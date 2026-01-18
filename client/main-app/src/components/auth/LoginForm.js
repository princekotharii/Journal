import { useState } from "react";
import { useRouter } from "next/router";
import { login } from "@/services/apiService";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function LoginForm({ role, displayRole }) {
  const router = useRouter();
  const { login: loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: role,
      });

      const userData = response.data.data;
      const token = response.data.token;

      if (userData && token) {
        const userWithRole = {
          ...userData,
          role: userData.role || role,
        };

        loginUser(userWithRole, token);
        toast.success("Login Successful!", { id: toastId });
        
        setTimeout(() => {
          router.push(`/${userWithRole.role}/dashboard`);
        }, 500);
      } else {
        toast.error("Invalid response from server", { id: toastId });
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid credentials";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email ID
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <a
              href="#"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Forgot Password?
            </a>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
            Remember Me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing In...
            </span>
          ) : (
            `Sign In as ${displayRole}`
          )}
        </button>

        {/* 🆕 Role Switcher (Replaces Social Login) */}
        <div className="mt-6 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            {role === "student" ? "Are you a Tutor?" : "Are you a Student?"}{" "}
            <button
              type="button"
              onClick={() => router.push(`/auth/${role === "student" ? "tutor" : "student"}?tab=login`)}
              className="text-purple-600 font-bold hover:text-purple-700 hover:underline transition-all"
            >
              {role === "student" ? "Login as Tutor" : "Login as Student"}
            </button>
          </p>
        </div>
      </form>
    </>
  );
}