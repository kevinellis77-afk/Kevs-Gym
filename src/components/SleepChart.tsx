import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  type DataPoint = {
    date: string;
    sleepQuality: number;
  };
  
  type Props = {
    data: DataPoint[];
    height?: number;
  };
  
  /**
   * Bare chart primitive, same pattern as ProgressChart/BPChart - no
   * title, no card wrapper. Plotted as bars rather than a line since
   * sleep quality is a discrete 1-5 rating, not a continuous
   * measurement. Sits directly under the BP chart on the Health
   * screen so the two can be eyeballed for correlation - same
   * 12-week window and "one slot per logged entry" spacing as the
   * other charts, though not pixel-synced date-for-date with BP,
   * since the two are logged independently and won't always share
   * exact dates.
   */
  export default function SleepChart({ data, height = 64 }: Props) {
    const hasData = data && data.length > 0;
  
    if (!hasData) {
      return (
        <p className="empty-state">Log a few nights to see this trend.</p>
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
              dataKey="date"
              tick={false}
              axisLine={{ stroke: "rgba(32,30,29,.4)", strokeWidth: 2 }}
              tickLine={false}
            />
  
            <YAxis hide domain={[0, 5]} />
  
            <Tooltip
              contentStyle={{
                background: "#201e1d",
                color: "#f3f2f2",
                border: 0,
                borderRadius: 0,
                fontSize: 12,
              }}
              formatter={(value:> [`${value}/5`, "Sleep"]}
            />
  
            <Bar dataKey="sleepQuality" fill="#201e1d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
