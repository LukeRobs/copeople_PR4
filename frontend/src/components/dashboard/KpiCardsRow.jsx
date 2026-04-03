import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import KpiCard from "./KpiCard";

export default function KpiCardsRow({ items = [] }) {
  const { isDark } = useContext(ThemeContext);

  if (!items.length) return null;

  return (
    <div
      style={{
        background: isDark ? "#1A1A1C" : "#F3F4F6",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
      >
        {items.map((item, i) => (
          <KpiCard
            key={i}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
            bgColor={item.bgColor}
            suffix={item.suffix}
            tooltip={item.tooltip}
          />
        ))}
      </div>
    </div>
  );
}
