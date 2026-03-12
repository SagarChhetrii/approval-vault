const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function VersionList({ versions, selectedId, onSelect }) {
  if (!versions.length) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No files uploaded yet.</p>;
  }

  return (
    <div style={styles.list}>
      {versions.map(v => (
        <div
          key={v._id}
          style={{
            ...styles.item,
            borderColor: selectedId === v._id ? 'var(--accent)' : 'var(--border)',
            background: selectedId === v._id ? 'rgba(79,140,255,0.07)' : 'var(--surface2)',
          }}
          onClick={() => onSelect(v)}
        >
          <div style={styles.row}>
            <span style={styles.version}>v{v.versionNumber}</span>
            <span style={styles.filename}>{v.filename}</span>
            {v.locked && <span style={styles.lock}>🔒 LOCKED</span>}
          </div>
          <div style={styles.meta}>
            <span className="fingerprint">
              {v.hash.slice(0, 6)}...{v.hash.slice(-6)}
            </span>
            <span style={styles.date}>{new Date(v.createdAt).toLocaleString()}</span>
          </div>
          {v.locked && (
            <p style={styles.lockedMsg}>This version is approved and immutably locked.</p>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  item: {
    border: '1px solid',
    borderRadius: 8,
    padding: 14,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  version: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '2px 8px',
    borderRadius: 4,
    color: 'var(--accent)',
    fontWeight: 600,
  },
  filename: { fontWeight: 600, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  lock: { fontSize: 11, color: 'var(--green)', fontWeight: 700 },
  meta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  date: { color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' },
  lockedMsg: { marginTop: 8, fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)' },
};
