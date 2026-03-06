"use client";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function ScoreGauge({
  score,
  size = 120,
  showLabel = true,
}: ScoreGaugeProps) {
  const normalizedScore = Math.min(10, Math.max(0, score));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / 10) * circumference;
  const offset = circumference - progress;

  const getColor = (s: number) => {
    if (s <= 3) return "var(--accent-green)";
    if (s <= 6) return "var(--accent-yellow)";
    if (s < 10) return "var(--accent-red)";
    return "var(--accent-darkred)";
  };

  const getLabel = (s: number) => {
    if (s <= 3) return "User Friendly";
    if (s <= 6) return "Average";
    if (s < 10) return "Concerning";
    return "Harmful";
  };

  const color = getColor(normalizedScore);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size * 0.28}
          fontFamily="var(--font-mono)"
          fontWeight="700"
        >
          {normalizedScore.toFixed(1)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-tertiary)"
          fontSize={size * 0.1}
          fontFamily="var(--font-mono)"
        >
          / 10
        </text>
      </svg>
      {showLabel && (
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: "var(--font-mono)",
          }}
        >
          {getLabel(normalizedScore)}
        </span>
      )}
    </div>
  );
}
