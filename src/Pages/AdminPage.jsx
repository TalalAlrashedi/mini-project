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
    setStudents(res.data.filter((u) => u.role === "student"));
    setTeachers(res.data.filter((u) => u.role === "teacher"));
  };

  const filteredStudents = students.filter((s) => s.username?.includes(search));

  const handleIdeaAction = async (student, index, type) => {
    const updatedIdeas = [...(student.ideas || [])];
    if (type === "accept") {
      updatedIdeas[index].status = "مقبولة";
    } else if (type === "reject") {
      const { value: reason } = await Swal.fire({
        title: "سبب الرفض",
        input: "textarea",
        showCancelButton: true,
      });
      if (!reason) return;
      updatedIdeas[index].status = "مرفوضة";
      updatedIdeas[index].rejectReason = reason;
    } else if (type === "edit") {
      const { value: newIdea } = await Swal.fire({
        title: "تعديل الفكرة",
        input: "textarea",
        inputValue: updatedIdeas[index].idea,
        showCancelButton: true,
      });
      if (!newIdea) return;
      updatedIdeas[index].idea = newIdea;
    } else if (type === "delete") {
      const res = await Swal.fire({
        title: "هل أنت متأكد من حذف الفكرة؟",
        icon: "warning",
        showCancelButton: true,
      });
      if (!res.isConfirmed) return;
      updatedIdeas.splice(index, 1);
    }

    await axios.put(`${api}/${student.id}`, { ...student, ideas: updatedIdeas });
    fetchData();
  };

  const handleAdd = async (type) => {
    if (type === "student") {
      const { value: form } = await Swal.fire({
        title: "إضافة طالب",
        html:
          '<input id="swal-name" class="swal2-input" placeholder="الاسم">' +
          '<input id="swal-email" class="swal2-input" placeholder="البريد">' +
          `<select id="swal-teacher" class="swal2-select">
            <option value="">اختر المعلم</option>
            ${teachers.map((t) => `<option value="${t.id}">${t.username}</option>`).join("")}
          </select>`,
        preConfirm: () => {
          const name = document.getElementById("swal-name").value;
          const email = document.getElementById("swal-email").value;
          const teacherId = document.getElementById("swal-teacher").value;
          if (!name || !email || !teacherId) return false;
          return { name, email, teacherId };
        },
        showCancelButton: true,
      });
      if (form) {
        await axios.post(api, {
          username: form.name,
          email: form.email,
          ideas: [],
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
      });
      if (name) {
        await axios.post(api, { username: name, role: "teacher" });
        fetchData();
      }
    }
  };

  const handleAssignTeacher = async (student) => {
    const { value: selectedId } = await Swal.fire({
      title: `تعيين معلم للطالب: ${student.username}`,
      input: "select",
      inputOptions: Object.fromEntries(teachers.map((t) => [t.id, t.username])),
      inputPlaceholder: "اختر معلماً",
      showCancelButton: true,
    });
    if (selectedId) {
      await axios.put(`${api}/${student.id}`, { ...student, teacherId: selectedId });
      fetchData();
      Swal.fire("تم", "تم ربط الطالب بالمعلم بنجاح", "success");
    }
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
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

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">الطالب</th>
              <th className="p-3">الأفكار</th>
              <th className="p-3">المعلم</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-t align-top">
                <td className="p-3 font-medium">{s.username}</td>
                <td className="p-3 space-y-3">
                  {(s.ideas || []).map((idea, idx) => (
                    <div key={idx} className="border p-2 rounded bg-gray-50">
                      <p>{idea.idea}</p>
                      <p className="text-sm text-gray-600">الحالة: {idea.status}</p>
                      {idea.status === "مرفوضة" && (
                        <p className="text-sm text-red-600">سبب الرفض: {idea.rejectReason}</p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {idea.status === "قيد المراجعة" && (
                          <>
                            <button
                              onClick={() => handleIdeaAction(s, idx, "accept")}
                              className="bg-green-500 text-white px-2 py-1 rounded"
                            >
                              قبول
                            </button>
                            <button
                              onClick={() => handleIdeaAction(s, idx, "reject")}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              رفض
                            </button>
                            <button
                              onClick={() => handleIdeaAction(s, idx, "edit")}
                              className="bg-yellow-400 text-white px-2 py-1 rounded"
                            >
                              تعديل
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleIdeaAction(s, idx, "delete")}
                          className="bg-red-800 text-white px-2 py-1 rounded"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  {teachers.find((t) => t.id === s.teacherId)?.username || (
                    <button
                      onClick={() => handleAssignTeacher(s)}
                      className="text-blue-600 underline"
                    >
                      تعيين معلم
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(s)} className="text-red-600">
                    حذف الطالب
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
            <li key={t.id} className="flex justify-between items-center">
              <span>{t.username}</span>
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