export default function Scorecard({ stock, onClick }) {
  const isUp = parseFloat(stock.price_change_pct) >= 0;

  return (
    <div
      onClick={() => onClick && onClick(stock.symbol)}
      className="bg-surface-800 border border-surface-700 rounded-lg p-5 cursor-pointer
                 hover:border-brand-gold/40 hover:shadow-gold-sm transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xl font-mono font-bold text-brand-gold">{stock.symbol}</span>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-semibold text-gray-100">
            ${parseFloat(stock.current_price).toFixed(2)}
          </p>
          <p className={`text-xs font-mono font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(stock.price_change_pct)}% since entry
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-700 text-gray-400">
          {stock.sector}
        </span>
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-700 text-gray-400">
          {stock.industry_name}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-700 rounded p-2 text-center">
          <p className="text-xs font-mono text-gray-500 mb-1">RS Rating</p>
          <p className="text-sm font-mono font-bold text-brand-gold">{stock.rs_rating}</p>
        </div>
        <div className="bg-surface-700 rounded p-2 text-center">
          <p className="text-xs font-mono text-gray-500 mb-1">Appearances</p>
          <p className="text-sm font-mono font-bold text-accent-blue">{stock.appearances_21d}
            <span className="text-xs text-gray-500"> /21d</span>
          </p>
        </div>
        <div className="bg-surface-700 rounded p-2 text-center">
          <p className="text-xs font-mono text-gray-500 mb-1">First Seen</p>
          <p className="text-sm font-mono font-bold text-gray-300">
            {new Date(stock.first_seen_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Description */}
      {stock.company_description && (
        <p className="text-xs text-gray-500 font-body leading-relaxed line-clamp-2">
          {stock.company_description}
        </p>
      )}
    </div>
  );
}