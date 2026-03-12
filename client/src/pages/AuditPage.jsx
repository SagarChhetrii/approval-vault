import { useEffect, useState } from "react";
import { getProjects, getAuditLog } from "../services/api";
import Sidebar from "../components/Sidebar";

const ACTION_META = {
  PROJECT_CREATED:   { label:"Project Created",   color:"var(--blue)"   },
  UPLOAD:            { label:"File Uploaded",      color:"var(--blue)"   },
  COMMENT:           { label:"Comment Added",      color:"var(--yellow)" },
  APPROVE:           { label:"Approved",           color:"var(--green)"  },
  CHANGES_REQUESTED: { label:"Changes Requested",  color:"var(--red)"    },
};

export default function AuditPage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    getProjects().then(ps => {
      setProjects(ps);
      if (ps.length > 0) loadLogs(ps[0]);
    });
  }, []);

  async function loadLogs(p) {
    setSelected(p); setLoading(true);
    try { const l = await getAuditLog(p._id); setLogs(l.reverse()); }
    catch { setLogs([]); }
    finally { setLoading(false); }
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Audit Trail</div>
            <div className="topbar-sub">IMMUTABLE COMPLIANCE LOG</div>
          </div>
        </div>
        <div className="page-body fade-up" style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:18}}>
          <div className="card" style={{padding:0,overflow:"hidden",alignSelf:"start"}}>
            <div style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Projects</div>
            {projects.map(p=>(
              <div key={p._id} onClick={()=>loadLogs(p)} style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",fontSize:13,fontWeight:selected?._id===p._id?600:400,color:selected?._id===p._id?"var(--accent)":"var(--text2)",background:selected?._id===p._id?"var(--accent-dim)":"transparent",transition:"all 0.15s"}}>
                {p.title}
              </div>
            ))}
          </div>

          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"13px 20px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>
              {selected?.title || "Select a project"}
            </div>
            {loading ? <p style={{padding:20,color:"var(--text3)"}}>Loading…</p> :
            logs.length===0 ? <p style={{padding:20,color:"var(--text3)",fontSize:13,fontFamily:"var(--mono)"}}>No activity yet.</p> : (
              <table>
                <thead><tr><th>Action</th><th>User</th><th>Details</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {logs.map((log,i)=>{
                    const m = ACTION_META[log.action]||{label:log.action,color:"var(--text3)"};
                    return (
                      <tr key={i}>
                        <td><span style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:6,height:6,borderRadius:"50%",background:m.color,display:"inline-block",flexShrink:0}} /><span style={{fontWeight:600,color:m.color}}>{m.label}</span></span></td>
                        <td style={{color:"var(--text2)"}}>{log.userId?.name||"System"}</td>
                        <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{log.meta?.hash?`Hash: ${log.meta.hash.slice(0,10)}…`:log.meta?.text?"Comment":""}</td>
                        <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{new Date(log.timestamp).toLocaleString()}</td>
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