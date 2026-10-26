export default function Header({ onAdd }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">R</span>
        <div>
          <p className="brand-name">Rollcall</p>
          <p className="brand-sub">Student register, B.Tech 2026</p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onAdd}>
        + Add student
      </button>
    </header>
  );
}
