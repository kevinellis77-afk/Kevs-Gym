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
          className="mini-stat"
        >
          <div className="mini-value">
            {stat.value}
          </div>

          <div className="mini-label">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}