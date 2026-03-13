import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css"; 

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  
  // ✅ Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bookings"), where("email", "==", user.email));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // 1. Sirf Popup Kholega
  const initiateCancel = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // 2. Delete aur Email Logic (Async function zaroori hai yahan)
  const confirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      // 🔥 STEP 1: Pehle Database se Delete Karo
      await deleteDoc(doc(db, "bookings", selectedBooking.id));
      
      // Modal band karo
      setShowModal(false);
      
      // Success Notification
      toast.success("✅ Booking Cancelled Successfully!");

      // 🔥 STEP 2: Email Bhejo (Try-Catch taaki agar mail fail ho to app crash na ho)
      try {
        const templateParams = {
          to_name: selectedBooking.name,
          to_email: selectedBooking.email,
          event_name: selectedBooking.eventName,
          date: selectedBooking.date,
          status: "CANCELLED",
          message: "This booking was cancelled by you."
        };
        
        // ⚠️ APNI EMAIL SERVICE IDs YAHAN CHECK KAR LENA
        await emailjs.send('service_pu8v9ik', 'template_fsvewmn', templateParams, 'brwklSK_C1VLSMlQD');
        
        // ✅ Mail Sent Popup
        toast.info("📧 Cancellation Mail Sent!"); 

      } catch (emailError) {
        console.warn("Email failed.", emailError);
        toast.warning("⚠️ Booking Deleted, but Mail Failed.");
      }

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("❌ Failed to delete from Database.");
      setShowModal(false);
    }
  };

  return (
    <div className="dashboard-container" style={{padding: "0", minHeight: "100vh"}}>
      
      {/* Logo */}
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"180px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />
      
      <ToastContainer position="bottom-right" theme="colored" />
      
      <header style={{background: "#1e3c72", height: "80px", display: "flex", alignItems: "center", paddingLeft: "250px", paddingRight: "40px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", marginBottom: "40px"}}>
         <h2 style={{color: "white", margin: 0, fontSize: "24px"}}>📜 My Booking History</h2>
         <button onClick={() => navigate("/home")} className="back-btn" style={{marginLeft: "auto", background:"transparent", border:"1px solid white", color:"white"}}>⬅ Back Home</button>
      </header>

      <div style={{padding: "0 40px"}}>
        {bookings.length === 0 ? (
          <p style={{color: "white", fontSize: "18px", textAlign: "center"}}>No bookings found yet.</p>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"25px"}}>
            {bookings.map((b) => (
              <div key={b.id} className="details-card" style={{position:"relative", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderLeft: `5px solid ${b.status === "APPROVED" ? "#2ecc71" : b.status === "REJECTED" ? "#e74c3c" : "#f1c40f"}`}}>
                 
                 {/* Status Badge */}
                 <span style={{
                   position: "absolute", top: "20px", right: "20px", 
                   background: b.status === "APPROVED" ? "#2ecc71" : b.status === "REJECTED" ? "#e74c3c" : "#f1c40f", 
                   color: b.status === "PENDING" ? "black" : "white", 
                   padding: "5px 10px", borderRadius: "5px", fontSize: "12px", fontWeight: "bold"
                 }}>
                   {b.status}
                 </span>

                 <h3 style={{margin:"0 0 10px 0", color:"white", paddingRight: "80px"}}>{b.eventName}</h3>
                 <p style={{color: "#ddd", margin: "5px 0"}}><strong>📍 {b.auditorium}</strong></p>
                 <p style={{color: "#ddd", margin: "5px 0"}}>📅 {b.date}</p>
                 <p style={{color: "#ddd", margin: "5px 0"}}>⏰ {b.slots.join(", ")}</p>
                 <p style={{color: "#ddd", margin: "5px 0", fontSize: "13px"}}>🆔 ID: {b.id.slice(0, 8)}...</p>

                 {/* Cancel Button */}
                 <button onClick={() => initiateCancel(b)} style={{
                   marginTop: "20px", background: "rgba(231, 76, 60, 0.2)", color: "#e74c3c", 
                   border: "1px solid #e74c3c", padding: "8px 15px", borderRadius: "5px", 
                   cursor: "pointer", fontWeight: "bold", width: "100%", transition: "0.3s"
                 }} 
                 onMouseOver={(e) => { e.target.style.background = "#e74c3c"; e.target.style.color = "white"; }} 
                 onMouseOut={(e) => { e.target.style.background = "rgba(231, 76, 60, 0.2)"; e.target.style.color = "#e74c3c"; }}>
                   🗑️ Cancel Booking
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ CUSTOM CENTER MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{color: "#e74c3c", fontSize: "22px"}}>⚠️ Cancel Booking?</h3>
            <p style={{color: "#ccc", margin: "15px 0"}}>
              Are you sure you want to delete <strong>{selectedBooking?.eventName}</strong>?
              <br/>This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-no" onClick={() => setShowModal(false)}>No, Keep it</button>
              <button className="btn-yes" onClick={confirmCancel}>Yes, Cancel it</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}