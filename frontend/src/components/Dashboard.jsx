import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [filters, setFilters] = useState({ location: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/analytics', { params: filters });
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <select
          className="form-select"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          {metrics.locations?.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <h4>Average Ratings</h4>
            <BarChart width={500} height={300} data={metrics.averageRatings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageRating" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <h4>Order Accuracy</h4>
            <PieChart width={500} height={300}>
              <Pie
                data={metrics.accuracyStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {metrics.accuracyStats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="chart-container">
            <h4>Top Performers</h4>
            <ul className="list-group">
              {metrics.topAgents?.map((agent) => (
                <li key={agent._id} className="list-group-item d-flex justify-content-between">
                  <span>Agent {agent._id}</span>
                  <span>{agent.avgRating?.toFixed(1)} ⭐</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-container">
            <h4>Needs Improvement</h4>
            <ul className="list-group">
              {metrics.bottomAgents?.map((agent) => (
                <li key={agent._id} className="list-group-item d-flex justify-content-between">
                  <span>Agent {agent._id}</span>
                  <span>{agent.avgRating?.toFixed(1)} ⭐</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}