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

  useEffect(() => {
    if (teacher) {
      setLoading(true);
      axios
        .get(api)
        .then(({ data }) => {
          const teamStudents = data.filter((s) => s.teacherId === teacher.id);
          setStudents(teamStudents);
        })
        .catch(() => {
          Swal.fire("خطأ", "تعذر جلب بيانات الطلاب", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [teacher]);

  const updateIdeaStatus = async (studentId, status, rejectReason = "") => {
    try {
      const { data } = await axios.put(`${api}/${studentId}`, {
        status,
        rejectReason: status === "مرفوضة" ? rejectReason : ""
      });
      setStudents((prev) =>
        prev.map((stu) => (stu.id === studentId ? data : stu))
      );
      Swal.fire("تم", `تم تحديث حالة الفكرة إلى "${status}"`, "success");
    } catch {
      Swal.fire("خطأ", "حدث خطأ أثناء تحديث الحالة", "error");
    }
  };

  const handleReject = (student) => {
    Swal.fire({
      title: `رفض فكرة ${student.username}`,
      input: "text",
      inputLabel: "سبب الرفض",
      inputPlaceholder: "اكتب سبب الرفض هنا...",
      showCancelButton: true,
      confirmButtonText: "رفض",
      cancelButtonText: "إلغاء",
      inputValidator: (value) => {
        if (!value) {
          return "الرجاء كتابة سبب الرفض!";
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateIdeaStatus(student.id, "مرفوضة", result.value);
      }
    });
  };

  const handleAccept = (student) => {
    Swal.fire({
      title: `قبول فكرة ${student.username}`,
      text: "هل أنت متأكد من قبول هذه الفكرة؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، قبول",
      cancelButtonText: "إلغاء"
    }).then((result) => {
      if (result.isConfirmed) {
        updateIdeaStatus(student.id, "مقبولة");
      }
    });
  };

  if (!teacher) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
          <p>يجب تسجيل الدخول كمعلم لعرض هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">طلابك وأفكارهم</h2>

        {loading ? (
          <p>جاري تحميل البيانات...</p>
        ) : students.length === 0 ? (
          <p>لا يوجد طلاب تحت إدارتك.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">الاسم</th>
                <th className="border border-gray-300 p-2">الفكرة</th>
                <th className="border border-gray-300 p-2">الحالة</th>
                <th className="border border-gray-300 p-2">سبب الرفض</th>
                <th className="border border-gray-300 p-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => (
                <tr key={stu.id} className="text-center">
                  <td className="border border-gray-300 p-2">{stu.username}</td>
                  <td className="border border-gray-300 p-2">{stu.idea || "-"}</td>
                  <td
                    className={`border border-gray-300 p-2 font-semibold ${
                      stu.status === "مقبولة"
                        ? "text-green-600"
                        : stu.status === "مرفوضة"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {stu.status || "لا يوجد"}
                  </td>
                  <td className="border border-gray-300 p-2">{stu.rejectReason || "-"}</td>
                  <td className="border border-gray-300 p-2 space-x-2">
                    {stu.status !== "مقبولة" && (
                      <button
                        onClick={() => handleAccept(stu)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        قبول
                      </button>
                    )}
                    {stu.status !== "مرفوضة" && (
                      <button
                        onClick={() => handleReject(stu)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        رفض
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;