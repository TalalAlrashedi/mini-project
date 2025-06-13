import React, { useState } from "react";
import Swal from "sweetalert2";

const AdminPage = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "أحمد خالد",
      idea: "تطبيق تعليمي",
      status: "قيد المراجعة",
      rejectReason: "",
      teacherId: null,
    },
    {
      id: 2,
      name: "سارة محمد",
      idea: "موقع تواصل",
      status: "مقبولة",
      rejectReason: "",
      teacherId: 3,
    },
    {
      id: 3,
      name: "مريم علي",
      idea: "نظام إدارة",
      status: "مرفوضة",
      rejectReason: "الفكرة غير واضحة",
      teacherId: null,
    },
  ]);

  const [teachers, setTeachers] = useState([
    { id: 3, name: "د. فهد" },
    { id: 4, name: "د. ليلى" },
  ]);

  const handleAdd = async (type) => {
    const { value: formValues } = await Swal.fire({
      title: `إضافة ${type === "student" ? "طالب" : "معلم"} جديد`,
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="الاسم">` +
        (type === "student"
          ? `<textarea id="swal-input2" class="swal2-textarea" placeholder="الفكرة"></textarea>`
          : ""),
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value.trim();
        const idea = type === "student" ? document.getElementById("swal-input2").value.trim() : null;
        if (!name) {
          Swal.showValidationMessage("الرجاء إدخال الاسم");
          return;
        }
        if (type === "student" && !idea) {
          Swal.showValidationMessage("الرجاء إدخال الفكرة");
          return;
        }
        return { name, idea };
      },
      showCancelButton: true,
    });

    if (formValues) {
      if (type === "student") {
        setStudents((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: formValues.name,
            idea: formValues.idea,
            status: "قيد المراجعة",
            rejectReason: "",
            teacherId: null,
          },
        ]);
      } else {
        setTeachers((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: formValues.name,
          },
        ]);
      }
      Swal.fire("تمت الإضافة بنجاح", "", "success");
    }
  };

  const acceptIdea = (studentId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: "مقبولة", rejectReason: "" }
          : s
      )
    );
    Swal.fire("تم قبول الفكرة", "", "success");
  };

  const handleReject = async (studentId) => {
    const { value: reason } = await Swal.fire({
      title: "سبب الرفض",
      input: "textarea",
      inputPlaceholder: "أدخل سبب الرفض هنا...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return "الرجاء إدخال سبب الرفض";
        }
      },
    });

    if (reason) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, status: "مرفوضة", rejectReason: reason }
            : s
        )
      );
      Swal.fire("تم رفض الفكرة", "", "success");
    }
  };

  const handleEditIdea = async (student) => {
    const { value: newIdea } = await Swal.fire({
      title: "تعديل الفكرة",
      input: "textarea",
      inputValue: student.idea,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return "لا يمكن ترك الفكرة فارغة";
        }
      },
    });

    if (newIdea) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, idea: newIdea } : s
        )
      );
      Swal.fire("تم التعديل بنجاح", "", "success");
    }
  };

  const handleDeleteIdea = async (studentId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد من حذف الفكرة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      Swal.fire("تم الحذف", "تم حذف الفكرة بنجاح", "success");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">لوحة تحكم الإدارة</h1>
        <div className="space-x-2">
          <button
            onClick={() => handleAdd("student")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            إضافة طالب
          </button>
          <button
            onClick={() => handleAdd("teacher")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            إضافة معلم
          </button>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">الطلاب</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">الاسم</th>
                <th className="border p-2">الفكرة</th>
                <th className="border p-2">الحالة</th>
                <th className="border p-2">المعلم</th>
                <th className="border p-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const teacherName = teachers.find(t => t.id === student.teacherId)?.name || "غير معين";
                return (
                  <tr
                    key={student.id}
                    className={`border-b ${
                      student.status === "مرفوضة" ? "bg-red-50" :
                      student.status === "مقبولة" ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="border p-2">{student.name}</td>
                    <td className="border p-2 whitespace-pre-wrap max-w-xs">{student.idea}</td>
                    <td className="border p-2">{student.status}</td>
                    <td className="border p-2">{teacherName}</td>
                    <td className="border p-2 space-x-1 flex justify-end">
                      {student.status === "قيد المراجعة" && (
                        <>
                          <button
                            onClick={() => acceptIdea(student.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleEditIdea(student)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleReject(student.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {student.status === "مرفوضة" && (
                        <>
                          <button
                            onClick={() => handleDeleteIdea(student.id)}
                            className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded"
                          >
                            حذف الفكرة
                          </button>
                        </>
                      )}
                      {student.status === "مقبولة" && (
                        <span className="text-green-700 font-semibold">مقبولة</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">المعلمين</h2>
        <ul className="list-disc list-inside">
          {teachers.map((teacher) => (
            <li key={teacher.id}>{teacher.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPage;