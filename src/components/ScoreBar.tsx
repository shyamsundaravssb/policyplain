interface ScoreBarProps {
  score: number;
  label: string;
  note?: string;
}

export default function ScoreBar({ score, label, note }: ScoreBarProps) {
  const normalizedScore = Math.min(10, Math.max(0, score));
  const percentage = (normalizedScore / 10) * 100;

  const getColor = (s: number) => {
    if (s <= 3) return "var(--accent-green)";
    if (s <= 6) return "var(--accent-yellow)";
    if (s < 10) return "var(--accent-red)";
    return "var(--accent-darkred)";
  };

  const color = getColor(normalizedScore);

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.4rem",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            fontWeight: 600,
            color,
          }}
        >
          {normalizedScore}/10
        </span>
      </div>
      <div className="score-bar-container">
        <div
          className="score-bar-fill"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
      {note && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-tertiary)",
            marginTop: "0.35rem",
            lineHeight: 1.4,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
