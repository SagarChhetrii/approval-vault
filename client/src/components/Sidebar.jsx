import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ counts = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef();

  const NAV_MAIN = [
    { path: "/",          icon: DashIcon,    label: "Dashboard",   count: counts.pending },
    { path: "/projects",  icon: DocIcon,     label: "Documents",   count: counts.projects },
    { path: "/approvals", icon: ApvIcon,     label: "Approvals",   count: counts.approvals },
    { path: "/files",     icon: CmtIcon,     label: "Comments",    count: counts.comments },
  ];
  const NAV_COMPLIANCE = [
    { path: "/audit",   icon: AuditIcon,   label: "Audit Trail" },
    { path: "/clients", icon: RptIcon,     label: "Reports" },
    { path: "/profile", icon: ProfileIcon, label: "My Profile" },
  ];

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isActive = (p) => pathname === p || (p !== "/" && pathname.startsWith(p));
  const COLORS = ["#4a9eff","#a78bfa","#2dd4a0","#f5a623","#ff5c5c"];
  const avatarColor = COLORS[(user.name?.charCodeAt(0) || 0) % COLORS.length];
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.logo} onClick={() => navigate("/")}>
          <div style={S.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="11" rx="2" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M5 3V2a3 3 0 016 0v1" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="9" r="1.5" fill="var(--accent)"/>
            </svg>
          </div>
          <span style={S.logoText}>Vault</span>
          <span style={S.e2eTag}>E2E</span>
        </div>

        {/* Nav */}
        <div style={S.navWrap}>
          <div className="section-label" style={{paddingTop:14}}>Workspace</div>
          {NAV_MAIN.map(item => (
            <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />
          ))}
          <div className="section-label" style={{marginTop:12}}>Compliance</div>
          {NAV_COMPLIANCE.map(item => (
            <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />
          ))}
        </div>

        {/* Bottom - profile */}
        <div style={S.bottom} ref={menuRef}>
          {/* Security badge */}
          <div style={S.securityBadge}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",boxShadow:"0 0 6px var(--accent)",animation:"pulse 2s infinite"}} />
            <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--accent)"}}>AES-256 Encrypted</span>
          </div>

          {/* Profile dropdown */}
          {showMenu && (
            <div style={S.profileMenu}>
              {/* Header */}
              <div style={S.menuHeader}>
                <div style={{position:"relative",display:"inline-block"}}>
                  <div className="avatar" style={{width:42,height:42,background:avatarColor,fontSize:14,color:"#070a0e"}}>{initials}</div>
                  <div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:"var(--accent)",border:"2px solid var(--surface)"}} />
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{user.name}</div>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:1}}>{user.email}</div>
                  <div style={{marginTop:4}}>
                    <span style={{fontSize:9,fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",background:"var(--accent-dim)",border:"1px solid rgba(181,242,61,0.2)",borderRadius:3,padding:"2px 6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="divider" style={{margin:"4px 0"}} />

              <MenuItem icon="👤" label="View Profile" onClick={() => { setShowMenu(false); navigate("/profile"); }} />
              <MenuItem icon="✏️" label="Edit Profile" onClick={() => { setShowMenu(false); setShowEditModal(true); }} />

              <div className="divider" style={{margin:"4px 0"}} />

              <MenuItem icon="🚪" label="Sign Out" danger onClick={() => { localStorage.clear(); navigate("/login"); }} />
            </div>
          )}

          {/* Profile trigger */}
          <div style={{...S.profileRow, ...(showMenu ? S.profileRowActive : {})}} onClick={() => setShowMenu(v => !v)}>
            <div style={{position:"relative",flexShrink:0}}>
              <div className="avatar" style={{width:34,height:34,background:avatarColor,fontSize:12,color:"#070a0e"}}>{initials}</div>
              <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:"var(--accent)",border:"2px solid var(--sidebar-bg)"}} />
            </div>
            <div style={{flex:1,overflow:"hidden",minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name || "User"}</div>
              <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",textTransform:"capitalize"}}>{user.role}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,color:"var(--text3)",transition:"transform 0.2s",transform:showMenu?"rotate(180deg)":"rotate(0deg)"}}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </aside>

      {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />}
    </>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} style={{...S.navBtn, ...(active ? S.navActive : {})}}>
      <span style={{flexShrink:0,opacity:active?1:0.6}}><Icon active={active} /></span>
      <span style={{flex:1,textAlign:"left"}}>{item.label}</span>
      {item.count > 0 && <span className="nav-count">{item.count}</span>}
    </button>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      style={{...S.menuItem, color: danger ? "var(--red)" : hov ? "var(--text)" : "var(--text2)", background: hov ? "var(--surface2)" : "transparent"}}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <span style={{fontSize:14}}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function EditProfileModal({ user, onClose }) {
  const [name, setName]   = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [saved, setSaved] = useState(false);
  const COLORS = ["#4a9eff","#a78bfa","#2dd4a0","#f5a623","#ff5c5c"];
  const avatarColor = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  const initials = (name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  function save(e) {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...user, name, email }));
    setSaved(true);
    setTimeout(() => { onClose(); window.location.reload(); }, 1000);
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:14}}>
            <div className="avatar" style={{width:72,height:72,background:avatarColor,fontSize:24,color:"#070a0e",margin:"0 auto"}}>{initials}</div>
            <div style={{position:"absolute",bottom:2,right:2,width:16,height:16,borderRadius:"50%",background:"var(--accent)",border:"3px solid var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#070a0e"}}>✏</div>
          </div>
          <div className="modal-title">Edit Profile</div>
          <div style={{fontSize:13,color:"var(--text2)"}}>Update your account details</div>
        </div>

        <form onSubmit={save} style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="field-label">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div className="field-label" style={{margin:0,marginBottom:2}}>Role</div>
              <div style={{fontSize:13,fontWeight:600,textTransform:"capitalize",color:"var(--text)"}}>{user.role}</div>
            </div>
            <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--mono)"}}>Read-only</span>
          </div>

          {saved && (
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(45,212,160,0.3)",borderRadius:8,padding:"10px 14px",color:"var(--green)",fontSize:12,fontFamily:"var(--mono)",textAlign:"center"}}>
              ✓ Profile updated!
            </div>
          )}

          <div style={{display:"flex",gap:10,marginTop:2}}>
            <button type="button" className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" style={{flex:1}}>{saved ? "✓ Saved!" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Icons ── */
function DashIcon({active})    { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill={active?"var(--accent)":"var(--text2)"}/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill={active?"var(--accent)":"var(--text2)"}/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill={active?"var(--accent)":"var(--text2)"}/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill={active?"var(--accent)":"var(--text2)"}/></svg>; }
function DocIcon({active})     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="1" width="9" height="13" rx="1.5" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5"/><line x1="4.5" y1="5" x2="10.5" y2="5" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.2"/><line x1="4.5" y1="8" x2="10.5" y2="8" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.2"/><line x1="4.5" y1="11" x2="8" y2="11" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.2"/></svg>; }
function ApvIcon({active})     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="13" height="13" rx="2" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5"/><polyline points="4,7.5 6.5,10 11,5" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function CmtIcon({active})     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2h11a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5"/></svg>; }
function AuditIcon({active})   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5"/><polyline points="7.5,4 7.5,8 10,9.5" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function RptIcon({active})     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="8" width="3" height="6" rx="1" fill={active?"var(--accent)":"var(--text2)"}/><rect x="6" y="5" width="3" height="9" rx="1" fill={active?"var(--accent)":"var(--text2)"}/><rect x="11" y="2" width="3" height="12" rx="1" fill={active?"var(--accent)":"var(--text2)"}/></svg>; }
function ProfileIcon({active}) { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5"/><path d="M2.5 13c0-2.76 2.24-4 5-4s5 1.24 5 4" stroke={active?"var(--accent)":"var(--text2)"} strokeWidth="1.5" strokeLinecap="round"/></svg>; }

/* ── Styles ── */
const S = {
  sidebar: { position:"fixed",top:0,left:0,width:"var(--sidebar-w)",height:"100vh",background:"var(--sidebar-bg)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",zIndex:100 },
  logo: { display:"flex",alignItems:"center",gap:10,padding:"18px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",flexShrink:0 },
  logoIcon: { width:34,height:34,borderRadius:9,background:"var(--accent-dim)",border:"1px solid rgba(181,242,61,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  logoText: { fontSize:17,fontWeight:800,color:"var(--text)",letterSpacing:"-0.02em" },
  e2eTag: { marginLeft:"auto",fontSize:9,fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",background:"var(--accent-dim)",border:"1px solid rgba(181,242,61,0.25)",borderRadius:4,padding:"2px 7px" },
  navWrap: { flex:1,padding:"4px 8px",display:"flex",flexDirection:"column",gap:1,overflowY:"auto" },
  navBtn: { display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:8,background:"none",color:"var(--text2)",fontSize:13,fontWeight:500,width:"100%",cursor:"pointer",transition:"all 0.15s",textAlign:"left" },
  navActive: { background:"var(--accent-dim)",color:"var(--accent)",fontWeight:600 },
  bottom: { padding:"12px 12px",borderTop:"1px solid var(--border)",flexShrink:0,position:"relative" },
  securityBadge: { display:"flex",alignItems:"center",gap:7,marginBottom:10,paddingLeft:4 },
  profileRow: { display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,cursor:"pointer",transition:"all 0.15s",background:"var(--surface2)",border:"1px solid var(--border)" },
  profileRowActive: { border:"1px solid var(--border2)",background:"var(--surface3)" },
  profileMenu: { position:"absolute",bottom:"calc(100% + 10px)",left:8,right:8,background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:12,overflow:"hidden",boxShadow:"0 -16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",zIndex:200 },
  menuHeader: { display:"flex",alignItems:"center",gap:12,padding:"16px 14px 12px" },
  menuItem: { display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 14px",background:"none",fontSize:13,fontWeight:500,textAlign:"left",borderRadius:0,transition:"all 0.1s",cursor:"pointer",border:"none" },
};