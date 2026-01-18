import { useEffect } from "react";
import { useRouter } from "next/router";
import AuthSlider from "@/components/auth/authSlider";

export default function AuthPage() {
  const router = useRouter();
  const { role, tab = "login" } = router.query;

  // Redirect invalid roles to home
  useEffect(() => {
    if (role && role !== "student" && role !== "tutor") {
      router.push("/");
    }
  }, [role, router]);

  // Don't render until role is loaded
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-indigo-700">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Block invalid roles
  if (role !== "student" && role !== "tutor") {
    return null;
  }

  return <AuthSlider role={role} activeTab={tab} />;
}