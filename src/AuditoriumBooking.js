import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css"; 

const auditoriums = ["Audi B Block (Ground Floor)","Audi C block UID (Av Room)","Audi SoHT",  "Moot Court Hall D block","Amphitheater", "Staff Refractory, B Block","Student Refractory, B Block","Staff Refractory, D Block","UID Courtyard, C Block"];
const slots = ["09:10 AM - 10:00 AM", "10:00 AM - 10:50 AM", "10:50 AM - 11:40 AM", "11:40 AM - 12:30 PM", "12:30 PM - 01:20 PM", "01:20 PM - 02:10 PM", "02:10 PM - 03:00 PM", "03:00 PM - 03:50 PM", "03:50 PM - 04:30 PM"];
const countryCodes = ["+91", "+1", "+44", "+971"];

function AuditoriumBooking({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAuditorium, setSelectedAuditorium] = useState(auditoriums[0]);
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", purpose: "", eventName: "", host: "", capacity: "" });

  useEffect(() => { if(user) setDetails(prev => ({ ...prev, name: user.displayName, email: user.email })); }, [user]);

  useEffect(() => {
    if (!date) return;
    const q = query(collection(db, "bookings"), where("date", "==", date), where("auditorium", "==", selectedAuditorium));
    const unsub = onSnapshot(q, (snapshot) => setExistingBookings(snapshot.docs.map(doc => doc.data())));
    return () => unsub();
  }, [date, selectedAuditorium]);

  const submitBooking = async () => {
    if (selectedSlots.length === 0) return toast.warning("Select slot!");
    try {
      await addDoc(collection(db, "bookings"), { ...details, fullPhone: `${countryCode} ${details.phone}`, email: user.email, auditorium: selectedAuditorium, date, slots: selectedSlots, status: "PENDING", createdAt: new Date().toISOString(), type: "Auditorium" });
      emailjs.send('service_pu8v9ik', 'template_fsvewmn', { ...details, date }, 'brwklSK_C1VLSMlQD'); 
      toast.success("✅ Request Sent!");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (error) { toast.error("❌ Error"); }
  };

  return (
    <div style={{minHeight:"100vh", background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"}}>
      <ToastContainer position="bottom-right" theme="colored" />
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"10px", left:"20px", height:"60px", zIndex:1000, background:"white", padding:"5px", borderRadius:"8px"}} />
      <header style={{background: "rgba(0,0,0,0.3)", height: "80px", display: "flex", alignItems: "center", justifyContent:"center"}}>
        <h2 style={{color: "white", margin: 0}}>🏟️ Auditorium Booking</h2>
        <button onClick={() => navigate("/home")} style={{position:"absolute", right:"30px", background:"transparent", border:"1px solid white", color:"white", padding:"8px 15px", borderRadius:"5px"}}>⬅ Back Home</button>
      </header>

      <div style={{padding: "40px"}}>
      {step === 1 && (
        <div className="details-card">
          <h3>Step 1: Event Details</h3>
          <div className="input-group"><label>Phone</label>
             <div style={{display:"flex", gap:"10px"}}>
               <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{width:"80px"}}>{countryCodes.map(c => <option key={c}>{c}</option>)}</select>
               <input value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value.replace(/\D/g, "")})} placeholder="9876543210" maxLength="10" />
             </div>
          </div>
          <div className="input-group"><label>Event Name</label><input value={details.eventName} onChange={(e) => setDetails({...details, eventName: e.target.value})} /></div>
          <div className="input-group"><label>Capacity (Min 1)</label><input type="number" min="1" value={details.capacity} onChange={(e) => {if(e.target.value >= 1) setDetails({...details, capacity: e.target.value})}} /></div>
          <div className="input-group"><label>Purpose</label><input value={details.purpose} onChange={(e) => setDetails({...details, purpose: e.target.value})} /></div>
          <div className="input-group"><label>Host</label><input value={details.host} onChange={(e) => setDetails({...details, host: e.target.value})} /></div>
          <button className="submit" style={{width:"100%", background:"#1e3c72"}} onClick={() => { if(details.phone.length===10 && details.eventName && details.capacity > 0) setStep(2); else toast.warning("Enter Valid Details!"); }}>Next ➡️</button>
        </div>
      )}

      {step === 2 && (
        <div className="dashboard">
          <aside>{auditoriums.map(r => <div key={r} onClick={() => setSelectedAuditorium(r)} className={selectedAuditorium === r ? "active" : ""}>{r}</div>)}</aside>
          <main>
             <h3>{selectedAuditorium}</h3>
             <input type="date" min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} className="date-picker" />
             {date && <div className="slots">{slots.map(s => {
               const isBooked = existingBookings.some(b => b.slots.includes(s) && (b.status === "APPROVED" || b.status === "PENDING"));
               return <button key={s} onClick={() => !isBooked && setSelectedSlots(prev => prev.includes(s) ? prev.filter(x=>x!==s):[...prev,s])} className={`slot ${isBooked ? "booked-slot" : selectedSlots.includes(s) ? "selected" : ""}`} disabled={isBooked}>{s}</button>
             })}</div>}
             {selectedSlots.length > 0 && <button className="submit" style={{background:"#1e3c72"}} onClick={submitBooking}>Confirm Booking</button>}
          </main>
          {/* Legend */}
          <div style={{position:"fixed", bottom:"20px", right:"20px", background:"white", padding:"15px", borderRadius:"10px", color:"black", fontSize:"12px", zIndex:2000}}>
             <div style={{display:"flex", gap:"5px", marginBottom:"5px"}}><div style={{width:"10px", height:"10px", background:"#3498db"}}></div> Selected</div>
             <div style={{display:"flex", gap:"5px", marginBottom:"5px"}}><div style={{width:"10px", height:"10px", background:"#f1c40f"}}></div> Pending</div>
             <div style={{display:"flex", gap:"5px"}}><div style={{width:"10px", height:"10px", background:"#e74c3c"}}></div> Booked</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
export default AuditoriumBooking;