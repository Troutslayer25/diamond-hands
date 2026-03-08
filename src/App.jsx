import { useState } from "react";
import UploadZone from "./components/UploadZone";
import Scorecard from "./components/Scorecard";

const NAV_LINKS = ["Screener", "Heat Map", "Scorecard", "Tracker", "Watchlist"];

const STATS = [
  { label: "S&P 500",  value: "5,431.20", change: "+0.84%",  up: true },
  { label: "NASDAQ",   value: "17,204.10", change: "+1.12%", up: true },
  { label: "DOW",      value: "39,118.86", change: "-0.21%", up: false },
  { label: "VIX",      value: "14.32",     change: "-3.40%", up: false },
  { label: "BTC/USD",  value: "67,840.00", change: "+2.75%", up: true },
];

export default function App() {
  const [activeNav, setActiveNav] = useState("Screener");
  const [query, setQuery] = useState("");
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchScorecards = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://diamond-hands-production.up.railway.app/api/scorecards');
      const data = await res.json();
      setScorecards(data);
    } catch (err) {
      console.error('Could not fetch scorecards:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = scorecards.filter(s =>
    s.symbol.toLowerCase().includes(query.toLowerCase()) ||
    s.name?.toLowerCase().includes(query.toLowerCase()) ||
    s.sector?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-950 font-body">

      {/* Ticker Tape */}
      <div className="bg-surface-900 border-b border-surface-700 overflow-hidden py-1.5">
        <div className="flex gap-10 px-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          {STATS.map((s) => (
            <span key={s.label} className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="text-gray-400">{s.label}</span>
              <span className="text-gray-100 font-medium">{s.value}</span>
              <span className={s.up ? "text-accent-green" : "text-accent-red"}>{s.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-surface-900/90 backdrop-blur-md border-b border-surface-700">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-3xl font-display tracking-widest text-brand-gold leading-none">DIAMOND</span>
            <span className="text-3xl font-display tracking-widest text-gray-100 leading-none">HANDS</span>
            <span className="ml-1 text-xl">💎</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => { setActiveNav(link); if (link === 'Tracker') fetchScorecards(); }}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-150
                  ${activeNav === link
                    ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30 shadow-gold-sm"
                    : "text-gray-400 hover:text-gray-100 hover:bg-surface-700"
                  }`}
              >
                {link}
              </button>
            ))}
          </nav>
          <div className="relative ml-auto">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm pointer-events-none">⌕</span>
            <input
              type="text"
              placeholder="Search ticker, sector…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56 pl-8 pr-4 py-2 rounded bg-surface-800 border border-surface-600
                         text-sm text-gray-100 placeholder-gray-500 font-mono
                         focus:outline-none focus:border-brand-gold/60 focus:shadow-gold-sm
                         transition-all duration-150"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-8">
        <div className="mb-8 flex items-end justify-between border-b border-surface-700 pb-5">
          <div>
            <p className="text-xs font-mono text-brand-gold tracking-widest uppercase mb-1">— Module</p>
            <h1 className="text-5xl font-display tracking-wider text-gray-100 leading-none">{activeNav}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">Last updated:</span>
            <span className="text-xs font-mono text-brand-gold">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ET
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          </div>
        </div>

        {activeNav === 'Tracker' && (
          <div>
            <UploadZone onUploadSuccess={fetchScorecards} />
            {loading && (
              <p className="text-center font-mono text-brand-gold animate-pulse py-8">Loading scorecards...</p>
            )}
            {!loading && scorecards.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📂</p>
                <p className="font-mono text-gray-400">No stocks tracked yet.</p>
                <p className="font-mono text-gray-600 text-sm mt-1">Upload your first daily screen file above to get started.</p>
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(stock => (
                  <Scorecard key={stock.symbol} stock={stock} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav !== 'Tracker' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Total Signals", value: "284", sub: "Active setups today" },
              { title: "Bullish / Bearish", value: "187 / 97", sub: "Directional split" },
              { title: "Avg. Score", value: "74.2", sub: "Composite momentum" },
            ].map((card) => (
              <div key={card.title} className="bg-surface-800 border border-surface-700 rounded-lg p-5
                           hover:border-brand-gold/30 hover:shadow-gold-sm transition-all duration-200">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">{card.title}</p>
                <p className="text-3xl font-mono font-semibold text-gray-100 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.sub}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-700 bg-surface-900">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-3xl font-display tracking-widest text-brand-gold leading-none">IRA'S</span>
<span className="text-3xl font-display tracking-widest text-gray-100 leading-none">SCREEN TRACKER</span>
<span className="ml-1 text-xl">📈</span>
          <div className="flex items-center gap-5 text-xs font-mono text-gray-600">
            {["Privacy", "Terms", "API", "Status"].map((l) => (
              <a key={l} href="#" className="hover:text-brand-gold transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}