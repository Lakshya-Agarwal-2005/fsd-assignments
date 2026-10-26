const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Same student always gets the same avatar colour
const COLORS = ["#2541b2", "#1f7a5c", "#a23b72", "#b5651d", "#5b4bb7", "#0f7c8c"];
const colorFor = (name) => COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];

function Badges({ student }) {
  return (
    <>
      {student.cgpa >= 9 && <span className="badge star">★ Dean's list</span>}
      {student.attendance < 75 && <span className="badge warn">⚠ Low attendance</span>}
    </>
  );
}

export default function StudentItem({ student, view, onEdit, onDelete }) {
  const actions = (
    <div className="actions">
      <button className="link-btn" onClick={() => onEdit(student)} aria-label={`Edit ${student.name}`}>Edit</button>
      <button className="link-btn danger" onClick={() => onDelete(student)} aria-label={`Delete ${student.name}`}>Delete</button>
    </div>
  );

  if (view === "table") {
    return (
      <tr>
        <td>
          <div className="who">
            <span className="avatar sm" style={{ background: colorFor(student.name) }}>{initials(student.name)}</span>
            <div>
              <div className="name">{student.name}</div>
              <div className="muted small">{student.email}</div>
            </div>
          </div>
        </td>
        <td>{student.rollNo}</td>
        <td>{student.department}</td>
        <td>{student.year}</td>
        <td className="num">{Number(student.cgpa).toFixed(1)}</td>
        <td className={student.attendance < 75 ? "num low" : "num"}>{student.attendance}%</td>
        <td>{actions}</td>
      </tr>
    );
  }

  return (
    <article className="card">
      <div className="card-top">
        <span className="avatar" style={{ background: colorFor(student.name) }}>{initials(student.name)}</span>
        <div className="card-id">
          <h3 className="name">{student.name}</h3>
          <p className="muted small">
            {student.rollNo}, year {student.year}
          </p>
        </div>
      </div>
      <p className="dept">{student.department}</p>
      <p className="muted small email">{student.email}</p>

      <dl className="metrics">
        <div>
          <dt>CGPA</dt>
          <dd>{Number(student.cgpa).toFixed(1)}</dd>
        </div>
        <div>
          <dt>Attendance</dt>
          <dd className={student.attendance < 75 ? "low" : ""}>{student.attendance}%</dd>
        </div>
      </dl>
      <div className="meter" aria-hidden="true">
        <div style={{ width: `${student.attendance}%` }} className={student.attendance < 75 ? "low" : ""} />
      </div>

      <div className="card-foot">
        <div className="badges">
          <Badges student={student} />
        </div>
        {actions}
      </div>
    </article>
  );
}
