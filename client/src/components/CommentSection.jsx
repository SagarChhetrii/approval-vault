import { useEffect, useState } from "react";
import { getComments, addComment } from "../services/api";

export default function CommentSection({ versionId }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if(versionId) load(); }, [versionId]);
  async function load() { try { setComments(await getComments(versionId)); } catch {} }

  async function submit(e) {
    e.preventDefault(); if (!text.trim()) return;
    setSubmitting(true);
    try { await addComment(versionId, text); setText(""); load(); } catch {}
    finally { setSubmitting(false); }
  }

  const colors = ["#4a9eff","#a78bfa","#2dd4a0","#f5a623","#ff5c5c"];

  return (
    <div>
      <div style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>
        All Comments ({comments.length})
      </div>
      {comments.length===0 && <p style={{color:"var(--text3)",fontSize:13,fontFamily:"var(--mono)",marginBottom:16}}>No comments yet.</p>}
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
        {comments.map(c=>{
          const color = colors[(c.userId?.name?.charCodeAt(0)||0)%colors.length];
          const initials = (c.userId?.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
          return (
            <div key={c._id} style={{display:"flex",gap:12}}>
              <div className="avatar" style={{width:32,height:32,background:color,fontSize:11,color:"#0a0d0f",flexShrink:0}}>{initials}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:13}}>{c.userId?.name||"User"}</span>
                  <span style={{fontSize:10,fontFamily:"var(--mono)",color:"var(--text3)"}}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",fontSize:13,lineHeight:1.6}}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:8}}>
        <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} placeholder="Leave a comment…" style={{resize:"vertical"}} />
        <button type="submit" className="btn btn-ghost btn-sm" style={{alignSelf:"flex-end"}} disabled={submitting}>{submitting?"Posting…":"Post Comment"}</button>
      </form>
    </div>
  );
}