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

    if (role === "student" && !email.includes("tuwaiq")) {
      return Swal.fire("خطأ", "يجب أن يحتوي البريد الإلكتروني على 'tuwaiq'", "error");
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

    if (email === "admin" && password === "admin") {
      const adminUser = {
        id: "admin",
        username: "المسؤول",
        email: "admin",
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(adminUser));
      Swal.fire("تم", "تم تسجيل الدخول كمسؤول", "success").then(() => {
        navigate("/admin");
      });
      return;
    }
  
    try {
      const { data } = await axios.get(api);
      const user = data.find(
        (u) => u.email === email && u.password === password && u.role === role
      );
  
      if (!user) {
        return Swal.fire("خطأ", "بيانات غير صحيحة أو المستخدم غير موجود", "error");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isRegistering ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </h2>

        <div className="mb-4">
          <label className="block mb-1">الدور:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
          </select>
        </div>

        {isRegistering && (
          <input
            type="text"
            placeholder="الاسم"
            className="w-full border p-2 rounded mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {isRegistering ? "تسجيل" : "دخول"}
        </button>

        <p className="text-center mt-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 underline"
          >
            {isRegistering ? "لدي حساب" : "إنشاء حساب جديد"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;