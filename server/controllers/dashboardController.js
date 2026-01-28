import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Student
export const getDashboardStats = catchAsync(async (req, res) => {
  const studentId = req.user._id;

  // Get enrolled courses with details
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      select: "title thumbnail category tutor sections",
      populate: { path: "tutor", select: "name email" },
    })
    .sort({ createdAt: -1 });

  // Calculate total tutorials and time
  let totalTutorials = 0;
  let totalTimeMinutes = 0;

  const activeCourses = enrollments.map((enrollment) => {
    const course = enrollment.course;

    // Count lectures
    let lectureCount = 0;
    let courseDuration = 0;

    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach((section) => {
        if (section.lectures && Array.isArray(section.lectures)) {
          lectureCount += section.lectures.length;
          section.lectures.forEach((lecture) => {
            courseDuration += lecture.duration || 0;
          });
        }
      });
    }

    totalTutorials += lectureCount;
    totalTimeMinutes += courseDuration;

    return {
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      category: course.category,
      tutor: course.tutor,
      progress: enrollment.completionPercentage || 0,
      lectureCount,
      duration: courseDuration,
      lastAccessed: enrollment.updatedAt,
    };
  });

  // Get recent payments
  const payments = await Payment.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("amount status createdAt")
    .populate("course", "title");

  // Calculate overall progress (average of all courses)
  const overallProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, e) => sum + (e.completionPercentage || 0),
            0,
          ) / enrollments.length,
        )
      : 0;

  // Course-wise performance data for graph
  const coursePerformance = activeCourses.map((course) => ({
    courseName: course.title,
    progress: course.progress,
    shortName: course.title.split(" ").slice(0, 3).join(" "), // First 3 words
  }));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        enrolledCourses: enrollments.length,
        totalTutorials,
        totalTimeMinutes,
        overallProgress,
      },
      activeCourses,
      recentPayments: payments,
      coursePerformance,
    },
  });
});

// @desc    Get student's enrolled courses
// @route   GET /api/dashboard/courses
// @access  Private/Student
export const getEnrolledCourses = catchAsync(async (req, res) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      populate: { path: "tutor", select: "name email avatar" },
    })
    .sort({ updatedAt: -1 });

  const courses = enrollments.map((enrollment) => ({
    ...enrollment.course.toObject(),
    progress: enrollment.completionPercentage || 0,
    enrollmentId: enrollment._id,
    lastAccessed: enrollment.updatedAt,
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});
