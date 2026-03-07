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
  const strokeWidth = Math.max(6, size * 0.065);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / 10) * circumference;
  const offset = circumference - progress;

  const getColor = (s: number) => {
    if (s <= 3)
      return {
        main: "#2ecc71",
        glow: "rgba(46, 204, 113, 0.35)",
        grad1: "#2ecc71",
        grad2: "#27ae60",
      };
    if (s <= 6)
      return {
        main: "#f39c12",
        glow: "rgba(243, 156, 18, 0.35)",
        grad1: "#f39c12",
        grad2: "#e67e22",
      };
    if (s < 10)
      return {
        main: "#e74c3c",
        glow: "rgba(231, 76, 60, 0.35)",
        grad1: "#e74c3c",
        grad2: "#c0392b",
      };
    return {
      main: "#922b21",
      glow: "rgba(146, 43, 33, 0.35)",
      grad1: "#922b21",
      grad2: "#7b241c",
    };
  };

  const getLabel = (s: number) => {
    if (s <= 3) return "User Friendly";
    if (s <= 6) return "Average";
    if (s < 10) return "Concerning";
    return "Harmful";
  };

  const { main, glow, grad1, grad2 } = getColor(normalizedScore);
  const gradId = `scoreGrad-${size}-${Math.random().toString(36).substring(7)}`;
  const glowId = `scoreGlow-${size}-${Math.random().toString(36).substring(7)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ filter: `drop-shadow(0 0 ${size * 0.08}px ${glow})` }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={grad1} />
              <stop offset="100%" stopColor={grad2} />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />

          {/* Subtle tick marks */}
          {size >= 80 &&
            [...Array(10)].map((_, i) => {
              const angle = (i / 10) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const innerR = radius - strokeWidth * 0.8;
              const outerR = radius + strokeWidth * 0.8;
              return (
                <line
                  key={i}
                  x1={size / 2 + innerR * Math.cos(rad)}
                  y1={size / 2 + innerR * Math.sin(rad)}
                  x2={size / 2 + outerR * Math.cos(rad)}
                  y2={size / 2 + outerR * Math.sin(rad)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              );
            })}

          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter={`url(#${glowId})`}
            style={{
              transition:
                "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease",
            }}
          />

          {/* End dot on the arc */}
          {normalizedScore > 0 &&
            (() => {
              const angle =
                ((normalizedScore / 10) * 360 - 90) * (Math.PI / 180);
              const dotX = size / 2 + radius * Math.cos(angle);
              const dotY = size / 2 + radius * Math.sin(angle);
              return (
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={strokeWidth * 0.45}
                  fill={main}
                  style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
                />
              );
            })()}

          {/* Score number */}
          <text
            x={size / 2}
            y={size / 2 - size * 0.02}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={main}
            fontSize={size * 0.3}
            fontFamily="var(--font-mono)"
            fontWeight="800"
            letterSpacing="-0.02em"
          >
            {normalizedScore.toFixed(1)}
          </text>

          {/* /10 label */}
          <text
            x={size / 2}
            y={size / 2 + size * 0.16}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize={size * 0.1}
            fontFamily="var(--font-mono)"
            fontWeight="500"
          >
            / 10
          </text>
        </svg>
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: main,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-mono)",
            padding: "0.2rem 0.6rem",
            borderRadius: "100px",
            background: `${main}15`,
            border: `1px solid ${main}30`,
          }}
        >
          {getLabel(normalizedScore)}
        </span>
      )}
    </div>
  );
}
