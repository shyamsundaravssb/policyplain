interface CategoryBreakdownProps {
  title: string;
  icon: string;
  items: string[];
  accentColor?: string;
}

export default function CategoryBreakdown({
  title,
  icon,
  items,
  accentColor = "var(--accent-blue)",
}: CategoryBreakdownProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <h4
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: accentColor,
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-body)",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        {title}
      </h4>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              paddingLeft: "1rem",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "0.45rem",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: accentColor,
                opacity: 0.6,
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
