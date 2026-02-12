"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SimplePointLineChartProps {
  chartData: any[];
  title?: string;
  description?: string;
}

const formatCurrency = (value: number) => {
  return value?.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

export default function SimplePointLineChart({ 
  chartData, 
  title = "Revenue Overview",
  description = "Revenue trends over time"
}: SimplePointLineChartProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          <p className="text-blue-600 font-medium">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          {payload[0]?.payload?.appointments && (
            <p className="text-gray-600 text-sm mt-1">
              Appointments: {payload[0].payload.appointments}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot component
  const renderCustomDot = (props: any) => {
    const { cx, cy, value } = props;
    
    // Determine dot size based on value (larger for higher values)
    const maxValue = Math.max(...chartData.map(d => d.actual || 0));
    const size = 4 + (value / maxValue) * 4; // 4-8px based on value
    
    return (
      <g>
        {/* Outer circle (white border) */}
        <circle
          cx={cx}
          cy={cy}
          r={size + 2}
          fill="white"
        />
        {/* Inner colored circle */}
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill="#3b82f6"
          className="hover:fill-blue-700 transition-colors"
        />
        {/* Center dot for better visibility */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 3}
          fill="white"
        />
      </g>
    );
  };

  return (
    <Card className="shadow-sm rounded-lg border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
              <LineChart
                data={chartData}
                margin={{ 
                  top: 10, 
                  right: isMobile ? 5 : 20, 
                  left: isMobile ? 0 : 10, 
                  bottom: 5 
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0" 
                  vertical={false}
                />
                
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: isMobile ? 10 : 11 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                  interval={isMobile ? "preserveStartEnd" : 0}
                />
                
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  domain={[0, "auto"]}
                  width={isMobile ? 50 : 70}
                  tick={{ fill: "#6b7280", fontSize: isMobile ? 9 : 10 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  wrapperStyle={{ fontSize: isMobile ? "11px" : "12px" }}
                />
                
                {/* Main line connecting all points */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={renderCustomDot}
                  activeDot={{
                    r: 8,
                    fill: "#1d4ed8",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Mobile Instructions */}
        {isMobile && (
          <div className="mt-4 p-2 bg-blue-50 rounded text-center">
            <p className="text-xs text-blue-600">
              ← Scroll horizontally to see all data points →
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}