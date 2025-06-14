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
      const res = await axios.get(api);
      setStudents(res.data.filter((u) => u.role === "student"));
      setTeachers(res.data.filter((u) => u.role === "teacher"));
    };

    fetchData();
  }, []);

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) return Swal.fire("تنبيه", "يرجى إدخال الفكرة", "warning");

    const newIdea = {
      idea,
      status: "قيد المراجعة",
      rejectReason: "",
    };

    const updatedUser = {
      ...user,
      ideas: [...(user.ideas || []), newIdea],
    };

    const updated = await axios.put(`${api}/${user.id}`, updatedUser);

    localStorage.setItem("user", JSON.stringify(updated.data));
    setUser(updated.data);
    setIdea("");
    Swal.fire("تم", "تم إرسال الفكرة", "success");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const acceptedIdeas = students.flatMap((s) =>
    (s.ideas || []).filter((i) => i.status === "مقبولة")
  );
  const myTeacher = teachers.find((t) => t.id === user.teacherId);
  const myTeam = students.filter((s) => s.teacherId === user.teacherId && s.id !== user.id);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-800">مرحبًا {user.username}</h2>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow transition">
            تسجيل خروج
          </button>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">أفكارك</h3>
          {(user.ideas || []).length > 0 ? (
            <div className="space-y-4">
              {user.ideas.map((idea, index) => {
                let bgColor = "bg-yellow-100";
                let textColor = "text-yellow-800";
                if (idea.status === "مقبولة") {
                  bgColor = "bg-green-100";
                  textColor = "text-green-800 font-bold";
                } else if (idea.status === "مرفوضة") {
                  bgColor = "bg-red-100";
                  textColor = "text-red-800 font-bold";
                }

                return (
                  <div key={index} className={`p-4 rounded-lg border ${bgColor} shadow`}>
                    <p className="text-gray-800 mb-1">{idea.idea}</p>
                    <p className={`text-sm ${textColor}`}>الحالة: {idea.status}</p>
                    {idea.status === "مرفوضة" && (
                      <p className="text-sm text-red-600 mt-1">سبب الرفض: {idea.rejectReason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">لم تقم بإرسال أي فكرة بعد.</p>
          )}

          <textarea
            rows={3}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-3 rounded-lg mt-4 resize-none"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="اكتب فكرتك هنا"
          />
          <button onClick={handleIdeaSubmit} className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition">
            إرسال الفكرة
          </button>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">أفكار مقبولة من طلاب آخرين</h3>
          <ul className="list-disc pr-6 space-y-2 text-gray-700">
            {acceptedIdeas.map((i, idx) => (
              <li key={idx}>{i.idea}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">معلمك المسؤول</h3>
          <p className="text-gray-700">
            {myTeacher ? myTeacher.username : "لم يتم تعيين معلم"}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">أعضاء فريقك</h3>
          {myTeam.length === 0 ? (
            <p className="text-gray-600">لا يوجد أعضاء فريق حالياً.</p>
          ) : (
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              {myTeam.map((m) => (
                <li key={m.id}>
                  {m.username} - <span className="text-sm text-gray-500">{m.email}</span>
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