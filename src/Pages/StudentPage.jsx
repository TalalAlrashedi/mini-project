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
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-violet-50 px-4 py-8 font-[Cairo]">
      <div className="max-w-7xl mx-auto space-y-8">

      <div className="flex flex-wrap justify-between items-center gap-4 bg-white shadow rounded-2xl px-6 py-4">
  <div>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-violet-700"> لوحة الطالب</h1>
    <p className="text-violet-500 mt-1">مرحباً، {user.username}</p>
  </div>
  <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition"
  >
    تسجيل خروج
  </button>
</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-violet-700 border-b pb-2">أفكارك</h2>
            {(user.ideas && user.ideas.length > 0) ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {user.ideas.map((idea, idx) => {
                  let classes = "border p-3 rounded-lg";
                  if (idea.status === "مقبولة") {
                    classes += " bg-green-50 border-green-300 text-green-800 font-semibold";
                  } else if (idea.status === "مرفوضة") {
                    classes += " bg-red-50 border-red-300 text-red-800 font-semibold";
                  } else {
                    classes += " bg-yellow-50 border-yellow-300 text-yellow-800";
                  }

                  return (
                    <div key={idx} className={classes}>
                      <p>{idea.idea}</p>
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
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full border border-violet-300 rounded-lg p-3 text-gray-700 placeholder-violet-300 focus:ring-2 focus:ring-violet-400 resize-none"
              placeholder="اكتب فكرتك هنا"
            />
            <button
              onClick={handleIdeaSubmit}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-semibold shadow transition"
            >
              إرسال الفكرة
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-violet-700 border-b pb-2 mb-2">أفكار مقبولة</h2>
              {acceptedIdeas.length === 0 ? (
                <p className="text-violet-400">لا توجد أفكار مقبولة حالياً.</p>
              ) : (
                <ul className="list-disc pr-5 space-y-1 max-h-40 overflow-y-auto text-violet-600 text-sm">
                  {acceptedIdeas.map((i, idx) => (
                    <li key={idx}>{i.idea}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-violet-700 border-b pb-2 mb-2">معلمك المسؤول</h2>
              <p className="text-violet-500">{myTeacher ? myTeacher.username : "لم يتم تعيين معلم بعد"}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-violet-700 border-b pb-2 mb-2">أعضاء فريقك</h2>
              {myTeam.length === 0 ? (
                <p className="text-violet-400">لا يوجد أعضاء فريق حالياً.</p>
              ) : (
                <ul className="list-disc pr-5 text-violet-600 text-sm space-y-1">
                  {myTeam.map((m) => (
                    <li key={m.id}>
                      {m.username} - <span className="text-violet-400">{m.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentPage;