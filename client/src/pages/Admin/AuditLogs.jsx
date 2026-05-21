import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminLogs } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Search, ShieldCheck } from 'lucide-react';

const AuditLogs = () => {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((state) => state.admin);

  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    dispatch(fetchAdminLogs());
  }, [dispatch]);

  const filteredLogs = logs.filter((log) => {
    return log.adminName?.toLowerCase().includes(searchVal.toLowerCase()) ||
           log.action?.toLowerCase().includes(searchVal.toLowerCase()) ||
           log.details?.toLowerCase().includes(searchVal.toLowerCase()) ||
           log.ipAddress?.includes(searchVal);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header text */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Security & Audit Logs</h1>
        <p className="text-sm text-slate-500">Review historical administrative operations, coordinate IPs, and secure data access.</p>
      </div>

      {/* Query filters */}
      <div className="flex gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search logs by admin name, action details, IP..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Logs table list */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-205 dark:border-slate-805 rounded-[2rem] text-center text-slate-400 text-sm">
          No security audit records logged yet.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Operation Action</th>
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-semibold text-slate-550 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Operator */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{log.adminName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ID: {log.adminId?.substring(0, 8)}...</p>
                    </td>

                    {/* Operation */}
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      {log.action}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-normal max-w-xs break-words">
                      {log.details}
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
