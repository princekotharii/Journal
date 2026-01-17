import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { login } from "@/services/apiService";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast"; // Toast import

export default function LoginPage() {
  const router = useRouter();
  const { user, login: loginUser } = useAuth();
  const { role } = router.query;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // User logged in hai to redirect karo
  useEffect(() => {
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  // Invalid role check
  useEffect(() => {
    if (role && role !== "student" && role !== "tutor") {
      router.push("/");
    }
  }, [role, router]);

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying credentials..."); // Loading toast

    try {
      const response = await login({ email, password, role });
      const userData = response.data.data;
      const token = response.data.token;

      if (userData && token) {
        const userWithRole = {
          ...userData,
          role: userData.role || role,
        };

        loginUser(userWithRole, token);
        toast.success("Login Successful!", { id: toastId }); // Success update
        router.push(`/${userWithRole.role}/dashboard`);
      } else {
        toast.error("Invalid response from server", { id: toastId });
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid credentials";
      toast.error(msg, { id: toastId }); // Error update
    } finally {
      setIsLoading(false);
    }
  };

  // User logged in hai to loading UI
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-blue-600 font-medium">Redirecting to Dashboard...</div>
      </div>
    );
  }

  // Role loading UI
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Capitalize Role for UI
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Toast Container */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-black p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Welcome Back</h2>
          <p className="text-gray-100">
            Login to your <span className="font-semibold text-blue-600">{displayRole}</span> account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-black text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-black text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link href="/forgot-password">
               <span className="text-blue-600 hover:underline cursor-pointer">Forgot Password?</span>
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200 ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer / Switch Role */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {role === "student" ? (
            // Agar Student page par hai, to Tutor ka link dikhao
            <>
              Are you a Tutor?{" "}
              <Link href="/login/tutor">
                <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                  Login as Tutor
                </span>
              </Link>
            </>
          ) : (
            // Agar Tutor (ya Admin) page par hai, to Student ka link dikhao
            <>
              Are you a Student?{" "}
              <Link href="/login/student">
                <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                  Login as Student
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}