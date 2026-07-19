"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function DifficultyRadar({ data }: { data: { difficulty: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="difficulty" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
        <Radar dataKey="count" stroke="#E10600" fill="#E10600" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
