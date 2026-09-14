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
  systolic: number;
  diastolic: number;
};

type Props = {
  data: DataPoint[];
  height?: number;
};

/**
 * Bare chart primitive, same pattern as ProgressChart - no title,
 * no wrapper. Two lines: systolic (solid, accent) and diastolic
 * (dashed, ink) - the palette only has two strong colors, so stroke
 * style carries the distinction rather than a third invented color.
 * Reference lines at 120/80 - standard clinical "normal" thresholds.
 */
export default function BPChart({ data, height = 100 }: Props) {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <p className="empty-state">Log a few entries to see this trend.</p>
    );
  }

  const lastIndex = data.length - 1;

  const squareDot =
    (color: string) =>
    (dotProps: any) => {
      const isLast = dotProps.index === lastIndex;
      const size = 3;

      return (
        <rect
          key={dotProps.index}
          x={dotProps.cx - size}
          y={dotProps.cy - size}
          width={size * 2}
          height={size * 2}
          fill={isLast ? "#201e1d" : color}
        />
      );
    };

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

          <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />

          <ReferenceLine
            y={120}
            stroke="#605d5d"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />

          <ReferenceLine
            y={80}
            stroke="#605d5d"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />

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
            dataKey="systolic"
            stroke="#ec3013"
            strokeWidth={2}
            dot={squareDot("#ec3013")}
            activeDot={{ r: 4 }}
          />

          <Line
            type="linear"
            dataKey="diastolic"
            stroke="#201e1d"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={squareDot("#201e1d")}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
