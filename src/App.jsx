import { useState, useMemo } from "react";

const MEETINGS = [
  {
    id: "China", label: "China Team Monthly Meeting", color: "#D85A30", bg: "#FAECE7",
    members: ["CY Hung (HK)","Michael Mei (SH)","Yan Zhang(SH)","Jiesy Yan (SZ)","Elmer Chow (BJ)"]
  },
  {
    id: "JPKR", label: "JP / KR Team Monthly Meeting", color: "#185FA5", bg: "#E6F1FB",
    members: ["Taikin Lin (JP)","DH Shim (KR)"]
  },
  {
    id: "Europe", label: "Europe Team Monthly Meeting", color: "#3B6D11", bg: "#EAF3DE",
    members: ["George Linardatos (GM)","Yoann Tellier (NL)","James Grant (UK)"]
  },
  {
    id: "USA", label: "USA Team Monthly Meeting", color: "#533AB7", bg: "#EEEDFE",
    members: ["Teri Chang","Mike Ventura"]
  },
  {
    id: "TW", label: "TW Team Monthly Meeting", color: "#0F6E56", bg: "#E1F5EE",
    members: ["Michael (SD1)","Sean (SD2)","Oliver (SD3)","Fenny (SD4)","Blue (SD5)","Eddie Yang(TEC)","Paul (VP)"]
  }
];

const SLOTS = [
  { id: "s1", label: "8–10 AM" },
  { id: "s2", label: "10–12 PM" },
  { id: "s3", label: "13–15 PM" },
  { id: "s4", label: "15–17 PM" }
];

// Taiwan National Holidays 2026 (format: "month-day")
const TW_HOLIDAYS_2026 = {
  3: [28, 29], // 3/28-29 Memorial Day (supplementary holiday)
  4: [3, 4, 5, 6], // 4/3-6 Tomb Sweeping Day holiday
  5: [1], // 5/1 Labor Day
  6: [19] // 6/19 Dragon Boat Festival
};

// USA National Holidays 2026
const USA_HOLIDAYS_2026 = {
  3: [], // No federal holidays in March
  4: [], // No federal holidays in April
  5: [25], // 5/25 Memorial Day
  6: [19] // 6/19 Juneteenth
};

// China National Holidays 2026
const CHINA_HOLIDAYS_2026 = {
  3: [], // No statutory holidays in March
  4: [4, 5, 6], // 4/4-6 Tomb Sweeping Festival holiday
  5: [1, 2, 3, 4, 5], // 5/1-5 Labor Day holiday (work on 5/9 Saturday)
  6: [19, 20, 21] // 6/19-21 Dragon Boat Festival holiday
};

// Japan and Korea National Holidays 2026
const JPKR_HOLIDAYS_2026 = {
  3: [1, 20], // 3/1 Korea Independence Movement Day, 3/20 Japan Vernal Equinox Day
  4: [5, 29], // 4/5 Korea Buddha's Birthday, 4/29 Japan Showa Day
  5: [3, 4, 5, 6], // 5/3-6 Japan Golden Week (Constitution Day, Greenery Day, Children's Day, substitute holiday), 5/5 Korea Children's Day
  6: [6] // 6/6 Korea Memorial Day
};

// Europe National Holidays 2026 (Germany, UK, Netherlands)
const EUROPE_HOLIDAYS_2026 = {
  3: [], // No holidays in March
  4: [3, 6, 27], // 4/3 Good Friday, 4/6 Easter Monday, 4/27 Netherlands King's Day
  5: [1, 4, 5, 14, 25], // 5/1 Germany Labor Day, 5/4 UK May Day, 5/5 Netherlands Liberation Day, 5/14 Ascension Day (DE/NL), 5/25 Whit Monday (DE/NL)/Spring Bank Holiday (UK)
  6: [] // No holidays in June
};

function isTWHoliday(year, month, day) {
  if (year !== 2026) return false;
  const monthHolidays = TW_HOLIDAYS_2026[month + 1]; // month is 0-based
  return monthHolidays ? monthHolidays.includes(day) : false;
}

function isUSAHoliday(year, month, day) {
  if (year !== 2026) return false;
  const monthHolidays = USA_HOLIDAYS_2026[month + 1]; // month is 0-based
  return monthHolidays ? monthHolidays.includes(day) : false;
}

function isChinaHoliday(year, month, day) {
  if (year !== 2026) return false;
  const monthHolidays = CHINA_HOLIDAYS_2026[month + 1]; // month is 0-based
  return monthHolidays ? monthHolidays.includes(day) : false;
}

function isJPKRHoliday(year, month, day) {
  if (year !== 2026) return false;
  const monthHolidays = JPKR_HOLIDAYS_2026[month + 1]; // month is 0-based
  return monthHolidays ? monthHolidays.includes(day) : false;
}

function isEuropeHoliday(year, month, day) {
  if (year !== 2026) return false;
  const monthHolidays = EUROPE_HOLIDAYS_2026[month + 1]; // month is 0-based
  return monthHolidays ? monthHolidays.includes(day) : false;
}

// Check if the date is a holiday based on meeting ID
function isHolidayForMeeting(meetingId, year, month, day) {
  if (meetingId === "TW") {
    return isTWHoliday(year, month, day);
  } else if (meetingId === "USA") {
    return isUSAHoliday(year, month, day);
  } else if (meetingId === "China") {
    return isChinaHoliday(year, month, day);
  } else if (meetingId === "JPKR") {
    return isJPKRHoliday(year, month, day);
  } else if (meetingId === "Europe") {
    return isEuropeHoliday(year, month, day);
  }
  return false; // Other teams have no specific holiday restrictions
}

const today = new Date();
const CURRENT_YEAR = today.getFullYear();
const CURRENT_MONTH = today.getMonth();

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstMonday(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 1 : (8 - d) % 7;
}
function getMondayOffset(y, m) {
  const day1 = new Date(y, m, 1).getDay(); // 0=Sun
  return day1 === 0 ? 6 : day1 - 1; // offset so Mon=0
}

function initScheduled() {
  // { meetingId: { day, slotId } | null }
  const s = {};
  MEETINGS.forEach(m => { s[m.id] = null; });
  return s;
}

function initAvailability() {
  // { memberId: { "day-slotId": bool } }
  const all = {};
  MEETINGS.forEach(mt => mt.members.forEach(mb => { if (!all[mb]) all[mb] = {}; }));
  return all;
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH); // 0-based month index
  const [tab, setTab] = useState("availability"); // availability | schedule | result
  const [activeMeeting, setActiveMeeting] = useState(null); // null = no team selected
  const [activeMember, setActiveMember] = useState(null);
  const [availability, setAvailability] = useState(initAvailability);
  const [scheduled, setScheduled] = useState(initScheduled);
  const [selectedDay, setSelectedDay] = useState(null);
  const [schedDay, setSchedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(true);
  const [savedMembers, setSavedMembers] = useState(new Set()); // Track members who have saved their availability
  const [isTab3Authenticated, setIsTab3Authenticated] = useState(false); // Track if Tab 3 (schedule) is authenticated

  const YEAR = CURRENT_YEAR;
  const MONTH = selectedMonth;
  const MONTH_NAME = new Date(YEAR, MONTH).toLocaleString("zh-TW", { month: "long", year: "numeric" });
  const DAYS_IN_MONTH = getDaysInMonth(YEAR, MONTH);
  const MON_OFFSET = getMondayOffset(YEAR, MONTH);

  const meeting = activeMeeting ? MEETINGS.find(m => m.id === activeMeeting) : null;

  const toggleSlot = (member, day, slotId, force) => {
    // Prevent changes if member has saved their availability
    if (savedMembers.has(member)) return;
    
    const key = `${day}-${slotId}`;
    setAvailability(prev => {
      const u = { ...prev[member] };
      u[key] = force !== undefined ? force : !u[key];
      return { ...prev, [member]: u };
    });
  };

  const saveAvailability = (member) => {
    setSavedMembers(prev => new Set([...prev, member]));
  };

  // For a meeting + day + slot, count how many members are available
  const countAvail = (meetingId, day, slotId) => {
    const mt = MEETINGS.find(m => m.id === meetingId);
    const key = `${day}-${slotId}`;
    return mt.members.filter(mb => availability[mb]?.[key]).length;
  };

  const allAvail = (meetingId, day, slotId) => {
    const mt = MEETINGS.find(m => m.id === meetingId);
    const key = `${day}-${slotId}`;
    
    // Check if all members of the team are available
    const allMembersAvail = mt.members.every(mb => availability[mb]?.[key]);
    
    // China, JPKR, Europe, TW teams also need to check if Teri Chang is available
    if (["China", "JPKR", "Europe", "TW"].includes(meetingId)) {
      const teriAvail = availability["Teri Chang"]?.[key];
      return allMembersAvail && teriAvail;
    }
    
    return allMembersAvail;
  };

  // Best slots per meeting: all members free
  const bestSlots = useMemo(() => {
    const res = {};
    MEETINGS.forEach(mt => {
      res[mt.id] = [];
      for (let d = 1; d <= DAYS_IN_MONTH; d++) {
        const dow = new Date(YEAR, MONTH, d).getDay();
        const isHoliday = isHolidayForMeeting(mt.id, YEAR, MONTH, d);
        if (dow === 0 || dow === 6 || isHoliday) continue; // Exclude weekends and national holidays
        SLOTS.forEach(sl => {
          if (allAvail(mt.id, d, sl.id)) res[mt.id].push({ day: d, slotId: sl.id });
        });
      }
    });
    return res;
  }, [availability]);

  // Schedule a meeting
  const scheduleMeeting = (meetingId, day, slotId) => {
    setScheduled(prev => ({ ...prev, [meetingId]: { day, slotId } }));
  };
  const unschedule = (meetingId) => {
    setScheduled(prev => ({ ...prev, [meetingId]: null }));
  };

  // Conflict detection
  const hasConflict = (meetingId, day, slotId) => {
    return Object.entries(scheduled).some(([mid, s]) =>
      mid !== meetingId && s && s.day === day && s.slotId === slotId &&
      MEETINGS.find(m => m.id === mid).members.some(mb =>
        MEETINGS.find(m => m.id === meetingId).members.includes(mb)
      )
    );
  };

  // Handle Tab 3 (Schedule) access with password protection
  const handleTab3Click = () => {
    if (isTab3Authenticated) {
      setTab("schedule");
      return;
    }
    
    const password = prompt("Enter password to access FAD Zone:");
    if (password === "23446187") {
      setIsTab3Authenticated(true);
      setTab("schedule");
    } else {
      alert("The function is for FAD team only.");
      setTab("availability");
    }
  };

  const DOW_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const renderCalendarGrid = (onDayClick, dayCell, meetingId = null) => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
        {DOW_LABELS.map(d => (
          <div key={d} style={{ fontSize: 11, color: "var(--color-text-secondary)", textAlign: "center", padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array(MON_OFFSET).fill(null).map((_,i) => <div key={"e"+i} />)}
        {Array(DAYS_IN_MONTH).fill(null).map((_,i) => {
          const d = i + 1;
          const dow = new Date(YEAR, MONTH, d).getDay();
          const isWeekend = dow === 0 || dow === 6;
          const isHoliday = meetingId ? isHolidayForMeeting(meetingId, YEAR, MONTH, d) : false;
          return dayCell(d, dow, isWeekend, isHoliday);
        })}
      </div>
    </div>
  );

  const tabStyle = (t) => ({
    fontSize: 13, padding: "6px 16px", borderRadius: 8, border: "0.5px solid",
    borderColor: tab === t ? "#7F77DD" : "var(--color-border-secondary)",
    background: tab === t ? "#EEEDFE" : "transparent",
    color: tab === t ? "#3C3489" : "var(--color-text-primary)",
    cursor: "pointer", fontWeight: tab === t ? 500 : 400
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 1.25rem", maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 18, fontWeight: 500, cursor: "pointer", outline: "none" }}>
            <option value={3}>April 2026</option>
            <option value={4}>May 2026</option>
          </select>
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>Transcend Branch Office Monthly Meeting Scheduler</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button style={tabStyle("availability")} onClick={() => setTab("availability")}> Fill in available time slots</button>
        <button style={tabStyle("result")} onClick={() => setTab("result")}> Monthly Meeting Overview</button>
        <button style={tabStyle("schedule")} onClick={handleTab3Click}>[FAD Zone] Schedule meetings</button>
        
      </div>

      {/* ── TAB 1: Availability ── */}
      {tab === "availability" && (
        <>
          {/* Meeting selector */}
          <div style={{ marginBottom: "1rem" }}>
            <select value={activeMeeting || ""}
              onChange={e => { 
                const newMeeting = e.target.value;
                setActiveMeeting(newMeeting || null); 
                if (newMeeting) {
                  setActiveMember(MEETINGS.find(m => m.id === newMeeting).members[0]); 
                } else {
                  setActiveMember(null);
                }
                setSelectedDay(null); 
              }}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #185FA5", background: "var(--color-background-secondary)", color: "#185FA5", fontSize: 13, fontWeight: 500, cursor: "pointer", outline: "none" }}>
              <option value="" style={{ color: "#185FA5" }}>Please Select Your Team</option>
              {MEETINGS.map(mt => (
                <option key={mt.id} value={mt.id} style={{ color: "#185FA5" }}>{mt.label} ({mt.members.length} members)</option>
              ))}
            </select>
          </div>

          {/* Member selector */}
          {meeting && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1rem" }}>
                {meeting.members.map(mb => {
                  const filled = Object.values(availability[mb] || {}).filter(Boolean).length;
                  const active = mb === activeMember;
                  const isSaved = savedMembers.has(mb);
                  return (
                    <button key={mb} onClick={() => { setActiveMember(mb); setSelectedDay(null); }}
                      style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, border: "0.5px solid", borderColor: active ? "#533AB7" : "var(--color-border-tertiary)", background: active ? "#EEEDFE" : "transparent", color: active ? "#533AB7" : "var(--color-text-secondary)", cursor: "pointer", position: "relative" }}>
                      {mb}{filled > 0 ? ` ·${filled}` : ""}
                      {isSaved && <span style={{ marginLeft: 4 }}>🔒</span>}
                    </button>
                  );
                })}
              </div>

              {/* Mini calendar */}
              {activeMember && (
                <>
                  <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                       <strong style={{ color: "#533AB7" }}>{activeMember}</strong> Select date → Available time slots → Save
                    </p>
                    {renderCalendarGrid(null, (d, dow, isWeekend, isHoliday) => {
                      const hasAny = SLOTS.some(sl => availability[activeMember]?.[`${d}-${sl.id}`]);
                      const isSel = selectedDay === d;
                      const isSaved = savedMembers.has(activeMember);
                      const isPast = MONTH < CURRENT_MONTH || (MONTH === CURRENT_MONTH && d < today.getDate());
                      const isDisabled = isWeekend || isHoliday || isSaved || isPast;
                      return (
                        <button key={d} disabled={isDisabled} onClick={() => !isSaved && setSelectedDay(isSel ? null : d)}
                          style={{ borderRadius: 8, padding: "7px 2px 5px", background: isSel ? "#EEEDFE" : isDisabled ? "transparent" : "var(--color-background-primary)", border: "0.5px solid", borderColor: isSel ? "#533AB7" : isHoliday ? "#F59E0B" : "var(--color-border-tertiary)", cursor: isDisabled ? "default" : "pointer", opacity: isDisabled ? 0.3 : 1, textAlign: "center", outline: isSel ? "2px solid #533AB7" : "none", position: "relative" }}>
                          <div style={{ fontSize: 12, color: isSel ? "#533AB7" : isHoliday ? "#F59E0B" : "var(--color-text-primary)", fontWeight: isSel ? 500 : 400 }}>{d}</div>
                          {hasAny && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#533AB7", margin: "2px auto 0" }} />}
                          {isHoliday && !isWeekend && <div style={{ fontSize: 8, color: "#F59E0B", marginTop: 1 }}>Holiday</div>}
                        </button>
                      );
                    }, activeMeeting)}
                  </div>

                  {/* Slot picker */}
                  {selectedDay && !savedMembers.has(activeMember) && (
                    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                        Available time for {MONTH + 1}/{selectedDay}
                      </p>
                      <div style={{ display: "flex", gap: 8 }}
                        onMouseLeave={() => setDragging(false)}
                        onMouseUp={() => setDragging(false)}>
                        {SLOTS.map(sl => {
                          const key = `${selectedDay}-${sl.id}`;
                          const filled = availability[activeMember]?.[key];
                          return (
                            <div key={sl.id}
                              onMouseDown={() => { setDragging(true); setDragVal(!filled); toggleSlot(activeMember, selectedDay, sl.id, !filled); }}
                              onMouseEnter={() => { if (dragging) toggleSlot(activeMember, selectedDay, sl.id, dragVal); }}
                              style={{ flex: 1, padding: "12px 6px", borderRadius: 10, background: filled ? "#EEEDFE" : "var(--color-background-secondary)", border: "0.5px solid", borderColor: filled ? "#533AB7" : "var(--color-border-tertiary)", cursor: "pointer", textAlign: "center", userSelect: "none" }}>
                              <div style={{ fontSize: 13, color: filled ? "#533AB7" : "var(--color-text-secondary)", fontWeight: filled ? 500 : 400 }}>{sl.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Save button section */}
                  {!savedMembers.has(activeMember) && Object.values(availability[activeMember] || {}).filter(Boolean).length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                      <button onClick={() => saveAvailability(activeMember)}
                        style={{ fontSize: 13, padding: "10px 32px", borderRadius: 8, border: "none", background: "#533AB7", color: "white", cursor: "pointer", fontWeight: 500 }}>
                        Save Availability
                      </button>
                    </div>
                  )}
                  {savedMembers.has(activeMember) && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                      <span style={{ fontSize: 13, color: "#10B981", background: "#D1FAE5", padding: "10px 24px", borderRadius: 8, fontWeight: 500 }}>
                        ✓ Availability Saved
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── TAB 2: Schedule ── */}
      {tab === "schedule" && (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {MEETINGS.map(mt => {
              const best = bestSlots[mt.id];
              const sched = scheduled[mt.id];
              const conflict = sched && hasConflict(mt.id, sched.day, sched.slotId);
              return (
                <div key={mt.id} style={{ background: "var(--color-background-primary)", border: `0.5px solid ${sched ? mt.color : "var(--color-border-tertiary)"}`, borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: mt.color }}>{mt.label}</span>
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>{mt.members.length} members</span>
                    </div>
                    {sched && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, background: mt.bg, color: mt.color, padding: "3px 10px", borderRadius: 10, border: `0.5px solid ${mt.color}` }}>
                          {MONTH + 1}/{sched.day} {SLOTS.find(s => s.id === sched.slotId)?.label}
                        </span>
                        {conflict && <span style={{ fontSize: 11, color: "#A32D2D", background: "#FCEBEB", padding: "3px 8px", borderRadius: 8 }}>Time conflict</span>}
                        <button onClick={() => unschedule(mt.id)} style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
                      </div>
                    )}
                  </div>

                  {!sched && (
                    <>
                      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
                        {best.length === 0 ? (() => {
                          // Check which members haven't filled in availability
                          const membersToCheck = [...mt.members];
                          // China, JPKR, Europe, TW teams also need to include Teri Chang
                          if (["China", "JPKR", "Europe", "TW"].includes(mt.id)) {
                            membersToCheck.push("Teri Chang");
                          }
                          
                          const notFilledMembers = membersToCheck.filter(mb => {
                            const memberAvail = availability[mb] || {};
                            return Object.values(memberAvail).every(v => !v);
                          });
                          
                          if (notFilledMembers.length > 0) {
                            return `${notFilledMembers.join(", ")} haven't filled in availability`;
                          }
                          return "Everyone has filled in, but no available time slots";
                        })() : `Select the Time slots available for all (${best.length}):`}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {best.map(({ day, slotId }) => {
                          const dow = new Date(YEAR, MONTH, day).getDay();
                          const dowL = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow];
                          const conflict2 = hasConflict(mt.id, day, slotId);
                          return (
                            <button key={`${day}-${slotId}`}
                              onClick={() => scheduleMeeting(mt.id, day, slotId)}
                              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 16, border: `0.5px solid ${conflict2 ? "#E24B4A" : mt.color}`, background: conflict2 ? "#FCEBEB" : mt.bg, color: conflict2 ? "#A32D2D" : mt.color, cursor: "pointer" }}>
                              {MONTH + 1}/{day}（{dowL}）{SLOTS.find(s => s.id === slotId)?.label}
                              {conflict2 ? " ⚠" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Members Status Table */}
                  <div style={{ marginTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 12 }}>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "6px 8px", background: "var(--color-background-secondary)", borderRadius: "8px 0 0 0", fontWeight: 500, color: "var(--color-text-primary)" }}>Not Finish</th>
                          <th style={{ textAlign: "left", padding: "6px 8px", background: "var(--color-background-secondary)", borderRadius: "0 8px 0 0", fontWeight: 500, color: "var(--color-text-primary)" }}>Finish</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "8px", verticalAlign: "top", borderRight: "0.5px solid var(--color-border-tertiary)" }}>
                            {(() => {
                              const membersToCheck = [...mt.members];
                              if (["China", "JPKR", "Europe", "TW"].includes(mt.id)) {
                                membersToCheck.push("Teri Chang");
                              }
                              const notFinished = membersToCheck.filter(mb => {
                                const memberAvail = availability[mb] || {};
                                return Object.values(memberAvail).every(v => !v);
                              });
                              return notFinished.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {notFinished.map(mb => (
                                    <span key={mb} style={{ fontSize: 11, color: "#A32D2D", background: "#FCEBEB", padding: "2px 8px", borderRadius: 8 }}>{mb}</span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>—</span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "top" }}>
                            {(() => {
                              const membersToCheck = [...mt.members];
                              if (["China", "JPKR", "Europe", "TW"].includes(mt.id)) {
                                membersToCheck.push("Teri Chang");
                              }
                              const finished = membersToCheck.filter(mb => {
                                const memberAvail = availability[mb] || {};
                                return Object.values(memberAvail).some(v => v);
                              });
                              return finished.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {finished.map(mb => (
                                    <span key={mb} style={{ fontSize: 11, color: "#10B981", background: "#D1FAE5", padding: "2px 8px", borderRadius: 8 }}>{mb}</span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>—</span>
                              );
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── TAB 3: Result ── */}
      {tab === "result" && (
        <>
          {/* Calendar with meetings marked */}
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
            {renderCalendarGrid(null, (d, dow, isWeekend, isHoliday) => {
              const dayMeetings = MEETINGS.filter(mt => scheduled[mt.id]?.day === d);
              // Check if the date is a holiday for any team
              const isTWHol = isTWHoliday(YEAR, MONTH, d);
              const isUSAHol = isUSAHoliday(YEAR, MONTH, d);
              const isCNHol = isChinaHoliday(YEAR, MONTH, d);
              const isJPKRHol = isJPKRHoliday(YEAR, MONTH, d);
              const isEUHol = isEuropeHoliday(YEAR, MONTH, d);
              const hasAnyHoliday = isTWHol || isUSAHol || isCNHol || isJPKRHol || isEUHol;
              const isDisabled = isWeekend || hasAnyHoliday;
              return (
                <div key={d} style={{ borderRadius: 8, padding: "5px 3px", background: dayMeetings.length > 0 ? "var(--color-background-primary)" : "transparent", border: `0.5px solid ${hasAnyHoliday && !isWeekend ? "#260bf5" : dayMeetings.length > 0 ? "var(--color-border-secondary)" : "transparent"}`, minHeight: 52, opacity: isDisabled ? 0.25 : 1, position: "relative" }}>
                  <div style={{ fontSize: 12, textAlign: "center", color: hasAnyHoliday ? "#170bf5" : "var(--color-text-secondary)", marginBottom: 2 }}>
                    {d}
                    {hasAnyHoliday && !isWeekend && (
                      <div style={{ fontSize: 8, color: "#130bf5" }}>
                        {isCNHol && "CN Holiday"}
                        {isCNHol && (isTWHol || isUSAHol || isJPKRHol || isEUHol) && "/"}
                        {isEUHol && "EU Holiday"}
                        {isEUHol && (isJPKRHol || isTWHol || isUSAHol) && "/"}
                        {isJPKRHol && "JPKR Holiday"}
                        {isJPKRHol && (isTWHol || isUSAHol) && "/"}
                        {isTWHol && "TW Holiday"}
                        {isTWHol && isUSAHol && "/"}
                        {isUSAHol && "US Holiday"}
                      </div>
                    )}
                  </div>
                  {dayMeetings.map(mt => {
                    const timeLabel = SLOTS.find(s => s.id === scheduled[mt.id]?.slotId)?.label.replace(/ (AM|PM)/, '').replace('–', '-');
                    return (
                      <div key={mt.id} style={{ fontSize: 9, background: mt.bg, color: mt.color, borderRadius: 4, padding: "1px 4px", marginBottom: 2, lineHeight: 1.4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {timeLabel} ({mt.id})
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Summary list */}
          <div style={{ display: "grid", gap: 8 }}>
            {MEETINGS.map(mt => {
              const sched = scheduled[mt.id];
              const conflict = sched && hasConflict(mt.id, sched.day, sched.slotId);
              return (
                <div key={mt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--color-background-primary)", border: `0.5px solid ${sched ? mt.color : "var(--color-border-tertiary)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: mt.color, display: "inline-block" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {mt.label}
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 8, fontWeight: 400 }}>({mt.id})</span>
                      </div>
                    </div>
                  </div>
                  {sched ? (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: mt.color }}>{MONTH + 1}/{sched.day} ({["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(YEAR,MONTH,sched.day).getDay()]})</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{SLOTS.find(s => s.id === sched.slotId)?.label}</div>
                      {conflict && <div style={{ fontSize: 11, color: "#A32D2D" }}>⚠ Member time conflict</div>}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "4px 10px", borderRadius: 8 }}>Not scheduled</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}