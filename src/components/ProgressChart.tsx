import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type Props = {
  title: string;
  data: {
    date: string;
    weight: number;
  }[];
  // Optional goal shading - draws a shaded zone from 0 up to
  // goalValue plus a dashed reference line at it, so the chart
  // reads as "get the line into the green" rather than just a log.
  goalValue?: number;
  goalLabel?: string;
};

export default function ProgressChart({
  title,
  data,
  goalValue,
  goalLabel,
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

  // Y-axis domain needs to stretch to include the goal line too,
  // in case it sits below (or above) the current data range.
  let yDomain: [number, number] | undefined;

  if (hasData) {
    const values = data.map((point) => point.weight);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    const lowerBound =
      goalValue !== undefined ? Math.min(dataMin, goalValue) : dataMin;
    const upperBound =
      goalValue !== undefined ? Math.max(dataMax, goalValue) : dataMax;

    const padding = Math.max(2, (upperBound - lowerBound) * 0.15);

    yDomain = [
      Math.max(0, Math.floor(lowerBound - padding)),
      Math.ceil(upperBound + padding),
    ];
  }

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

              <YAxis domain={yDomain} hide />

              {goalValue !== undefined && (
                <ReferenceArea
                  y1={0}
                  y2={goalValue}
                  fill="#3DD68C"
                  fillOpacity={0.08}
                  stroke="none"
                />
              )}

              {goalValue !== undefined && (
                <ReferenceLine
                  y={goalValue}
                  stroke="#3DD68C"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: goalLabel || `Goal: ${goalValue}`,
                    position: "insideTopRight",
                    fill: "#3DD68C",
                    fontSize: 11,
                  }}
                />
              )}

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
