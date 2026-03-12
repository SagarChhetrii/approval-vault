import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, getVersions } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Approvals() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [versionMap, setVersionMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects().then(async ps => {
      setProjects(ps);
      const map = {};
      await Promise.all(ps.map(async p => {
        try { map[p._id] = await getVersions(p._id); } catch { map[p._id] = []; }
      }));
      setVersionMap(map);
      setLoading(false);
    });
  }, []);

  const pending  = projects.filter(p=>p.status==="Pending").length;
  const approved = projects.filter(p=>p.status==="Approved").length;
  const changes  = projects.filter(p=>p.status==="Changes Requested").length;

  function badge(s) {
    if (s==="Approved") return "badge badge-approved";
    if (s==="Changes Requested") return "badge badge-changes";
    return "badge badge-pending";
  }

  return (
    <div className="layout">
      <Sidebar counts={{approvals:pending}} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Approval Workflows</div>
            <div className="topbar-sub">{pending} AWAITING · {approved} COMPLETED</div>
          </div>
        </div>
        <div className="page-body fade-up">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
            <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{color:"var(--yellow)"}}>{pending}</div></div>
            <div className="stat-card"><div className="stat-label">Changes Requested</div><div className="stat-value" style={{color:"var(--red)"}}>{changes}</div></div>
            <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-value" style={{color:"var(--accent)"}}>{approved}</div></div>
          </div>

          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontWeight:700,fontSize:14}}>All Approval Workflows</span>
            </div>
            {loading ? <p style={{padding:20,color:"var(--text3)"}}>Loading…</p> : (
              <table>
                <thead><tr><th>Document</th><th>Client</th><th>Latest Version</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {projects.map(p => {
                    const versions = versionMap[p._id] || [];
                    const latest = versions[0];
                    return (
                      <tr key={p._id} style={{cursor:"pointer"}} onClick={()=>navigate("/projects/"+p._id)}>
                        <td>
                          <div style={{fontWeight:600}}>{p.title}</div>
                          {latest && <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginTop:2}}>Submitted {new Date(latest.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>}
                        </td>
                        <td style={{color:"var(--text2)"}}>{p.clientId?.name||"—"}</td>
                        <td>{latest ? <span style={{fontFamily:"var(--mono)",fontSize:11,background:"var(--blue-dim)",border:"1px solid rgba(74,158,255,0.2)",borderRadius:5,padding:"2px 8px",color:"var(--blue)"}}>v{latest.versionNumber}</span> : "—"}</td>
                        <td><span className={badge(p.status)}>{p.status}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();navigate("/projects/"+p._id);}}>Review</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}