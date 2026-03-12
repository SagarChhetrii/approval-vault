import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, getVersions, approveVersion, requestChanges, getAuditLog } from "../services/api";
import FileUpload from "../components/FileUpload";
import CommentSection from "../components/CommentSection";
import Sidebar from "../components/Sidebar";

const API = (import.meta.env.VITE_API_URL||"http://localhost:4000/api").replace("/api","");

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [project, setProject]   = useState(null);
  const [versions, setVersions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs]         = useState([]);
  const [tab, setTab]           = useState("review");
  const [approving, setApproving]   = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => { loadAll(); }, [id]);

  async function loadAll() {
    const [proj, vers, auditLogs] = await Promise.all([getProject(id), getVersions(id), getAuditLog(id)]);
    setProject(proj); setVersions(vers); setLogs(auditLogs.reverse());
    if (vers.length > 0) setSelected(vers[0]);
  }

  async function handleApprove() {
    if (!selected) return;
    setApproving(true);
    try { await approveVersion(selected._id); navigate("/approval/"+selected._id); }
    catch(e) { alert(e.message); }
    finally { setApproving(false); }
  }

  async function handleChanges() {
    setRequesting(true);
    try { await requestChanges(id); loadAll(); }
    catch(e) { alert(e.message); }
    finally { setRequesting(false); }
  }

  function badge(s) {
    if (s==="Approved") return "badge badge-approved";
    if (s==="Changes Requested") return "badge badge-changes";
    return "badge badge-pending";
  }

  const ACTION_META = {
    PROJECT_CREATED:{label:"Project Created",color:"var(--blue)"},
    UPLOAD:{label:"File Uploaded",color:"var(--blue)"},
    COMMENT:{label:"Comment Added",color:"var(--yellow)"},
    APPROVE:{label:"Approved",color:"var(--green)"},
    CHANGES_REQUESTED:{label:"Changes Requested",color:"var(--red)"},
  };

  const isPDF = selected?.filename?.toLowerCase().endsWith(".pdf");

  if (!project) return <div style={{padding:40,color:"var(--text3)"}}>Loading…</div>;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/projects")}>← Back</button>
            <span style={{color:"var(--border2)"}}>|</span>
            <div>
              <div className="topbar-title">{project.title}</div>
              <div className="topbar-sub">CLIENT PORTAL · {project.clientId?.name}</div>
            </div>
            <span className={badge(project.status)}>{project.status}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            {["review","comments","audit"].map(t=>(
              <button key={t} className={"btn btn-sm "+(tab===t?"btn-accent":"btn-ghost")} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>
                {t==="audit"?"Audit Trail":t==="comments"?"Comments":"Review"}
              </button>
            ))}
          </div>
        </div>

        <div className="page-body fade-up">
          {tab==="review" && (
            <div style={{display:"grid",gridTemplateColumns:"250px 1fr",gap:18}}>
              {/* Left panel */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {isAdmin && (
                  <div className="card">
                    <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Upload New Version</div>
                    {selected?.locked && <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--yellow)",background:"var(--yellow-dim)",border:"1px solid rgba(245,166,35,0.2)",borderRadius:6,padding:"7px 10px",marginBottom:10}}>⚠ Re-approval required after upload</div>}
                    <FileUpload projectId={id} onUploaded={loadAll} />
                  </div>
                )}
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Version History</div>
                  {versions.length===0 ? <p style={{padding:"12px 16px",color:"var(--text3)",fontSize:12}}>No files yet.</p> :
                  versions.map(v=>(
                    <div key={v._id} onClick={()=>setSelected(v)} style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",background:selected?._id===v._id?"var(--surface2)":"transparent",transition:"background 0.15s"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--blue)",background:"var(--blue-dim)",padding:"1px 7px",borderRadius:4}}>v{v.versionNumber}</span>
                        {v.locked && <span style={{fontSize:10,color:"var(--green)",fontFamily:"var(--mono)"}}>🔒 LOCKED</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{v.filename}</div>
                      <span className="fingerprint" style={{fontSize:10}}>{v.hash.slice(0,6)}…{v.hash.slice(-6)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main panel */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="card">
                  {selected ? (
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>
                            {selected.filename}
                            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--blue)",background:"var(--blue-dim)",padding:"1px 8px",borderRadius:4,marginLeft:8}}>v{selected.versionNumber}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <span className="fingerprint">{selected.hash.slice(0,6)}…{selected.hash.slice(-6)}</span>
                            <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>SHA-256 · If 1 byte changes, fingerprint changes</span>
                          </div>
                        </div>
                        {selected.locked && <div style={{background:"var(--green-dim)",border:"1px solid rgba(45,212,160,0.25)",color:"var(--green)",padding:"6px 14px",borderRadius:6,fontSize:11,fontWeight:700,fontFamily:"var(--mono)"}}>🔒 LOCKED AFTER APPROVAL</div>}
                      </div>
                      <div style={{borderRadius:8,overflow:"hidden",background:"var(--surface2)",minHeight:280,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {isPDF
                          ? <iframe src={API+"/uploads/"+selected.storagePath} style={{width:"100%",height:480,border:"none"}} />
                          : <img src={API+"/uploads/"+selected.storagePath} alt="preview" style={{maxWidth:"100%",maxHeight:480,objectFit:"contain"}} />
                        }
                      </div>
                    </>
                  ) : <p style={{color:"var(--text3)"}}>Select a version to preview.</p>}
                </div>

                {selected && !selected.locked && !isAdmin && (
                  <div className="card">
                    <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Approval Queue</div>
                    <p style={{color:"var(--text2)",fontSize:13,lineHeight:1.6,marginBottom:16}}>
                      By approving, you confirm <strong>{selected.filename}</strong> (fingerprint: <span className="fingerprint">{selected.hash.slice(0,6)}…{selected.hash.slice(-6)}</span>) meets your requirements. This action is cryptographically signed and immutable.
                    </p>
                    <div style={{display:"flex",gap:10}}>
                      <button className="btn btn-success" style={{flex:1,padding:"11px",fontSize:14,justifyContent:"center"}} onClick={handleApprove} disabled={approving}>
                        {approving?"Processing…":"✓ Approve"}
                      </button>
                      <button className="btn btn-danger" style={{flex:1,padding:"11px",fontSize:14,justifyContent:"center"}} onClick={handleChanges} disabled={requesting}>
                        {requesting?"Sending…":"✕ Request Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {selected?.locked && (
                  <div className="card" style={{borderColor:"rgba(45,212,160,0.25)",background:"var(--green-dim)"}}>
                    <p style={{color:"var(--green)",fontWeight:700,marginBottom:8}}>✓ This version is approved and locked</p>
                    <button className="btn btn-ghost btn-sm" style={{borderColor:"rgba(45,212,160,0.4)",color:"var(--green)"}} onClick={()=>navigate("/approval/"+selected._id)}>
                      View Approval Certificate →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab==="comments" && selected && (
            <div style={{maxWidth:700}}>
              <div className="card">
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{selected.filename}</div>
                <span className={"badge "+(selected.locked?"badge-approved":"badge-pending")} style={{marginBottom:18,display:"inline-flex"}}>{selected.locked?"Approved":"Pending"}</span>
                <CommentSection versionId={selected._id} />
              </div>
            </div>
          )}

          {tab==="audit" && (
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>Audit Trail — {project.title}</div>
              {logs.length===0 ? <p style={{padding:20,color:"var(--text3)"}}>No activity yet.</p> : (
                <table>
                  <thead><tr><th>Action</th><th>User</th><th>Timestamp</th></tr></thead>
                  <tbody>
                    {logs.map((log,i)=>{
                      const m = ACTION_META[log.action]||{label:log.action,color:"var(--text3)"};
                      return (
                        <tr key={i}>
                          <td><span style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:6,height:6,borderRadius:"50%",background:m.color,display:"inline-block"}} /><span style={{fontWeight:600,color:m.color}}>{m.label}</span></span></td>
                          <td style={{color:"var(--text2)"}}>{log.userId?.name||"System"}</td>
                          <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}