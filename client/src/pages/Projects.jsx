import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, register } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Projects() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({title:"",name:"",email:"",password:""});
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  function load() { getProjects().then(setProjects).finally(()=>setLoading(false)); }

  async function submit(e) {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const { userId } = await register(form.name, form.email, form.password, "client");
      await createProject(form.title, userId);
      setShowModal(false);
      setForm({title:"",name:"",email:"",password:""});
      load();
    } catch(e) { setErr(e.message); }
    finally { setSaving(false); }
  }

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
            <div className="topbar-title">Document Management</div>
            <div className="topbar-sub">{projects.length} FILES · VERSION CONTROLLED</div>
          </div>
          {isAdmin && <button className="btn btn-accent" onClick={()=>setShowModal(true)}>⬆ New Project</button>}
        </div>

        <div className="page-body fade-up">
          {isAdmin && (
            <div style={s.dropzone} onClick={()=>setShowModal(true)}>
              <div style={{fontSize:26,marginBottom:8}}>⬆</div>
              <div style={{fontWeight:600,marginBottom:4}}>Click to create a new project</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>All files are encrypted in transit and at rest · Max 20MB per file</div>
            </div>
          )}

          <div className="card" style={{marginTop:20,padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontWeight:700,fontSize:14}}>All Projects</span>
            </div>
            {loading ? <p style={{padding:20,color:"var(--text3)"}}>Loading…</p> :
            projects.length===0 ? (
              <div style={{padding:40,textAlign:"center",color:"var(--text3)"}}>
                <div style={{fontSize:32,marginBottom:10}}>📁</div>
                <p>No projects yet.</p>
              </div>
            ) : (
              <table>
                <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {projects.map(p=>(
                    <tr key={p._id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:30,height:30,borderRadius:6,background:"var(--surface2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                            {p.status==="Approved"?"✅":"📄"}
                          </div>
                          <span style={{fontWeight:600}}>{p.title}</span>
                        </div>
                      </td>
                      <td style={{color:"var(--text2)"}}>{p.clientId?.name||"—"}</td>
                      <td><span className={badge(p.status)}>{p.status}</span></td>
                      <td style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text3)"}}>{new Date(p.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={()=>navigate("/projects/"+p._id)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="modal">
            <div className="modal-title">New Project</div>
            <div className="modal-sub">Create a project and client account</div>
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:13}}>
              <div><label className="field-label">Project Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Website Redesign" required /></div>
              <div style={{height:1,background:"var(--border)"}} />
              <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Create Client Account</div>
              <div><label className="field-label">Client Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Jane Smith" required /></div>
              <div><label className="field-label">Client Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="client@company.com" required /></div>
              <div><label className="field-label">Temp Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Share with client" required /></div>
              {err && <p className="error-msg">{err}</p>}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button type="button" className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" style={{flex:1}} disabled={saving}>{saving?"Creating…":"Create Project"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  dropzone:{border:"2px dashed var(--border2)",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:"var(--surface)"},
};