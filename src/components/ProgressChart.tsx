import {
    LineChart,
    Line,
    XAxis,
    YAxis,
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
    return (
      <div
        className="exercise-card"
        style={{
          marginTop: "20px",
        }}
      >
        <h3>{title}</h3>
  
        <div
          style={{
            width: "100%",
            height: 250,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" />
  
              <YAxis />
  
              <Tooltip />
  
              <Line
                type="monotone"
                dataKey="weight"
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }