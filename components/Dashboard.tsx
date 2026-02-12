import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { DashboardStat } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, CreditCard } from 'lucide-react';

const dataSpendByDept = [
  { name: 'Sales', amount: 450000 },
  { name: 'Eng', amount: 320000 },
  { name: 'Marketing', amount: 280000 },
  { name: 'HR', amount: 120000 },
  { name: 'Exec', amount: 550000 },
];

const dataSpendTrend = [
  { month: 'Jan', spend: 120000 },
  { month: 'Feb', spend: 190000 },
  { month: 'Mar', spend: 150000 },
  { month: 'Apr', spend: 220000 },
  { month: 'May', spend: 280000 },
  { month: 'Jun', spend: 240000 },
];

const dataCategory = [
  { name: 'Flights', value: 450000 },
  { name: 'Hotels', value: 350000 },
  { name: 'Meals', value: 150000 },
  { name: 'Transport', value: 80000 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const StatCard: React.FC<{ stat: DashboardStat; icon: React.ReactNode }> = ({ stat, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
      <div className={`flex items-center mt-2 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
        {stat.trendUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        <span>{stat.trend}</span>
      </div>
    </div>
    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const stats: (DashboardStat & { icon: React.ReactNode })[] = [
    { label: 'Total T&E Spend (YTD)', value: '₹12,45,000', trend: '+12.5% vs last year', trendUp: false, icon: <span className="text-xl font-bold">₹</span> },
    { label: 'Pending Requests', value: '18', trend: '-2 vs last week', trendUp: true, icon: <Briefcase /> },
    { label: 'Avg. Trip Cost', value: '₹18,500', trend: '+5% vs last month', trendUp: false, icon: <CreditCard /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spend Trend (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataSpendTrend}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spend']}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Department */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spend by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataSpendByDept} layout="vertical">
                <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Expense Categories</h3>
          </div>
          <div className="h-72 flex flex-col md:flex-row items-center justify-around">
            <div className="w-full md:w-1/2 h-full">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
               {dataCategory.map((cat, idx) => (
                 <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">{cat.name}</p>
                    <p className="text-xl font-bold" style={{ color: COLORS[idx % COLORS.length] }}>₹{cat.value.toLocaleString()}</p>
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