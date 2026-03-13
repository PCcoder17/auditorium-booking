import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./Dashboard.css"; 

const auditoriumSlots = ["09:10 - 10:00", "10:00 - 10:50", "10:50 - 11:40", "11:40 - 12:30", "12:30 - 01:20", "01:20 - 02:10", "02:10 - 03:00", "03:00 - 03:50", "03:50 - 04:30"];
const meetingSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 01:00","1:00-2:00", "02:00 - 03:00", "03:00 - 04:00"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];

export default function TimetableView() {
  const [bookings, setBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState("Audi, B Block, Ground Floor"); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ✅ AUTO-DETECT ADMIN MODE: Agar URL mein 'admin' hai toh true ho jayega
  const isAdmin = window.location.pathname.toLowerCase().includes("admin");

  const isAuditorium = !selectedResource.includes("Conference") && !selectedResource.includes("Lounge");
  const currentSlots = isAuditorium ? auditoriumSlots : meetingSlots;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };
  
  const startOfWeek = getStartOfWeek(currentDate);
  
  const weekDays = Array.from({length: 7}, (_, i) => {
      let d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`; 

      return { 
        name: daysOfWeek[i], 
        dateStr: localDateStr, 
        display: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) 
      };
  });

  const getBookingForCell = (dateStr, slot) => {
    return bookings.find(b => 
      b.date === dateStr && 
      (b.auditorium === selectedResource || b.room === selectedResource || b.meetingRoom === selectedResource) && 
      b.slots && b.slots.includes(slot) && 
      b.status !== "REJECTED"
    );
  };

  const handleSlotClick = (booking) => {
    // ✅ Agar Admin detect hua hai tabhi click kaam karega
    if (isAdmin && booking) {
      setSelectedBooking(booking);
    }
  };

  return (
    <div className="timetable-container" style={{padding:"20px", paddingBottom: "120px"}}>
      
      {/* HEADER */}
      <div className="timetable-header" style={{display:"flex", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px", alignItems:"center"}}>
        <select 
          value={selectedResource} 
          onChange={(e) => {setSelectedResource(e.target.value); setSelectedBooking(null);}} 
          style={{
            padding:"10px", fontSize:"16px", borderRadius:"5px", minWidth: "200px", 
            background: "rgba(0,0,0,0.6)", color:"white", border:"1px solid rgba(255,255,255,0.3)"
          }}
        >
          {[
            "Audi, B Block, Ground Floor", "Audi C block UID (Av Room)", "Audi SoHT",
            "Moot Court Hall D block", "Ampitheatre", "Staff Refractory, B Block",
            "Student Refractory, B Block", "Staff Refractory, D Block", "UID Courtyard, C Block",
            "Conference room, D Block, 1st Floor", "Conference room, B Block, Ground Floor",
            "B Block VC Lounge", "B Block Conference room, 1st Floor (B103)"
          ].map(r => <option key={r} style={{background:"#333", color:"white"}}>{r}</option>)}
        </select>

        <div>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); setSelectedBooking(null); }} className="nav-btn">◀ Prev</button>
          <span style={{fontWeight:"bold", margin:"0 15px", color:"white"}}>{weekDays[0].display} - {weekDays[6].display}</span>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); setSelectedBooking(null); }} className="nav-btn">Next ▶</button>
        </div>
      </div>

      {/* TABLE GRID */}
      <div style={{overflowX:"auto", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"}}>
        <table style={{width:"100%", borderCollapse:"collapse", minWidth:"1000px"}}>
          <thead>
            <tr style={{background:"rgba(0,0,0,0.8)", color:"white"}}>
              <th style={{padding:"12px", border:"1px solid rgba(255,255,255,0.1)"}}>Day / Time</th>
              {currentSlots.map(s => <th key={s} style={{padding:"10px", border:"1px solid rgba(255,255,255,0.1)", fontSize:"12px"}}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => (
              <tr key={day.dateStr}>
                <td style={{
                    background:"rgba(255,255,255,0.05)", color:"white", padding:"10px", 
                    border:"1px solid rgba(255,255,255,0.1)", fontWeight:"bold", textAlign:"center", minWidth:"100px"
                }}>
                  {day.name}<br/>
                  <span style={{fontSize:"12px", opacity:0.8, color: "#ddd"}}>{day.display}</span>
                </td>

                {currentSlots.map((slot) => {
                  const booking = getBookingForCell(day.dateStr, slot);
                  let bg = "rgba(255,255,255,0.02)"; 
                  let label = "";
                  let textColor = "white";
                  
                  if (booking) {
                      bg = booking.status === "APPROVED" ? "#e74c3c" : "#f1c40f"; 
                      label = booking.status;
                      textColor = booking.status === "PENDING" ? "black" : "white"; 
                  }
                  
                  return (
                    <td key={slot} 
                        onClick={() => handleSlotClick(booking)}
                        style={{
                            background: bg, border:"1px solid rgba(255,255,255,0.1)", 
                            cursor: (isAdmin && booking) ? "pointer" : "default", 
                            height:"60px", minWidth:"100px", textAlign:"center", fontSize:"12px", 
                            color: textColor, fontWeight:"bold", transition: "all 0.2s"
                        }} 
                        className={(isAdmin && booking) ? "booked-cell" : ""}
                    >
                        {label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ DETAILS BOX - Sirf Admin URLs par dikhega */}
      {isAdmin && selectedBooking && (
        <div className="booking-details-box">
          <div className="details-header">
            <h3>📋 Booking Insights</h3>
            <button className="close-btn" onClick={() => setSelectedBooking(null)}>✕</button>
          </div>
          
          <div className="details-grid">
            <div className="info-item">
              <span className="info-label">📌 Event Name</span>
              <span className="info-value">{selectedBooking.eventName || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">👤 Hosted By</span>
              <span className="info-value">{selectedBooking.hostName || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📅 Date</span>
              <span className="info-value">{selectedBooking.date}</span>
            </div>
            <div className="info-item">
              <span className="info-label">⏰ Booked Slots</span>
              <span className="info-value">{selectedBooking.slots.join(", ")}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📍 Location</span>
              <span className="info-value">{selectedResource}</span>
            </div>
            <div className="info-item">
              <span className="info-label">🛡️ Approval</span>
              <span className={`status-pill ${selectedBooking.status}`}>{selectedBooking.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}