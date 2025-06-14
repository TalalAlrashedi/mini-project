import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const TeacherPage = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "teacher" ? user : null;
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(api);
      const team = data.filter((s) => s.teacherId === teacher.id);
      setStudents(team);
    } catch {
      Swal.fire("خطأ", "تعذر جلب بيانات الطلاب", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher) fetchStudents();
  }, [teacher]);

  const updateIdeaStatus = async (student, index, status, reason = "") => {
    const updatedIdeas = [...(student.ideas || [])];
    updatedIdeas[index].status = status;
    updatedIdeas[index].rejectReason = status === "مرفوضة" ? reason : "";

    try {
      await axios.put(`${api}/${student.id}`, { ...student, ideas: updatedIdeas });
      fetchStudents();
      Swal.fire("تم", `تم تحديث الحالة إلى "${status}"`, "success");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء التحديث", "error");
    }
  };

  const handleReject = (student, index) => {
    Swal.fire({
      title: `سبب رفض الفكرة`,
      input: "text",
      inputPlaceholder: "اكتب سبب الرفض هنا...",
      showCancelButton: true,
      confirmButtonText: "رفض",
      inputValidator: (value) => (!value ? "الرجاء كتابة السبب!" : undefined),
    }).then((result) => {
      if (result.isConfirmed) {
        updateIdeaStatus(student, index, "مرفوضة", result.value);
      }
    });
  };

  const handleAccept = (student, index) => {
    Swal.fire({
      title: "قبول الفكرة",
      text: "هل أنت متأكد من قبول هذه الفكرة؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        updateIdeaStatus(student, index, "مقبولة");
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "تسجيل الخروج",
      text: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، خروج",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        navigate("/auth");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6 relative">
        <button
          onClick={handleLogout}
          className=" bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md shadow text-sm"
        >
          تسجيل الخروج
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">الطلاب المرتبطين بك</h2>

        {loading ? (
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-600">لا يوجد طلاب مرتبطين بك حالياً.</p>
        ) : (
          <div className="space-y-6">
            {students.map((stu) => (
              <div key={stu.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{stu.username}</h3>
                <div className="space-y-4">
                  {(stu.ideas || []).map((idea, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border shadow">
                      <p className="text-gray-800">{idea.idea}</p>
                      <p className="text-sm mt-2">
                        الحالة:{" "}
                        <span
                          className={
                            idea.status === "مقبولة"
                              ? "text-green-600 font-bold"
                              : idea.status === "مرفوضة"
                              ? "text-red-600 font-bold"
                              : "text-yellow-600 font-bold"
                          }
                        >
                          {idea.status}
                        </span>
                      </p>
                      {idea.status === "مرفوضة" && (
                        <p className="text-sm text-red-500 mt-1">سبب الرفض: {idea.rejectReason}</p>
                      )}
                      {idea.status === "قيد المراجعة" && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => handleAccept(stu, idx)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md shadow"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleReject(stu, idx)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md shadow"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;