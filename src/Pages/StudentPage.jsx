import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const StudentPage = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [idea, setIdea] = useState("");
  const [myIdea, setMyIdea] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      axios.get(`${api}/${user.id}`).then(({ data }) => {
        setMyIdea(data.idea ? data : null);
      });
    }
  }, [user]);

  const handleRegister = async () => {
    const teacher = JSON.parse(localStorage.getItem("user"));
    const teacherId = teacher?.role === "teacher" ? teacher.id : null;

    try {
      await axios.post(api, {
        username: name,
        email,
        password,
        role: "student",
        teacherId,
        status: "قيد المراجعة",
        idea: "",
        rejectReason: ""
      });
      Swal.fire("تم", "تم التسجيل بنجاح", "success");
      setIsRegistering(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء التسجيل", "error");
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = await axios.get(api);
      const found = data.find(s => s.email === email && s.password === password && s.role === "student");
      if (found) {
        localStorage.setItem("user", JSON.stringify(found));
        setUser(found);
        Swal.fire("مرحبًا", "تم تسجيل الدخول بنجاح", "success");
      } else {
        Swal.fire("خطأ", "بيانات غير صحيحة", "error");
      }
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء تسجيل الدخول", "error");
    }
  };

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) {
      Swal.fire("تنبيه", "يرجى كتابة الفكرة", "warning");
      return;
    }
    try {
      const { data } = await axios.put(`${api}/${user.id}`, {
        idea,
        status: "قيد المراجعة"
      });
      setMyIdea(data);
      Swal.fire("تم", "تم إرسال الفكرة بنجاح", "success");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء إرسال الفكرة", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIdea("");
    setMyIdea(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center">{isRegistering ? "تسجيل جديد" : "تسجيل الدخول"}</h2>

          {isRegistering && (
            <input
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
          )}

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <button onClick={isRegistering ? handleRegister : handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">مرحبًا {user.username}</h2>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
            تسجيل خروج
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">فكرتك</h3>
          {myIdea && myIdea.idea ? (
            <div
              className={`p-4 rounded ${
                myIdea.status === "مقبولة"
                  ? "bg-green-100"
                  : myIdea.status === "مرفوضة"
                  ? "bg-red-100"
                  : "bg-yellow-100"
              }`}
            >
              <p className="mb-2">{myIdea.idea}</p>
              <p className="font-semibold">الحالة: {myIdea.status}</p>
            </div>
          ) : (
            <>
              <textarea
                rows={3}
                value={idea}
                onChange={e => setIdea(e.target.value)}
                className="w-full border p-2 rounded mb-2"
                placeholder="اكتب فكرتك هنا"
              />
              <button onClick={handleIdeaSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
                إرسال الفكرة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;