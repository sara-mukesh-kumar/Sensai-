"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      // sort assessments by date ascending before mapping
      const sorted = [...assessments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      const formattedData = sorted.map((assessment, index) => ({
        date: format(new Date(assessment.createdAt), "MMM dd HH:mm"),
        score: Number(assessment.quizScore),
        id: index,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Performance Trend
          </CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-lg">
              No assessments yet. Take a quiz to see your performance trend!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} syncId="performance-chart">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" tickFormatter={(i) => chartData[i]?.date} />
              <YAxis domain={[0, 100]} />
              <Tooltip
  cursor={{
    stroke: "white",
    strokeWidth: 1,
  }}
  isAnimationActive={false}
  wrapperStyle={{ outline: "none" }}
  content={({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-background border rounded-lg px-3 py-2 shadow-md">
        <p className="text-sm font-semibold">
          Score: {data.score}%
        </p>
        <p className="text-xs text-muted-foreground">
          {data.date}
        </p>
      </div>
    );
  }}
/>
              <Line
  type="monotone"
  dataKey="score"
  stroke="white"
  strokeWidth={1}
  dot={{ r: 4, fill: "white" }}
  activeDot={{ r: 7, stroke: "white", strokeWidth: 2 }}
  connectNulls={true}
/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
