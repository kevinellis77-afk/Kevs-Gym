import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  date: string;
  weight: number;
};

type Props = {
  data: DataPoint[];
  height?: number;
  // Optional goal line - a dashed reference line at goalValue.
  // No filled area, per the design system's "no area fill" rule.
  goalValue?: number;
  goalLabel?: string;
};

/**
 * Bare chart primitive - no title, no card wrapper, no trend text.
 * Each page composes its own header (using .chart-block/.chart-head/
 * .chart-label/.chart-delta) around this, since the header format
 * differs per screen.
 */
export default function ProgressChart({
  data,
  height = 100,
  goalValue,
  goalLabel,
}: Props) {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <p className="empty-state">Log a few sessions to see this trend.</p>
    );
  }

  const lastIndex = data.length - 1;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis
            dataKey="date"
            tick={false}
            axisLine={{ stroke: "rgba(32,30,29,.4)", strokeWidth: 2 }}
            tickLine={false}
          />

          <YAxis
            hide
            domain={
              goalValue !== undefined
                ? [
                    (dataMin: number) =>
                      Math.min(dataMin, goalValue) - 2,
                    (dataMax: number) =>
                      Math.max(dataMax, goalValue) + 2,
                  ]
                : ["dataMin - 2", "dataMax + 2"]
            }
          />

          {goalValue !== undefined && (
            <ReferenceLine
              y={goalValue}
              stroke="#605d5d"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: goalLabel || `Goal ${goalValue}`,
                position: "insideTopRight",
                fill: "#605d5d",
                fontSize: 10,
              }}
            />
          )}

          <Tooltip
            contentStyle={{
              background: "#201e1d",
              color: "#f3f2f2",
              border: 0,
              borderRadius: 0,
              fontSize: 12,
            }}
          />

          <Line
            type="linear"
            dataKey="weight"
            stroke="#ec3013"
            strokeWidth={2}
            dot={(dotProps: any) => {
              const isLast = dotProps.index === lastIndex;
              const size = 3;
              return (
                <rect
                  key={dotProps.index}
                  x={dotProps.cx - size}
                  y={dotProps.cy - size}
                  width={size * 2}
                  height={size * 2}
                  fill={isLast ? "#201e1d" : "#ec3013"}
                />
              );
            }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
