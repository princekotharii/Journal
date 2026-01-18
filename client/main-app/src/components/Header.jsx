import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Check if we're on auth pages
  const isAuthPage = router.pathname.startsWith("/auth");

  return (
    <header className="flex justify-between items-center p-4 bg-black text-white">
      <Link href="/" className="font-bold text-xl">
        Journal
      </Link>
      
      <nav className="space-x-6 hidden md:block">
        <Link href="/teaching" className="hover:text-gray-300">Teaching</Link>
        <Link href="/training" className="hover:text-gray-300">Training</Link>
        <Link href="/research" className="hover:text-gray-300">Research</Link>
      </nav>

      {user ? (
        /* Logged In User */
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user.name}</span>
          <button 
            onClick={logout} 
            className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        /* Logged Out User */
        <div className="flex items-center space-x-4">
          
          {/* LOGIN BUTTON:  Hide on auth pages */}
          {! isAuthPage && (
            <Link href="/auth/student?tab=login">
              <span className="cursor-pointer hover:text-gray-300">Login</span>
            </Link>
          )}

          {/* SIGN UP BUTTON: Hide on auth pages */}
          {!isAuthPage && (
            <Link href="/auth/student?tab=register">
              <span className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition cursor-pointer">
                Sign Up
              </span>
            </Link>
          )}
          
        </div>
      )}
    </header>
  );
}