import { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import StudentForm from "./components/StudentForm.jsx";
import StudentList from "./components/StudentList.jsx";

const initialStudents = [
  { id: 1, name: "Lakshya Agarwal", rollNo: "A101", email: "lakshya@example.com", course: "Data Science Engineering" },
  { id: 2, name: "Aarav Sharma", rollNo: "A102", email: "aarav.sharma@example.com", course: "Computer Science" },
  { id: 3, name: "Riya Patel", rollNo: "A103", email: "riya.patel@example.com", course: "Data Science Engineering" },
  { id: 4, name: "Kabir Verma", rollNo: "A104", email: "kabir.verma@example.com", course: "Information Technology" },
  { id: 5, name: "Sneha Joshi", rollNo: "A105", email: "sneha.joshi@example.com", course: "Computer Science" },
];

function App() {
  // State: the list of students and the student currently being edited (null = adding new)
  const [students, setStudents] = useState(initialStudents);
  const [editingStudent, setEditingStudent] = useState(null);

  // CREATE
  const addStudent = (student) => {
    setStudents([...students, { ...student, id: Date.now() }]);
  };

  // UPDATE
  const updateStudent = (updated) => {
    setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
    setEditingStudent(null);
  };

  // DELETE
  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id));
      if (editingStudent && editingStudent.id === id) setEditingStudent(null);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">🎓 EduTrack Admin</div>
        <a href="#student-form" className="btn btn-primary" onClick={() => setEditingStudent(null)}>
          + Add New Student
        </a>
      </header>

      <main className="container">
        {/* READ: dashboard and list both receive the students array as props */}
        <Dashboard students={students} />

        <StudentForm
          onAdd={addStudent}
          onUpdate={updateStudent}
          editingStudent={editingStudent}
          onCancel={() => setEditingStudent(null)}
        />

        <StudentList students={students} onEdit={setEditingStudent} onDelete={deleteStudent} />
      </main>
    </div>
  );
}

export default App;
