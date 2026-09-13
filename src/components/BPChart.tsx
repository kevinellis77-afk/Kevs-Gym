import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
  } from "recharts";
  
  type Props = {
    data: {
      date: string;
      systolic: number;
      diastolic: number;
    }[];
  };
  
  /**
   * Blood pressure trend - two lines (systolic/diastolic) with dashed
   * reference lines at 120 and 80, the standard clinical thresholds
   * for "normal" blood pressure. These are widely recognized medical
   * reference points, not a personalized target.
   */
  export default function BPChart({ data }: Props) {
    const hasData = data && data.length > 0;
  
    return (
      <div className="card">
        <h3 className="exercise-name" style={{ marginBottom: "4px" }}>
          Blood Pressure Trend
        </h3>
  
        {!hasData && (
          <p className="empty-state">
            Log a few entries to see this trend.
          </p>
        )}
  
        {hasData && (
          <div style={{ width: "100%", height: 160, marginTop: "8px" }}>
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
  
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
  
                <ReferenceLine
                  y={120}
                  stroke="#3DD68C"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Normal (120/80)",
                    position: "insideTopRight",
                    fill: "#3DD68C",
                    fontSize: 11,
                  }}
                />
  
                <ReferenceLine
                  y={80}
                  stroke="#3DD68C"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
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
  
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#9AA3B5" }}
                />
  
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="#5E8DFF"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#5E8DFF", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
  
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="#F5B94D"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#F5B94D", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }
  