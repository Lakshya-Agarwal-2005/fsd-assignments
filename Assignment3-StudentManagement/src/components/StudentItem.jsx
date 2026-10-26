function StudentItem({ student, onEdit, onDelete }) {
  return (
    <tr>
      <td className="bold">{student.name}</td>
      <td>{student.rollNo}</td>
      <td className="muted">{student.email}</td>
      <td>
        <span className="tag">{student.course}</span>
      </td>
      <td className="right">
        <button className="btn-sm edit" onClick={() => onEdit(student)}>
          Edit
        </button>
        <button className="btn-sm delete" onClick={() => onDelete(student.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default StudentItem;
