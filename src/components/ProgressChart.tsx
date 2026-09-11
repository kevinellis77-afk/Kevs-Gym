import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  title: string;
  data: {
    date: string;
    weight: number;
  }[];
};

export default function ProgressChart({
  title,
  data,
}: Props) {
  const hasData = data && data.length > 0;

  const first = hasData ? data[0].weight : 0;
  const last = hasData ? data[data.length - 1].weight : 0;
  const change = last - first;

  const trendClass =
    change > 0
      ? "trend-up"
      : change < 0
      ? "trend-down"
      : "trend-flat";

  const trendLabel =
    change === 0
      ? "No change"
      : `${change > 0 ? "+" : ""}${change}kg`;

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "4px",
        }}
      >
        <h3 className="exercise-name">{title}</h3>

        {hasData && (
          <span className={trendClass}>{trendLabel}</span>
        )}
      </div>

      {!hasData && (
        <p className="empty-state">
          Log a few sessions to see this trend.
        </p>
      )}

      {hasData && (
        <div style={{ width: "100%", height: 140, marginTop: "8px" }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fill: "#5C6478", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#1A2130",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                labelStyle={{ color: "#9AA3B5" }}
                itemStyle={{ color: "#F2F4F8" }}
              />

              <Line
                type="monotone"
                dataKey="weight"
                stroke="#5E8DFF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#5E8DFF", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
