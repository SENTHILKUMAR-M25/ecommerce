import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnalytics } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, ShoppingBag, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading || !analytics) return <LoadingSpinner size="lg" />;

  const stats = [
    { title: 'Total Revenue', value: `₹${analytics.totalRevenue.toFixed(2)}`, desc: 'Overall gross catalog revenues', icon: <DollarSign className="w-6 h-6 text-cyan-500" />, bg: 'bg-cyan-500/10' },
    { title: 'Total Sales', value: analytics.totalOrders, desc: 'Successful carrier deliveries', icon: <ShoppingBag className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-500/10' },
    { title: 'Customer Base', value: analytics.totalUsers, desc: 'Registered shoppers accounts', icon: <Users className="w-6 h-6 text-emerald-500" />, bg: 'bg-emerald-500/10' }
  ];

  // SVG Chart Configurations
  const trend = analytics.salesHistory || [];
  const chartHeight = 200;
  const chartWidth = 500;
  
  // Calculate SVG line points based on actual dynamic monthly sales trend data
  let pointsStr = '';
  let fillPointsStr = '';
  if (trend.length > 0) {
    const maxSales = Math.max(...trend.map((t) => t.sales), 100);
    const xStep = chartWidth / (trend.length - 1 || 1);
    
    const coordPoints = trend.map((t, idx) => {
      const x = idx * xStep;
      // Invert Y axis for SVG rendering
      const y = chartHeight - (t.sales / maxSales) * (chartHeight - 40) - 20;
      return { x, y };
    });

    pointsStr = coordPoints.map(p => `${p.x},${p.y}`).join(' ');
    fillPointsStr = `0,${chartHeight} ${pointsStr} ${chartWidth},${chartHeight}`;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Review live financial statistics and customer counts.</p>
      </div>

      {/* 3. CORE STATISTICS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-455">{s.title}</span>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.desc}</p>
            </div>
            <div className={`p-4 rounded-2xl ${s.bg}`}>
              {s.icon}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Animated Area Sales Line Chart using pure native SVG */}
        <section className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-cyan-500" />
              <span>Revenue Trend (Trailing 6 Months)</span>
            </h3>
          </div>

          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Insufficient transactional sales logs to plot chart coordinates.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Chart */}
              <div className="w-full h-56">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Dynamic Area Fill */}
                  <polygon points={fillPointsStr} fill="url(#chartGradient)" />

                  {/* Neon Line Path */}
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3.5"
                    points={pointsStr}
                  />

                  {/* Gradient for Line */}
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>

                  {/* Data Point Circles */}
                  {trend.map((t, idx) => {
                    const xStep = chartWidth / (trend.length - 1 || 1);
                    const maxSales = Math.max(...trend.map((x) => x.sales), 100);
                    const x = idx * xStep;
                    const y = chartHeight - (t.sales / maxSales) * (chartHeight - 40) - 20;
                    return (
                      <g key={idx} className="group">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          className="fill-cyan-500 stroke-white dark:stroke-slate-950 stroke-2 hover:r-7 transition-all cursor-pointer"
                        />
                        {/* Hover Tooltip box */}
                        <title>{`${t.month}: ₹${t.sales}`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 px-1 font-bold uppercase tracking-wider">
                {trend.map((t, idx) => <span key={idx}>{t.month}</span>)}
              </div>
            </div>
          )}
        </section>

        {/* Best Sellers Leaderboard */}
        <section className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-6">
          <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <ShoppingBag className="w-4.5 h-4.5 text-indigo-500" />
            <span>Best-Selling Rankings</span>
          </h3>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {analytics.bestSellers.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-205 dark:border-slate-805 rounded-2xl text-center text-slate-400 text-xs">
                No catalog item sales tracked yet.
              </div>
            ) : (
              analytics.bestSellers.map((item, idx) => (
                <div key={item._id} className="flex justify-between items-center gap-3 text-xs pb-3 border-b border-slate-100 dark:border-slate-85 last:border-0 last:pb-0">
                  <div className="flex gap-2.5 items-center min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Total Revenue: ₹{item.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-cyan-650 dark:text-cyan-400 whitespace-nowrap bg-cyan-500/5 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full">
                    {item.totalSold} sold
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
