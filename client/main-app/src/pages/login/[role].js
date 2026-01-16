import { useRouter } from "next/router";
import { useState } from "react";
import { login } from "@/services/apiService";

export default function LoginPage() {
  const router = useRouter();
  const { role } = router.query;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const { data } = await login({ email, password, role });
      localStorage.setItem("token", data.token);
      router.push(`/${role}/dashboard`);
    } catch {
      alert("Invalid credentials");
    }
  };

  if (!role) return null;

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <h1>{role} Login</h1>
      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
}
