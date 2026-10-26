import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Header from "./components/Header.jsx";
import Chalkboard from "./components/Chalkboard.jsx";
import Toolbar from "./components/Toolbar.jsx";
import StudentList from "./components/StudentList.jsx";
import StudentForm from "./components/StudentForm.jsx";
import Toast from "./components/Toast.jsx";
import { initialStudents } from "./data/students.js";

const STORAGE_KEY = "rollcall-students";

function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : initialStudents;
  } catch {
    return initialStudents;
  }
}

// All CRUD changes to the student list go through this reducer
function studentsReducer(students, action) {
  switch (action.type) {
    case "add":
      return [...students, { ...action.student, id: Date.now() }];
    case "update":
      return students.map((s) => (s.id === action.student.id ? action.student : s));
    case "delete":
      return students.filter((s) => s.id !== action.id);
    case "restore": {
      const copy = [...students];
      copy.splice(action.index, 0, action.student);
      return copy;
    }
    case "reset":
      return initialStudents;
    default:
      return students;
  }
}

export default function App() {
  const [students, dispatch] = useReducer(studentsReducer, undefined, loadStudents);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [view, setView] = useState("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      /* storage unavailable: the app still works for this session */
    }
  }, [students]);

  // READ: search + filter + sort (recomputed only when its inputs change)
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => department === "All" || s.department === department)
      .filter((s) => !q || [s.name, s.rollNo, s.email].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]));
  }, [students, search, department, sortBy]);

  const closeToast = useCallback(() => setToast(null), []);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setFormOpen(true);
  };

  // CREATE + UPDATE
  const saveStudent = (student) => {
    if (editing) {
      dispatch({ type: "update", student });
      setToast({ message: `Saved changes to ${student.name}` });
    } else {
      dispatch({ type: "add", student });
      setToast({ message: `Added ${student.name} to the register` });
    }
    setFormOpen(false);
  };

  // DELETE (with undo)
  const deleteStudent = (student) => {
    const index = students.findIndex((s) => s.id === student.id);
    dispatch({ type: "delete", id: student.id });
    setToast({
      message: `Removed ${student.name}`,
      action: { label: "Undo", onClick: () => dispatch({ type: "restore", student, index }) },
    });
  };

  return (
    <div className="app">
      <Header onAdd={openAdd} />

      <main className="container">
        <Chalkboard students={students} />

        <Toolbar
          search={search}
          onSearch={setSearch}
          department={department}
          onDepartment={setDepartment}
          sortBy={sortBy}
          onSort={setSortBy}
          view={view}
          onView={setView}
          count={visible.length}
          total={students.length}
        />

        <StudentList
          students={visible}
          view={view}
          onEdit={openEdit}
          onDelete={deleteStudent}
          onAdd={openAdd}
          onReset={() => dispatch({ type: "reset" })}
          isFiltered={visible.length !== students.length}
        />
      </main>

      {formOpen && (
        <StudentForm
          student={editing}
          existingRollNos={students.filter((s) => s.id !== editing?.id).map((s) => s.rollNo.toLowerCase())}
          onSave={saveStudent}
          onClose={() => setFormOpen(false)}
        />
      )}

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  );
}
