interface RiskBadgeProps {
  level: "low" | "medium" | "high";
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const config = {
    low: { icon: "✓", label: "Low Risk", className: "badge badge-low" },
    medium: {
      icon: "●",
      label: "Medium Risk",
      className: "badge badge-medium",
    },
    high: { icon: "✕", label: "High Risk", className: "badge badge-high" },
  };

  const { icon, label, className } = config[level] || config.medium;

  return (
    <span className={className}>
      {icon} {label}
    </span>
  );
}
