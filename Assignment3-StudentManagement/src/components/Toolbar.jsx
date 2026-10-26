import { DEPARTMENTS } from "../data/students.js";

export default function Toolbar({ search, onSearch, department, onDepartment, sortBy, onSort, view, onView, count, total }) {
  return (
    <section className="toolbar" aria-label="Search and filters">
      <div className="toolbar-row">
        <label className="search">
          <span className="visually-hidden">Search students</span>
          <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search by name, roll number or email" />
        </label>

        <label className="sort">
          Sort by
          <select value={sortBy} onChange={(e) => onSort(e.target.value)}>
            <option value="name">Name (A to Z)</option>
            <option value="cgpa">CGPA (high to low)</option>
            <option value="attendance">Attendance (high to low)</option>
            <option value="year">Year (high to low)</option>
          </select>
        </label>

        <div className="view-toggle" role="group" aria-label="Layout">
          <button aria-pressed={view === "grid"} onClick={() => onView("grid")}>Cards</button>
          <button aria-pressed={view === "table"} onClick={() => onView("table")}>Table</button>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filter by department">
        {["All", ...DEPARTMENTS].map((d) => (
          <button key={d} className="chip" aria-pressed={department === d} onClick={() => onDepartment(d)}>
            {d}
          </button>
        ))}
        <span className="count" aria-live="polite">
          Showing {count} of {total}
        </span>
      </div>
    </section>
  );
}
