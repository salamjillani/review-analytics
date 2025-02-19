import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get('/api/analytics');
      setMetrics(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Agent Performance</h2>
      <BarChart width={600} height={300} data={metrics.averageRatings}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="location" />
        <YAxis />
        <Bar dataKey="rating" fill="#8884d8" />
      </BarChart>
    </div>
  );
}