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
        <div className="py-12 glass-panel border border-dashed border-slate-205 dark:border-slate-805 rounded-[2rem] text-center text-slate-400 text-sm">
          No matching user accounts discovered.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">System Role</th>
                  {/* <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Safety Lock</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold">{u.name}</td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-semibold text-slate-550 dark:text-slate-400">{u.email}</td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    {/* <td className="py-3.5 px-4">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        u.isBlocked 
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {u.isBlocked ? 'Blocked Access' : 'Active Account'}
                      </span>
                    </td> */}

                    {/* Block trigger */}
                    {/* <td className="py-3.5 px-4 text-center">
                      <button
                        disabled={actionLoading || u._id === currentAdmin._id}
                        onClick={() => handleToggleBlock(u)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow ${
                          u.isBlocked
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-30'
                        }`}
                      >
                        {u.isBlocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Unblock Account</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Block Account</span>
                          </>
                        )}
                      </button>
                    </td> */}
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
