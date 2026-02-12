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
import { Calendar, Calendar1 } from "iconsax-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimplePointLineChartProps {
  chartData: any[];
  title?: string;
  description?: string;
}

type ViewType = "year" | "month";

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
  const [view, setView] = React.useState<ViewType>("month");
  const [selectedYear, setSelectedYear] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");
  const [filteredData, setFilteredData] = React.useState<any[]>([]);
  const [availableYears, setAvailableYears] = React.useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = React.useState<string[]>([]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Format date for CHART display (YYYY-MM-DD -> DD MMM)
  const formatChartDate = (dateStr: string) => {
    if (!dateStr) return "";

    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`; // Returns 15 Jan, 16 Jan etc.
      }
    }
    return dateStr;
  };

  // Format month for DROPDOWN display (YYYY-MM -> JAN 2025, FEB 2025)
  const formatDropdownMonth = (monthStr: string) => {
    if (!monthStr) return "";

    if (monthStr.includes("-")) {
      const parts = monthStr.split("-");
      if (parts.length >= 2) {
        const year = parts[0];
        const month = parts[1];
        const monthIndex = parseInt(month) - 1;
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
    return monthStr;
  };

  // Extract unique years from chartData
  // Extract unique years from chartData
  React.useEffect(() => {
    if (!chartData || chartData.length === 0) return;

    // --- EXTRACT YEARS ---
    const years = new Set<string>();
    chartData.forEach((item) => {
      if (item.month) {
        if (item.month.includes("-")) {
          const year = item.month.split("-")[0];
          years.add(year);
        }
      }
    });

    // Sort years in DESCENDING order for dropdown (most recent first)
    const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    setAvailableYears(sortedYears);

    // Set default selected year to the most recent year
    if (sortedYears.length > 0 && !selectedYear) {
      setSelectedYear(sortedYears[0]);
    }
  }, [chartData]);

  // Extract months when selected year changes
  React.useEffect(() => {
    if (!chartData || chartData.length === 0 || !selectedYear) return;

    // --- EXTRACT MONTHS from selected year ---
    const months = new Set<string>();

    chartData.forEach((item) => {
      if (!item.month) return;

      // Get month from YYYY-MM-DD format (dates)
      if (item.month.includes("-")) {
        const parts = item.month.split("-");
        if (parts.length >= 2) {
          const year = parts[0];
          const month = parts[1];
          if (year === selectedYear) {
            months.add(`${year}-${month}`);
          }
        }
      }
    });

    const sortedMonths = Array.from(months).sort((a, b) => {
      const [yearA, monthA] = a.split("-");
      const [yearB, monthB] = b.split("-");
      if (yearA === yearB) {
        return parseInt(monthA) - parseInt(monthB);
      }
      return parseInt(yearA) - parseInt(yearB);
    });

    setAvailableMonths(sortedMonths);

    // Set default selected month to the latest month
    if (sortedMonths.length > 0) {
      if (selectedMonth && sortedMonths.includes(selectedMonth)) {
        // Keep current selection
      } else {
        setSelectedMonth(sortedMonths[sortedMonths.length - 1]);
      }
    } else {
      setSelectedMonth("");
    }
  }, [chartData, selectedYear]);

  // Filter data based on view and selections - FIXED YEAR SORTING
  React.useEffect(() => {
    if (!chartData || chartData.length === 0) {
      setFilteredData([]);
      return;
    }

    if (view === "year") {
      // Group by year
      const yearlyMap = new Map();

      chartData.forEach((item) => {
        if (!item.month) return;

        let year: string;
        if (item.month.includes("-")) {
          year = item.month.split("-")[0];
        } else {
          year = item.month;
        }

        if (!yearlyMap.has(year)) {
          yearlyMap.set(year, {
            month: year,
            actual: 0,
            appointments: 0
          });
        }
        const existing = yearlyMap.get(year);
        existing.actual += item.actual || 0;
        existing.appointments += item.appointments || 0;
      });

      // FIXED: Sort in ASCENDING order (oldest to newest) so current/upcoming year appears on RIGHT
      const groupedData = Array.from(yearlyMap.values())
        .sort((a, b) => parseInt(a.month) - parseInt(b.month));

      setFilteredData(groupedData);
    }
    else if (view === "month") {
      // MONTHLY VIEW - Show DATE WISE report for selected month
      if (selectedYear && selectedMonth) {
        const [year, month] = selectedMonth.split("-");

        // Filter data for selected month and group by date
        const dateMap = new Map();

        chartData
          .filter(item => {
            if (!item.month) return false;

            // Get YYYY-MM-DD format dates
            if (item.month.includes("-") && item.month.split("-").length === 3) {
              const [itemYear, itemMonth] = item.month.split("-");
              return itemYear === year && itemMonth === month;
            }
            return false;
          })
          .forEach(item => {
            const date = item.month; // YYYY-MM-DD

            if (!dateMap.has(date)) {
              dateMap.set(date, {
                month: date, // Will format for display
                actual: 0,
                appointments: 0
              });
            }

            const existing = dateMap.get(date);
            existing.actual += item.actual || 0;
            existing.appointments += item.appointments || 0;
          });

        // Convert to array and format for display
        const monthData = Array.from(dateMap.values())
          .map(item => ({
            ...item,
            month: formatChartDate(item.month) // Convert to "15 Jan", "16 Jan" etc.
          }))
          .sort((a, b) => {
            // Sort by date
            return a.month.localeCompare(b.month);
          });

        setFilteredData(monthData);
      } else {
        setFilteredData([]);
      }
    }
  }, [chartData, view, selectedYear, selectedMonth]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">
            {view === "year" && `Year ${label}`}
            {view === "month" && label}
          </p>
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
    const maxValue = Math.max(...(filteredData.map(d => d.actual || 0).filter(v => !isNaN(v))), 1);
    const size = 4 + (value / maxValue) * 4;

    return (
      <g>
        <circle cx={cx} cy={cy} r={size + 2} fill="white" />
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill="#3b82f6"
          className="hover:fill-blue-700 transition-colors"
        />
        <circle cx={cx} cy={cy} r={size / 3} fill="white" />
      </g>
    );
  };

  return (
    <Card className="shadow-sm rounded-lg border border-gray-200">
      <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">
            {view === "year" ? "Yearly Revenue" : "Daily Revenue (Date Wise)"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {view === "year" && "Annual revenue comparison"}
            {view === "month" && selectedMonth && `Revenue for ${formatDropdownMonth(selectedMonth)}`}
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* View Toggle Buttons - Only Yearly and Monthly */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("year")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${view === "year"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Calendar size={isMobile ? 14 : 16} variant={view === "year" ? "Bold" : "Outline"} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Yearly</span>
            </button>
            <button
              onClick={() => setView("month")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${view === "month"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Calendar1 size={isMobile ? 14 : 16} variant={view === "month" ? "Bold" : "Outline"} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Monthly</span>
            </button>
          </div>

          {/* Year Selector */}
          {availableYears.length > 0 && (
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                setSelectedYear(value);
                setSelectedMonth("");
              }}
            >
              <SelectTrigger className="w-[100px] sm:w-[120px] h-8 sm:h-9 text-xs sm:text-sm">
                <Calendar size={14} className="mr-1" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year} className="text-xs sm:text-sm">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Month Selector - Required for monthly view */}
          {view === "month" && availableMonths.length > 0 && (
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[140px] sm:w-[160px] h-8 sm:h-9 text-xs sm:text-sm">
                <Calendar1 size={14} className="mr-1" />
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month} className="text-xs sm:text-sm">
                    {formatDropdownMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredData.length > 0 ? (
          <>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px] lg:min-w-full">
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
                  <LineChart
                    data={filteredData}
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

           
          </>
        ) : (
          <div className="flex items-center justify-center h-[250px] sm:h-[350px]">
            <p className="text-gray-500 text-sm">
              {view === "month" && !selectedMonth
                ? "Please select a month to view date-wise revenue"
                : "No data available for the selected period"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}