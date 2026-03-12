import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, getAuditLog } from "../services/api";
import Sidebar from "../components/Sidebar";

const ACTION_LABEL = { APPROVE:"Approved", UPLOAD:"Uploaded file", COMMENT:"Commented", CHANGES_REQUESTED:"Requested changes", PROJECT_CREATED:"Created project" };
const ACTION_COLOR = { APPROVE:"var(--green)", UPLOAD:"var(--blue)", COMMENT:"var(--yellow)", CHANGES_REQUESTED:"var(--red)", PROJECT_CREATED:"var(--purple)" };
const ACTION_ICON  = { APPROVE:"✅", UPLOAD:"⬆", COMMENT:"💬", CHANGES_REQUESTED:"🔄", PROJECT_CREATED:"📁" };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [projects, setProjects] = useState([]);
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProjects().then(async ps => {
      setProjects(ps);
      if (ps.length > 0) {
        try {
          const l = await getAuditLog(ps[0]._id);
          setLogs(l.slice(-8).reverse());
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const approved = projects.filter(p => p.status === "Approved").length;
  const pending  = projects.filter(p => p.status === "Pending").length;
  const changes  = projects.filter(p => p.status === "Changes Requested").length;

  function badgeClass(s) {
    if (s === "Approved") return "badge badge-approved";
    if (s === "Changes Requested") return "badge badge-changes";
    return "badge badge-pending";
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="layout">
      <Sidebar counts={{ pending, projects: projects.length, approvals: approved }} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-sub">APPROVALVAULT · WORKSPACE</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="encrypted-badge">Encrypted</div>
            {user.role === "admin" && (
              <button className="btn btn-accent btn-sm" onClick={() => navigate("/projects")}>+ New Project</button>
            )}
          </div>
        </div>

        <div className="page-body fade-up">
          {/* Greeting */}
          <div style={s.greeting}>
            <span style={s.greetingText}>{greeting}, <strong>{user.name?.split(" ")[0]}</strong> 👋</span>
            <span style={s.greetingDate}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label:"Pending Approvals", value:pending,          color:"var(--yellow)", icon:"⏳", accent:"var(--yellow)" },
              { label:"Total Documents",   value:projects.length,  color:"var(--blue)",   icon:"📁", accent:"var(--blue)" },
              { label:"Changes Requested", value:changes,          color:"var(--red)",    icon:"🔄", accent:"var(--red)" },
              { label:"Approved",          value:approved,         color:"var(--accent)", icon:"✅", accent:"var(--accent)" },
            ].map(card => (
              <div key={card.label} className="stat-card" style={{"--card-accent":card.accent}}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-sub">{card.label === "Total Documents" ? "all projects" : card.label === "Approved" ? "completed" : "need action"}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>
            {/* Projects table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Recent Projects</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/projects")}>View all →</button>
              </div>
              {loading ? (
                <div className="empty-state"><div style={{ fontFamily:"var(--mono)",fontSize:12 }}>Loading…</div></div>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📁</div>
                  <div className="empty-state-title">No projects yet</div>
                  <div className="empty-state-sub">Create your first project to get started</div>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {projects.slice(0, 6).map(p => (
                      <tr key={p._id} style={{ cursor: "pointer" }} onClick={() => navigate("/projects/" + p._id)}>
                        <td>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <div style={{ width:32,height:32,borderRadius:8,background:"var(--surface2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>
                              {p.status==="Approved"?"✅":"📄"}
                            </div>
                            <span style={{ fontWeight:600 }}>{p.title}</span>
                          </div>
                        </td>
                        <td style={{ color:"var(--text2)" }}>{p.clientId?.name || "—"}</td>
                        <td><span className={badgeClass(p.status)}>{p.status}</span></td>
                        <td style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)" }}>{new Date(p.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Activity feed */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Activity</span>
                <span style={{ fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)" }}>LIVE</span>
              </div>
              <div>
                {logs.length === 0 ? (
                  <div className="empty-state" style={{ padding:"30px 20px" }}>
                    <div className="empty-state-icon" style={{ fontSize:24 }}>📋</div>
                    <div className="empty-state-sub">No activity yet</div>
                  </div>
                ) : logs.map((log, i) => (
                  <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px 18px",borderBottom:"1px solid var(--border)" }}>
                    <div style={{ width:30,height:30,borderRadius:8,background:`${ACTION_COLOR[log.action]||"var(--text3)"}22`,border:`1px solid ${ACTION_COLOR[log.action]||"var(--text3)"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>
                      {ACTION_ICON[log.action]||"•"}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13 }}>
                        <strong>{log.userId?.name||"User"}</strong>{" "}
                        <span style={{ color:"var(--text2)" }}>{ACTION_LABEL[log.action]||log.action}</span>
                      </div>
                      <div style={{ fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:3 }}>{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  greeting: { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 },
  greetingText: { fontSize:18,fontWeight:600,letterSpacing:"-0.01em" },
  greetingDate: { fontSize:12,fontFamily:"var(--mono)",color:"var(--text3)" },
  cardHeader: { display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid var(--border)" },
  cardTitle: { fontWeight:700,fontSize:14 },
};