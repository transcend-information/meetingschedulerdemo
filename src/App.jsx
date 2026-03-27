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

// 台灣國定假日 2026年 (格式: "月-日")
const TW_HOLIDAYS_2026 = {
  3: [28, 29], // 3/28-29 和平紀念日補假
  4: [3, 4, 5, 6], // 4/3-6 清明連假
  5: [1], // 5/1 勞動節
  6: [19] // 6/19 端午節
};

// 美國國定假日 2026年
const USA_HOLIDAYS_2026 = {
  3: [], // 3月無聯邦假日
  4: [], // 4月無聯邦假日
  5: [25], // 5/25 Memorial Day (陣亡將士紀念日)
  6: [19] // 6/19 Juneteenth (六月節)
};

// 中國國定假日 2026年
const CHINA_HOLIDAYS_2026 = {
  3: [], // 3月無法定假日
  4: [4, 5, 6], // 4/4-6 清明節假期
  5: [1, 2, 3, 4, 5], // 5/1-5 勞動節假期（5/9週六補班）
  6: [19, 20, 21] // 6/19-21 端午節假期
};

// 日本與韓國國定假日 2026年
const JPKR_HOLIDAYS_2026 = {
  3: [1, 20], // 3/1 韓國三一節, 3/20 日本春分の日
  4: [5, 29], // 4/5 韓國佛誕日, 4/29 日本昭和の日
  5: [3, 4, 5, 6], // 5/3-6 日本黃金週（憲法紀念日、綠之日、兒童節、補假）、5/5 韓國兒童節
  6: [6] // 6/6 韓國顯忠日
};

// 歐洲國定假日 2026年（德國、英國、荷蘭）
const EUROPE_HOLIDAYS_2026 = {
  3: [], // 3月無假日
  4: [3, 6, 27], // 4/3 Good Friday, 4/6 Easter Monday, 4/27 荷蘭國王節
  5: [1, 4, 5, 14, 25], // 5/1 德國勞動節, 5/4 英國五月初銀行假日, 5/5 荷蘭解放日, 5/14 耶穌升天節(DE/NL), 5/25 聖靈降臨節(DE/NL)/春季銀行假日(UK)
  6: [] // 6月無假日
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

// 根據會議ID判斷該日是否為假日
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
  return false; // 其他團隊沒有特定假日限制
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
  const [activeMeeting, setActiveMeeting] = useState(MEETINGS[0].id);
  const [activeMember, setActiveMember] = useState(MEETINGS[0].members[0]);
  const [availability, setAvailability] = useState(initAvailability);
  const [scheduled, setScheduled] = useState(initScheduled);
  const [selectedDay, setSelectedDay] = useState(null);
  const [schedDay, setSchedDay] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(true);

  const YEAR = CURRENT_YEAR;
  const MONTH = selectedMonth;
  const MONTH_NAME = new Date(YEAR, MONTH).toLocaleString("zh-TW", { month: "long", year: "numeric" });
  const DAYS_IN_MONTH = getDaysInMonth(YEAR, MONTH);
  const MON_OFFSET = getMondayOffset(YEAR, MONTH);

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
        const isHoliday = isHolidayForMeeting(mt.id, YEAR, MONTH, d);
        if (dow === 0 || dow === 6 || isHoliday) continue; // 排除週末和國定假日
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
            <option value={2}>2026年3月</option>
            <option value={3}>2026年4月</option>
            <option value={4}>2026年5月</option>
            <option value={5}>2026年6月</option>
          </select>
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>會議排程</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button style={tabStyle("availability")} onClick={() => setTab("availability")}>[GM] 填寫有空時段</button>
        <button style={tabStyle("schedule")} onClick={() => setTab("schedule")}>[FAD] 安排會議時間</button>
        <button style={tabStyle("result")} onClick={() => setTab("result")}>[FAD] 本月會議總覽</button>
      </div>

      {/* ── TAB 1: Availability ── */}
      {tab === "availability" && (
        <>
          {/* Meeting selector */}
          <div style={{ marginBottom: "1rem" }}>
            <select value={activeMeeting}
              onChange={e => { setActiveMeeting(e.target.value); setActiveMember(MEETINGS.find(m => m.id === e.target.value).members[0]); setSelectedDay(null); }}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${meeting.color}`, background: meeting.bg, color: meeting.color, fontSize: 13, fontWeight: 500, cursor: "pointer", outline: "none" }}>
              {MEETINGS.map(mt => (
                <option key={mt.id} value={mt.id}>{mt.label}（{mt.members.length} 人）</option>
              ))}
            </select>
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
            {renderCalendarGrid(null, (d, dow, isWeekend, isHoliday) => {
              const hasAny = SLOTS.some(sl => availability[activeMember]?.[`${d}-${sl.id}`]);
              const isSel = selectedDay === d;
              const isDisabled = isWeekend || isHoliday;
              return (
                <button key={d} disabled={isDisabled} onClick={() => setSelectedDay(isSel ? null : d)}
                  style={{ borderRadius: 8, padding: "7px 2px 5px", background: isSel ? meeting.bg : isDisabled ? "transparent" : "var(--color-background-primary)", border: "0.5px solid", borderColor: isSel ? meeting.color : isHoliday ? "#F59E0B" : "var(--color-border-tertiary)", cursor: isDisabled ? "default" : "pointer", opacity: isDisabled ? 0.3 : 1, textAlign: "center", outline: isSel ? `2px solid ${meeting.color}` : "none", position: "relative" }}>
                  <div style={{ fontSize: 12, color: isSel ? meeting.color : isHoliday ? "#F59E0B" : "var(--color-text-primary)", fontWeight: isSel ? 500 : 400 }}>{d}</div>
                  {hasAny && <div style={{ width: 5, height: 5, borderRadius: "50%", background: meeting.color, margin: "2px auto 0" }} />}
                  {isHoliday && !isWeekend && <div style={{ fontSize: 8, color: "#F59E0B", marginTop: 1 }}>休</div>}
                </button>
              );
            }, activeMeeting)}
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
            {renderCalendarGrid(null, (d, dow, isWeekend, isHoliday) => {
              const dayMeetings = MEETINGS.filter(mt => scheduled[mt.id]?.day === d);
              // 檢查當天是否為任何團隊的假日
              const isTWHol = isTWHoliday(YEAR, MONTH, d);
              const isUSAHol = isUSAHoliday(YEAR, MONTH, d);
              const isCNHol = isChinaHoliday(YEAR, MONTH, d);
              const isJPKRHol = isJPKRHoliday(YEAR, MONTH, d);
              const isEUHol = isEuropeHoliday(YEAR, MONTH, d);
              const hasAnyHoliday = isTWHol || isUSAHol || isCNHol || isJPKRHol || isEUHol;
              const isDisabled = isWeekend || hasAnyHoliday;
              return (
                <div key={d} style={{ borderRadius: 8, padding: "5px 3px", background: dayMeetings.length > 0 ? "var(--color-background-primary)" : "transparent", border: `0.5px solid ${hasAnyHoliday && !isWeekend ? "#F59E0B" : dayMeetings.length > 0 ? "var(--color-border-secondary)" : "transparent"}`, minHeight: 52, opacity: isDisabled ? 0.25 : 1, position: "relative" }}>
                  <div style={{ fontSize: 11, textAlign: "center", color: hasAnyHoliday ? "#F59E0B" : "var(--color-text-secondary)", marginBottom: 2 }}>
                    {d}
                    {hasAnyHoliday && !isWeekend && (
                      <div style={{ fontSize: 8, color: "#F59E0B" }}>
                        {isCNHol && "CN休"}
                        {isCNHol && (isTWHol || isUSAHol || isJPKRHol || isEUHol) && "/"}
                        {isEUHol && "EU休"}
                        {isEUHol && (isJPKRHol || isTWHol || isUSAHol) && "/"}
                        {isJPKRHol && "JPKR休"}
                        {isJPKRHol && (isTWHol || isUSAHol) && "/"}
                        {isTWHol && "TW休"}
                        {isTWHol && isUSAHol && "/"}
                        {isUSAHol && "US休"}
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