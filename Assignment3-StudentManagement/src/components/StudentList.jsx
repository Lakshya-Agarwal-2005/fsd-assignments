import StudentItem from "./StudentItem.jsx";

function StudentList({ students, onEdit, onDelete }) {
  return (
    <section className="card">
      <h3>Student Records ({students.length})</h3>
      {students.length === 0 ? (
        <p className="muted">No students found. Add a new student above.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Email</th>
                <th>Course</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <StudentItem key={student.id} student={student} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StudentList;
