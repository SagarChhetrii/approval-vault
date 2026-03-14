import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ counts = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef();

  const NAV_MAIN = [
    { path: "/",          icon: "fa-solid fa-table-cells-large", label: "Dashboard",   count: counts.pending },
    { path: "/projects",  icon: "fa-solid fa-file-lines",        label: "Documents",   count: counts.projects },
    { path: "/approvals", icon: "fa-solid fa-circle-check",      label: "Approvals",   count: counts.approvals },
    { path: "/files",     icon: "fa-solid fa-message",           label: "Comments",    count: counts.comments },
  ];
  const NAV_COMPLIANCE = [
    { path: "/audit",   icon: "fa-solid fa-clock-rotate-left", label: "Audit Trail" },
    { path: "/clients", icon: "fa-solid fa-chart-bar",         label: "Reports" },
    { path: "/profile", icon: "fa-solid fa-user",              label: "My Profile" },
  ];

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* Close mobile sidebar on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (p) => pathname === p || (p !== "/" && pathname.startsWith(p));
  const COLORS = ["#4a9eff","#a78bfa","#2dd4a0","#f5a623","#ff5c5c"];
  const avatarColor = COLORS[(user.name?.charCodeAt(0) || 0) % COLORS.length];
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile hamburger button */}
      <button className="hamburger-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
        <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        {/* Logo */}
        <div style={S.logo} onClick={() => navigate("/")}>
          <div style={S.logoIcon}>
            <i className="fa-solid fa-vault" style={{color:"var(--accent)",fontSize:14}} />
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
            <i className="fa-solid fa-shield-halved" style={{color:"var(--accent)",fontSize:10,filter:"drop-shadow(0 0 4px var(--accent))"}} />
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

              <MenuItem icon="fa-solid fa-user" label="View Profile" onClick={() => { setShowMenu(false); navigate("/profile"); }} />
              <MenuItem icon="fa-solid fa-pen" label="Edit Profile" onClick={() => { setShowMenu(false); setShowEditModal(true); }} />

              <div className="divider" style={{margin:"4px 0"}} />

              <MenuItem icon="fa-solid fa-right-from-bracket" label="Sign Out" danger onClick={() => { localStorage.clear(); navigate("/login"); }} />
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
            <i className="fa-solid fa-chevron-up" style={{flexShrink:0,color:"var(--text3)",fontSize:10,transition:"transform 0.2s",transform:showMenu?"rotate(0deg)":"rotate(180deg)"}} />
          </div>
        </div>
      </aside>

      {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />}
    </>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button onClick={onClick} style={{...S.navBtn, ...(active ? S.navActive : {})}}>
      <i className={item.icon} style={{flexShrink:0,fontSize:13,width:16,textAlign:"center",opacity:active?1:0.55}} />
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
      <i className={icon} style={{fontSize:13,width:16,textAlign:"center"}} />
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
            <div style={{position:"absolute",bottom:2,right:2,width:20,height:20,borderRadius:"50%",background:"var(--accent)",border:"3px solid var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",color:"#070a0e"}}>
              <i className="fa-solid fa-pen" style={{fontSize:8}} />
            </div>
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
              <i className="fa-solid fa-circle-check" style={{marginRight:6}} />Profile updated!
            </div>
          )}

          <div style={{display:"flex",gap:10,marginTop:2}}>
            <button type="button" className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" style={{flex:1}}>
              {saved ? <><i className="fa-solid fa-check" /> Saved!</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Styles ── */
const S = {
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