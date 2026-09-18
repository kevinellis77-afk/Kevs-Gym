import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
  } from "recharts";
  
  type DataPoint = {
    label: string;
    sessions: number;
  };
  
  type Props = {
    data: DataPoint[];
    target: number;
    height?: number;
  };
  
  /**
   * Bare chart primitive, same pattern as BPChart/SleepChart - no
   * title, no wrapper. One bar per rolling 7-day window, oldest to
   * newest, with a reference line at the weekly target. Bars that
   * meet or beat the target are ink; bars below it are accent red -
   * the same red the "Something Hurt" flag uses elsewhere, so a week
   * that fell short reads as the same "pay attention" signal without
   * needing to read the axis.
   */
  export default function ConsistencyChart({
    data,
    target,
    height = 90,
  }: Props) {
    const hasData = data && data.length > 0;
  
    if (!hasData) {
      return (
        <p className="empty-state">
          Log a few sessions to see this trend.
        </p>
      );
    }
  
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
          >
            <XAxis
              dataKey="label"
              tick={false}
              axisLine={{ stroke: "rgba(32,30,29,.4)", strokeWidth: 2 }}
              tickLine={false}
            />
  
            <YAxis
              hide
              domain={[0, (dataMax: number) => Math.max(dataMax, target)]}
            />
  
            <ReferenceLine
              y={target}
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
              formatter={(value) => [
                `${value} session${value === 1 ? "" : "s"}`,
                "",
              ]}
            />
  
            <Bar dataKey="sessions">
              {data.map((point, index) => (
                <Cell
                  key={index}
                  fill={point.sessions >= target ? "#201e1d" : "#ec3013"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
