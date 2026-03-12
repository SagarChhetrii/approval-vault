import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApproval } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function ApprovalProof() {
  const { versionId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { getApproval(versionId).then(setCert).catch(e=>setError(e.message)); }, [versionId]);

  if (error) return <div className="layout"><Sidebar /><div className="main-content"><div style={{padding:40,color:"var(--red)",fontFamily:"var(--mono)"}}>{error}</div></div></div>;
  if (!cert)  return <div className="layout"><Sidebar /><div className="main-content"><div style={{padding:40,color:"var(--text3)"}}>Loading certificate…</div></div></div>;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)}>← Back</button>
            <div><div className="topbar-title">Approval Certificate</div><div className="topbar-sub">CRYPTOGRAPHICALLY VERIFIED · IMMUTABLE</div></div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>window.print()}>🖨 Print</button>
        </div>

        <div className="page-body fade-up" style={{maxWidth:780}}>
          <div className="card" style={{padding:0,overflow:"hidden",border:"1px solid rgba(181,242,61,0.25)"}}>
            {/* Header */}
            <div style={{padding:"28px 32px",background:"linear-gradient(135deg,rgba(181,242,61,0.06) 0%,rgba(45,212,160,0.04) 100%)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,boxShadow:"0 0 30px rgba(181,242,61,0.35)"}}>✓</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Approval Certificate</div>
                <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em"}}>Digitally Verified</div>
                <div style={{color:"var(--text2)",fontSize:13,marginTop:4}}>This document serves as immutable proof of client approval</div>
              </div>
              <div style={{background:"rgba(181,242,61,0.1)",border:"2px solid var(--accent)",color:"var(--accent)",padding:"8px 18px",borderRadius:8,fontWeight:800,fontSize:12,fontFamily:"var(--mono)",letterSpacing:"0.08em"}}>IMMUTABLE</div>
            </div>

            {/* Fields */}
            <div style={{padding:"4px 32px"}}>
              {[
                ["Project",    cert.projectName],
                ["File Name",  cert.filename],
                ["Version",    `v${cert.versionNumber}`, true],
                ["Approved By",`${cert.approvedBy.name} (${cert.approvedBy.email})`],
                ["Approved At", new Date(cert.approvedAt).toLocaleString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",timeZoneName:"short"}), true],
                ["IP Address", cert.ipAddress, true],
                ["Record ID",  cert.approvalId, true],
              ].map(([label,val,mono])=>(
                <div key={label} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:11,fontFamily:"var(--mono)",fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.06em",paddingTop:2}}>{label}</span>
                  <span style={{fontSize:13,fontFamily:mono?"var(--mono)":"var(--font)",wordBreak:"break-all",fontWeight:500}}>{val}</span>
                </div>
              ))}
            </div>

            {/* Fingerprint */}
            <div style={{padding:"24px 32px",borderTop:"1px solid var(--border)"}}>
              <div style={{fontSize:10,fontFamily:"var(--mono)",fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>File Fingerprint (SHA-256)</div>
              <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 16px",marginBottom:14,overflowX:"auto"}}>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--text)",letterSpacing:"0.04em",wordBreak:"break-all"}}>{cert.fileHash}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <span style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:"var(--accent)",background:"var(--accent-dim)",padding:"5px 14px",borderRadius:7}}>{cert.fileHash.slice(0,6)}</span>
                <span style={{flex:1,height:1,background:"var(--border)"}} />
                <span style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:"var(--accent)",background:"var(--accent-dim)",padding:"5px 14px",borderRadius:7}}>{cert.fileHash.slice(-6)}</span>
              </div>
              <div style={{fontSize:12,color:"var(--text3)",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:7,padding:"10px 14px",fontFamily:"var(--mono)",lineHeight:1.6}}>
                🔒 If even a single byte of the original file changes, this fingerprint becomes completely different — guaranteeing absolute integrity.
              </div>
            </div>

            {/* Signature */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,padding:"24px 32px",borderTop:"1px solid var(--border)"}}>
              <div>
                <div style={{fontFamily:"Georgia,serif",fontSize:26,fontStyle:"italic",marginBottom:8}}>{cert.approvedBy.name}</div>
                <div style={{height:1,background:"var(--text3)",marginBottom:6}} />
                <div style={{fontSize:12,color:"var(--text3)"}}>Authorized Client · Digital Approval</div>
              </div>
              <div>
                <div style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--accent)",marginBottom:8,wordBreak:"break-all"}}>{cert.approvalId?.toString().slice(-16)}</div>
                <div style={{height:1,background:"var(--text3)",marginBottom:6}} />
                <div style={{fontSize:12,color:"var(--text3)"}}>Approval Record ID</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 32px",background:"var(--surface2)",borderTop:"1px solid var(--border)",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🔐</span><span style={{fontWeight:800,fontSize:14}}>ApprovalVault</span></div>
              <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)"}}>This certificate is cryptographically verifiable and immutable.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}