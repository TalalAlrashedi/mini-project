import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const StudentPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [idea, setIdea] = useState("");

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(api);
        setStudents(res.data.filter((u) => u.role === "student"));
        setTeachers(res.data.filter((u) => u.role === "teacher"));
      } catch {
        Swal.fire("خطأ", "فشل تحميل البيانات", "error");
      }
    };

    fetchData();
  }, [navigate, user]);

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) {
      return Swal.fire("تنبيه", "يرجى إدخال الفكرة", "warning");
    }

    const newIdea = {
      idea,
      status: "قيد المراجعة",
      rejectReason: "",
    };

    try {
      const updatedUser = {
        ...user,
        ideas: [...(user.ideas || []), newIdea],
      };
      const { data } = await axios.put(`${api}/${user.id}`, updatedUser);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setIdea("");
      Swal.fire("تم", "تم إرسال الفكرة", "success");
    } catch {
      Swal.fire("خطأ", "فشل إرسال الفكرة", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const acceptedIdeas = students.flatMap((s) =>
    (s.ideas || []).filter((i) => i.status === "مقبولة")
  );

  const myTeacher = teachers.find((t) => t.id === user.teacherId);
  const myTeam = students.filter((s) => s.teacherId === user.teacherId && s.id !== user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-violet-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
  
        <header className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-violet-700 tracking-wide">
            مرحبًا، <span className="text-violet-500">{user.username}</span>
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition"
          >
            تسجيل خروج
          </button>
        </header>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-5 border-b border-violet-200 pb-2 text-violet-700">أفكارك</h3>
            {(user.ideas && user.ideas.length > 0) ? (
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {user.ideas.map((idea, idx) => {
                  let bgColor = "bg-yellow-50 border-yellow-300 text-yellow-700";
                  if (idea.status === "مقبولة") {
                    bgColor = "bg-green-50 border-green-300 text-green-700 font-semibold";
                  } else if (idea.status === "مرفوضة") {
                    bgColor = "bg-red-50 border-red-300 text-red-700 font-semibold";
                  }
                  return (
                    <div
                      key={idx}
                      className={`border p-4 rounded-lg shadow-sm ${bgColor}`}
                    >
                      <p className="mb-1 text-gray-800">{idea.idea}</p>
                      <p className="text-sm">الحالة: {idea.status}</p>
                      {idea.status === "مرفوضة" && (
                        <p className="text-sm text-red-600 mt-1">سبب الرفض: {idea.rejectReason}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-violet-400">لم تقم بإرسال أي فكرة بعد.</p>
            )}
  
            <textarea
              rows={3}
              className="w-full mt-4 p-3 rounded-lg border border-violet-300 placeholder-violet-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              placeholder="اكتب فكرتك هنا"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <button
              onClick={handleIdeaSubmit}
              className="mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg shadow transition duration-300"
            >
              إرسال الفكرة
            </button>
          </section>
  
          <section className="bg-white rounded-2xl shadow p-6 flex flex-col space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b border-violet-200 pb-2 text-violet-700">أفكار مقبولة من طلاب آخرين</h3>
              {acceptedIdeas.length === 0 ? (
                <p className="text-violet-400">لا توجد أفكار مقبولة حالياً.</p>
              ) : (
                <ul className="list-disc pr-6 max-h-40 overflow-y-auto text-violet-600 space-y-1">
                  {acceptedIdeas.map((i, idx) => (
                    <li key={idx}>{i.idea}</li>
                  ))}
                </ul>
              )}
            </div>
  
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b border-violet-200 pb-2 text-violet-700">معلمك المسؤول</h3>
              <p className="text-violet-500">{myTeacher ? myTeacher.username : "لم يتم تعيين معلم"}</p>
            </div>
  
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b border-violet-200 pb-2 text-violet-700">أعضاء فريقك</h3>
              {myTeam.length === 0 ? (
                <p className="text-violet-400">لا يوجد أعضاء فريق حالياً.</p>
              ) : (
                <ul className="list-disc pr-6 text-violet-600 space-y-1">
                  {myTeam.map((m) => (
                    <li key={m.id}>
                      {m.username} - <span className="text-violet-400 text-sm">{m.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
  
        </div>
      </div>
    </div>
  );
};

export default StudentPage;