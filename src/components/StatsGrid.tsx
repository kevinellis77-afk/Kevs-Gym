type Stat = {
  label: string;
  value: string | number;
};

type StatsGridProps = {
  stats?: Stat[];
};

export default function StatsGrid({
  stats = [],
}: StatsGridProps) {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="stat-card"
        >
          <div className="stat-value">
            {stat.value}
          </div>

          <div className="stat-title">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}