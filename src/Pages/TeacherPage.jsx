import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

const TeacherPage = () => {
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

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <p>يجب تسجيل الدخول كمعلم.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">طلابك</h2>

        {loading ? (
          <p>جاري تحميل البيانات...</p>
        ) : students.length === 0 ? (
          <p>لا يوجد طلاب.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-right">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">الطالب</th>
                  <th className="p-2 border">الأفكار</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => (
                  <tr key={stu.id} className="border-t align-top">
                    <td className="p-2 font-semibold">{stu.username}</td>
                    <td className="p-2 space-y-3">
                      {(stu.ideas || []).map((idea, idx) => (
                        <div key={idx} className="border rounded p-2 bg-gray-50">
                          <p>{idea.idea}</p>
                          <p className="text-sm text-gray-600">
                            الحالة:{" "}
                            <span
                              className={
                                idea.status === "مقبولة"
                                  ? "text-green-600"
                                  : idea.status === "مرفوضة"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }
                            >
                              {idea.status}
                            </span>
                          </p>
                          {idea.status === "مرفوضة" && (
                            <p className="text-sm text-red-500">سبب الرفض: {idea.rejectReason}</p>
                          )}
                          {idea.status === "قيد المراجعة" && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <button
                                onClick={() => handleAccept(stu, idx)}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                              >
                                قبول
                              </button>
                              <button
                                onClick={() => handleReject(stu, idx)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;