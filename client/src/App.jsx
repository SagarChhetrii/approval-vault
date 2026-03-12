import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/Projects";
import ProjectView  from "./pages/ProjectView";
import Files        from "./pages/files";
import Approvals    from "./pages/Approvals";
import Clients      from "./pages/Clients";
import AuditPage    from "./pages/AuditPage";
import ApprovalProof from "./pages/ApprovalProof";
import Profile      from "./pages/Profile";

function Guard({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"              element={<Login />} />
        <Route path="/"                   element={<Guard><Dashboard /></Guard>} />
        <Route path="/projects"           element={<Guard><Projects /></Guard>} />
        <Route path="/projects/:id"       element={<Guard><ProjectView /></Guard>} />
        <Route path="/files"              element={<Guard><Files /></Guard>} />
        <Route path="/approvals"          element={<Guard><Approvals /></Guard>} />
        <Route path="/clients"            element={<Guard><Clients /></Guard>} />
        <Route path="/audit"              element={<Guard><AuditPage /></Guard>} />
        <Route path="/profile"            element={<Guard><Profile /></Guard>} />
        <Route path="/approval/:versionId" element={<Guard><ApprovalProof /></Guard>} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}