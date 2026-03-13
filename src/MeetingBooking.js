import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import emailjs from "@emailjs/browser"; 
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const meetingRooms = ["Conference room, D Block, 1st Floor", "Conference room, B Block, Ground Floor", "B Block VC Lounge", "B Block Conference room, 1st Floor (B103)"];
const slots = ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"];
const countryCodes = ["+91", "+1", "+44", "+971", "+61"];

function MeetingBooking({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(meetingRooms[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", purpose: "", eventName: "", host: "", capacity: "" });

  const getTodayIST = () => {
    const now = new Date();
    const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  };
  const todayIST = getTodayIST();

  useEffect(() => {
    if (user) setDetails(prev => ({ ...prev, name: user.displayName || "Faculty", email: user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!startDate) return;
    const q = query(collection(db, "bookings"), where("date", "==", startDate), where("auditorium", "==", selectedRoom));
    const unsub = onSnapshot(q, (snapshot) => setExistingBookings(snapshot.docs.map(doc => doc.data())));
    return () => unsub();
  }, [startDate, selectedRoom]);

  const isSlotPast = (slotString) => {
    if (!startDate || startDate < todayIST) return true;
    if (startDate > todayIST) return false;
    const now = new Date();
    const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (5.5 * 60 * 60 * 1000));
    const startTime = slotString.split(" - ")[0]; 
    let [time, modifier] = startTime.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
    return (h * 60 + m) < (istNow.getHours() * 60 + istNow.getMinutes());
  };

  const getSlotStatus = (slotTime) => {
    if (isSlotPast(slotTime)) return { status: "PASSED" };
    const approved = existingBookings.find(b => b.slots.includes(slotTime) && b.status === "APPROVED");
    if (approved) return { status: "BOOKED" };
    const pending = existingBookings.find(b => b.slots.includes(slotTime) && b.status === "PENDING");
    if (pending) return { status: "PENDING" };
    return { status: "AVAILABLE" };
  };

  const handleNextStep = () => {
    // ✅ SARE DETAILS MANDATORY + 10 DIGIT CHECK
    const { phone, eventName, capacity, purpose, host } = details;
    if (!phone || phone.length !== 10 || !eventName || !capacity || !purpose || !host) {
        return toast.warning("⚠️ Please fill all details correctly !");
    }
    if (parseInt(capacity) <= 0) {
        return toast.warning("⚠️ Capacity must be greater than 0!");
    }
    setStep(2);
  };

  const submitBooking = async () => {
    if (selectedSlots.length === 0 || !startDate || !endDate) return toast.warning("⚠️ Select slots and date range!");
    
    let dates = [];
    let curr = new Date(startDate);
    let last = new Date(endDate);
    while(curr <= last) {
      dates.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    try {
      for (const d of dates) {
        await addDoc(collection(db, "bookings"), {
          ...details, fullPhone: `${countryCode} ${details.phone}`, email: user.email,
          auditorium: selectedRoom, date: d, slots: selectedSlots, status: "PENDING", createdAt: new Date(), type: "Meeting Room"
        });
      }
      toast.success(`✅ Request Saved for ${dates.length} days!`);
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (e) { toast.error("❌ Error!"); }
  };

  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"180px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px"}} />
      <header className="topbar" style={{ background:"#1e3c72", paddingLeft: "250px", height: "80px", display:"flex", alignItems:"center" }}> 
        <h2 style={{color: "white", margin: 0}}>🤝 Meeting Room Booking</h2>
        <button onClick={() => navigate("/home")} className="back-btn" style={{background:"transparent", border:"1px solid white", color:"white", marginLeft:"auto", marginRight:"20px"}}>⬅ Back Home</button>
      </header>

      {step === 1 && (
        <div className="details-card">
          <h3>Step 1: Meeting Details</h3>
          <div className="input-group">
            <label>Phone (10 Digits) *</label>
            <div className="phone-input-container">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="country-select">{countryCodes.map(c => <option key={c}>{c}</option>)}</select>
              <input value={details.phone} onChange={(e)=>setDetails({...details, phone:e.target.value.replace(/\D/g,"")})} placeholder="9876543210" maxLength={10} />
            </div>
          </div>
          <div className="input-group"><label>Meeting Name *</label><input value={details.eventName} onChange={(e) => setDetails({ ...details, eventName: e.target.value })} /></div>
          <div className="input-group">
            <label>Approx. Capacity Required *</label>
            <input type="number" min="1" value={details.capacity} onChange={(e) => setDetails({ ...details, capacity: e.target.value })} placeholder="Ex: 10" />
          </div>
          <div className="input-group"><label>Purpose *</label><input value={details.purpose} onChange={(e) => setDetails({ ...details, purpose: e.target.value })} /></div>
          <div className="input-group"><label>Host *</label><input value={details.host} onChange={(e) => setDetails({ ...details, host: e.target.value })} /></div>
          <button className="submit" style={{width:"100%", background:"#1e3c72"}} onClick={handleNextStep}>Next ➡️</button>
        </div>
      )}

      {step === 2 && (
        <div className="dashboard">
          <aside>{meetingRooms.map(r => <div key={r} onClick={() => setSelectedRoom(r)} className={selectedRoom === r ? "active" : ""}>{r}</div>)}</aside>
          <main>
             <h3>{selectedRoom}</h3>
             <div style={{display:"flex", gap:"10px", marginBottom:"20px"}}>
                <div style={{flex:1}}><label>From: *</label><input type="date" min={todayIST} onChange={(e)=>setStartDate(e.target.value)} className="date-picker"/></div>
                <div style={{flex:1}}><label>To: *</label><input type="date" min={startDate || todayIST} onChange={(e)=>setEndDate(e.target.value)} className="date-picker"/></div>
             </div>
             {startDate && (
               <div className="slots">
                 {slots.map(s => {
                   const { status } = getSlotStatus(s);
                   return <button key={s} onClick={() => status === "AVAILABLE" && setSelectedSlots(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])} className={`slot ${status !== 'AVAILABLE' ? 'booked-slot' : selectedSlots.includes(s) ? 'selected' : ''}`} disabled={status !== 'AVAILABLE'}>{s} <br/><small>{status === 'AVAILABLE' ? '' : status}</small></button>
                 })}
               </div>
             )}
             {selectedSlots.length > 0 && <button className="submit" style={{background:"#1e3c72"}} onClick={submitBooking}>Confirm Meeting</button>}
             
             <div className="legend" style={{marginTop:"30px", borderTop:"1px solid #333", paddingTop:"15px"}}>
               <div className="legend-item"><div className="dot available"></div> Available</div>
               <div className="legend-item"><div className="dot selected"></div> Selected</div>
               <div className="legend-item"><div className="dot pending"></div> Pending</div>
               <div className="legend-item"><div className="dot booked"></div> Booked/Passed</div>
             </div>
          </main>
        </div>
      )}
    </>
  );
}
export default MeetingBooking;