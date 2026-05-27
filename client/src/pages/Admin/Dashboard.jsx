// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchAnalytics } from '../../redux/slices/adminSlice';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import { DollarSign, ShoppingBag, Users, Calendar, TrendingUp } from 'lucide-react';

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { analytics, loading } = useSelector((state) => state.admin);

//   useEffect(() => {
//     dispatch(fetchAnalytics());
//   }, [dispatch]);

//   if (loading || !analytics) return <LoadingSpinner size="lg" />;

//   const stats = [
//     { title: 'Total Revenue', value: `₹${analytics.totalRevenue.toFixed(2)}`, desc: 'Overall gross catalog revenues', icon: <DollarSign className="w-6 h-6 text-cyan-500" />, bg: 'bg-cyan-500/10' },
//     { title: 'Total Sales', value: analytics.totalOrders, desc: 'Successful carrier deliveries', icon: <ShoppingBag className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-500/10' },
//     { title: 'Customer Base', value: analytics.totalUsers, desc: 'Registered shoppers accounts', icon: <Users className="w-6 h-6 text-emerald-500" />, bg: 'bg-emerald-500/10' }
//   ];

//   // SVG Chart Configurations
//   const trend = analytics.salesHistory || [];
//   const chartHeight = 200;
//   const chartWidth = 500;
  
//   // Calculate SVG line points based on actual dynamic monthly sales trend data
//   let pointsStr = '';
//   let fillPointsStr = '';
//   if (trend.length > 0) {
//     const maxSales = Math.max(...trend.map((t) => t.sales), 100);
//     const xStep = chartWidth / (trend.length - 1 || 1);
    
//     const coordPoints = trend.map((t, idx) => {
//       const x = idx * xStep;
//       // Invert Y axis for SVG rendering
//       const y = chartHeight - (t.sales / maxSales) * (chartHeight - 40) - 20;
//       return { x, y };
//     });

//     pointsStr = coordPoints.map(p => `${p.x},${p.y}`).join(' ');
//     fillPointsStr = `0,${chartHeight} ${pointsStr} ${chartWidth},${chartHeight}`;
//   }

//   return (
//     <div className="space-y-8 pb-16">
//       {/* Welcome header */}
//       <div>
//         <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
//         <p className="text-sm text-slate-500 mt-1">Review live financial statistics and customer counts.</p>
//       </div>

//       {/* 3. CORE STATISTICS CARDS */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
//         {stats.map((s, idx) => (
//           <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between hover:border-cyan-500/20 transition-all duration-300">
//             <div className="space-y-1.5">
//               <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-455">{s.title}</span>
//               <p className="text-2xl sm:text-3xl font-black">{s.value}</p>
//               <p className="text-[10px] text-slate-400">{s.desc}</p>
//             </div>
//             <div className={`p-4 rounded-2xl ${s.bg}`}>
//               {React.cloneElement(s.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
//             </div>
//           </div>
//         ))}
//       </section>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Animated Area Sales Line Chart using pure native SVG */}
//         <section className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-white/10 shadow-lg space-y-6">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
//               <TrendingUp className="w-4.5 h-4.5 text-cyan-500" />
//               <span>Revenue Trend</span>
//             </h3>
//             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase">Last 6 Months</span>
//           </div>

//           {trend.length === 0 ? (
//             <div className="h-48 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
//               Insufficient sales data to plot chart.
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Responsive SVG Chart */}
//               <div className="w-full h-[200px] sm:h-[300px]">
//                 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
//                   <defs>
//                     <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
//                       <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
//                     </linearGradient>
//                   </defs>

//                   {/* Dynamic Area Fill */}
//                   <polygon points={fillPointsStr} fill="url(#chartGradient)" />

//                   {/* Neon Line Path */}
//                   <polyline
//                     fill="none"
//                     stroke="url(#lineGradient)"
//                     strokeWidth="4"
//                     points={pointsStr}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />

//                   {/* Gradient for Line */}
//                   <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
//                     <stop offset="0%" stopColor="#06b6d4" />
//                     <stop offset="100%" stopColor="#6366f1" />
//                   </linearGradient>

//                   {/* Data Point Circles */}
//                   {trend.map((t, idx) => {
//                     const xStep = chartWidth / (trend.length - 1 || 1);
//                     const maxSales = Math.max(...trend.map((x) => x.sales), 100);
//                     const x = idx * xStep;
//                     const y = chartHeight - (t.sales / maxSales) * (chartHeight - 40) - 20;
//                     return (
//                       <g key={idx}>
//                         <circle
//                           cx={x}
//                           cy={y}
//                           r="6"
//                           className="fill-white dark:fill-slate-100 stroke-cyan-500 stroke-2 hover:r-8 transition-all cursor-pointer shadow-xl"
//                         />
//                         <title>{`${t.month}: ₹${t.sales}`}</title>
//                       </g>
//                     );
//                   })}
//                 </svg>
//               </div>

//               {/* X Axis Labels */}
//               <div className="flex justify-between text-[10px] text-slate-450 px-0.5 font-black uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-4">
//                 {trend.map((t, idx) => <span key={idx}>{t.month}</span>)}
//               </div>
//             </div>
//           )}
//         </section>

//         {/* Best Sellers Leaderboard */}
//         <section className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-white/10 shadow-lg space-y-6">
//           <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
//             <ShoppingBag className="w-4.5 h-4.5 text-indigo-500" />
//             <span>Top Rankings</span>
//           </h3>

//           <div className="space-y-5 max-h-[400px] lg:max-h-none overflow-y-auto pr-1 scrollbar-hide">
//             {analytics.bestSellers.length === 0 ? (
//               <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-400 text-xs">
//                 No rankings available yet.
//               </div>
//             ) : (
//               analytics.bestSellers.map((item, idx) => (
//                 <div key={item._id} className="flex justify-between items-center gap-4 text-xs pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 group">
//                   <div className="flex gap-3 items-center min-w-0">
//                     <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-900 text-[10px] font-black flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
//                       {idx + 1}
//                     </span>
//                     <div className="min-w-0">
//                       <p className="font-bold truncate text-slate-800 dark:text-slate-100">{item.name}</p>
//                       <p className="text-[10px] text-slate-400 font-medium">Revenue: ₹{item.revenue.toLocaleString()}</p>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <span className="font-extrabold text-cyan-600 dark:text-cyan-400 whitespace-nowrap bg-cyan-500/10 px-3 py-1 rounded-full text-[10px]">
//                       {item.totalSold} Units
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAnalytics } from "../../redux/slices/adminSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  BarChart3,
  Crown,
} from "lucide-react";

import { motion } from "framer-motion";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { analytics, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const trend = analytics?.salesHistory || [];

  const stats = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: "Total Revenue",
        value: `₹${analytics.totalRevenue.toLocaleString()}`,
        desc: "Overall store revenue",
        icon: DollarSign,
        color:
          "from-cyan-500 to-blue-600",
        glow:
          "shadow-cyan-500/20",
        bg:
          "bg-cyan-500/10",
      },
      {
        title: "Total Orders",
        value: analytics.totalOrders,
        desc: "Completed customer orders",
        icon: ShoppingBag,
        color:
          "from-indigo-500 to-violet-600",
        glow:
          "shadow-indigo-500/20",
        bg:
          "bg-indigo-500/10",
      },
      {
        title: "Customers",
        value: analytics.totalUsers,
        desc: "Registered accounts",
        icon: Users,
        color:
          "from-emerald-500 to-green-600",
        glow:
          "shadow-emerald-500/20",
        bg:
          "bg-emerald-500/10",
      },
    ];
  }, [analytics]);

  if (loading || !analytics) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Chart configs
  const chartHeight = 280;
  const chartWidth = 700;

  let pointsStr = "";
  let fillPointsStr = "";

  if (trend.length > 0) {
    const maxSales = Math.max(
      ...trend.map((t) => t.sales),
      100
    );

    const xStep =
      chartWidth / (trend.length - 1 || 1);

    const points = trend.map((t, idx) => {
      const x = idx * xStep;

      const y =
        chartHeight -
        (t.sales / maxSales) *
          (chartHeight - 60) -
        30;

      return { x, y };
    });

    pointsStr = points
      .map((p) => `${p.x},${p.y}`)
      .join(" ");

    fillPointsStr = `0,${chartHeight} ${pointsStr} ${chartWidth},${chartHeight}`;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Activity className="w-4 h-4" />
            Live Analytics
          </div>

          <h1 className="text-4xl md:text-5xl text-slate-900 dark:text-white font-black tracking-tight">
            Admin Dashboard
          </h1>

          <p className="text-slate-500 mt-3 text-sm md:text-base max-w-2xl">
            Track revenue performance, customer growth,
            best-selling products and store insights.
          </p>
        </div>

      </motion.div>

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;

          return (
            <motion.div
              key={idx}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: idx * 0.08,
              }}
              className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-7 shadow-2xl ${s.glow} group`}
            >
              {/* glow */}
              <div
                className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r ${s.color} opacity-10 blur-3xl rounded-full group-hover:scale-125 transition-all duration-500`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.25em] font-black text-slate-400">
                    {s.title}
                  </p>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {s.value}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {s.desc}
                  </p>
                </div>

                <div
                  className={`w-16 h-16 rounded-2xl ${s.bg} border border-white/10 flex items-center justify-center`}
                >
                  <Icon className="w-7 h-7 text-black dark:text-white" />
                </div>
              </div>

              <div className="relative z-10 mt-7 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ArrowUpRight className="w-4 h-4" />
                <span>Performance Increased</span>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* CHART + TOP SELLERS */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
        {/* CHART */}
        <motion.section
          initial={{
            opacity: 0,
            y: 35,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="2xl:col-span-2 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl overflow-hidden relative"
        >
          {/* background glow */}
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full" />

          <div className="relative z-10">
            {/* heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-black uppercase tracking-widest">
                  <BarChart3 className="w-4 h-4" />
                  Revenue Analytics
                </div>

                <h2 className="text-2xl font-black mt-4 * tracking-tight text-slate-900 dark:text-white">
                  Revenue Trend
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Store revenue generated over recent months.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
                  Last 6 Months
                </div>
              </div>
            </div>

            {/* chart */}
            {trend.length === 0 ? (
              <div className="h-[320px] rounded-[2rem] border border-dashed border-white/10 flex items-center justify-center text-slate-900 dark:text-white text-sm">
                No chart data available.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-full h-[260px] md:h-[320px]">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                          stopOpacity="0.35"
                        />

                        <stop
                          offset="100%"
                          stopColor="#06b6d4"
                          stopOpacity="0"
                        />
                      </linearGradient>

                      <linearGradient
                        id="lineGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                        />

                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                        />
                      </linearGradient>
                    </defs>

                    {/* area */}
                    <polygon
                      points={fillPointsStr}
                      fill="url(#areaGradient)"
                    />

                    {/* line */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="5"
                      points={pointsStr}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* points */}
                    {trend.map((t, idx) => {
                      const maxSales = Math.max(
                        ...trend.map((x) => x.sales),
                        100
                      );

                      const xStep =
                        chartWidth /
                        (trend.length - 1 || 1);

                      const x = idx * xStep;

                      const y =
                        chartHeight -
                        (t.sales / maxSales) *
                          (chartHeight - 60) -
                        30;

                      return (
                        <g key={idx}>
                          <circle
                            cx={x}
                            cy={y}
                            r="7"
                            fill="#fff"
                            stroke="#06b6d4"
                            strokeWidth="4"
                            className="hover:r-9 transition-all duration-300"
                          />

                          <title>
                            {`${t.month}: ₹${t.sales}`}
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* labels */}
                <div className="grid grid-cols-6 gap-2 border-t border-white/5 pt-5">
                  {trend.map((t, idx) => (
                    <div
                      key={idx}
                      className="text-center"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                        {t.month}
                      </p>

                      <p className="text-xs font-bold mt-1">
                        ₹{t.sales}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* BEST SELLERS */}
        <motion.section
          initial={{
            opacity: 0,
            y: 35,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* glow */}
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/10 blur-[100px] rounded-full" />

          <div className="relative z-10">
            {/* heading */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest">
                  <Crown className="w-4 h-4" />
                  Rankings
                </div>

                <h2 className="text-2xl font-black mt-4 text-slate-900 dark:text-white">
                  Best Sellers
                </h2>
              </div>
            </div>

            {/* list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {analytics.bestSellers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-slate-400 text-sm">
                  No best seller data available.
                </div>
              ) : (
                analytics.bestSellers.map(
                  (item, idx) => (
                    <motion.div
                      key={item._id}
                      whileHover={{
                        scale: 1.02,
                      }}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center text-black dark:text-white font-black shadow-lg flex-shrink-0">
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-slate-900 dark:text-white">
                            {item.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            Revenue ₹
                            {item.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-black whitespace-nowrap">
                          {item.totalSold} Sold
                        </div>
                      </div>
                    </motion.div>
                  )
                )
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;