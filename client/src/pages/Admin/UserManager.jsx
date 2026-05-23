import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminUsers, toggleUserBlockState } from '../../redux/slices/adminSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, ShieldCheck, ShieldAlert, Search } from 'lucide-react';

const UserManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { users, loading, actionLoading } = useSelector((state) => state.admin);
  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleToggleBlock = async (user) => {
    if (user._id === currentAdmin._id) {
      toast("Security Warning: You cannot block your own administrative account!", 'error');
      return;
    }

    const actionText = user.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you absolutely sure you want to ${actionText} this user account?`)) {
      return;
    }

    try {
      await dispatch(toggleUserBlockState(user._id)).unwrap();
      toast(`User ${user.name} has been successfully ${user.isBlocked ? 'unblocked' : 'blocked'}!`, 'info');
      dispatch(fetchAdminUsers()); // reload list
    } catch (err) {
      toast(err || 'Failed to update user block status.', 'error');
    }
  };

  // Filter list
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchVal.toLowerCase()) || 
    u.email.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header text */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Accounts</h1>
        <p className="text-sm text-slate-500">Track customer bases, verify roles, and toggle account blocking locks.</p>
      </div>

      {/* Query filters */}
      <div className="flex gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Customers table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 text-sm">
          No matching user accounts discovered.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-0 sm:p-6 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Acc. Status</th>
                  <th className="py-3 px-4 text-center">Safety Lock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 block sm:table-row-group">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors block sm:table-row p-4 sm:p-0">
                    {/* Customer info */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm sm:text-xs text-slate-800 dark:text-slate-100">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Role</span>
                        <span className={`font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-widest ${
                          u.role === 'admin' 
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-3 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Status</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                          u.isBlocked 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {u.isBlocked ? 'Blocked' : 'Active Account'}
                        </span>
                      </div>
                    </td>

                    {/* Interaction */}
                    <td className="py-2 sm:py-3.5 px-0 sm:px-4 block sm:table-cell border-t sm:border-0 border-slate-100 dark:border-slate-800 mt-2 sm:mt-0 pt-3 sm:pt-0">
                      <div className="flex justify-between sm:justify-center items-center">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Account Lock</span>
                        <button
                          disabled={actionLoading || u._id === currentAdmin._id}
                          onClick={() => handleToggleBlock(u)}
                          className={`flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                            u.isBlocked
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-30'
                          }`}
                        >
                          {u.isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          <span>{u.isBlocked ? 'Unlock' : 'Lock Account'}</span>
                        </button>
                      </div>
                    </td>
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

export default UserManager;
