import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const FEATURES = [
    { icon: "fa-solid fa-fingerprint",      title: "SHA-256 File Fingerprinting",    desc: "Every file gets a unique cryptographic fingerprint" },
    { icon: "fa-solid fa-lock",             title: "Immutable Approval Locking",     desc: "Approved files cannot be modified or tampered with" },
    { icon: "fa-solid fa-clipboard-list",   title: "Full Audit Trail",               desc: "Every action logged with timestamps & user attribution" },
    { icon: "fa-solid fa-shield-halved",    title: "AES-256 Encrypted Sessions",     desc: "Bank-grade security for all your approvals" },
  ];

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left} className="login-left">
        <div style={s.leftInner} className="login-left-inner">
          <div style={s.logoRow}>
            <div style={s.logoIcon}>
              <i className="fa-solid fa-vault" style={{color:"var(--accent)",fontSize:18}} />
            </div>
            <span style={s.logoText}>Vault</span>
            <span style={s.e2eTag}>E2E ENCRYPTED</span>
          </div>

          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <h1 style={s.headline} className="login-headline">Secure Client<br/>Approval Portal</h1>
            <p style={s.sub} className="login-sub">Turn every client approval into a cryptographically signed, timestamped, immutable record — no more "I never said that."</p>

            <div style={s.features} className="login-features">
              {FEATURES.map(({icon,title,desc}) => (
                <div key={title} style={s.feat}>
                  <div style={s.featIcon}>
                    <i className={icon} style={{color:"var(--accent)",fontSize:15}} />
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{title}</div>
                    <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--mono)"}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.leftFooter} className="login-footer">
            <span style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)"}}>© 2025 ApprovalVault · Built for hackathon</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formWrap}>
          <div style={{marginBottom:30}}>
            <h2 style={{fontSize:24,fontWeight:800,letterSpacing:"-0.02em",marginBottom:6}}>Welcome back</h2>
            <p style={{fontSize:14,color:"var(--text2)"}}>Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label className="field-label">Email Address</label>
              <div className="input-group">
                <i className="fa-solid fa-envelope input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={{fontSize:14}}
                />
              </div>
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="input-group">
                <i className="fa-solid fa-key input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{fontSize:14}}
                />
              </div>
            </div>

            {error && (
              <div style={{background:"var(--red-dim)",border:"1px solid rgba(255,92,92,0.25)",borderRadius:8,padding:"10px 14px",color:"var(--red)",fontSize:13,fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:8}}>
                <i className="fa-solid fa-triangle-exclamation" /> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{width:"100%",padding:"12px",fontSize:14,justifyContent:"center",marginTop:4}}
            >
              {loading ? (
                <span style={{display:"flex",alignItems:"center",gap:8}}>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Signing in…
                </span>
              ) : (
                <span style={{display:"flex",alignItems:"center",gap:8}}>
                  Sign In <i className="fa-solid fa-arrow-right" />
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={s.demoBox}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <i className="fa-solid fa-circle-info" style={{color:"var(--accent)",fontSize:10}} />
              <span style={{fontSize:10,fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",letterSpacing:"0.1em"}}>DEMO CREDENTIALS</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Admin","admin@test.com","admin123"],["Client","client@test.com","client123"]].map(([role,em,pw]) => (
                <div
                  key={role}
                  style={{background:"var(--surface3)",border:"1px solid var(--border)",borderRadius:7,padding:"9px 12px",cursor:"pointer",transition:"border-color 0.15s"}}
                  onClick={() => { setEmail(em); setPassword(pw); }}
                >
                  <div style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{role}</div>
                  <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text2)"}}>{em}</div>
                  <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)"}}>{pw}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)",marginTop:8,textAlign:"center"}}>Click a card to auto-fill credentials</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display:"flex",minHeight:"100vh",flexWrap:"wrap" },
  left: { flex:1,minWidth:280,background:"var(--sidebar-bg)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative" },
  leftInner: { display:"flex",flexDirection:"column",height:"100%",padding:"48px 52px" },
  logoRow: { display:"flex",alignItems:"center",gap:10,marginBottom:0 },
  logoIcon: { width:40,height:40,borderRadius:10,background:"var(--accent-dim)",border:"1px solid rgba(181,242,61,0.3)",display:"flex",alignItems:"center",justifyContent:"center" },
  logoText: { fontSize:22,fontWeight:800,letterSpacing:"-0.02em" },
  e2eTag: { marginLeft:6,fontSize:9,fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",background:"var(--accent-dim)",border:"1px solid rgba(181,242,61,0.25)",borderRadius:4,padding:"2px 8px" },
  headline: { fontSize:46,fontWeight:900,lineHeight:1.1,letterSpacing:"-0.035em",marginBottom:18,marginTop:48 },
  sub: { color:"var(--text2)",fontSize:15,lineHeight:1.75,marginBottom:40,maxWidth:440 },
  features: { display:"flex",flexDirection:"column",gap:16 },
  feat: { display:"flex",alignItems:"flex-start",gap:14 },
  featIcon: { width:36,height:36,borderRadius:9,background:"var(--surface)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 },
  leftFooter: { marginTop:"auto",paddingTop:40 },
  right: { width:480,display:"flex",alignItems:"center",justifyContent:"center",padding:48 },
  formWrap: { width:"100%",maxWidth:400 },
  demoBox: { marginTop:24,padding:16,background:"var(--surface)",borderRadius:10,border:"1px solid var(--border)" },
};