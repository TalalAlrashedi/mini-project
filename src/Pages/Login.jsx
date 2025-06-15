import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      return Swal.fire("تنبيه", "الرجاء تعبئة جميع الحقول", "warning");
    }
    if (email === "admin@tuwaiq.edu.sa" && password === "admin") {
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "admin", username: "admin" })
      );
      return Swal.fire("تم", "تم تسجيل الدخول كأدمن", "success").then(() =>
        navigate("/admin")
      );
    }

    try {
      const { data } = await axios.get(api);
      const user = data.find(
        (u) => u.email === email && u.password === password && u.role === role
      );

      if (!user) {
        return Swal.fire(
          "خطأ",
          "بيانات غير صحيحة أو المستخدم غير موجود",
          "error"
        );
      }

      localStorage.setItem("user", JSON.stringify(user));
      Swal.fire("تم", "تم تسجيل الدخول بنجاح", "success").then(() => {
        navigate(role === "student" ? "/student" : "/teacher");
      });
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء تسجيل الدخول", "error");
    }
  };

  return (
    <div className="min-h-screen bg-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/30 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden">
        <div className=" md:hidden flex flex-col  items-center justify-center p-6 bg-white/10">
          <img
            src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png"
            alt="Tuwaiq Logo"
            className="w-40 drop-shadow-xl"
          />
          <h1>مرحبا بك مجددا في الأكاديمية</h1>
        </div>

        <div className="md:w-1/2 flex-col  hidden md:flex items-center justify-center bg-white/10 p-8">
          <img
            src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png"
            alt="Tuwaiq Logo"
            className="w-64 drop-shadow-xl"
          />
          <h1 className="p-5 text-xl">مرحبا بك مجددا في الأكاديمية</h1>
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-center text-violet-800 mb-6">
            تسجيل الدخول
          </h2>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-4 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
          </select>

          <input
            type="email"
            placeholder="example@tuwaiq.edu.sa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-lg transition"
          >
            دخول
          </button>

          <p className="text-center text-sm mt-5 text-gray-700">
            لا تملك حساباً؟{" "}
            <Link
              to="/register"
              className="text-violet-700 hover:underline font-medium"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
