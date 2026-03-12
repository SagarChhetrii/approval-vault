import { useState, useRef } from "react";
import { uploadFile } from "../services/api";

export default function FileUpload({ projectId, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  async function handle(file) {
    if (!file) return;
    setError(""); setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const version = await uploadFile(projectId, fd);
      onUploaded(version);
    } catch(e) { setError(e.message); }
    finally { setUploading(false); }
  }

  return (
    <div>
      <div
        style={{border:"2px dashed "+(dragging?"var(--accent)":"var(--border2)"),borderRadius:8,padding:"18px 14px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:dragging?"var(--accent-dim)":"transparent"}}
        onClick={()=>inputRef.current.click()}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);handle(e.dataTransfer.files[0]);}}
      >
        <input ref={inputRef} type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>handle(e.target.files[0])} />
        <div style={{fontSize:20,marginBottom:6,color:"var(--accent)"}}>⬆</div>
        <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{uploading?"Uploading & hashing…":"Drop file here"}</div>
        <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>PDF or image · SHA-256 auto-generated</div>
      </div>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}