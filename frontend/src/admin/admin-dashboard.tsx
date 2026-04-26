import { useState } from "react";
import { Sidebar } from "../components/dashboard/sidebar";   // line 2
import { Topbar } from "../components/dashboard/topbar";     // line 3
import { Routes, Route } from "react-router-dom";


// ── Types ──────────────────────────────────────────────────────────────────
interface OverdueItem {
  id: number;
  initials: string;
  avatarColor: string;
  name: string;
  bookTitle: string;
  author: string;
  overdueDays: number;
  fine: number;
}

interface BookRequest {
  id: number;
  bookTitle: string;
  author: string;
  badgeColor: string;
  userInitials: string;
  userAvatarColor: string;
  userName: string;
  requestedOn: string;
  status: "pending" | "approved" | "denied";
}

interface BookLended {
  id: number;
  bookTitle: string;
  author: string;
  badgeColor: string;
  userInitials: string;
  userAvatarColor: string;
  userName: string;
  lendedOn: string;
  returned: boolean;
  overdue: boolean;
}


export default function AdminDashboard() {
  return(
<main className="min-h-screen p-4 grid grid-cols-[auto_1fr] gap-4">
      <Sidebar className="sticky top-4 h-[calc(100vh-1rem*2)]" />
      <div className="grid grid-rows-[auto_1fr] gap-4">
        <Topbar className="sticky top-4" />
        <div>
          <LibraryDashboard />
        </div>
      </div>
    </main>

          )
}
// ── Initial Data ────────────────────────────────────────────────────────────
const initialOverdue: OverdueItem[] = [
  { id: 1, initials: "JS", avatarColor: "#7c6af7", name: "John Stone",    bookTitle: "Do Android..",  author: "by Douglas A.",  overdueDays: 1, fine: 40 },
  { id: 2, initials: "PP", avatarColor: "#f4a261", name: "Ponnappa P..", bookTitle: "The Hitchh..",  author: "by Ray Bradb..", overdueDays: 1, fine: 40 },
  { id: 3, initials: "MW", avatarColor: "#4bc5a5", name: "Mia Wong",     bookTitle: "Something-..", author: "by Seth Grah..", overdueDays: 1, fine: 40 },
  { id: 4, initials: "PS", avatarColor: "#4caf8b", name: "Peter Stanb.", bookTitle: "Pride and ..", author: "by Mark Hadd..", overdueDays: 2, fine: 50 },
  { id: 5, initials: "NL", avatarColor: "#e05a7a", name: "Natalie Lee.", bookTitle: "The Curiou..", author: "by Harper L..",  overdueDays: 3, fine: 60 },
  { id: 6, initials: "AL", avatarColor: "#e8734a", name: "Ang Li",       bookTitle: "I Was Told..", author: "by Milan Kun..", overdueDays: 3, fine: 60 },
];

const initialRequests: BookRequest[] = [
  { id: 1, bookTitle: "A Brief History o..",  author: "by Stephen Hawk..", badgeColor: "#e05a7a", userInitials: "JS", userAvatarColor: "#7c6af7", userName: "John Stone",   requestedOn: "12-Dec-22", status: "pending"  },
  { id: 2, bookTitle: "A Vindication of ..",  author: "by Mary Wollsto..", badgeColor: "#e8734a", userInitials: "PP", userAvatarColor: "#f4a261", userName: "Ponnappa Pr.", requestedOn: "12-Dec-22", status: "approved" },
  { id: 3, bookTitle: "Critique of Pure ..",  author: "by Immanuel Kan..", badgeColor: "#4bc5a5", userInitials: "MW", userAvatarColor: "#4bc5a5", userName: "Mia Wong",     requestedOn: "12-Dec-22", status: "pending"  },
  { id: 4, bookTitle: "Nineteen Eighty-F..", author: "by George Orwell",  badgeColor: "#e05a7a", userInitials: "PS", userAvatarColor: "#4caf8b", userName: "Peter Stanb.", requestedOn: "12-Dec-22", status: "denied"   },
];

const initialLended: BookLended[] = [
  { id: 1, bookTitle: "A Brief History o..",  author: "by Stephen Hawk..", badgeColor: "#e05a7a", userInitials: "JS", userAvatarColor: "#7c6af7", userName: "John Stone",   lendedOn: "12-Dec-22", returned: true,  overdue: true  },
  { id: 2, bookTitle: "A Vindication of ..",  author: "by Mary Wollsto..", badgeColor: "#e8734a", userInitials: "PP", userAvatarColor: "#f4a261", userName: "Ponnappa Pr.", lendedOn: "12-Dec-22", returned: true,  overdue: false },
  { id: 3, bookTitle: "Critique of Pure ..",  author: "by Immanuel Kan..", badgeColor: "#4bc5a5", userInitials: "MW", userAvatarColor: "#4bc5a5", userName: "Mia Wong",     lendedOn: "12-Dec-22", returned: true,  overdue: true  },
  { id: 4, bookTitle: "Nineteen Eighty-F..", author: "by George Orwell",  badgeColor: "#e05a7a", userInitials: "PS", userAvatarColor: "#4caf8b", userName: "Peter Stanb.", lendedOn: "12-Dec-22", returned: false, overdue: true  },
];

// ── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ color, rising = true }: { color: string; rising?: boolean }) {
  const path = rising
    ? "M0,28 C15,24 30,18 45,14 C60,10 72,8 88,5"
    : "M0,10 C15,14 30,20 45,22 C60,24 72,20 88,22";
  const fillPath = rising
    ? "M0,28 C15,24 30,18 45,14 C60,10 72,8 88,5 L88,36 L0,36Z"
    : "M0,10 C15,14 30,20 45,22 C60,24 72,20 88,22 L88,36 L0,36Z";
  const id = `sg-${color.replace("#", "")}${rising ? "r" : "f"}`;
  return (
    <svg width="88" height="36" viewBox="0 0 88 36" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${id})`} />
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ iconEmoji, iconBg, num, label, badge1, badge2, sparkColor, rising, isWarning }: {
  iconEmoji: string; iconBg: string; num: string | number; label: string;
  badge1: string; badge2: string; sparkColor: string; rising?: boolean; isWarning?: boolean;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px 20px 16px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{iconEmoji}</div>
        <Sparkline color={sparkColor} rising={rising} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#1a1a2e", lineHeight: 1, marginBottom: 4 }}>{num}</div>
      <div style={{ fontSize: 12, color: "#8a8a9a", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: isWarning ? "#fff3e0" : "#e8f8f0", color: isWarning ? "#e67e22" : "#27ae60" }}>{badge1}</span>
        <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: isWarning ? "#fdecea" : "#e8f8f0", color: isWarning ? "#e74c3c" : "#27ae60" }}>{badge2}</span>
      </div>
    </div>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0, letterSpacing: 0.3 }}>
      {initials}
    </div>
  );
}

// ── BookBadge ────────────────────────────────────────────────────────────────
function BookBadge({ color, size = 30 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>B</div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
  border: "none", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s, transform 0.1s",
};

const Divider = () => <div style={{ height: 1, background: "#f0ede8", margin: "2px 0" }} />;

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, color }: { message: string; color: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      background: "#1a1a2e", color: "#fff", padding: "10px 18px", borderRadius: 12,
      fontSize: 13, fontWeight: 500, boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
      borderLeft: `4px solid ${color}`, animation: "slideIn 0.25s ease",
    }}>
      {message}
    </div>
  );
}

// ── Overdue Row ──────────────────────────────────────────────────────────────
function OverdueRow({ item, onRemove }: { item: OverdueItem; onRemove: (id: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderRadius: 10, cursor: "pointer" }}>
      <Avatar initials={item.initials} color={item.avatarColor} size={34} />
      <BookBadge color="#e05a7a" size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 1 }}>{item.name}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.bookTitle}</div>
        <div style={{ fontSize: 10.5, color: "#aaa" }}>{item.author}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: 10, color: "#aaa" }}>Overdue</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{item.overdueDays} Days</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 40 }}>
        <div style={{ fontSize: 10, color: "#aaa" }}>Fine</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>₹ {item.fine}</div>
      </div>
      <div
        title="Dismiss entry"
        onClick={() => onRemove(item.id)}
        style={{ color: "#ccc", fontSize: 18, cursor: "pointer", paddingLeft: 2, userSelect: "none" }}
      >⋮</div>
    </div>
  );
}

// ── Request Row ──────────────────────────────────────────────────────────────
function RequestRow({ item, onStatusChange }: {
  item: BookRequest;
  onStatusChange: (id: number, status: "approved" | "denied") => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 4px", borderRadius: 10 }}>
      <BookBadge color={item.badgeColor} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.bookTitle}</div>
        <div style={{ fontSize: 10.5, color: "#aaa" }}>{item.author}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 1 }}>
          <Avatar initials={item.userInitials} color={item.userAvatarColor} size={18} />
          <span style={{ fontSize: 11.5, fontWeight: 500, color: "#1a1a2e" }}>{item.userName}</span>
        </div>
        <div style={{ fontSize: 10, color: "#aaa" }}>Requested on</div>
        <div style={{ fontSize: 10.5, color: "#555", fontWeight: 500 }}>{item.requestedOn}</div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, minWidth: 72 }}>
        {item.status === "pending" && (
          <>
            <button onClick={() => onStatusChange(item.id, "approved")} style={{ ...btnBase, background: "#e8f8f0", color: "#27ae60" }}>Approve</button>
            <button onClick={() => onStatusChange(item.id, "denied")}   style={{ ...btnBase, background: "#fdecea", color: "#e74c3c" }}>Deny</button>
          </>
        )}
        {item.status === "approved" && (
          <button onClick={() => onStatusChange(item.id, "denied")} style={{ ...btnBase, background: "#e8f8f0", color: "#27ae60" }}>Approved ✓</button>
        )}
        {item.status === "denied" && (
          <button onClick={() => onStatusChange(item.id, "approved")} style={{ ...btnBase, background: "#f0f0f5", color: "#aaa" }}>Denied</button>
        )}
      </div>
    </div>
  );
}

// ── Lended Row ───────────────────────────────────────────────────────────────
function LendedRow({ item, onToggleReturned, onToggleOverdue }: {
  item: BookLended;
  onToggleReturned: (id: number) => void;
  onToggleOverdue: (id: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 4px", borderRadius: 10 }}>
      <BookBadge color={item.badgeColor} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.bookTitle}</div>
        <div style={{ fontSize: 10.5, color: "#aaa" }}>{item.author}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 1 }}>
          <Avatar initials={item.userInitials} color={item.userAvatarColor} size={18} />
          <span style={{ fontSize: 11.5, fontWeight: 500, color: "#1a1a2e" }}>{item.userName}</span>
        </div>
        <div style={{ fontSize: 10, color: "#aaa" }}>Lended on</div>
        <div style={{ fontSize: 10.5, color: "#555", fontWeight: 500 }}>{item.lendedOn}</div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, minWidth: 72 }}>
        <button
          onClick={() => onToggleReturned(item.id)}
          style={{ ...btnBase, background: item.returned ? "#e8f4fd" : "#f0f0f5", color: item.returned ? "#3498db" : "#aaa" }}
        >
          {item.returned ? "Returned ✓" : "Not Returned"}
        </button>
        <button
          onClick={() => onToggleOverdue(item.id)}
          style={{ ...btnBase, background: item.overdue ? "#fdecea" : "#e8f8f0", color: item.overdue ? "#e74c3c" : "#27ae60" }}
        >
          {item.overdue ? "Overdue !" : "On Time ✓"}
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function LibraryDashboard() {
  const [overdueList, setOverdueList] = useState<OverdueItem[]>(initialOverdue);
  const [requests, setRequests]       = useState<BookRequest[]>(initialRequests);
  const [lended, setLended]           = useState<BookLended[]>(initialLended);
  const [toast, setToast]             = useState<{ message: string; color: string } | null>(null);

  const showToast = (message: string, color: string) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 2500);
  };

  const handleRemoveOverdue = (id: number) => {
    setOverdueList((prev) => prev.filter((x) => x.id !== id));
    showToast("Overdue entry dismissed", "#e8a020");
  };

  const handleRequestStatus = (id: number, status: "approved" | "denied") => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    showToast(status === "approved" ? "✓ Request approved" : "✗ Request denied", status === "approved" ? "#27ae60" : "#e74c3c");
  };

  const handleToggleReturned = (id: number) => {
    setLended((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const next = !l.returned;
      showToast(next ? "📗 Marked as returned" : "📕 Marked as not returned", next ? "#3498db" : "#e8a020");
      return { ...l, returned: next };
    }));
  };

  const handleToggleOverdue = (id: number) => {
    setLended((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const next = !l.overdue;
      showToast(next ? "⚠️ Marked as overdue" : "✓ Marked as on time", next ? "#e74c3c" : "#27ae60");
      return { ...l, overdue: next };
    }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7f3ec 0%, #f5f0e8 50%, #fdf6e8 100%)", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {toast && <Toast message={toast.message} color={toast.color} />}

      <div style={{ padding: "20px 22px" }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard iconEmoji="📦" iconBg="#fff8eb" num={210}               label="Total Inventory"      badge1="+12 This week"  badge2="+5% This month"        sparkColor="#e8a020" rising={true}  />
          <StatCard iconEmoji="⚠️" iconBg="#fff3e0" num={overdueList.length} label="Total Books overdue"  badge1="-2% This month" badge2="₹8,360 Fine this month" sparkColor="#e74c3c" rising={false} isWarning />
          <StatCard iconEmoji="📤" iconBg="#e8f4fd" num={120}               label="Total Books Borrowed"  badge1="+42 This week"  badge2="+102% This month"       sparkColor="#3498db" rising={true}  />
          <StatCard iconEmoji="📥" iconBg="#e8f8f5" num={90}                label="Books Left"            badge1="+42 This week"  badge2="+102% This month"       sparkColor="#1abc9c" rising={true}  />
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Overdue Details */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a020" }} />
                Overdue details
              </div>
              <span style={{ fontSize: 12, color: "#e8a020", fontWeight: 500, cursor: "pointer" }}>See All &gt;</span>
            </div>
            {overdueList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#aaa", fontSize: 13 }}>🎉 No overdue books!</div>
            ) : (
              overdueList.map((item, i) => (
                <div key={item.id}>
                  <OverdueRow item={item} onRemove={handleRemoveOverdue} />
                  {i < overdueList.length - 1 && <Divider />}
                </div>
              ))
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Book Requests */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a020" }} />
                  Book requests
                </div>
                <span style={{ fontSize: 14, color: "#bbb", cursor: "pointer" }}>›</span>
              </div>
              {requests.map((item, i) => (
                <div key={item.id}>
                  <RequestRow item={item} onStatusChange={handleRequestStatus} />
                  {i < requests.length - 1 && <Divider />}
                </div>
              ))}
            </div>

            {/* Books Lended */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a020" }} />
                  Books Lended
                </div>
                <span style={{ fontSize: 14, color: "#bbb", cursor: "pointer" }}>›</span>
              </div>
              {lended.map((item, i) => (
                <div key={item.id}>
                  <LendedRow item={item} onToggleReturned={handleToggleReturned} onToggleOverdue={handleToggleOverdue} />
                  {i < lended.length - 1 && <Divider />}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
