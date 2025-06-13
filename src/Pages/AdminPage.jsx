import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const AdminPage = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([
    { id: 1, name: "د. فهد" },
    { id: 2, name: "د. ليلى" },
  ]);

  const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    axios.get(api).then((res) => {
      setStudents(res.data);
      localStorage.setItem("students", JSON.stringify(res.data));
    });
  };

  const handleAdd = async (type) => {
    if (type === "student") {
      const { value: formValues } = await Swal.fire({
        title: `إضافة طالب جديد`,
        html:
          `<input id="swal-input1" class="swal2-input" placeholder="الاسم">` +
          `<textarea id="swal-input2" class="swal2-textarea" placeholder="الفكرة"></textarea>` +
          `<select id="swal-input3" class="swal2-select">
            <option value="">اختر المعلم</option>
            ${teachers.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}
          </select>`,
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById("swal-input1").value.trim();
          const idea = document.getElementById("swal-input2").value.trim();
          const teacherId = document.getElementById("swal-input3").value;
          if (!name) return Swal.showValidationMessage("الرجاء إدخال الاسم");
          if (!idea) return Swal.showValidationMessage("الرجاء إدخال الفكرة");
          if (!teacherId) return Swal.showValidationMessage("الرجاء اختيار المعلم");
          return { name, idea, teacherId };
        },
        showCancelButton: true,
      });

      if (formValues) {
        await axios.post(api, {
          name: formValues.name,
          idea: formValues.idea,
          status: "قيد المراجعة",
          rejectReason: "",
          teacherId: Number(formValues.teacherId),
        });
        refreshData();
      }
    } else {
      const { value: formValues } = await Swal.fire({
        title: `إضافة معلم جديد`,
        html: `<input id="swal-input1" class="swal2-input" placeholder="الاسم">`,
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById("swal-input1").value.trim();
          if (!name) return Swal.showValidationMessage("الرجاء إدخال الاسم");
          return { name };
        },
        showCancelButton: true,
      });
      if (formValues) {
        setTeachers((prev) => [...prev, { id: Date.now(), name: formValues.name }]);
        Swal.fire("تمت الإضافة بنجاح", "", "success");
      }
    }
  };

  const acceptIdea = async (student) => {
    await axios.put(`${api}/${student.id}`, {
      ...student,
      status: "مقبولة",
      rejectReason: "",
    });
    refreshData();
    Swal.fire("تم قبول الفكرة", "", "success");
  };

  const handleReject = async (student) => {
    const { value: reason } = await Swal.fire({
      title: "سبب الرفض",
      input: "textarea",
      inputPlaceholder: "أدخل سبب الرفض هنا...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) return "الرجاء إدخال سبب الرفض";
      },
    });
    if (reason) {
      await axios.put(`${api}/${student.id}`, {
        ...student,
        status: "مرفوضة",
        rejectReason: reason,
      });
      refreshData();
      Swal.fire("تم الرفض", "", "success");
    }
  };

  const handleEdit = async (student) => {
    const { value: newIdea } = await Swal.fire({
      title: "تعديل الفكرة",
      input: "textarea",
      inputValue: student.idea,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) return "لا يمكن ترك الفكرة فارغة";
      },
    });
    if (newIdea) {
      await axios.put(`${api}/${student.id}`, {
        ...student,
        idea: newIdea,
      });
      refreshData();
      Swal.fire("تم التعديل", "", "success");
    }
  };

  const handleDelete = async (studentId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد من الحذف؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });
    if (result.isConfirmed) {
      await axios.delete(`${api}/${studentId}`);
      refreshData();
      Swal.fire("تم الحذف", "", "success");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">لوحة تحكم الإدارة</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAdd("student")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            إضافة طالب
          </button>
          <button
            onClick={() => handleAdd("teacher")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            إضافة معلم
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="min-w-full text-right border-collapse">
          <thead className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white">
            <tr>
              <th className="py-3 px-6 font-semibold border-l border-white">الاسم</th>
              <th className="py-3 px-6 font-semibold border-l border-white max-w-xs">الفكرة</th>
              <th className="py-3 px-6 font-semibold border-l border-white">الحالة</th>
              <th className="py-3 px-6 font-semibold border-l border-white">المعلم</th>
              <th className="py-3 px-6 font-semibold border-l border-white">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const teacherName = teachers.find((t) => t.id === student.teacherId)?.name || "غير معين";
              const statusColors = {
                "قيد المراجعة": "bg-yellow-100 text-yellow-800",
                "مقبولة": "bg-green-100 text-green-800",
                "مرفوضة": "bg-red-100 text-red-800",
              };
              return (
                <tr
                  key={student.id}
                  className={`border-b last:border-b-0 ${
                    student.status === "مرفوضة"
                      ? "bg-red-50"
                      : student.status === "مقبولة"
                      ? "bg-green-50"
                      : "bg-yellow-50"
                  } hover:shadow-md transition`}
                >
                  <td className="border-l border-gray-200 py-3 px-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
                  <td className="border-l border-gray-200 py-3 px-4 max-w-xs whitespace-pre-wrap break-words text-gray-700">{student.idea}</td>
                  <td>
                    <span
                      className={`inline-block py-1 px-3 rounded-full font-semibold text-sm ${statusColors[student.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="border-l border-gray-200 py-3 px-4 font-semibold text-indigo-700">{teacherName}</td>
                  <td className="border-l border-gray-200 py-3 px-4 flex flex-wrap justify-end gap-2">
                    {student.status === "قيد المراجعة" && (
                      <>
                        <button
                          onClick={() => acceptIdea(student)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleReject(student)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
                        >
                          رفض
                        </button>
                      </>
                    )}
                    {student.status === "مرفوضة" && (
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded-md transition"
                      >
                        حذف
                      </button>
                    )}
                    {student.status === "مقبولة" && (
                      <span className="text-green-700 font-semibold py-1 px-3">مقبولة</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2 text-center text-indigo-700">المعلمون</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-800">
          {teachers.map((teacher) => (
            <li
              key={teacher.id}
              className="bg-indigo-50 rounded-md px-3 py-2 font-medium hover:bg-indigo-100 cursor-default transition"
            >
              {teacher.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPage;