import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Clients() {
  const navigate = useNavigate();
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div><div className="topbar-title">Reports</div><div className="topbar-sub">COMPLIANCE OVERVIEW</div></div>
        </div>
        <div className="page-body fade-up">
          <div className="card" style={{padding:40,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>📊</div>
            <h3 style={{marginBottom:8}}>Reports Coming Soon</h3>
            <p style={{color:"var(--text2)",fontSize:14}}>Downloadable approval certificates and compliance reports will appear here.</p>
            <button className="btn btn-ghost" style={{marginTop:20}} onClick={()=>navigate("/approvals")}>View Approvals →</button>
          </div>
        </div>
      </div>
    </div>
  );
}