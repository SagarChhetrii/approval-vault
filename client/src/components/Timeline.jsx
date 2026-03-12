const ACTION_META = {
  PROJECT_CREATED:   { icon: '◈', color: 'var(--accent)',  label: 'Project Created' },
  UPLOAD:            { icon: '⬆', color: 'var(--accent2)', label: 'File Uploaded' },
  COMMENT:           { icon: '💬', color: 'var(--yellow)',  label: 'Comment Added' },
  APPROVE:           { icon: '✓',  color: 'var(--green)',   label: 'Approved' },
  CHANGES_REQUESTED: { icon: '↩',  color: 'var(--red)',     label: 'Changes Requested' },
};

export default function Timeline({ logs }) {
  if (!logs.length) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No activity yet.</p>;
  }

  return (
    <div style={styles.wrapper}>
      {logs.map((log, i) => {
        const meta = ACTION_META[log.action] || { icon: '·', color: 'var(--muted)', label: log.action };
        return (
          <div key={log._id} style={styles.item}>
            <div style={{ ...styles.iconWrap, background: meta.color + '22', border: `1px solid ${meta.color}44` }}>
              <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
            </div>
            {i < logs.length - 1 && <div style={styles.line} />}
            <div style={styles.body}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{meta.label}</span>
              {log.userId && (
                <span style={{ color: 'var(--muted)', fontSize: 12 }}> · {log.userId.name}</span>
              )}
              <p style={styles.time}>{new Date(log.timestamp).toLocaleString()}</p>
              {log.meta?.hash && (
                <span className="fingerprint" style={{ fontSize: 11 }}>
                  {log.meta.hash.slice(0, 6)}...{log.meta.hash.slice(-6)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 },
  item: { display: 'flex', gap: 14, position: 'relative', paddingBottom: 22 },
  iconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, zIndex: 1,
  },
  line: {
    position: 'absolute',
    left: 17, top: 36,
    width: 2, height: '100%',
    background: 'var(--border)',
  },
  body: { paddingTop: 6 },
  time: { color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2, marginBottom: 4 },
};
