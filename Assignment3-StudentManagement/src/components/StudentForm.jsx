import { useEffect, useRef, useState } from "react";
import { DEPARTMENTS } from "../data/students.js";

const EMPTY = { name: "", rollNo: "", email: "", department: DEPARTMENTS[0], year: 1, cgpa: "", attendance: "" };

function validate(form, existingRollNos) {
  const errors = {};
  if (form.name.trim().length < 3) errors.name = "Enter the student's full name (at least 3 letters).";
  if (!/^[A-Za-z]{2,4}-\d{3}$/.test(form.rollNo.trim())) errors.rollNo = "Use the format DEPT-123, for example CS-145.";
  else if (existingRollNos.includes(form.rollNo.trim().toLowerCase())) errors.rollNo = "Another student already has this roll number.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter an email like name@college.edu.";
  const cgpa = Number(form.cgpa);
  if (form.cgpa === "" || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) errors.cgpa = "CGPA must be between 0 and 10.";
  const att = Number(form.attendance);
  if (form.attendance === "" || !Number.isInteger(att) || att < 0 || att > 100) errors.attendance = "Attendance must be a whole number from 0 to 100.";
  return errors;
}

// Slide-over form used for both "Add" (student = null) and "Edit"
export default function StudentForm({ student, existingRollNos, onSave, onClose }) {
  const [form, setForm] = useState(student || EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched) setErrors(validate(next, existingRollNos));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(form, existingRollNos);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSave({
      ...form,
      name: form.name.trim(),
      rollNo: form.rollNo.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      year: Number(form.year),
      cgpa: Number(form.cgpa),
      attendance: Number(form.attendance),
    });
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={form[name]} onChange={handleChange} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && <p className="error" id={`${name}-err`}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="drawer-head">
          <h2 id="form-title">{student ? `Edit ${student.name}` : "Add a student"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close form">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {field("name", "Full name", { placeholder: "Priya Nair", ref: firstField, autoComplete: "off" })}
          <div className="two">
            {field("rollNo", "Roll number", { placeholder: "CS-145" })}
            <div className="field">
              <label htmlFor="year">Year</label>
              <select id="year" name="year" value={form.year} onChange={handleChange}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>
          {field("email", "College email", { placeholder: "priya.nair@college.edu", type: "email" })}
          <div className="field">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={form.department} onChange={handleChange}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="two">
            {field("cgpa", "CGPA", { placeholder: "8.5", inputMode: "decimal" })}
            {field("attendance", "Attendance %", { placeholder: "85", inputMode: "numeric" })}
          </div>

          <div className="drawer-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{student ? "Save changes" : "Add student"}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}
