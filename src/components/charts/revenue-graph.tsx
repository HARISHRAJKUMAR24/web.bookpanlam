"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 👉 Accept chartData from parent
interface RevenueGraphProps {
  chartData: any[];
}

// Format numbers professionally
const formatCurrency = (value: number) => {
  return value?.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

// 👉 Export correct component name AND accept props
export default function RevenueGraph({ chartData }: RevenueGraphProps) {
  const [forecastPeriod, setForecastPeriod] = React.useState("3");
  const [isMobile, setIsMobile] = React.useState(false);

  // Check screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // MOVING AVERAGE CALCULATION
  const applyMovingAverage = (period: number) => {
    const updated = [...chartData];
    for (let i = period; i < updated.length; i++) {
      let sum = 0;
      for (let j = i - period; j < i; j++) {
        sum += updated[j].actual;
      }
      updated[i].forecast = Math.round(sum / period);
    }
    return updated;
  };

  const forecastedData = applyMovingAverage(parseInt(forecastPeriod));

  // Custom responsive legend formatter
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-4 px-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs md:text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-lg rounded-xl border border-gray-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
            Moving Average Forecast
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-600">
            Revenue trend with {forecastPeriod}-day moving average forecast
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[120px] md:w-[150px] bg-white border-gray-300 text-sm md:text-base">
              <SelectValue placeholder="Forecast Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2" className="text-sm md:text-base">2-Day MA</SelectItem>
              <SelectItem value="3" className="text-sm md:text-base">3-Day MA</SelectItem>
              <SelectItem value="5" className="text-sm md:text-base">5-Day MA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] lg:min-w-[800px]">
            <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
              <LineChart
                data={forecastedData}
                margin={{ 
                  top: 20, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 20, 
                  bottom: 10 
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ 
                    fill: "#6b7280", 
                    fontSize: isMobile ? 10 : 12 
                  }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                  interval={isMobile ? "preserveStartEnd" : 0}
                />

                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  domain={["auto", "auto"]}
                  width={isMobile ? 60 : 80}
                  tick={{ 
                    fill: "#6b7280", 
                    fontSize: isMobile ? 10 : 11 
                  }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(v: any) => formatCurrency(v)}
                  labelStyle={{ 
                    fontWeight: "bold",
                    fontSize: isMobile ? "12px" : "14px"
                  }}
                  contentStyle={{
                    fontSize: isMobile ? "12px" : "14px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}
                />

                <Legend 
                  verticalAlign="top" 
                  height={36}
                  content={isMobile ? renderLegend : undefined}
                  wrapperStyle={{
                    fontSize: isMobile ? "12px" : "14px",
                    paddingTop: isMobile ? "0" : "10px"
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Revenue"
                  stroke="#3b82f6"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ 
                    r: isMobile ? 4 : 6, 
                    fill: "#3b82f6", 
                    stroke: "#fff", 
                    strokeWidth: isMobile ? 1 : 2 
                  }}
                  activeDot={{ 
                    r: isMobile ? 6 : 8 
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#f97316"
                  strokeWidth={isMobile ? 2 : 3}
                  strokeDasharray="6 6"
                  dot={{ 
                    r: isMobile ? 4 : 6, 
                    fill: "#f97316", 
                    stroke: "#fff", 
                    strokeWidth: isMobile ? 1 : 2 
                  }}
                  activeDot={{ 
                    r: isMobile ? 6 : 8 
                  }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600">Forecast Period</div>
            <div className="text-base md:text-lg font-semibold text-gray-900">
              {forecastPeriod} Days
            </div>
          </div>

          {chartData.length > 0 && (
            <>
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <div className="text-xs md:text-sm text-blue-600">Latest Revenue</div>
                <div className="text-base md:text-lg font-semibold text-blue-700">
                  {formatCurrency(chartData[chartData.length - 1].actual)}
                </div>
              </div>

              <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
                <div className="text-xs md:text-sm text-orange-600">Next Forecast</div>
                <div className="text-base md:text-lg font-semibold text-orange-700">
                  {forecastedData[forecastedData.length - 1].forecast
                    ? formatCurrency(
                        forecastedData[forecastedData.length - 1].forecast
                      )
                    : "—"}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Instructions */}
        {isMobile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              ← Scroll horizontally to view full chart →
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}