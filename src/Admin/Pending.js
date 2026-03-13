import React, { useEffect, useState } from "react";
import { db } from "../firebase"; 
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import "./Admin.css"; 

// ✅ Import Timetable from main folder
import TimetableView from "../TimetableView"; 

export default function Pending() {
  const [requests, setRequests] = useState([]);
  const [showTimetable, setShowTimetable] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((b) => b.status === "PENDING");
      data.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
      setRequests(data);
    });
    return () => unsub();
  }, []);

  const handleAction = async (request, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", request.id), { status: newStatus });
      
      const templateParams = {
        to_name: request.name,
        to_email: request.email,
        event_name: request.eventName,
        status: newStatus,
        date: request.date,
        message: newStatus === "APPROVED" 
          ? "Your booking has been confirmed by the Admin." 
          : "Sorry, your booking request was declined."
      };

      // ⚠️ APNI ASLI IDs YAHAN CHECK KAR LENA
      emailjs.send('service_pu8v9ik', 'template_fsvewmn', templateParams, 'brwklSK_C1VLSMlQD')
        .then(() => alert(`Request ${newStatus} & Mail Sent!`))
        .catch(() => alert(`Request ${newStatus} but Mail Failed`));

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="pending-container">
      {/* HEADER WITH TOGGLE BUTTON */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
         <h2 className="section-title">
           {/* ✅ Renamed to Resource Tracker */}
           {showTimetable ? "📊 Resource Tracker" : `🔔 Pending Requests (${requests.length})`}
         </h2>
         <button 
           onClick={() => setShowTimetable(!showTimetable)}
           className="view-toggle-btn"
           style={{
             background: showTimetable ? "#e74c3c" : "#3498db",
             color: "white", padding: "10px 20px", border:"none", borderRadius:"5px", cursor:"pointer", fontWeight:"bold"
           }}
         >
           {/* ✅ Button Text Changed */}
           {showTimetable ? "⬅ Back to List" : "📊 Resource Tracker"}
         </button>
      </div>

      {/* TOGGLE LOGIC */}
      {showTimetable ? (
        <TimetableView />
      ) : (
        requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <div className="requests-grid">
            {requests.map((r) => (
              <div key={r.id} className="request-card">
                 <div className="card-body">
                    <h3>{r.eventName}</h3>
                    <p>{r.auditorium} | {r.date}</p>
                    <p>By: {r.name}</p>
                    <p><strong>Capacity Req:</strong> {r.capacity || "N/A"}</p>
                    <div className="card-actions">
                      <button className="btn-reject" onClick={() => handleAction(r, "REJECTED")}>Reject</button>
                      <button className="btn-approve" onClick={() => handleAction(r, "APPROVED")}>Approve</button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}