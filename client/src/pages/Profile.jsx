import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const COLORS = ["#4a9eff","#a78bfa","#2dd4a0","#f5a623","#ff5c5c"];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]   = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [tab, setTab]     = useState("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm]   = useState({ name: user.name||"", email: user.email||"" });
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [pwMsg, setPwMsg] = useState("");

  const avatarColor = COLORS[(form.name?.charCodeAt(0)||0) % COLORS.length];
  const initials = (form.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  function saveProfile(e) {
    e.preventDefault();
    const updated = { ...user, name: form.name, email: form.email };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function savePassword(e) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return setPwMsg("Passwords don't match");
    if (pwForm.next.length < 6) return setPwMsg("Min 6 characters");
    setPwMsg("✓ Password updated!");
    setPwForm({ current:"", next:"", confirm:"" });
    setTimeout(() => setPwMsg(""), 3000);
  }

  const joinDate = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">My Profile</div>
            <div className="topbar-sub">ACCOUNT · SETTINGS · SECURITY</div>
          </div>
          {!editing && tab === "profile" && (
            <button className="btn btn-accent btn-sm" onClick={() => setEditing(true)}>✏️  Edit Profile</button>
          )}
        </div>

        <div className="page-body fade-up" style={{maxWidth:900}}>
          {/* Hero card */}
          <div style={s.heroCard}>
            {/* Gradient blob */}
            <div style={s.heroBlob} />
            <div style={{position:"relative",display:"flex",alignItems:"flex-end",gap:20,flexWrap:"wrap"}}>
              <div style={{position:"relative"}}>
                <div style={{width:80,height:80,borderRadius:"50%",background:avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"#070a0e",fontFamily:"var(--mono)",boxShadow:`0 0 0 3px var(--surface), 0 0 0 5px ${avatarColor}44`}}>
                  {initials}
                </div>
                <div style={{position:"absolute",bottom:2,right:2,width:16,height:16,borderRadius:"50%",background:"var(--accent)",border:"3px solid var(--surface)",boxShadow:"0 0 8px var(--accent)"}} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em",marginBottom:4}}>{user.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,color:"var(--text2)",fontFamily:"var(--mono)"}}>{user.email}</span>
                  <span style={{width:3,height:3,borderRadius:"50%",background:"var(--text3)"}} />
                  <span className="badge badge-approved" style={{fontSize:10,textTransform:"capitalize"}}>{user.role}</span>
                  <span className="badge" style={{background:"rgba(181,242,61,0.08)",color:"var(--accent)",border:"1px solid rgba(181,242,61,0.2)",fontSize:10}}>● Online</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️  Edit</button>}
                <button className="btn btn-danger btn-sm" onClick={() => { localStorage.clear(); navigate("/login"); }}>Sign Out</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {[["profile","👤","Profile"],["security","🔒","Security"],["activity","📋","Activity"]].map(([id,icon,label]) => (
              <button key={id} style={{...s.tab, ...(tab===id ? s.tabActive : {})}} onClick={() => setTab(id)}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {saved && (
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(45,212,160,0.3)",borderRadius:8,padding:"12px 16px",marginBottom:20,color:"var(--green)",fontSize:13,fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:8}}>
              <span>✓</span> Profile updated successfully!
            </div>
          )}

          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:18}}>
              <div className="card">
                <div style={{fontSize:14,fontWeight:700,marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Profile Details</span>
                  {editing && <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm({ name:user.name, email:user.email }); }}>✕ Cancel</button>}
                </div>

                {editing ? (
                  <form onSubmit={saveProfile} style={{display:"flex",flexDirection:"column",gap:16}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div>
                        <label className="field-label">Display Name</label>
                        <input value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Your full name" required />
                      </div>
                      <div>
                        <label className="field-label">Email Address</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@company.com" required />
                      </div>
                    </div>
                    <div style={{background:"var(--surface2)",borderRadius:8,border:"1px solid var(--border)",padding:"12px 14px",display:"flex",gap:24}}>
                      <div><div className="field-label" style={{marginBottom:4}}>Role</div><div style={{fontSize:13,fontWeight:600,textTransform:"capitalize"}}>{user.role}</div></div>
                      <div><div className="field-label" style={{marginBottom:4}}>Status</div><div style={{fontSize:13,fontWeight:600,color:"var(--green)"}}>Active</div></div>
                    </div>
                    <button type="submit" className="btn btn-accent" style={{alignSelf:"flex-start",paddingInline:28}}>Save Changes</button>
                  </form>
                ) : (
                  <div>
                    {[["Display Name",user.name],["Email",user.email],["Role",user.role],["Account Status","Active"],["Member Since",joinDate],["User ID",user.id||"—"]].map(([label,val]) => (
                      <div key={label} style={{display:"grid",gridTemplateColumns:"150px 1fr",gap:16,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                        <span style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",paddingTop:1}}>{label}</span>
                        <span style={{fontSize:13,fontWeight:500,wordBreak:"break-all",textTransform:label==="Role"||label==="Account Status"?"capitalize":"none"}}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Avatar card */}
                <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
                  <div style={{position:"relative",display:"inline-block",marginBottom:16}}>
                    <div style={{width:72,height:72,borderRadius:"50%",background:avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#070a0e",fontFamily:"var(--mono)",margin:"0 auto",boxShadow:`0 0 0 3px var(--surface), 0 0 0 5px ${avatarColor}55`}}>{initials}</div>
                    <div style={{position:"absolute",bottom:2,right:2,width:14,height:14,borderRadius:"50%",background:"var(--accent)",border:"2px solid var(--surface)"}} />
                  </div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{user.name}</div>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)",marginBottom:12}}>{user.email}</div>
                  <span className="badge badge-approved" style={{textTransform:"capitalize"}}>{user.role}</span>
                </div>

                {/* Stats */}
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",fontSize:11,fontFamily:"var(--mono)",fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.07em"}}>Quick Stats</div>
                  {[["Joined",joinDate],["Session","AES-256"],["Status","Active"]].map(([l,v]) => (
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid var(--border)"}}>
                      <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--mono)"}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {tab === "security" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div className="card">
                <div style={{fontSize:14,fontWeight:700,marginBottom:20}}>Change Password</div>
                <form onSubmit={savePassword} style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div><label className="field-label">Current Password</label><input type="password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} placeholder="••••••••" required /></div>
                  <div><label className="field-label">New Password</label><input type="password" value={pwForm.next} onChange={e=>setPwForm({...pwForm,next:e.target.value})} placeholder="Min 6 characters" required /></div>
                  <div><label className="field-label">Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} placeholder="Repeat new password" required /></div>
                  {pwMsg && <div style={{fontSize:12,fontFamily:"var(--mono)",color:pwMsg.startsWith("✓")?"var(--green)":"var(--red)",padding:"8px 12px",background:pwMsg.startsWith("✓")?"var(--green-dim)":"var(--red-dim)",borderRadius:6}}>{pwMsg}</div>}
                  <button type="submit" className="btn btn-accent" style={{alignSelf:"flex-start"}}>Update Password</button>
                </form>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {icon:"🛡",title:"Two-Factor Auth",desc:"Not enabled",action:"Enable 2FA",color:"var(--yellow)"},
                  {icon:"📱",title:"Active Sessions",desc:"1 active session — This device",action:"View All",color:"var(--blue)"},
                  {icon:"🔑",title:"API Access",desc:"No active API keys",action:"Generate Key",color:"var(--purple)"},
                ].map(item => (
                  <div key={item.title} className="card">
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${item.color}22`,border:`1px solid ${item.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{item.title}</div>
                        <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>{item.desc}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm">{item.action}</button>
                    </div>
                  </div>
                ))}

                <div className="card" style={{border:"1px solid rgba(255,92,92,0.25)",background:"rgba(255,92,92,0.04)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:12}}>⚠ Danger Zone</div>
                  <div style={{fontSize:13,color:"var(--text2)",marginBottom:14,lineHeight:1.6}}>Sign out from all devices and revoke all sessions.</div>
                  <button className="btn btn-danger btn-sm" onClick={() => { localStorage.clear(); navigate("/login"); }}>Sign Out Everywhere</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Activity Tab ── */}
          {tab === "activity" && (
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>Recent Activity</div>
              {[
                {icon:"🔐",text:"Signed in from Chrome · Delhi, IN",time:"Just now",color:"var(--accent)"},
                {icon:"✅",text:"Account profile loaded",time:"Just now",color:"var(--green)"},
              ].map((item,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:"1px solid var(--border)"}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${item.color}22`,border:`1px solid ${item.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13}}>{item.text}</div>
                    <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:2}}>{item.time}</div>
                  </div>
                </div>
              ))}
              <div className="empty-state" style={{padding:"30px 20px"}}>
                <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)"}}>Activity log populates as you use ApprovalVault</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  heroCard: { background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"28px 28px 24px",marginBottom:20,position:"relative",overflow:"hidden" },
  heroBlob: { position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle, rgba(181,242,61,0.08) 0%, transparent 70%)",pointerEvents:"none" },
  tabs: { display:"flex",gap:4,marginBottom:20,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:4,alignSelf:"flex-start" },
  tab: { padding:"8px 18px",borderRadius:7,fontSize:13,fontWeight:600,background:"none",color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s",border:"none" },
  tabActive: { background:"var(--surface2)",color:"var(--text)",border:"1px solid var(--border2)" },
};