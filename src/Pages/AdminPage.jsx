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
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">لوحة تحكم الإدارة</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          تسجيل خروج
        </button>
      </div>
  
      <div className="flex flex-wrap gap-4 items-center">
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
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن طالب"
          className="border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg w-64 transition"
        />
      </div>
  
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-300">
        <table className="w-full table-auto border-collapse text-right">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-4 border border-gray-300">الطالب</th>
              <th className="p-4 border border-gray-300">الأفكار</th>
              <th className="p-4 border border-gray-300">المعلم</th>
              <th className="p-4 border border-gray-300">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-100 transition"
              >
                <td className="p-4 font-semibold text-gray-900 border border-gray-300 align-top">
                  {s.username}
                </td>
                <td className="p-4 border border-gray-300 space-y-4 align-top">
                  {(s.ideas || []).map((idea, idx) => {
                    let bgColor = "bg-gray-50";
                    let statusColor = "text-gray-600";
                    if (idea.status === "مقبولة") {
                      bgColor = "bg-green-100";
                      statusColor = "text-green-700 font-bold";
                    } else if (idea.status === "مرفوضة") {
                      bgColor = "bg-red-100";
                      statusColor = "text-red-700 font-bold";
                    } else if (idea.status === "قيد المراجعة") {
                      bgColor = "bg-yellow-100";
                      statusColor = "text-yellow-700 font-semibold";
                    }
  
                    return (
                      <div
                        key={idx}
                        className={`${bgColor} border border-gray-300 rounded-lg p-4 shadow-sm`}
                      >
                        <p className="text-gray-800">{idea.idea}</p>
                        <p className={`text-sm ${statusColor}`}>
                          الحالة: {idea.status}
                        </p>
                        {idea.status === "مرفوضة" && (
                          <p className="text-sm text-red-600 mt-1">
                            سبب الرفض: {idea.rejectReason}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {idea.status === "قيد المراجعة" && (
                            <>
                              <button
                                onClick={() =>
                                  handleIdeaAction(s, idx, "accept")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition"
                              >
                                قبول
                              </button>
                              <button
                                onClick={() =>
                                  handleIdeaAction(s, idx, "reject")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
                              >
                                رفض
                              </button>
                              <button
                                onClick={() =>
                                  handleIdeaAction(s, idx, "edit")
                                }
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md transition"
                              >
                                تعديل
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleIdeaAction(s, idx, "delete")}
                            className="bg-gray-800 hover:bg-black text-white px-3 py-1 rounded-md transition"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </td>
                <td className="p-4 border border-gray-300 align-top text-gray-800">
                  {teachers.find((t) => t.id === s.teacherId)?.username || (
                    <button
                      onClick={() => handleAssignTeacher(s)}
                      className="text-blue-600 underline hover:text-blue-800 transition"
                    >
                      تعيين معلم
                    </button>
                  )}
                </td>
                <td className="p-4 border border-gray-300 align-top">
                  <button
                    onClick={() => handleDelete(s)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    حذف الطالب
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">قائمة المعلمين</h2>
        <ul className="space-y-2">
          {teachers.map((t) => (
            <li
              key={t.id}
              className="flex justify-between items-center border-b border-gray-300 pb-2"
            >
              <span className="text-gray-800 font-medium">{t.username}</span>
              <button
                onClick={() => handleDelete(t)}
                className="text-red-600 hover:underline text-sm font-semibold"
              >
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