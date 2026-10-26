import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { DEPARTMENTS } from "../data/students.js";

const short = { "Computer Science": "CSE", "Data Science": "DS", "Information Tech": "IT", Electronics: "ECE", Mechanical: "MECH" };

function ChalkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chalk-tip">
      <b>{d.full}</b>
      <span>
        {d.count} student{d.count === 1 ? "" : "s"}, avg CGPA {d.avg}
      </span>
    </div>
  );
}

// Summary statistics + department chart, drawn like a classroom chalkboard
export default function Chalkboard({ students }) {
  const avgCgpa = students.length ? students.reduce((s, x) => s + Number(x.cgpa), 0) / students.length : 0;
  const avgAttendance = students.length ? students.reduce((s, x) => s + Number(x.attendance), 0) / students.length : 0;
  const lowAttendance = students.filter((s) => s.attendance < 75).length;
  const topper = students.reduce((best, s) => (!best || s.cgpa > best.cgpa ? s : best), null);

  const data = DEPARTMENTS.map((dep) => {
    const group = students.filter((s) => s.department === dep);
    return {
      name: short[dep],
      full: dep,
      count: group.length,
      avg: group.length ? (group.reduce((s, x) => s + Number(x.cgpa), 0) / group.length).toFixed(1) : "-",
    };
  });

  return (
    <section className="chalkboard" aria-label="Class summary">
      <div className="chalk-stats">
        <div className="chalk-stat">
          <span className="chalk-num">{students.length}</span>
          <span className="chalk-label">students on the register</span>
        </div>
        <div className="chalk-stat">
          <span className="chalk-num">{avgCgpa.toFixed(2)}</span>
          <span className="chalk-label">average CGPA</span>
        </div>
        <div className="chalk-stat">
          <span className="chalk-num">{Math.round(avgAttendance)}%</span>
          <span className="chalk-label">average attendance</span>
        </div>
        <div className="chalk-stat">
          <span className="chalk-num">{lowAttendance}</span>
          <span className="chalk-label">below 75% attendance</span>
        </div>
        {topper && <p className="chalk-note">Class topper: {topper.name} ({topper.cgpa}) ★</p>}
      </div>

      <div className="chalk-chart">
        <p className="chalk-title">Students per department</p>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} margin={{ top: 22, right: 8, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#e8efe9" tickLine={false} axisLine={{ stroke: "rgba(232,239,233,.4)" }} tick={{ fill: "#e8efe9", fontSize: 13 }} />
            <YAxis allowDecimals={false} stroke="transparent" tick={{ fill: "rgba(232,239,233,.6)", fontSize: 12 }} />
            <Tooltip content={<ChalkTooltip />} cursor={{ fill: "rgba(255,255,255,.08)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive>
              {data.map((d) => (
                <Cell key={d.name} fill={d.count === Math.max(...data.map((x) => x.count)) ? "#ffe14d" : "rgba(240,244,241,.82)"} />
              ))}
              <LabelList dataKey="count" position="top" fill="#e8efe9" fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
