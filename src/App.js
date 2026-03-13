import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard"; 
import MeetingBooking from "./MeetingBooking"; 
import UserHome from "./UserHome";
import MyBookings from "./MyBookings";
import AdminLayout from "./Admin/AdminLayout";
import Pending from "./Admin/Pending";
import DataPage from "./Admin/DataPage";
// ✅ IMPORT NEW PAGES
import AuditoriumDetails from "./AuditoriumDetails";
import MeetingRoomDetails from "./MeetingRoomDetails";
import TimetableView from "./TimetableView";
function App() {
  const [user, setUser] = useState(null);
  const ADMINS = ["240160203087.priyesh@gdgu.org"];
  const isAdmin = user && ADMINS.includes(user.email);

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Login setUser={setUser} />;
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to="/home" />} />
      <Route path="/home" element={<ProtectedRoute><UserHome user={user} setUser={setUser} /></ProtectedRoute>} />
      
      <Route path="/auditorium" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
      <Route path="/meeting-booking" element={<ProtectedRoute><MeetingBooking user={user} /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings user={user} /></ProtectedRoute>} />

      {/* ✅ NEW ROUTES */}
      <Route path="/auditorium-details" element={<ProtectedRoute><AuditoriumDetails /></ProtectedRoute>} />
      <Route path="/meeting-details" element={<ProtectedRoute><MeetingRoomDetails /></ProtectedRoute>} />
{/* ✅ Resource Tracker Route */}
{/* ✅ RESOURCE TRACKER ROUTE (Fixed Layout & Logo) */}
      <Route path="/schedule" element={
        <ProtectedRoute>
          <div style={{minHeight:"100vh", background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", paddingBottom: "20px"}}>
             
             {/* ✅ Logo Fixed: image.png */}
             <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"150px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />
             
             {/* Header Bar */}
             <header style={{
                background: "#1e3c72", 
                height: "80px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                paddingLeft: "200px", 
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)", 
                marginBottom: "30px"
             }}>
               <h2 style={{color: "white", margin: 0, fontSize: "28px"}}>📊 Resource Tracker</h2>
               
               <button onClick={() => window.history.back()} style={{
                  marginLeft: "auto", 
                  marginRight: "40px",
                  background:"transparent", 
                  border:"1px solid white", 
                  color:"white", 
                  padding:"8px 15px", 
                  borderRadius:"5px", 
                  cursor:"pointer",
                  fontWeight: "bold"
               }}>
                 ⬅ Back Home
               </button>
             </header>
             
             <div style={{padding: "0 40px"}}>
                <TimetableView />
             </div>
          </div>
        </ProtectedRoute>
      } />
      {isAdmin && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="pending" />} />
          <Route path="pending" element={<Pending />} />
          <Route path="data" element={<DataPage />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;