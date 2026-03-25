import { useState, useMemo } from "react";

const MEETINGS = [
  {
    id: "china", label: "China Team Monthly", color: "#D85A30", bg: "#FAECE7",
    members: ["CY Hung (HK)","Michael Mei (SH)","Jiesy Yan (SZ)","Elmer Chow (BJ)","Teri Chang (USA)"]
  },
  {
    id: "jpkr", label: "JP / KR Team Monthly", color: "#185FA5", bg: "#E6F1FB",
    members: ["Taikin Lin (JP)","DH Shim (KR)","Teri Chang (USA)"]
  },
  {
    id: "europe", label: "Europe Team Monthly", color: "#3B6D11", bg: "#EAF3DE",
    members: ["George Linardatos (GM)","Yoann Tellier (NL)","James Grant (UK)","Teri Chang (USA)"]
  },
  {
    id: "usa", label: "USA Team Monthly", color: "#533AB7", bg: "#EEEDFE",
    members: ["Teri Chang","Clarence Chan","Mike Ventura","Andrew Hinkle"]
  },
  {
    id: "tw", label: "TW Team Monthly", color: "#0F6E56", bg: "#E1F5EE",
    members: ["Michael (SD1)","Sean (SD2)","Oliver (SD3)","Fenny (SD4)","Blue (SD5)","Paul (VP)","Teri Chang (USA)"]
  }
];

const SLOTS = [
  { id: "s1", label: "8–10 AM" },
  { id: "s2", label: "10–12 PM" },
  { id: "s3", label: "1–3 PM" },
  { id: "s4", label: "3–5 PM" }
];

const today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth();

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstMonday(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 1 : (8 - d) % 7;
}
function getMondayOffset(y, m) {
  const day1 = new Date(y, m, 1).getDay(); // 0=Sun
  return day1 === 0 ? 6 : day1 - 1; // offset so Mon=0
}

const MONTH_NAME = new Date(YEAR, MONTH).toLocaleString("zh-TW", { month: "long", year: "numeric" });
const DAYS_IN_MONTH = getDaysInMonth(YEAR, MONTH);
const MON_OFFSET = getMondayOffset(YEAR, MONTH);

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
  const [tab, setTab] = useState("availability"); // availability | schedule | result
  const [activeMeeting, setActiveMeeting] = useState(MEETINGS[0].id);
  const [activeMember, setActiveMember] = useState(MEETINGS[0].members[0]);
  const [availability, setAvailability] = useState(initAvailability);
  const [scheduled, setScheduled] = useState(initScheduled);
  const [selectedDay, setSelectedDay] = useState(null);
  const [schedDay, setSchedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(true);

  const meeting = MEETINGS.find(m => m.id === activeMeeting);

  const toggleSlot = (member, day, slotId, force) => {
    const key = `${day}-${slotId}`;
    setAvailability(prev => {
      const u = { ...prev[member] };
      u[key] = force !== undefined ? force : !u[key];
      return { ...prev, [member]: u };
    });
  };

  // For a meeting + day + slot, count how many members are available
  const countAvail = (meetingId, day, slotId) => {
    const mt = MEETINGS.find(m => m.id === meetingId);
    const key = `${day}-${slotId}`;
    return mt.members.filter(mb => availability[mb]?.[key]).length;
  };

  const allAvail = (meetingId, day, slotId) => {
    const mt = MEETINGS.find(m => m.id === meetingId);
    return countAvail(meetingId, day, slotId) === mt.members.length;
  };

  // Best slots per meeting: all members free
  const bestSlots = useMemo(() => {
    const res = {};
    MEETINGS.forEach(mt => {
      res[mt.id] = [];
      for (let d = 1; d <= DAYS_IN_MONTH; d++) {
        const dow = new Date(YEAR, MONTH, d).getDay();
        if (dow === 0 || dow === 6) continue;
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

  const DOW_LABELS = ["一","二","三","四","五","六","日"];

  const renderCalendarGrid = (onDayClick, dayCell) => (
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
          return dayCell(d, dow, isWeekend);
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
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>{MONTH_NAME} 會議排程</h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>5 場月會 · 共 {Object.values(initAvailability()).length} 位成員</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button style={tabStyle("availability")} onClick={() => setTab("availability")}>填寫有空時段</button>
        <button style={tabStyle("schedule")} onClick={() => setTab("schedule")}>安排會議時間</button>
        <button style={tabStyle("result")} onClick={() => setTab("result")}>本月會議總覽</button>
      </div>

      {/* ── TAB 1: Availability ── */}
      {tab === "availability" && (
        <>
          {/* Meeting selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
            {MEETINGS.map(mt => (
              <button key={mt.id} onClick={() => { setActiveMeeting(mt.id); setActiveMember(mt.members[0]); setSelectedDay(null); }}
                style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "0.5px solid", borderColor: activeMeeting === mt.id ? mt.color : "var(--color-border-tertiary)", background: activeMeeting === mt.id ? mt.bg : "transparent", color: activeMeeting === mt.id ? mt.color : "var(--color-text-secondary)", cursor: "pointer" }}>
                {mt.label}
              </button>
            ))}
          </div>

          {/* Member selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1rem" }}>
            {meeting.members.map(mb => {
              const filled = Object.values(availability[mb] || {}).filter(Boolean).length;
              const active = mb === activeMember;
              return (
                <button key={mb} onClick={() => { setActiveMember(mb); setSelectedDay(null); }}
                  style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, border: "0.5px solid", borderColor: active ? meeting.color : "var(--color-border-tertiary)", background: active ? meeting.bg : "transparent", color: active ? meeting.color : "var(--color-text-secondary)", cursor: "pointer" }}>
                  {mb}{filled > 0 ? ` ·${filled}` : ""}
                </button>
              );
            })}
          </div>

          {/* Mini calendar */}
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-secondary)" }}>
              選擇日期 → 填寫 <strong style={{ color: meeting.color }}>{activeMember}</strong> 有空的時段
            </p>
            {renderCalendarGrid(null, (d, dow, isWeekend) => {
              const hasAny = SLOTS.some(sl => availability[activeMember]?.[`${d}-${sl.id}`]);
              const isSel = selectedDay === d;
              return (
                <button key={d} disabled={isWeekend} onClick={() => setSelectedDay(isSel ? null : d)}
                  style={{ borderRadius: 8, padding: "7px 2px 5px", background: isSel ? meeting.bg : isWeekend ? "transparent" : "var(--color-background-primary)", border: "0.5px solid", borderColor: isSel ? meeting.color : "var(--color-border-tertiary)", cursor: isWeekend ? "default" : "pointer", opacity: isWeekend ? 0.2 : 1, textAlign: "center", outline: isSel ? `2px solid ${meeting.color}` : "none" }}>
                  <div style={{ fontSize: 12, color: isSel ? meeting.color : "var(--color-text-primary)", fontWeight: isSel ? 500 : 400 }}>{d}</div>
                  {hasAny && <div style={{ width: 5, height: 5, borderRadius: "50%", background: meeting.color, margin: "2px auto 0" }} />}
                </button>
              );
            })}
          </div>

          {/* Slot picker */}
          {selectedDay && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                {MONTH + 1}/{selectedDay} 有空時段
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
                      style={{ flex: 1, padding: "12px 6px", borderRadius: 10, background: filled ? meeting.bg : "var(--color-background-secondary)", border: "0.5px solid", borderColor: filled ? meeting.color : "var(--color-border-tertiary)", cursor: "pointer", textAlign: "center", userSelect: "none" }}>
                      <div style={{ fontSize: 13, color: filled ? meeting.color : "var(--color-text-secondary)", fontWeight: filled ? 500 : 400 }}>{sl.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>{mt.members.length} 人</span>
                    </div>
                    {sched && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, background: mt.bg, color: mt.color, padding: "3px 10px", borderRadius: 10, border: `0.5px solid ${mt.color}` }}>
                          {MONTH + 1}/{sched.day} {SLOTS.find(s => s.id === sched.slotId)?.label}
                        </span>
                        {conflict && <span style={{ fontSize: 11, color: "#A32D2D", background: "#FCEBEB", padding: "3px 8px", borderRadius: 8 }}>時段衝突</span>}
                        <button onClick={() => unschedule(mt.id)} style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
                      </div>
                    )}
                  </div>

                  {!sched && (
                    <>
                      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
                        {best.length === 0 ? "尚無全員有空的時段，請先填寫有空時段" : `全員有空的時段（${best.length} 個）：`}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {best.map(({ day, slotId }) => {
                          const dow = new Date(YEAR, MONTH, day).getDay();
                          const dowL = ["日","一","二","三","四","五","六"][dow];
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

                  {/* Members */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {mt.members.map(mb => (
                      <span key={mb} style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "2px 8px", borderRadius: 8 }}>{mb}</span>
                    ))}
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
            {renderCalendarGrid(null, (d, dow, isWeekend) => {
              const dayMeetings = MEETINGS.filter(mt => scheduled[mt.id]?.day === d);
              return (
                <div key={d} style={{ borderRadius: 8, padding: "5px 3px", background: dayMeetings.length > 0 ? "var(--color-background-primary)" : "transparent", border: `0.5px solid ${dayMeetings.length > 0 ? "var(--color-border-secondary)" : "transparent"}`, minHeight: 52, opacity: isWeekend ? 0.25 : 1 }}>
                  <div style={{ fontSize: 11, textAlign: "center", color: "var(--color-text-secondary)", marginBottom: 2 }}>{d}</div>
                  {dayMeetings.map(mt => (
                    <div key={mt.id} style={{ fontSize: 9, background: mt.bg, color: mt.color, borderRadius: 4, padding: "1px 4px", marginBottom: 2, lineHeight: 1.4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {SLOTS.find(s => s.id === scheduled[mt.id]?.slotId)?.label}
                    </div>
                  ))}
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
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{mt.label}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{mt.members.length} 位成員</div>
                    </div>
                  </div>
                  {sched ? (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: mt.color }}>{MONTH + 1}/{sched.day}（{["日","一","二","三","四","五","六"][new Date(YEAR,MONTH,sched.day).getDay()]}）</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{SLOTS.find(s => s.id === sched.slotId)?.label}</div>
                      {conflict && <div style={{ fontSize: 11, color: "#A32D2D" }}>⚠ 有成員時段衝突</div>}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "4px 10px", borderRadius: 8 }}>未安排</span>
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