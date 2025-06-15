import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const Register = () => {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Swal.fire("تنبيه", "الرجاء تعبئة جميع الحقول", "warning");
    }

    if (role === "student" && !email.includes("tuwaiq.edu.sa")) {
      return Swal.fire("خطأ", "يجب أن يحتوي البريد الإلكتروني على 'tuwaiq.edu.sa'", "error");
    }

    try {
      const { data } = await axios.get(api);
      const firstTeacher = data.find((u) => u.role === "teacher");

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
      navigate("/login");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء التسجيل", "error");
    }
  };

  return (
    <div className="min-h-screen bg-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/30 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden">


        <div className="block md:hidden text-center px-6 pt-6 pb-4 bg-white/10">
          <img
            src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png"
            alt="Tuwaiq Logo"
            className="w-32 mx-auto drop-shadow-xl mb-2"
          />
          <p className="text-gray-700 text-sm">
            منصة إلكترونية متكاملة لإدارة مشاريع التخرج بين الطلاب والمعلمين والإدارة.
          </p>
        </div>


        <div className="md:w-1/2 hidden md:flex flex-col items-center justify-center bg-white/10 p-8 text-center space-y-6">
          <img
            src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png"
            alt="Tuwaiq Logo"
            className="w-64 drop-shadow-xl"
          />
          <p className="text-gray-700 text-lg leading-relaxed max-w-xs">
            سجل الآن في منصة إدارة مشاريع التخرج وابدأ رحلتك الأكاديمية بتنظيم وفعالية، سواء كنت طالبًا أو معلمًا.
          </p>
        </div>


        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-center text-violet-800 mb-6">إنشاء حساب جديد</h2>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-4 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
          </select>

          <input
            type="text"
            placeholder="الاسم الكامل"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <input
            type="email"
            placeholder="example@tuwaiq.edu.sa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <button
            onClick={handleRegister}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-lg transition"
          >
            تسجيل
          </button>

          <p className="text-center text-sm mt-5 text-gray-700">
            لديك حساب؟{" "}
            <Link to="/login" className="text-violet-700 hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;