import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const api = "https://6836b885664e72d28e41d28e.mockapi.io/api/register";
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(api);
    setStudents(res.data);
    const teacherList = res.data.filter((u) => u.role === "teacher");
    setTeachers(teacherList);
  };

  const filteredStudents = students
    .filter((s) => s.role === "student")
    .filter((s) => s.name?.includes(search));

  const handleAdd = async (type) => {
    if (type === "student") {
      const { value: form } = await Swal.fire({
        title: "إضافة طالب",
        html:
          '<input id="swal-name" class="swal2-input" placeholder="الاسم">' +
          '<textarea id="swal-idea" class="swal2-textarea" placeholder="الفكرة"></textarea>' +
          `<select id="swal-teacher" class="swal2-select">
            <option value="">اختر المعلم</option>
            ${teachers.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}
          </select>`,
        preConfirm: () => {
          const name = document.getElementById("swal-name").value;
          const idea = document.getElementById("swal-idea").value;
          const teacherId = document.getElementById("swal-teacher").value;
          if (!name || !idea || !teacherId) return false;
          return { name, idea, teacherId };
        },
        showCancelButton: true,
      });
      if (form) {
        await axios.post(api, {
          name: form.name,
          idea: form.idea,
          status: "قيد المراجعة",
          role: "student",
          teacherId: form.teacherId,
        });
        fetchData();
      }
    } else {
      const { value: name } = await Swal.fire({
        title: "إضافة معلم",
        input: "text",
        inputPlaceholder: "اسم المعلم",
        showCancelButton: true,
        inputValidator: (val) => (!val ? "الرجاء إدخال الاسم" : null),
      });
      if (name) {
        await axios.post(api, {
          name,
          role: "teacher",
        });
        fetchData();
      }
    }
  };

  const handleEdit = async (student) => {
    const { value: idea } = await Swal.fire({
      title: "تعديل الفكرة",
      input: "textarea",
      inputValue: student.idea,
      showCancelButton: true,
    });
    if (idea) {
      await axios.put(`${api}/${student.id}`, { ...student, idea });
      fetchData();
    }
  };

  const handleReject = async (student) => {
    const { value: reason } = await Swal.fire({
      title: "سبب الرفض",
      input: "textarea",
      showCancelButton: true,
    });
    if (reason) {
      await axios.put(`${api}/${student.id}`, {
        ...student,
        status: "مرفوضة",
        rejectReason: reason,
      });
      fetchData();
    }
  };

  const handleAccept = async (student) => {
    await axios.put(`${api}/${student.id}`, { ...student, status: "مقبولة" });
    fetchData();
  };

  const handleDelete = async (user) => {
    const res = await Swal.fire({
      title: `هل أنت متأكد من حذف ${user.role === "teacher" ? "المعلم" : "الطالب"}؟`,
      icon: "warning",
      showCancelButton: true,
    });
    if (res.isConfirmed) {
      await axios.delete(`${api}/${user.id}`);
      fetchData();
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">لوحة تحكم الإدارة</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          تسجيل خروج
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => handleAdd("student")} className="bg-blue-600 text-white px-4 py-2 rounded">
          إضافة طالب
        </button>
        <button onClick={() => handleAdd("teacher")} className="bg-green-600 text-white px-4 py-2 rounded">
          إضافة معلم
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن طالب"
          className="border p-2 rounded w-64"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-right">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">الاسم</th>
              <th className="p-3">الفكرة</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">المعلم</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.idea}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">{teachers.find((t) => t.id === s.teacherId)?.name || "غير معين"}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  {s.status === "قيد المراجعة" && (
                    <>
                      <button onClick={() => handleAccept(s)} className="bg-green-600 text-white px-2 py-1 rounded">
                        قبول
                      </button>
                      <button onClick={() => handleReject(s)} className="bg-red-600 text-white px-2 py-1 rounded">
                        رفض
                      </button>
                      <button onClick={() => handleEdit(s)} className="bg-yellow-400 text-white px-2 py-1 rounded">
                        تعديل
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(s)} className="bg-red-800 text-white px-2 py-1 rounded">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">قائمة المعلمين</h2>
        <ul className="list-disc pr-6 space-y-1">
          {teachers.map((t) => (
            <li key={t.id} className="flex justify-between">
              <span>{t.name}</span>
              <button onClick={() => handleDelete(t)} className="text-red-600 text-sm">
                حذف
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;