import { useState, useRef } from "react";

export default function UploadZone({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage({ type: 'error', text: 'Please upload an Excel file (.xlsx or .xls)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://diamond-hands-production.up.railway.app/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `✓ Imported ${data.rowsImported} stocks for ${data.date}` });
        onUploadSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not connect to server. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileRef.current.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-brand-gold bg-brand-gold/10 shadow-gold-md'
            : 'border-surface-600 hover:border-brand-gold/50 hover:bg-surface-800'
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="text-4xl mb-3">📊</div>
        {loading ? (
          <p className="text-brand-gold font-mono text-sm animate-pulse">Processing file...</p>
        ) : (
          <>
            <p className="text-gray-300 font-mono text-sm mb-1">
              Drag & drop your daily screen Excel file here
            </p>
            <p className="text-gray-500 font-mono text-xs">or click to browse — .xlsx files only</p>
          </>
        )}
      </div>

      {message && (
        <div className={`mt-3 px-4 py-3 rounded font-mono text-sm
          ${message.type === 'success'
            ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
            : 'bg-accent-red/10 text-accent-red border border-accent-red/30'
          }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}