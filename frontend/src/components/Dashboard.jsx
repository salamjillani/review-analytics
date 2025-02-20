import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];
const PRICE_RANGES = ["$0-25", "$26-50", "$51-100", "$100+"];
const ISSUE_LABELS = {
  LATE_DELIVERY: "Late Delivery",
  WRONG_ITEMS: "Wrong Items",
  DAMAGED: "Damaged Items",
  CUSTOMER_SERVICE: "Poor Service",
  FOOD_QUALITY: "Food Quality Issues",
};

const initialMetrics = {
  averageRatings: [],
  topAgents: [],
  bottomAgents: [],
  priceRanges: {},
  commonComplaints: [],
  locations: [],
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(initialMetrics);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    location: "",
    minRating: "",
    priceRange: "",
    hasDiscount: "",
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }
        const queryParams = new URLSearchParams(
          Object.entries(filters).filter(([_, value]) => value !== "")
        );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/analytics?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch metrics");

        const { data } = await response.json();
        setMetrics(data || initialMetrics);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [filters, navigate]);

  const getPriceRangeData = () => {
    return PRICE_RANGES.map((range) => ({
      name: range,
      value: metrics.priceRanges?.[range] || 0,
    }));
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs md:text-sm"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-base md:text-lg text-gray-600">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-base md:text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        {[
          {
            value: filters.location,
            onChange: (e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value })),
            options: [
              { value: "", label: "All Locations" },
              ...(metrics.locations?.map((loc) => ({
                value: loc,
                label: loc,
              })) || []),
            ],
          },
          {
            value: filters.minRating,
            onChange: (e) =>
              setFilters((prev) => ({ ...prev, minRating: e.target.value })),
            options: [
              { value: "", label: "All Ratings" },
              ...[1, 2, 3, 4, 5].map((rating) => ({
                value: rating,
                label: `Min ${rating}★`,
              })),
            ],
          },
          {
            value: filters.priceRange,
            onChange: (e) =>
              setFilters((prev) => ({ ...prev, priceRange: e.target.value })),
            options: [
              { value: "", label: "All Prices" },
              ...PRICE_RANGES.map((range) => ({
                value: range,
                label: range,
              })),
            ],
          },
          {
            value: filters.hasDiscount,
            onChange: (e) =>
              setFilters((prev) => ({ ...prev, hasDiscount: e.target.value })),
            options: [
              { value: "", label: "All Orders" },
              { value: "true", label: "With Discount" },
              { value: "false", label: "No Discount" },
            ],
          },
        ].map((filter, index) => (
          <select
            key={index}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            value={filter.value}
            onChange={filter.onChange}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">
              Average Ratings by Location
            </h3>
          </div>
          <div className="p-2 sm:p-3 lg:p-4 h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.averageRatings || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="averageRating"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">
              Orders by Price Range
            </h3>
          </div>
          <div className="p-2 sm:p-3 lg:p-4 h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPriceRangeData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="90%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {getPriceRangeData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">
              Top Performing Agents
            </h3>
          </div>
          <div className="p-2 sm:p-3 lg:p-4">
            <div className="space-y-2 sm:space-y-3">
              {metrics.topAgents?.map((agent) => (
                <div
                  key={agent._id}
                  className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm sm:text-base text-gray-700">
                    Agent {agent._id}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium">
                    {agent.avgRating?.toFixed(1)} ⭐
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">
              Most Common Issues
            </h3>
          </div>
          <div className="p-2 sm:p-3 lg:p-4">
            <div className="space-y-2 sm:space-y-3">
              {metrics.commonComplaints?.map((complaint) => (
                <div
                  key={complaint._id}
                  className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm sm:text-base text-gray-700">
                    {ISSUE_LABELS[complaint._id] || complaint._id}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium">
                    {complaint.count} reports
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
