// Velvet Ledger reminder: ceremony belongs in the draw moment; every setup control stays calm, direct, and legible.
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp, Minus, Plus, RotateCcw, Sparkles, Trash2, Undo2, X } from "lucide-react";

type Winner = { name: string; time: string };
type Status = { message: string; tone?: "error" | "success" };

const STORAGE_KEYS = {
  participants: "hb-raffle-participants",
  winners: "hb-raffle-winners",
};

const BRAND_MARK = "/manus-storage/her-blueprint-mark_0b51d700.png";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The draw remains usable when storage is blocked or unavailable.
  }
}

function cleanName(raw: string) {
  return raw.replace(/\s+/g, " ").trim();
}

function isLikelyJunkLine(line: string) {
  const value = line.trim().toLowerCase();
  if (!value) return true;
  if (["name", "names", "full name", "participant", "participants", "entrant", "entrants"].includes(value)) return true;
  if (/^\d+$/.test(value)) return true;
  if (/^[-_=,.\s]+$/.test(value)) return true;
  return false;
}

function parseBulkText(text: string) {
  let lines = text.split(/\r?\n/);
  if (lines.length === 1 && lines[0].includes(",")) {
    lines = lines[0].split(",");
  } else {
    lines = lines.map((line) => (line.includes(",") ? line.split(",")[0] : line));
  }

  return lines
    .map((line) => cleanName(line.replace(/^\s*["']|["']\s*$/g, "")))
    .filter((name) => name && !isLikelyJunkLine(name));
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function csvEscape(value: unknown) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function Home() {
  const [participants, setParticipants] = useState<string[]>(() => loadJSON(STORAGE_KEYS.participants, []));
  const [winners, setWinners] = useState<Winner[]>(() => loadJSON(STORAGE_KEYS.winners, []));
  const [activeTab, setActiveTab] = useState<"manual" | "paste" | "upload">("manual");
  const [nameInput, setNameInput] = useState("");
  const [pasteArea, setPasteArea] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [drawName, setDrawName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageStatus, setStageStatus] = useState("Ready when you are");
  const [status, setStatus] = useState<Status>({ message: "" });
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.participants, participants);
  }, [participants]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.winners, winners);
  }, [winners]);

  const pool = useMemo(() => {
    if (allowRepeat) return participants;
    const won = new Set(winners.map((winner) => winner.name.toLowerCase()));
    return participants.filter((name) => !won.has(name.toLowerCase()));
  }, [allowRepeat, participants, winners]);

  const setHint = (message: string, tone?: Status["tone"]) => setStatus({ message, tone });

  const addNames = (names: string[]) => {
    const existing = new Set(participants.map((name) => name.toLowerCase()));
    let added = 0;
    let skipped = 0;
    const next = [...participants];

    names.forEach((rawName) => {
      const name = cleanName(rawName);
      const key = name.toLowerCase();
      if (!name || existing.has(key)) {
        if (name) skipped += 1;
        return;
      }
      existing.add(key);
      next.push(name);
      added += 1;
    });

    if (added) setParticipants(next);
    return { added, skipped };
  };

  const announceImport = (added: number, skipped: number) => {
    let message = `Added ${added} name${added === 1 ? "" : "s"}.`;
    if (skipped) message += ` Skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.`;
    setHint(message, "success");
  };

  const handleManualSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = cleanName(nameInput);
    if (!name) {
      setHint("Enter a participant name first.", "error");
      return;
    }
    const { skipped } = addNames([name]);
    setNameInput("");
    setHint(skipped ? "Already in the list." : "Entry added.", skipped ? "error" : "success");
  };

  const handlePasteAdd = () => {
    if (!pasteArea.trim()) {
      setHint("Paste at least one name first.", "error");
      return;
    }
    const { added, skipped } = addNames(parseBulkText(pasteArea));
    setPasteArea("");
    announceImport(added, skipped);
  };

  const readTextFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { added, skipped } = addNames(parseBulkText(String(reader.result ?? "")));
      if (!added && !skipped) {
        setHint("No names found in that file.", "error");
        return;
      }
      announceImport(added, skipped);
    };
    reader.onerror = () => setHint("Could not read that file. Try again.", "error");
    reader.readAsText(file);
  };

  const readPdfFile = async (file: File) => {
    const pdfjsLib = (window as Window & { pdfjsLib?: any }).pdfjsLib;
    if (!pdfjsLib) {
      setHint("PDF reader unavailable. Try a CSV or TXT file instead.", "error");
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let fullText = "";
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const lines = new Map<number, string[]>();
        content.items.forEach((item: { transform?: number[]; str?: string }) => {
          if (!item.str || !item.transform) return;
          const y = Math.round(item.transform[5]);
          if (!lines.has(y)) lines.set(y, []);
          lines.get(y)?.push(item.str);
        });
        Array.from(lines.keys()).sort((a, b) => b - a).forEach((y) => {
          fullText += `${lines.get(y)?.join(" ") ?? ""}\n`;
        });
      }
      const { added, skipped } = addNames(parseBulkText(fullText));
      if (!added && !skipped) {
        setHint("No names found in that PDF.", "error");
        return;
      }
      announceImport(added, skipped);
    } catch {
      setHint("Could not extract names from that PDF.", "error");
    }
  };

  const handleFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["csv", "txt", "pdf"].includes(extension)) {
      setHint("Use a CSV, TXT, or PDF file.", "error");
      return;
    }
    setHint(`Reading ${file.name}…`);
    if (extension === "pdf") void readPdfFile(file);
    else readTextFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearAll = () => {
    if (!participants.length && !winners.length) return;
    if (!window.confirm("Clear all entries and winners? This cannot be undone.")) return;
    setParticipants([]);
    setWinners([]);
    setWinnerCount(1);
    setDrawName("");
    setStageStatus("Ready when you are");
    setHint("");
  };

  const spinToWinner = (drawPool: string[]) =>
    new Promise<string>((resolve) => {
      setIsSpinning(true);
      let elapsed = 0;
      let interval = 55;
      const finalWinner = drawPool[Math.floor(Math.random() * drawPool.length)];

      const tick = () => {
        setDrawName(drawPool[Math.floor(Math.random() * drawPool.length)]);
        elapsed += interval;
        interval *= 1.12;
        if (elapsed < 1200) {
          window.setTimeout(tick, interval);
        } else {
          setDrawName(finalWinner);
          setIsSpinning(false);
          resolve(finalWinner);
        }
      };
      tick();
    });

  const drawWinners = async () => {
    if (isDrawing || !pool.length) return;
    setIsDrawing(true);
    setStageStatus("Drawing…");
    const requested = Math.min(Math.max(1, winnerCount), pool.length);
    const picks: string[] = [];

    for (let index = 0; index < requested; index += 1) {
      const roundPool = allowRepeat ? pool : pool.filter((name) => !picks.includes(name));
      if (!roundPool.length) break;
      const winner = await spinToWinner(roundPool);
      picks.push(winner);
      setWinners((current) => [...current, { name: winner, time: new Date().toISOString() }]);
      if (index < requested - 1) await new Promise((resolve) => window.setTimeout(resolve, 450));
    }

    setIsDrawing(false);
    setStageStatus(picks.length > 1 ? `${picks.length} winners drawn` : "We have a winner");
  };

  const undoLastDraw = () => {
    if (isDrawing || !winners.length) return;
    setWinners((current) => current.slice(0, -1));
    setStageStatus("Last draw undone");
  };

  const resetDraw = () => {
    if (isDrawing || !winners.length) return;
    if (!window.confirm("Reset the draw? Everyone returns to the pool, but the entry list stays.")) return;
    setWinners([]);
    setDrawName("");
    setStageStatus("Ready when you are");
  };

  const exportWinners = () => {
    if (!winners.length) return;
    const rows = [["Rank", "Name", "Time"], ...winners.map((winner, index) => [index + 1, winner.name, formatTime(winner.time)])];
    const blob = new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "her-blueprint-raffle-winners.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const particles = useMemo(
    () => Array.from({ length: 24 }, (_, index) => ({
      left: `${(index * 37) % 100}%`,
      top: `${(index * 53) % 100}%`,
      delay: `${-((index * 1.7) % 18)}s`,
      duration: `${14 + ((index * 2.3) % 18)}s`,
    })),
    [],
  );

  return (
    <div className="app-shell">
      <div className="ambient" aria-hidden="true">
        {particles.map((particle, index) => <span key={index} style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }} />)}
      </div>

      <div className="page-shell">
        <header className="site-header">
          <div className="brand-lockup">
            <img src={BRAND_MARK} alt="HER Blueprint mark" className="brand-mark" />
            <div>
              <div className="brand-name">HER Blueprint</div>
              <div className="brand-caption">A room for becoming</div>
            </div>
          </div>
          <div className="event-heading">
            <span className="eyebrow">An exclusive training for women</span>
            <h1>Raffle <em>Draw</em></h1>
          </div>
          <div className="event-meta">
            <span className="live-chip"><i /> Live event</span>
            <span className="date-chip">Aug 29 · 12:00 PM</span>
          </div>
        </header>

        <main className="content-layout">
          <section className="panel entries-panel" aria-labelledby="entries-heading">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">01 / Setup</span>
                <h2 id="entries-heading">Entries</h2>
              </div>
              <span className="pool-count"><strong>{participants.length}</strong> in the pool</span>
            </div>

            <div className="tabs" role="tablist" aria-label="Entry method">
              {(["manual", "paste", "upload"] as const).map((tab) => (
                <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={`tab ${activeTab === tab ? "is-active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab === "manual" ? "Type a name" : tab === "paste" ? "Paste a list" : "Upload file"}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === "manual" && (
                <form className="input-row" onSubmit={handleManualSubmit}>
                  <label className="sr-only" htmlFor="nameInput">Participant name</label>
                  <input id="nameInput" value={nameInput} onChange={(event) => setNameInput(event.target.value)} className="text-input" placeholder="Enter participant name" autoComplete="off" />
                  <button type="submit" className="button button-gold">Add</button>
                </form>
              )}
              {activeTab === "paste" && (
                <div>
                  <label className="sr-only" htmlFor="pasteArea">Participant names</label>
                  <textarea id="pasteArea" value={pasteArea} onChange={(event) => setPasteArea(event.target.value)} className="text-input text-area" rows={5} placeholder="Paste names — one per line, or separated by commas" />
                  <button type="button" className="button button-gold button-full" onClick={handlePasteAdd}>Add all names</button>
                </div>
              )}
              {activeTab === "upload" && (
                <div>
                  <label className={`dropzone ${dragging ? "is-dragging" : ""}`} htmlFor="fileInput" onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                    <FileUp size={28} strokeWidth={1.4} aria-hidden="true" />
                    <span className="dropzone-title">Drop a CSV, TXT, or PDF file</span>
                    <span className="dropzone-subtitle">or click to browse</span>
                    <input ref={fileInputRef} id="fileInput" type="file" accept=".csv,.txt,.pdf" hidden onChange={handleFileChange} />
                  </label>
                  <p className={`hint ${status.tone ? `hint-${status.tone}` : ""}`} aria-live="polite">{status.message}</p>
                </div>
              )}
            </div>

            {activeTab !== "upload" && <p className={`hint ${status.tone ? `hint-${status.tone}` : ""}`} aria-live="polite">{status.message}</p>}

            <div className="entry-register">
              {participants.length ? (
                <ul className="participant-list" aria-live="polite">
                  {participants.map((name, index) => (
                    <li key={`${name}-${index}`}>
                      <span>{name}</span>
                      <button type="button" className="remove-button" aria-label={`Remove ${name}`} onClick={() => setParticipants((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={15} /></button>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-state">No one&apos;s entered yet — add names to get started.</p>}
            </div>

            <div className="panel-footer-action">
              <button type="button" className="button button-ghost button-small" onClick={clearAll} disabled={!participants.length && !winners.length}><Trash2 size={14} /> Clear all entries</button>
            </div>
          </section>

          <section className="stage-column" aria-labelledby="stage-heading">
            <div className={`draw-card ${isSpinning ? "is-spinning" : ""}`}>
              <div className="draw-card-corner" aria-hidden="true" />
              <div className="draw-card-texture" aria-hidden="true" />
              <div className="draw-card-content">
                <span className="section-kicker">The moment</span>
                <span className="stage-status" aria-live="polite">{stageStatus}</span>
                <div className="draw-display" aria-live="polite" aria-atomic="true">
                  {drawName ? <span className={`winner-name ${isSpinning ? "is-spinning" : ""}`}>{drawName}</span> : <span className="draw-placeholder">Add entries, then draw a name</span>}
                </div>
                <div className="draw-controls">
                  <label className="stepper-label">
                    <span>Winners to draw</span>
                    <span className="stepper-control">
                      <button type="button" aria-label="Decrease winners" onClick={() => setWinnerCount((current) => Math.max(1, current - 1))} disabled={isDrawing || winnerCount <= 1}><Minus size={14} /></button>
                      <input aria-label="Number of winners" type="number" min={1} max={Math.max(1, pool.length)} value={winnerCount} onChange={(event) => setWinnerCount(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, pool.length)))} disabled={isDrawing} />
                      <button type="button" aria-label="Increase winners" onClick={() => setWinnerCount((current) => Math.min(Math.max(1, pool.length), current + 1))} disabled={isDrawing || winnerCount >= Math.max(1, pool.length)}><Plus size={14} /></button>
                    </span>
                  </label>
                  <label className="checkbox-label"><input type="checkbox" checked={allowRepeat} onChange={(event) => setAllowRepeat(event.target.checked)} disabled={isDrawing} /><span>Allow repeat winners</span></label>
                </div>
                <button type="button" className="button button-gold button-draw" onClick={() => void drawWinners()} disabled={!pool.length || isDrawing}><Sparkles size={17} /> {isDrawing ? "Drawing…" : "Draw"}</button>
                <div className="draw-footer-actions">
                  <button type="button" className="button button-ghost button-small" onClick={undoLastDraw} disabled={!winners.length || isDrawing}><Undo2 size={14} /> Undo last draw</button>
                  <button type="button" className="button button-ghost button-small" onClick={resetDraw} disabled={!winners.length || isDrawing}><RotateCcw size={14} /> Reset draw</button>
                </div>
              </div>
            </div>

            <div className="winners-panel">
              <div className="panel-heading winners-heading">
                <div>
                  <span className="section-kicker">02 / The register</span>
                  <h2 id="stage-heading">Winners</h2>
                </div>
                <button type="button" className="button button-outline button-small" onClick={exportWinners} disabled={!winners.length}><Download size={14} /> Export CSV</button>
              </div>
              {winners.length ? (
                <ol className="winner-list">
                  {winners.map((winner, index) => <li key={`${winner.time}-${index}`}><span className="winner-rank">#{index + 1}</span><span className="winner-list-name">{winner.name}</span><span className="winner-time">{formatTime(winner.time)}</span></li>)}
                </ol>
              ) : <p className="empty-state winners-empty">Winners will appear here as they&apos;re drawn.</p>}
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p><strong>Character.</strong> <strong>Competence.</strong> <strong>Confidence.</strong> <span>— The three pillars of success</span></p>
          <p className="footer-fine">HER Blueprint · Raffle Draw</p>
        </footer>
      </div>
    </div>
  );
}
