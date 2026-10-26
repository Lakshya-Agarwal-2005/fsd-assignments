import StudentItem from "./StudentItem.jsx";

export default function StudentList({ students, view, onEdit, onDelete, onAdd, onReset, isFiltered }) {
  if (students.length === 0) {
    return (
      <section className="empty">
        <p className="empty-title">{isFiltered ? "No students match these filters" : "The register is empty"}</p>
        <p>{isFiltered ? "Clear the search or pick another department." : "Add your first student, or bring back the sample class."}</p>
        {!isFiltered && (
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={onAdd}>+ Add student</button>
            <button className="btn btn-ghost" onClick={onReset}>Load sample class</button>
          </div>
        )}
      </section>
    );
  }

  if (view === "table") {
    return (
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Roll no.</th>
              <th scope="col">Department</th>
              <th scope="col">Year</th>
              <th scope="col">CGPA</th>
              <th scope="col">Attendance</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <StudentItem key={s.id} student={s} view="table" onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <section className="grid">
      {students.map((s) => (
        <StudentItem key={s.id} student={s} view="grid" onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  );
}
