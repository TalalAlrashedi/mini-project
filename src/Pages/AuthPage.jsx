import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const AuthPage = () => {
  const [role, setRole] = useState("student");
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Swal.fire("تنبيه", "الرجاء تعبئة جميع الحقول", "warning");
    }

    if (role === "student" && !email.includes("tuwaiq.edu.sa")) {
      return Swal.fire(
        "خطأ",
        "يجب أن يحتوي البريد الإلكتروني على 'tuwaiq.edu.sa'",
        "error"
      );
    }

    try {
      const teacherList = await axios.get(api);
      const firstTeacher = teacherList.data.find((u) => u.role === "teacher");

      await axios.post(api, {
        username,
        email,
        password,
        role,
        idea: "",
        status: "قيد المراجعة",
        rejectReason: "",
        teacherId: role === "student" ? firstTeacher?.id || null : null,
      });

      Swal.fire("تم", "تم إنشاء الحساب بنجاح", "success");
      setIsRegistering(false);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء التسجيل", "error");
    }
  };

  const handleLogin = async () => {
    if (email === "admin@tuwaiq.edu.sa" && password === "admin") {
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "admin", username: "admin" })
      );
      return Swal.fire("تم", "تم تسجيل الدخول الادمن", "success").then(() =>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-200 to-violet-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png"
            alt="Tuwaiq Logo"
            className="w-40 h-auto mb-2"
          />
          <h1 className="text-black text-xl font-semibold">
            Welcome to Tuwaiq Academy{" "}
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-violet-700">
          {isRegistering ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-right font-medium">الدور</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
          </select>
        </div>

        {isRegistering && (
          <div className="mb-2">
            <label className="block mb-1 text-right font-medium">الاسم</label>
            <input
              type="text"
              placeholder="الاسم الكامل"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="mb-2">
          <label className="block mb-1 text-right font-medium">
            البريد الإلكتروني
          </label>
          <input
            type="text"
            placeholder="example@tuwaiq.edu.sa"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-right font-medium">
            كلمة المرور
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 transition"
        >
          {isRegistering ? "تسجيل" : "دخول"}
        </button>

        <p className="text-center text-sm mt-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-violet-600 hover:underline"
          >
            {isRegistering
              ? "لدي حساب مسبقاً؟ تسجيل الدخول"
              : "مستخدم جديد؟ إنشاء حساب"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
