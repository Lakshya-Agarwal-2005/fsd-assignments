import { useEffect, useState } from "react";

const courses = ["Data Science Engineering", "Computer Science", "Information Technology", "Electronics"];
const emptyForm = { name: "", rollNo: "", email: "", course: courses[0] };

function StudentForm({ onAdd, onUpdate, editingStudent, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // When "Edit" is clicked, fill the form with that student's data
  useEffect(() => {
    setForm(editingStudent || emptyForm);
    setError("");
  }, [editingStudent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim() || !form.email.trim()) {
      setError("Please fill in all the fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    editingStudent ? onUpdate(form) : onAdd(form);
    setForm(emptyForm);
    setError("");
  };

  return (
    <section className="card" id="student-form">
      <h3>{editingStudent ? "Update Student" : "Add New Student"}</h3>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" />

        <label>Roll Number</label>
        <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. A106" />

        <label>Email Address</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="e.g. student@example.com" />

        <label>Course</label>
        <select name="course" value={form.course} onChange={handleChange}>
          {courses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">
            {editingStudent ? "Update Student" : "Add Student"}
          </button>
          {editingStudent && (
            <button type="button" className="btn btn-light" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default StudentForm;
