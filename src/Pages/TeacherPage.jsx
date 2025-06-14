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
      const team = data.filter((s) => s.teacherId === teacher?.id);
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
      await axios.put(`${api}/${student.id}`, {
        ...student,
        ideas: updatedIdeas,
      });
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
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-violet-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-violet-700 tracking-wide">
            مرحبًا، <span className="text-violet-500">{teacher?.username}</span>
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition"
          >
            تسجيل خروج
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold mb-6 border-b border-violet-200 pb-2 text-violet-700">
            الطلاب المرتبطين بك
          </h3>

          {loading ? (
            <p className="text-violet-600 text-center">جاري تحميل البيانات...</p>
          ) : students.length === 0 ? (
            <p className="text-violet-400 text-center">لا يوجد طلاب مرتبطين بك حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto">
              {students.map((stu) => (
                <div
                  key={stu.id}
                  className="bg-violet-50 border border-violet-200 rounded-2xl shadow p-5 flex flex-col"
                >
                  <h4 className="text-lg font-bold text-violet-700 mb-3">{stu.username}</h4>

                  {(stu.ideas || []).length === 0 ? (
                    <p className="text-violet-400 italic">لا يوجد أفكار حتى الآن.</p>
                  ) : (
                    <div className="space-y-4">
                      {(stu.ideas || []).map((idea, idx) => {
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
                            <p className="mb-1 text-violet-800 font-medium">{idea.idea}</p>
                            <p className="text-sm">
                              الحالة:{" "}
                              <span>
                                {idea.status}
                              </span>
                            </p>
                            {idea.status === "مرفوضة" && (
                              <p className="text-red-600 text-sm mt-1">
                                سبب الرفض: {idea.rejectReason}
                              </p>
                            )}

                            {idea.status === "قيد المراجعة" && (
                              <div className="flex gap-3 mt-3 flex-wrap">
                                <button
                                  onClick={() => handleAccept(stu, idx)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl shadow transition"
                                >
                                  قبول
                                </button>
                                <button
                                  onClick={() => handleReject(stu, idx)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl shadow transition"
                                >
                                  رفض
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherPage;