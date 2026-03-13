import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import "./Admin.css";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = "/"; 
    });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
<img src="/image.png" alt="Logo" style={{width:"150px", background:"#1e3c72", padding:"10px", borderRadius:"5px", marginBottom:"10px"}} />
           <h3>🛡️ Admin Panel</h3>
        </div>
        <nav className="admin-nav">
          <button onClick={() => navigate("/admin/pending")}>🔔 Pending Requests</button>
          <button onClick={() => navigate("/dashboard")}>➕ New Booking (Self)</button>
          <button onClick={() => navigate("/admin/data")}>📊 All Records / Data</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout} style={{marginTop: "auto", background: "#e74c3c", color: "white", border:"none"}}>Logout</button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;