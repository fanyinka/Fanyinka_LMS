
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, Users, Church, CalendarCheck, QrCode, ScanFace,
  MessageSquare, BarChart3, Shield, Settings, Search, Plus, LogOut
} from "lucide-react";

type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  ministry: string | null;
  bible_group: number | null;
  membership_status: string;
};

const nav = [
  ["Dashboard", LayoutDashboard], ["Members", Users],
  ["Departments", Church], ["Ministries", Church],
  ["Bible Study Groups", Users], ["Attendance", CalendarCheck],
  ["QR Attendance", QrCode], ["Face Registration", ScanFace],
  ["Messages", MessageSquare], ["Reports", BarChart3],
  ["User Access", Shield], ["Settings", Settings],
] as const;

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
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

  async function verifyUser(currentUser: any) {
    if (!supabase || !currentUser) {
      setUser(null);
      setAuthorized(false);
      setChecking(false);
      return;
    }

    const { data, error } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (error || !data || data.length === 0) {
      await supabase.auth.signOut();
      setUser(null);
      setAuthorized(false);
      setLoginError(
        "Your account has not been authorized. Contact the system administrator."
      );
      setChecking(false);
      return;
    }

    setUser(currentUser);
    setAuthorized(true);
    setChecking(false);
    setLoginError("");
  }

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        void verifyUser(data.session.user);
      } else {
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setAuthorized(false);
          setChecking(false);
        } else if (event === "SIGNED_IN") {
          setChecking(true);
          void verifyUser(session.user);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (!supabase) {
      setLoginError("Supabase is not configured.");
      return;
    }

    setChecking(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      setChecking(false);
      return;
    }

    await verifyUser(data.user);
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setAuthorized(false);
    setSection("Dashboard");
  }

  async function loadMembers() {
    if (!supabase || !authorized) return;

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("full_name")
      .limit(2000);

    if (error) {
      setNotice("Could not load members: " + error.message);
    } else {
      setMembers((data || []) as Member[]);
    }
  }

  useEffect(() => {
    if (authorized) loadMembers();
  }, [authorized]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setNotice("Supabase is not configured.");
      return;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setNotice("Your login session is missing. Please sign in again.");
      return;
    }

    const { data: canAdd, error: roleError } = await supabase.rpc(
      "has_staff_role",
      { required_roles: ["super_admin", "secretary"] }
    );

    if (roleError) {
      setNotice("Permission check failed: " + roleError.message);
      return;
    }

    if (!canAdd) {
      setNotice(
        "Your website login is not recognized as authorized staff."
      );
      return;
    }

    const { error } = await supabase.from("members").insert({
      full_name: name.trim(),
      phone: phone || null,
      email: email || null,
      department,
      ministry,
      bible_group: Number(group),
      membership_status: "active",
    });

    if (error) {
      setNotice("Member saving failed: " + error.message);
      return;
    }

    setNotice("Member added successfully!");
    setName("");
    setPhone("");
    setEmail("");
    setShowAdd(false);
    await loadMembers();
  }

  const filtered = members.filter(m =>
    [m.full_name, m.phone || "", m.email || "",
      m.department || "", m.ministry || ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (checking) {
    return <main style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "#07172e", color: "white", fontFamily: "Arial"
    }}>
      <div style={{ textAlign: "center" }}>
        <h2>FANYINKA LMS</h2>
        <p>Checking administrator access...</p>
      </div>
    </main>;
  }

  if (!authorized) {
    return <main style={{
      minHeight: "100vh", background: "#07172e",
      display: "grid", placeItems: "center",
      padding: "20px", fontFamily: "Arial"
    }}>
      <form onSubmit={login} style={{
        background: "white", width: "100%", maxWidth: "420px",
        padding: "35px", borderRadius: "16px",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "55px", height: "55px", borderRadius: "12px",
          background: "#102c50", color: "#d9b66b",
          display: "grid", placeItems: "center",
          fontSize: "28px", fontWeight: "bold", marginBottom: "20px"
        }}>F</div>

        <h1 style={{ color: "#102c50", marginBottom: "5px" }}>
          FANYINKA LMS
        </h1>
        <p style={{ color: "#64748b", marginTop: "0" }}>
          HARRY FANYINKA TEMPLE
        </p>

        <h2 style={{ color: "#102c50", marginTop: "30px" }}>
          Administrator Login
        </h2>
        <p style={{ color: "#64748b" }}>
          Sign in to access your church management dashboard.
        </p>

        {loginError && <p style={{
          background: "#fee2e2", color: "#991b1b",
          padding: "12px", borderRadius: "8px", fontSize: "14px"
        }}>{loginError}</p>}

        <label style={{ display: "block", marginTop: "20px", color: "#334155" }}>
          Email address
          <input
            required type="email" value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            placeholder="admin@email.com"
            style={{
              display: "block", width: "100%", padding: "13px",
              marginTop: "8px", border: "1px solid #cbd5e1",
              borderRadius: "8px", boxSizing: "border-box"
            }}
          />
        </label>

        <label style={{ display: "block", marginTop: "18px", color: "#334155" }}>
          Password
          <input
            required type="password" value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              display: "block", width: "100%", padding: "13px",
              marginTop: "8px", border: "1px solid #cbd5e1",
              borderRadius: "8px", boxSizing: "border-box"
            }}
          />
        </label>

        <button type="submit" style={{
          width: "100%", marginTop: "25px", padding: "14px",
          background: "#102c50", color: "white",
          border: "none", borderRadius: "8px",
          fontWeight: "bold", cursor: "pointer"
        }}>Sign In</button>

        <p style={{
          textAlign: "center", color: "#94a3b8",
          fontSize: "12px", marginTop: "25px"
        }}>THE CHURCH OF PENTECOST · HARRY FANYINKA TEMPLE</p>
      </form>
    </main>;
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div><b>FANYINKA LMS</b><small>HARRY FANYINKA TEMPLE</small></div>
      </div>

      <div className="nav-label">WORKSPACE</div>

      {nav.map(([label, Icon]) => (
        <button key={label} onClick={() => setSection(label)}
          className={`nav-item ${section === label ? "active" : ""}`}>
          <Icon size={18}/><span>{label}</span>
        </button>
      ))}

      <button className="nav-item" onClick={logout}>
        <LogOut size={18}/><span>Sign out</span>
      </button>

      <div className="sidebar-foot">
        Church Management System<br/>
        <span>Administrator workspace</span>
      </div>
    </aside>

    <section className="content">
      <header className="topbar">
        <div>
          <div className="eyebrow">THE CHURCH OF PENTECOST</div>
          <h1>{section}</h1>
        </div>
        <div className="admin-pill">
          <span className="online-dot"/> {user?.email || "Admin"}
        </div>
      </header>

      {notice && <div className="notice" role="status">
        {notice}
        <button onClick={() => setNotice("")}>×</button>
      </div>}

      {section === "Dashboard" && <>
        <div className="welcome">
          <div>
            <span className="eyebrow gold">WELCOME TO YOUR CHURCH PORTAL</span>
            <h2>Manage your church,<br/>connect your people.</h2>
            <p>Attendance, ministries and member records in one place.</p>
          </div>
          <div className="welcome-icon"><Church size={62}/></div>
        </div>

        <div className="stats">
          <Stat label="Registered members" value={String(members.length)} icon={<Users/>}/>
          <Stat label="Ministries" value="6" icon={<Church/>}/>
          <Stat label="Bible study groups" value="30" icon={<CalendarCheck/>}/>
          <Stat label="Departments" value="8" icon={<BarChart3/>}/>
        </div>

        <div className="grid-two">
          <div className="panel">
            <div className="panel-head"><h3>Quick actions</h3></div>
            <div className="quick-grid">
              <Quick icon={<Plus/>} title="Add a member"
                onClick={() => {setSection("Members");setShowAdd(true)}}/>
              <Quick icon={<QrCode/>} title="Open QR attendance"
                onClick={() => setSection("QR Attendance")}/>
              <Quick icon={<ScanFace/>} title="Face registration"
                onClick={() => setSection("Face Registration")}/>
              <Quick icon={<MessageSquare/>} title="Send announcement"
                onClick={() => setSection("Messages")}/>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>System setup</h3></div>
            <ol className="steps">
              <li>Register your church members.</li>
              <li>Organize departments and ministries.</li>
              <li>Set up attendance sessions.</li>
              <li>Review attendance reports.</li>
            </ol>
          </div>
        </div>
      </>}

      {section === "Members" && <div className="panel">
        <div className="panel-head member-head">
          <div>
            <h3>Church members</h3>
            <p>Manage member profiles and ministry assignments.</p>
          </div>
          <button className="primary"
            onClick={() => setShowAdd(!showAdd)}>
            <Plus size={17}/> Add member
          </button>
        </div>

        {showAdd && <form className="member-form" onSubmit={addMember}>
          <label>Full name
            <input required value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="Member full name"/>
          </label>
          <label>Phone number
            <input value={phone}
              onChange={e=>setPhone(e.target.value)}
              placeholder="+233..."/>
          </label>
          <label>Email
            <input type="email" value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="name@email.com"/>
          </label>
          <label>Department
            <select value={department}
              onChange={e=>setDepartment(e.target.value)}>
              {["Youth","Media","Elder","Deacon","Deaconess","Usher","Sound","Instrumentalist"].map(x=><option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Ministry
            <select value={ministry}
              onChange={e=>setMinistry(e.target.value)}>
              {["Youth Ministry","Men Ministry","Women Ministry","Virtuous Ladies","Faithful Gents","Children Ministry"].map(x=><option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Bible study group
            <select value={group} onChange={e=>setGroup(e.target.value)}>
              {Array.from({length:30},(_,i)=><option key={i+1} value={i+1}>Group {i+1}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="secondary"
              onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="primary">Save member</button>
          </div>
        </form>}

        <div className="toolbar">
          <div className="search">
            <Search size={17}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search members..."/>
          </div>
          <span>{filtered.length} members shown</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>MEMBER</th><th>PHONE</th><th>DEPARTMENT</th>
              <th>MINISTRY</th><th>BIBLE GROUP</th>
            </tr></thead>
            <tbody>
              {filtered.map(m=><tr key={m.id}>
                <td><b>{m.full_name}</b><small>{m.email || "No email added"}</small></td>
                <td>{m.phone || "—"}</td>
                <td>{m.department || "—"}</td>
                <td>{m.ministry || "—"}</td>
                <td><span className="tag">Group {m.bible_group ?? "—"}</span></td>
              </tr>)}
              {!filtered.length && <tr>
                <td colSpan={5} className="empty">
                  No members yet. Add your first member.
                </td>
              </tr>}
            </tbody>
          </table>
        </div>
      </div>}

      {section !== "Dashboard" && section !== "Members" &&
        <div className="panel placeholder">
          <div className="placeholder-icon">
            {section.includes("QR") ? <QrCode/> :
             section.includes("Face") ? <ScanFace/> : <Settings/>}
          </div>
          <h2>{section}</h2>
          <p>This module is included in the FANYINKA LMS build plan.
            It will be connected to the database in the next implementation stage.</p>
          {section === "Face Registration" &&
            <p className="security-note">Face verification is not activated.
              It requires informed consent and a non-biometric alternative.</p>}
          {section === "QR Attendance" &&
            <p className="security-note">QR attendance will use short-lived
              session tokens to reduce copied-code check-ins.</p>}
        </div>
      )}

      <footer>FANYINKA LMS <span>·</span> Harry Fanyinka Temple</footer>
    </section>
  </main>;
}

function Stat({label,value,icon}:{label:string;value:string;icon:React.ReactNode}) {
  return <div className="stat">
    <div className="stat-icon">{icon}</div>
    <div><small>{label}</small><strong>{value}</strong></div>
  </div>;
}

function Quick({icon,title,onClick}:{icon:React.ReactNode;title:string;onClick:()=>void}) {
  return <button className="quick" onClick={onClick}>
    <span>{icon}</span><b>{title}</b>
  </button>;
}
