import React, { useState } from "react";
import Swal from "sweetalert2";

const dummyApprovedIdeas = ["تطبيق تعليمي", "موقع للتبرعات", "نظام إدارة مكتبة"];

const dummyTeacher = {
  id: 1,
  name: "د. علي",
  email: "ali@tuwaiq.edu.sa",
  phone: "0551234567",
};

const dummyTeam = [
  { id: 1, name: "أحمد خالد", email: "ahmed@tuwaiq.edu.sa", phone: "0551111111" },
  { id: 2, name: "سارة محمد", email: "sarah@tuwaiq.edu.sa", phone: "0552222222" },
];

const StudentPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [idea, setIdea] = useState("");
  const [ideaStatus, setIdeaStatus] = useState("انتظار");
  const [ideas, setIdeas] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ name: "", email: "" });

  const isEmailValid = (email) => email.includes("tuwaiq");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Swal.fire("تنبيه", "يرجى تعبئة جميع الحقول", "warning");
      return;
    }
    if (!isEmailValid(email)) {
      Swal.fire("خطأ", "يجب أن يحتوي البريد الإلكتروني على كلمة طويق", "error");
      return;
    }

    try {
      const response = await fetch("https://6836b885664e72d28e41d28e.mockapi.io/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          role: "student",
        }),
      });

      if (!response.ok) throw new Error("فشل في التسجيل");

      const data = await response.json();
      setStudentInfo({ name: data.username, email: data.email });
      setIsLoggedIn(true);
      setIsRegistering(false);
      Swal.fire("تم", "تم إنشاء الحساب بنجاح", "success");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء التسجيل", "error");
    }
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Swal.fire("تنبيه", "يرجى إدخال البريد الإلكتروني وكلمة المرور", "warning");
      return;
    }
    if (!isEmailValid(email)) {
      Swal.fire("خطأ", "يجب أن يحتوي البريد الإلكتروني على كلمة طويق", "error");
      return;
    }

    setStudentInfo({ name: "طالب مسجل", email });
    setIsLoggedIn(true);
    Swal.fire("مرحبًا", "تم تسجيل الدخول بنجاح", "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setName("");
    setIdea("");
    setIdeas([]);
    setIdeaStatus("انتظار");
  };

  const handleAddIdea = () => {
    if (!idea.trim()) {
      Swal.fire("تنبيه", "يرجى كتابة الفكرة", "warning");
      return;
    }
    if (dummyApprovedIdeas.includes(idea.trim())) {
      Swal.fire("تنبيه", "هذه الفكرة موجودة بالفعل وتم قبولها من قبل", "info");
      return;
    }

    setIdeas((prev) => [...prev, { text: idea.trim(), status: "انتظار" }]);
    setIdea("");
    setIdeaStatus("انتظار");
    Swal.fire("تم", "تم إرسال الفكرة بنجاح", "success");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-100 flex justify-center items-start">
      {!isLoggedIn ? (
        <div className="bg-white p-6 md:p-8 rounded shadow max-w-md w-full">
          <h2 className="text-xl md:text-2xl mb-6 text-center font-semibold">
            {isRegistering ? "إنشاء حساب جديد" : "تسجيل دخول"}
          </h2>

          {isRegistering && (
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
          )}

          <input
            type="email"
            placeholder="البريد الإلكتروني (يحتوي على طويق)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-6"
          />

          {isRegistering ? (
            <button
              onClick={handleRegister}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              إنشاء حساب
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              تسجيل دخول
            </button>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 underline"
            >
              {isRegistering ? "لدي حساب بالفعل" : "إنشاء حساب جديد"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl bg-white p-4 md:p-8 rounded shadow">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 md:items-center">
            <h2 className="text-xl md:text-2xl font-semibold">مرحبا، {studentInfo.name}</h2>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              تسجيل خروج
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">الأفكار المقبولة</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded border max-h-32 overflow-auto">
              {dummyApprovedIdeas.map((idea, idx) => (
                <li key={idx}>{idea}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">إضافة فكرة جديدة</h3>
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              placeholder="اكتب فكرتك هنا"
            />
            <button
              onClick={handleAddIdea}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              إرسال الفكرة للمسؤول
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">أفكاري المرسلة</h3>
            {ideas.length === 0 ? (
              <p>لم ترسل أي فكرة بعد.</p>
            ) : (
              <ul className="space-y-2">
                {ideas.map((item, idx) => (
                  <li
                    key={idx}
                    className={`p-3 rounded border ${
                      item.status === "مقبولة"
                        ? "bg-green-100 border-green-400"
                        : item.status === "مرفوضة"
                        ? "bg-red-100 border-red-400"
                        : "bg-yellow-100 border-yellow-400"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p>{item.text}</p>
                      <span className="font-semibold">الحالة: {item.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">المعلم المسؤول</h3>
            <div className="border p-4 rounded bg-gray-50">
              <p>الاسم: {dummyTeacher.name}</p>
              <p>البريد الإلكتروني: {dummyTeacher.email}</p>
              <p>الهاتف: {dummyTeacher.phone}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              أعضاء الفريق ومعلومات التواصل
            </h3>
            <ul className="space-y-2">
              {dummyTeam.map((member) => (
                <li key={member.id} className="border p-3 rounded bg-gray-50">
                  <p>الاسم: {member.name}</p>
                  <p>البريد الإلكتروني: {member.email}</p>
                  <p>الهاتف: {member.phone}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPage;