import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, getVersions } from "../services/api";
import Sidebar from "../components/Sidebar";

const API = (import.meta.env.VITE_API_URL||"http://localhost:4000/api").replace("/api","");

export default function Files() {
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

  function badge(s) {
    if (s==="Approved") return "badge badge-approved";
    if (s==="Changes Requested") return "badge badge-changes";
    return "badge badge-pending";
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Comments</div>
            <div className="topbar-sub">ALL FILES ACROSS PROJECTS</div>
          </div>
        </div>
        <div className="page-body fade-up">
          {loading ? <p style={{color:"var(--text3)"}}>Loading…</p> :
          projects.map(p => {
            const versions = versionMap[p._id] || [];
            return (
              <div key={p._id} className="card" style={{marginBottom:16,padding:0,overflow:"hidden"}}>
                <div style={{padding:"13px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontWeight:700}}>{p.title}</span>
                    <span style={{color:"var(--text3)",fontSize:12,fontFamily:"var(--mono)"}}>{p.clientId?.name} · {versions.length} files</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span className={badge(p.status)}>{p.status}</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/projects/"+p._id)}>Open</button>
                  </div>
                </div>
                {versions.length===0
                  ? <p style={{padding:"13px 20px",color:"var(--text3)",fontSize:12,fontFamily:"var(--mono)"}}>No files yet</p>
                  : (
                  <table>
                    <thead><tr><th>File</th><th>Version</th><th>Fingerprint</th><th>Status</th><th>Uploaded</th><th>Actions</th></tr></thead>
                    <tbody>
                      {versions.map(v=>(
                        <tr key={v._id}>
                          <td style={{fontWeight:600}}>{v.filename}</td>
                          <td><span style={{fontFamily:"var(--mono)",fontSize:11,background:"var(--blue-dim)",border:"1px solid rgba(74,158,255,0.2)",borderRadius:5,padding:"2px 8px",color:"var(--blue)"}}>v{v.versionNumber}</span></td>
                          <td><span className="fingerprint">{v.hash.slice(0,6)}…{v.hash.slice(-6)}</span></td>
                          <td>{v.locked ? <span className="badge badge-approved">Approved</span> : <span className="badge badge-pending">Pending</span>}</td>
                          <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{new Date(v.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                          <td>
                            <div style={{display:"flex",gap:6}}>
                              <a href={API+"/uploads/"+v.storagePath} target="_blank" rel="noreferrer"><button className="btn btn-ghost btn-sm">View</button></a>
                              <a href={API+"/uploads/"+v.storagePath} download><button className="btn btn-ghost btn-sm">Download</button></a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}