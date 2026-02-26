import { useState, useEffect, useCallback } from "react";
import "./App.css";

type TimezoneOption = {
  label: string;
  value: string;
};

const TIMEZONES: TimezoneOption[] = [
  { label: "UTC", value: "UTC" },
  { label: "US Eastern", value: "America/New_York" },
  { label: "US Central", value: "America/Chicago" },
  { label: "US Pacific", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Amsterdam", value: "Europe/Amsterdam" },
  { label: "Berlin", value: "Europe/Berlin" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "São Paulo", value: "America/Sao_Paulo" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Hong Kong", value: "Asia/Hong_Kong" },
  { label: "Mumbai", value: "Asia/Kolkata" },
];

const COMMON_EPOCHS: { label: string; ts: number }[] = [
  { label: "Unix Epoch", ts: 0 },
  { label: "Y2K", ts: 946684800 },
  { label: "32-bit overflow", ts: 2147483647 },
  { label: "iPhone launch", ts: 1183248000 },
  { label: "Bitcoin genesis", ts: 1231006505 },
];

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const abs = Math.abs(diffMs);
  const future = diffMs < 0;

  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  let str: string;
  if (seconds < 5) str = "just now";
  else if (seconds < 60) str = `${seconds}s`;
  else if (minutes < 60) str = `${minutes}m`;
  else if (hours < 24) str = `${hours}h ${minutes % 60}m`;
  else if (days < 30) str = `${days}d`;
  else if (months < 12) str = `${months}mo`;
  else str = `${years}y`;

  if (str === "just now") return str;
  return future ? `in ${str}` : `${str} ago`;
}

function formatInTimezone(date: Date, tz: string): string {
  return date.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function Copied({ show }: { show: boolean }) {
  return (
    <span className={`copied-badge ${show ? "visible" : ""}`}>copied!</span>
  );
}

function App() {
  const [now, setNow] = useState(Date.now());
  const [input, setInput] = useState("");
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [parseError, setParseError] = useState("");
  const [liveMode, setLiveMode] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedTzs, setSelectedTzs] = useState<string[]>(["UTC", "America/New_York", "Europe/Amsterdam"]);

  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [liveMode]);

  const activeDate = parsedDate ?? new Date(now);

  const parseInput = useCallback((val: string) => {
    setInput(val);
    if (!val.trim()) {
      setParsedDate(null);
      setParseError("");
      setLiveMode(true);
      return;
    }
    setLiveMode(false);

    // Try unix timestamp (seconds)
    if (/^\d{10}$/.test(val.trim())) {
      setParsedDate(new Date(parseInt(val.trim()) * 1000));
      setParseError("");
      return;
    }
    // Try unix timestamp (milliseconds)
    if (/^\d{13}$/.test(val.trim())) {
      setParsedDate(new Date(parseInt(val.trim())));
      setParseError("");
      return;
    }
    // Try ISO / natural date
    const d = new Date(val.trim());
    if (!isNaN(d.getTime())) {
      setParsedDate(d);
      setParseError("");
      return;
    }
    setParseError("Can't parse that — try a Unix timestamp or ISO date");
    setParsedDate(null);
  }, []);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  }, []);

  const toggleTz = useCallback((tz: string) => {
    setSelectedTzs((prev) =>
      prev.includes(tz) ? prev.filter((t) => t !== tz) : [...prev, tz]
    );
  }, []);

  const unixSec = Math.floor(activeDate.getTime() / 1000);
  const unixMs = activeDate.getTime();

  return (
    <div className="app">
      <header>
        <h1>
          <span className="logo">⏱</span> epoch
        </h1>
        <p className="subtitle">timestamp toolkit for developers</p>
      </header>

      <section className="input-section">
        <div className="input-row">
          <input
            type="text"
            placeholder="Paste a timestamp or date (e.g. 1703275200, 2024-12-22T20:00:00Z)"
            value={input}
            onChange={(e) => parseInput(e.target.value)}
            className="main-input"
          />
          {input && (
            <button className="clear-btn" onClick={() => parseInput("")}>
              ✕
            </button>
          )}
        </div>
        {parseError && <p className="error">{parseError}</p>}
        {!input && (
          <p className="hint">
            Live clock · type or paste to convert
          </p>
        )}
      </section>

      <section className="output-grid">
        <div className="card primary">
          <div className="card-header">
            <span className="card-label">Unix (seconds)</span>
            <Copied show={copiedField === "unix-s"} />
          </div>
          <button
            className="card-value mono clickable"
            onClick={() => copyToClipboard(String(unixSec), "unix-s")}
          >
            {unixSec}
          </button>
        </div>

        <div className="card primary">
          <div className="card-header">
            <span className="card-label">Unix (milliseconds)</span>
            <Copied show={copiedField === "unix-ms"} />
          </div>
          <button
            className="card-value mono clickable"
            onClick={() => copyToClipboard(String(unixMs), "unix-ms")}
          >
            {unixMs}
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-label">ISO 8601</span>
            <Copied show={copiedField === "iso"} />
          </div>
          <button
            className="card-value mono clickable"
            onClick={() =>
              copyToClipboard(activeDate.toISOString(), "iso")
            }
          >
            {activeDate.toISOString()}
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-label">Relative</span>
          </div>
          <div className="card-value">{formatRelative(activeDate)}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-label">Day of Year</span>
          </div>
          <div className="card-value mono">{getDayOfYear(activeDate)}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-label">Week Number</span>
          </div>
          <div className="card-value mono">W{getWeekNumber(activeDate)}</div>
        </div>
      </section>

      <section className="tz-section">
        <h2>Timezones</h2>
        <div className="tz-chips">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.value}
              className={`tz-chip ${selectedTzs.includes(tz.value) ? "active" : ""}`}
              onClick={() => toggleTz(tz.value)}
            >
              {tz.label}
            </button>
          ))}
        </div>
        <div className="tz-grid">
          {selectedTzs.map((tz) => {
            const label = TIMEZONES.find((t) => t.value === tz)?.label ?? tz;
            const formatted = formatInTimezone(activeDate, tz);
            return (
              <div className="tz-card" key={tz}>
                <div className="card-header">
                  <span className="card-label">{label}</span>
                  <Copied show={copiedField === `tz-${tz}`} />
                </div>
                <button
                  className="card-value mono clickable"
                  onClick={() => copyToClipboard(formatted, `tz-${tz}`)}
                >
                  {formatted}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="epochs-section">
        <h2>Notable Timestamps</h2>
        <div className="epochs-grid">
          {COMMON_EPOCHS.map((ep) => (
            <button
              key={ep.ts}
              className="epoch-btn"
              onClick={() => parseInput(String(ep.ts))}
            >
              <span className="epoch-label">{ep.label}</span>
              <span className="epoch-ts mono">{ep.ts}</span>
            </button>
          ))}
          <button
            className="epoch-btn now-btn"
            onClick={() => parseInput("")}
          >
            <span className="epoch-label">Now (live)</span>
            <span className="epoch-ts mono">⏱</span>
          </button>
        </div>
      </section>

      <footer>
        <p>
          <a href="https://github.com/obrera/zangano-nightshift-oneoff-epoch" target="_blank" rel="noopener">
            GitHub
          </a>{" "}
          · Built during a Nightshift one-off session
        </p>
      </footer>
    </div>
  );
}

export default App;
