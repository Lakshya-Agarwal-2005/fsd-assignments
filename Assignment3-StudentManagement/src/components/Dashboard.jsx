import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function Dashboard({ students = [] }) {
  // Count students in each course
  const courseCounts = students.reduce((acc, student) => {
    acc[student.course] = (acc[student.course] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(courseCounts).map(([course, total]) => ({ course, total }));

  const topCourse = chartData.length
    ? chartData.reduce((max, c) => (c.total > max.total ? c : max)).course
    : "—";

  return (
    <section>
      <div className="stats">
        <div className="card stat">
          <div>
            <p className="stat-label">Total Students</p>
            <h2>{students.length}</h2>
          </div>
          <span className="stat-icon blue">👥</span>
        </div>
        <div className="card stat">
          <div>
            <p className="stat-label">Active Courses</p>
            <h2>{chartData.length}</h2>
          </div>
          <span className="stat-icon green">📚</span>
        </div>
        <div className="card stat">
          <div>
            <p className="stat-label">Top Department</p>
            <h3 className="truncate">{topCourse}</h3>
          </div>
          <span className="stat-icon yellow">⚡</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Course Distribution</h3>
            <p className="muted">Number of students enrolled in each course</p>
          </div>
          <span className="pill">Live Analytics</span>
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
