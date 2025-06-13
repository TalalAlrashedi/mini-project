import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const StudentPage = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [idea, setIdea] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchAll = async () => {
    const res = await axios.get(api);
    setStudents(res.data.filter((u) => u.role === "student"));
    setTeachers(res.data.filter((u) => u.role === "teacher"));
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const handleRegister = async () => {
    if (!email.includes("tuwaiq")) {
      Swal.fire("خطأ", "يجب أن يحتوي البريد الإلكتروني على كلمة 'tuwaiq'", "error");
      return;
    }

    const availableTeachers = (await axios.get(api)).data.filter(u => u.role === "teacher");
    const randomTeacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];

    await axios.post(api, {
      username: name,
      email,
      password,
      role: "student",
      teacherId: randomTeacher?.id || null,
      idea: "",
      status: "قيد المراجعة",
      rejectReason: "",
    });

    Swal.fire("تم", "تم التسجيل بنجاح", "success");
    setIsRegistering(false);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = async () => {
    const res = await axios.get(api);
    const found = res.data.find(
      (u) => u.email === email && u.password === password && u.role === "student"
    );
    if (found) {
      localStorage.setItem("user", JSON.stringify(found));
      setUser(found);
      Swal.fire("مرحبًا", "تم تسجيل الدخول بنجاح", "success");
    } else {
      Swal.fire("خطأ", "بيانات غير صحيحة", "error");
    }
  };

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) return Swal.fire("تنبيه", "يرجى إدخال الفكرة", "warning");
    const updated = await axios.put(`${api}/${user.id}`, {
      ...user,
      idea,
      status: "قيد المراجعة",
    });
    localStorage.setItem("user", JSON.stringify(updated.data));
    setUser(updated.data);
    fetchAll();
    Swal.fire("تم", "تم إرسال الفكرة", "success");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setEmail("");
    setPassword("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center">{isRegistering ? "تسجيل جديد" : "تسجيل الدخول"}</h2>
          {isRegistering && (
            <input type="text" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded mb-3" />
          )}
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-3" />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4" />
          <button onClick={isRegistering ? handleRegister : handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded">
            {isRegistering ? "تسجيل" : "دخول"}
          </button>
          <p className="text-center mt-4">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-500 underline">
              {isRegistering ? "لدي حساب" : "إنشاء حساب جديد"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const acceptedIdeas = students.filter((s) => s.idea && s.status === "مقبولة");
  const myTeacher = teachers.find((t) => t.id === user.teacherId);
  const myTeam = students.filter((s) => s.teacherId === user.teacherId && s.id !== user.id);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">مرحبًا {user.username}</h2>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">تسجيل خروج</button>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">فكرتك</h3>
          {user.idea ? (
            <div className={`p-4 rounded ${user.status === "مقبولة"
              ? "bg-green-100"
              : user.status === "مرفوضة"
                ? "bg-red-100"
                : "bg-yellow-100"}`}>
              <p className="mb-1">{user.idea}</p>
              <p className="font-bold">الحالة: {user.status}</p>
              {user.status === "مرفوضة" && (
                <p className="text-sm text-red-500 mt-1">سبب الرفض: {user.rejectReason}</p>
              )}
            </div>
          ) : (
            <>
              <textarea rows={3} className="w-full border p-2 rounded mb-2" value={idea}
                onChange={(e) => setIdea(e.target.value)} placeholder="اكتب فكرتك هنا" />
              <button onClick={handleIdeaSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
                إرسال الفكرة
              </button>
            </>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">أفكار مقبولة من طلاب آخرين</h3>
          <ul className="list-disc pr-6 space-y-1">
            {acceptedIdeas.map((s) => (
              <li key={s.id}>{s.idea}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">معلمك المسؤول</h3>
          <p>{myTeacher ? myTeacher.name : "لم يتم تعيين معلم"}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">أعضاء فريقك</h3>
          {myTeam.length === 0 ? (
            <p>لا يوجد أعضاء فريق حالياً.</p>
          ) : (
            <ul className="list-disc pr-6 space-y-1">
              {myTeam.map((m) => (
                <li key={m.id}>
                  {m.username} - {m.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;