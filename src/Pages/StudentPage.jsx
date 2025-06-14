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
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">مرحبًا {user.username}</h2>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
            تسجيل خروج
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">أفكارك</h3>
          {(user.ideas || []).length > 0 ? (
            user.ideas.map((idea, index) => (
              <div key={index} className={`p-4 mb-2 rounded ${
                idea.status === "مقبولة"
                  ? "bg-green-100"
                  : idea.status === "مرفوضة"
                  ? "bg-red-100"
                  : "bg-yellow-100"
              }`}>
                <p className="mb-1">{idea.idea}</p>
                <p className="font-bold">الحالة: {idea.status}</p>
                {idea.status === "مرفوضة" && (
                  <p className="text-sm text-red-500 mt-1">سبب الرفض: {idea.rejectReason}</p>
                )}
              </div>
            ))
          ) : (
            <p>لم تقم بإرسال أي فكرة بعد.</p>
          )}
          <textarea
            rows={3}
            className="w-full border p-2 rounded mb-2"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="اكتب فكرتك هنا"
          />
          <button onClick={handleIdeaSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
            إرسال الفكرة
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">أفكار مقبولة من طلاب آخرين</h3>
          <ul className="list-disc pr-6 space-y-1">
            {acceptedIdeas.map((i, idx) => (
              <li key={idx}>{i.idea}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">معلمك المسؤول</h3>
          <p>{myTeacher ? myTeacher.username : "لم يتم تعيين معلم"}</p>
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