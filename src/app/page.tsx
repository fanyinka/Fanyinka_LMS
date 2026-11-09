"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, Users, Church, CalendarCheck, QrCode, ScanFace,
  MessageSquare, BarChart3, Shield, Settings, Search, Plus, Menu
} from "lucide-react";

type Member = {
  id: string; full_name: string; phone: string | null; email: string | null;
  department: string | null; ministry: string | null; bible_group: number | null;
  membership_status: string;
};

const nav = [
  ["Dashboard", LayoutDashboard], ["Members", Users], ["Departments", Church],
  ["Ministries", Church], ["Bible Study Groups", Users], ["Attendance", CalendarCheck],
  ["QR Attendance", QrCode], ["Face Registration", ScanFace],
  ["Messages", MessageSquare], ["Reports", BarChart3], ["User Access", Shield],
  ["Settings", Settings],
] as const;

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [section, setSection] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Youth");
  const [ministry, setMinistry] = useState("Youth Ministry");
  const [group, setGroup] = useState("1");
  const [notice, setNotice] = useState("");

  async function loadMembers() {
    if (!supabase) return;
    const { data, error } = await supabase.from("members")
      .select("*").order("full_name").limit(2000);
    if (error) setNotice(error.message);
    else setMembers((data || []) as Member[]);
  }

  useEffect(() => { loadMembers(); }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setNotice("Connect Supabase first using the setup guide."); return; }
    const { error } = await supabase.from("members").insert({
      full_name: name.trim(), phone: phone || null, email: email || null,
      department, ministry, bible_group: Number(group), membership_status: "active"
    });
    if (error) setNotice(error.message);
    else {
      setNotice("Member added successfully.");
      setName(""); setPhone(""); setEmail(""); setShowAdd(false); loadMembers();
    }
  }

  const filtered = members.filter(m =>
    [m.full_name, m.phone || "", m.email || "", m.department || "", m.ministry || ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">F</div><div><b>FANYINKA LMS</b><small>HARRY FANYINKA TEMPLE</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      {nav.map(([label, Icon]) => <button key={label} onClick={() => setSection(label)}
        className={`nav-item ${section === label ? "active" : ""}`}>
        <Icon size={18}/><span>{label}</span>
      </button>)}
      <div className="sidebar-foot">Church Management System<br/><span>Version 0.1 · Starter</span></div>
    </aside>

    <section className="content">
      <header className="topbar">
        <div><div className="eyebrow">THE CHURCH OF PENTECOST</div><h1>{section}</h1></div>
        <div className="admin-pill"><span className="online-dot"/> Admin workspace</div>
      </header>

      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}

      {section === "Dashboard" && <>
        <div className="welcome"><div><span className="eyebrow gold">WELCOME TO YOUR CHURCH PORTAL</span>
          <h2>Manage your church,<br/>connect your people.</h2>
          <p>Attendance, ministries and member records in one place.</p></div>
          <div className="welcome-icon"><Church size={62}/></div></div>
        <div className="stats">
          <Stat label="Registered members" value={String(members.length)} icon={<Users/>}/>
          <Stat label="Ministries" value="6" icon={<Church/>}/>
          <Stat label="Bible study groups" value="30" icon={<CalendarCheck/>}/>
          <Stat label="Departments" value="8" icon={<BarChart3/>}/>
        </div>
        <div className="grid-two">
          <div className="panel"><div className="panel-head"><h3>Quick actions</h3></div>
            <div className="quick-grid">
              <Quick icon={<Plus/>} title="Add a member" onClick={() => {setSection("Members");setShowAdd(true)}}/>
              <Quick icon={<QrCode/>} title="Open QR attendance" onClick={() => setSection("QR Attendance")}/>
              <Quick icon={<ScanFace/>} title="Face registration" onClick={() => setSection("Face Registration")}/>
              <Quick icon={<MessageSquare/>} title="Send announcement" onClick={() => setSection("Messages")}/>
            </div></div>
          <div className="panel"><div className="panel-head"><h3>System setup</h3><span className="tag">Getting started</span></div>
            <ol className="steps"><li>Connect your secure cloud database.</li><li>Import your member list.</li><li>Invite approved staff and ministry leaders.</li><li>Configure attendance and consent settings.</li></ol>
          </div>
        </div>
      </>}

      {section === "Members" && <div className="panel">
        <div className="panel-head member-head"><div><h3>Church members</h3><p>Manage member profiles and ministry assignments.</p></div>
          <button className="primary" onClick={() => setShowAdd(!showAdd)}><Plus size={17}/> Add member</button></div>
        {showAdd && <form className="member-form" onSubmit={addMember}>
          <label>Full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Member full name"/></label>
          <label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+233..."/></label>
          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@email.com"/></label>
          <label>Department<select value={department} onChange={e=>setDepartment(e.target.value)}>{["Youth","Media","Elder","Deacon","Deaconess","Usher","Sound","Instrumentalist"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Ministry<select value={ministry} onChange={e=>setMinistry(e.target.value)}>{["Youth Ministry","Men Ministry","Women Ministry","Virtuous Ladies","Faithful Gents","Children Ministry"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Bible study group<select value={group} onChange={e=>setGroup(e.target.value)}>{Array.from({length:30},(_,i)=><option key={i+1} value={i+1}>Group {i+1}</option>)}</select></label>
          <div className="form-actions"><button type="button" className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="primary">Save member</button></div>
        </form>}
        <div className="toolbar"><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members..."/></div><span>{filtered.length} members shown</span></div>
        <div className="table-wrap"><table><thead><tr><th>MEMBER</th><th>PHONE</th><th>DEPARTMENT</th><th>MINISTRY</th><th>BIBLE GROUP</th></tr></thead>
          <tbody>{filtered.map(m=><tr key={m.id}><td><b>{m.full_name}</b><small>{m.email || "No email added"}</small></td><td>{m.phone || "—"}</td><td>{m.department || "—"}</td><td>{m.ministry || "—"}</td><td><span className="tag">Group {m.bible_group ?? "—"}</span></td></tr>)}
          {!filtered.length && <tr><td colSpan={5} className="empty">{supabase ? "No members yet. Add your first member or import your list." : "Connect your cloud database to load and save members."}</td></tr>}</tbody></table></div>
      </div>}

      {section !== "Dashboard" && section !== "Members" && <div className="panel placeholder">
        <div className="placeholder-icon">{section.includes("QR") ? <QrCode/> : section.includes("Face") ? <ScanFace/> : <Settings/>}</div>
        <h2>{section}</h2><p>This module is included in the FANYINKA LMS build plan. It will be connected to the secure database and permission system in the next implementation stage.</p>
        {section === "Face Registration" && <p className="security-note">Face verification is not activated in this starter. Before launch, it needs informed consent, secure biometric processing, liveness checks and a non-biometric attendance option.</p>}
        {section === "QR Attendance" && <p className="security-note">QR attendance will use short-lived, single-use session tokens to reduce copied-code and repeat check-ins.</p>}
      </div>}
      <footer>FANYINKA LMS <span>·</span> Harry Fanyinka Temple</footer>
    </section>
  </main>;
}

function Stat({label,value,icon}:{label:string;value:string;icon:React.ReactNode}) {
  return <div className="stat"><div className="stat-icon">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>;
}
function Quick({icon,title,onClick}:{icon:React.ReactNode;title:string;onClick:()=>void}) {
  return <button className="quick" onClick={onClick}><span>{icon}</span><b>{title}</b></button>;
}
