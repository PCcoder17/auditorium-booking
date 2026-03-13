import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; 

const auditoriumData = [
  { name: "Audi, B Block (Ground Floor)", capacity: "282 Seats", speakers: "0", mics: "2 wireless", projector: "2", facilities:"2 podiums and 3 podium mics",extra: "1 Device, Internet connectivity"  },
  { name: "Audi C block UID (Av Room)", capacity: "120 Seats", speakers: "2", mics: "2 wireless", projector: "1", facilities:"1 podium and 1 podium mic",extra: "1 Device, Internet connectivity"  },
  { name: "Audi SoHT ", capacity: "50 Seats", speakers: "2", mics: "2 wireless,2 wired", projector: "0", facilities:"1 podium and 1 podium mic",extra: "1 Device, Internet connectivity,2 Monitor"  },
  { name: "Moot Court Hall D block ", capacity: "50 Seats", speakers: "4", mics: "5 wired", projector: "2", facilities:"2 podium and 2 podium mic",extra: "1 Device, Internet connectivity,2 Monitor"  },
  { name: "Amphitheatre  ", capacity: "open  ", speakers: "2", mics: "As per requirement", projector: "0" },
  { name: "Block B Staff Refractory   ", capacity: "50 Seats" },
  { name: "Block D Staff Refractory   ", capacity: "50 Seats"},
  { name: "UID Courtyard, C Block ", capacity: "50 Seats", speakers: "4", mics: "2 Wired", projector: "1", facilities:"1 podium and 2 podium mic",extra: " 1 Device" },
  { name: "Block B Student Refractory   ", capacity: "250 Seats" },

];

function AuditoriumDetails() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-container" style={{padding:"0", minHeight:"100vh", background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"}}>
      
      {/* ✅ Logo Fixed: image.png */}
      <img src="/image.png" alt="Logo" style={{position:"absolute", top:"5px", left:"20px", width:"150px", zIndex:1000, background:"#1e3c72", padding:"8px", borderRadius:"5px", boxShadow:"0 2px 5px rgba(0,0,0,0.2)"}} />
      
      {/* ✅ Uniform Header (Matches Booking Page) */}
      <header style={{
         background: "#1e3c72", 
         height: "80px", 
         display: "flex", 
         alignItems: "center", 
         justifyContent: "center",
         paddingLeft: "200px", 
         paddingRight: "40px", 
         boxShadow: "0 4px 10px rgba(0,0,0,0.3)", 
         marginBottom: "40px"
      }}>
         <h2 style={{color: "white", margin: 0, fontSize: "28px"}}>🏟️ Auditorium Facilities</h2>
         
         <button onClick={() => navigate("/home")} style={{
             marginLeft: "auto", 
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

      {/* Details Cards */}
      <div style={{padding: "0 40px", display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"20px"}}>
        {auditoriumData.map((audi, index) => (
         <div key={index} style={{
  background:"white",
  padding:"25px",
  borderRadius:"10px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.3)",
  borderLeft:"5px solid #3498db"
}}>

<h3 style={{
  margin:"0 0 15px 0",
  color:"#2c3e50",
  fontSize:"22px",
  borderBottom:"1px solid #eee",
  paddingBottom:"10px"
}}>
{audi.name}
</h3>

{audi.capacity && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>🪑 Capacity:</strong> {audi.capacity}
</div>
)}

{audi.speakers && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>🔊 Speakers:</strong> {audi.speakers}
</div>
)}

{audi.mics && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>🎤 Mics:</strong> {audi.mics}
</div>
)}

{audi.projector && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>📽️ Projector:</strong> {audi.projector}
</div>
)}

{audi.facilities && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>🎛 Facilities:</strong> {audi.facilities}
</div>
)}

{audi.extra && (
<div style={{color:"#333", marginBottom:"8px", fontSize:"15px"}}>
<strong>✨ Extra:</strong> {audi.extra}
</div>
)}

</div>
               ))}
      </div>
    </div>
  );
}

export default AuditoriumDetails;