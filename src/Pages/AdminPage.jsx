import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaCheck, FaTimes } from 'react-icons/fa'; 

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

  const filteredStudents = students.filter((s) =>
    s.username?.includes(search)
  );

  const acceptedCount = students.reduce((acc, student) => {
    return (
      acc +
      (student.ideas || []).filter((idea) => idea.status === "مقبولة").length
    );
  }, 0);

  const rejectedCount = students.reduce((acc, student) => {
    return (
      acc +
      (student.ideas || []).filter((idea) => idea.status === "مرفوضة").length
    );
  }, 0);

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

    await axios.put(`${api}/${student.id}`, {
      ...student,
      ideas: updatedIdeas,
    });
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
            ${teachers
              .map((t) => `<option value="${t.id}">${t.username}</option>`)
              .join("")}
          </select>`,
        preConfirm: () => {
          const name = document.getElementById("swal-name").value;
          const email = document.getElementById("swal-email").value;
          const teacherId = document.getElementById("swal-teacher").value;
          if (!name || !email || !teacherId) {
            Swal.showValidationMessage("الرجاء تعبئة جميع الحقول");
            return false;
          }
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
        Swal.fire("تمت الإضافة", "تم إضافة الطالب بنجاح", "success");
      }
    } else {
      const { value: name } = await Swal.fire({
        title: "إضافة معلم",
        input: "text",
        inputPlaceholder: "اسم المعلم",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "الرجاء إدخال اسم المعلم";
          }
        },
      });
      if (name) {
        await axios.post(api, { username: name, role: "teacher" });
        fetchData();
        Swal.fire("تمت الإضافة", "تم إضافة المعلم بنجاح", "success");
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
      await axios.put(`${api}/${student.id}`, {
        ...student,
        teacherId: selectedId,
      });
      fetchData();
      Swal.fire("تم", "تم ربط الطالب بالمعلم بنجاح", "success");
    }
  };

  const handleDelete = async (user) => {
    const res = await Swal.fire({
      title: `هل أنت متأكد من حذف ${
        user.role === "teacher" ? "المعلم" : "الطالب"
      }؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });
    if (res.isConfirmed) {
      await axios.delete(`${api}/${user.id}`);
      fetchData();
      Swal.fire(
        "تم الحذف!",
        `تم حذف ${user.role === "teacher" ? "المعلم" : "الطالب"} بنجاح.`,
        "success"
      );
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-violet-50 px-4 py-6 font-[Cairo]">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-wrap gap-4 justify-between items-center bg-white shadow rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <img src="https://cdn.tuwaiq.edu.sa/landing/images/logo/logo-h.png" className="w-28 sm:w-32" alt="Tuwaiq Academy Logo" />
            <h1 className="text-2xl sm:text-3xl font-bold text-violet-700">لوحة تحكم الادمن</h1>
          </div>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition">
            تسجيل خروج
          </button>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-4">
            <FaUserGraduate className="text-3xl text-violet-600" />
            <div>
              <p className="text-sm text-gray-500">الطلاب</p>
              <p className="text-xl font-bold text-gray-700">{students.length}</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-4">
            <FaChalkboardTeacher className="text-3xl text-green-600" />
            <div>
              <p className="text-sm text-gray-500">المعلمين</p>
              <p className="text-xl font-bold text-gray-700">{teachers.length}</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-4">
            <FaCheck className="text-3xl text-green-500" />
            <div>
              <p className="text-sm text-gray-500">أفكار مقبولة</p>
              <p className="text-xl font-bold text-gray-700">{acceptedCount}</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-4">
            <FaTimes className="text-3xl text-red-500" />
            <div>
              <p className="text-sm text-gray-500">أفكار مرفوضة</p>
              <p className="text-xl font-bold text-gray-700">{rejectedCount}</p>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button onClick={() => handleAdd("student")} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium">
                إضافة طالب
              </button>
              <button onClick={() => handleAdd("teacher")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                إضافة معلم
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن طالب..."
              className="w-full sm:w-72 border border-gray-300 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow overflow-auto">
          <div className="px-6 py-4 bg-violet-50 border-b border-violet-200">
            <h2 className="text-xl font-bold text-violet-700">قائمة الطلاب</h2>
          </div>
          <div className="min-w-[850px]">
            <table className="w-full table-auto border border-violet-300 text-right">
              <thead className="bg-violet-100 text-violet-800">
                <tr>
                  <th className="p-3 border border-violet-300">الطالب</th>
                  <th className="p-3 border border-violet-300">الأفكار</th>
                  <th className="p-3 border border-violet-300">المعلم</th>
                  <th className="p-3 border border-violet-300">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="p-4 border border-violet-200 font-semibold text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex justify-center items-center text-violet-700 font-bold">
                          {s.username.charAt(0)}
                        </div>
                        <span>{s.username}</span>
                      </div>
                    </td>
                    <td className="p-4 border border-violet-200">
                      <div className="space-y-2 max-w-sm">
                        {(s.ideas || []).map((idea, idx) => {
                          let bg = "bg-gray-50",
                            text = "text-gray-700",
                            border = "border-gray-300";
                          if (idea.status === "مقبولة") {
                            bg = "bg-green-50";
                            text = "text-green-700 font-semibold";
                            border = "border-green-300";
                          } else if (idea.status === "مرفوضة") {
                            bg = "bg-red-50";
                            text = "text-red-700 font-semibold";
                            border = "border-red-300";
                          } else if (idea.status === "قيد المراجعة") {
                            bg = "bg-yellow-50";
                            text = "text-yellow-700 font-semibold";
                            border = "border-yellow-300";
                          }

                          return (
                            <div
                              key={idx}
                              className={`${bg} border ${border} p-3 rounded-lg text-sm`}
                            >
                              <p className="text-gray-800 mb-2 break-words">
                                {idea.idea}
                              </p>
                              <div className="flex flex-wrap gap-2 items-center text-xs mb-2">
                                <span className="bg-white px-2 py-1 rounded-lg border">
                                  الحالة:
                                </span>
                                <span className={text}>{idea.status}</span>
                              </div>
                              {idea.status === "مرفوضة" && (
                                <p className="text-red-600 bg-red-100 p-2 rounded-lg text-xs mb-2">
                                  سبب الرفض: {idea.rejectReason}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {idea.status === "قيد المراجعة" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleIdeaAction(s, idx, "accept")
                                      }
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs"
                                    >
                                      قبول
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleIdeaAction(s, idx, "reject")
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                                    >
                                      رفض
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleIdeaAction(s, idx, "edit")
                                      }
                                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs"
                                    >
                                      تعديل
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() =>
                                    handleIdeaAction(s, idx, "delete")
                                  }
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-md text-xs"
                                >
                                  حذف
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {(!s.ideas || s.ideas.length === 0) && (
                          <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border">
                            لا توجد أفكار
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 border border-violet-200 text-gray-800 align-top">
                      <div className="flex flex-col gap-2">
                        <span>
                          {teachers.find((t) => t.id === s.teacherId)
                            ?.username || "لا يوجد معلم"}
                        </span>
                        <button
                          onClick={() => handleAssignTeacher(s)}
                          className="text-violet-600 hover:text-violet-800 underline font-medium text-sm"
                        >
                          {s.teacherId ? "تغيير المعلم" : "تعيين معلم"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 border border-violet-200 align-top">
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-red-500 hover:text-red-600 font-semibold text-sm hover:underline"
                      >
                        حذف الطالب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-medium">لا يوجد طلاب لعرضهم</p>
                <p className="text-sm">ابدأ بإضافة طالب جديد</p>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-violet-50 border-b border-violet-200">
            <h2 className="text-xl font-bold text-violet-700">
              قائمة المعلمين
            </h2>
          </div>
          <div className="p-6">
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((t) => (
                  <div
                    key={t.id}
                    className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center text-violet-700 font-bold">
                        {t.username.charAt(0)}
                      </div>
                      <span className="text-gray-800 font-medium">
                        {t.username}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(t)}
                      className="text-red-500 hover:text-red-600 text-sm font-semibold hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">👨‍🏫</div>
                <p className="text-lg font-medium">لا يوجد معلمون</p>
                <p className="text-sm">ابدأ بإضافة معلم جديد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;