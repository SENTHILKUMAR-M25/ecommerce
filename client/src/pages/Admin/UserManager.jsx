import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminUsers,
  toggleUserBlockState,
} from "../../redux/slices/adminSlice";

import { useToast } from "../../components/common/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const UserManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { users, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [searchVal, setSearchVal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleToggleBlock = async (user) => {
    if (user._id === currentAdmin._id) {
      toast(
        "Security Warning: You cannot block your own admin account!",
        "error"
      );
      return;
    }

    const actionText = user.isBlocked ? "unblock" : "block";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} this account?`
      )
    ) {
      return;
    }

    try {
      await dispatch(toggleUserBlockState(user._id)).unwrap();

      toast(
        `${user.name} has been ${
          user.isBlocked ? "unblocked" : "blocked"
        } successfully!`,
        "success"
      );

      dispatch(fetchAdminUsers());
    } catch (err) {
      toast(err || "Failed to update account status.", "error");
    }
  };

  // FILTER
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        u.email.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [users, searchVal]);

  // PAGINATION
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal]);

  return (
    <div className="space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Users className="w-7 h-7 text-white" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">
              User Management
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage customer accounts, permissions and security access.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="flex items-center gap-3 flex-wrap">

          <div className="px-5 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
              Active
            </p>

            <h3 className="text-xl font-black text-emerald-500">
              {users.filter((u) => !u.isBlocked).length}
            </h3>
          </div>

          <div className="px-5 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
              Blocked
            </p>

            <h3 className="text-xl font-black text-rose-500">
              {users.filter((u) => u.isBlocked).length}
            </h3>
          </div>

        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md group">

          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300" />

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="relative w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
          />
        </div>

      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
          <Users className="w-14 h-14 text-slate-300 mx-auto mb-4" />

          <h3 className="text-xl font-bold text-slate-500">
            No Users Found
          </h3>

          <p className="text-sm text-slate-400 mt-2">
            Try searching with another keyword.
          </p>
        </div>
      ) : (
        <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.08)]">

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-widest text-[11px]">
                  <th className="px-6 py-5 text-left">
                    User
                  </th>

                  <th className="px-6 py-5 text-left">
                    Role
                  </th>

                  <th className="px-6 py-5 text-left">
                    Status
                  </th>

                  <th className="px-6 py-5 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-cyan-500/3 transition-all"
                  >

                    {/* USER */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                          {u.name?.charAt(0)}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white">
                            {u.name}
                          </h3>

                          <p className="text-xs text-slate-400 mt-1">
                            {u.email}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === "admin"
                            ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                            : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                        }`}
                      >
                        {u.role === "admin" && (
                          <Crown className="w-3 h-3" />
                        )}

                        {u.role}
                      </span>

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      <span
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.isBlocked
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>

                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">

                      <div className="flex justify-center">

                        <button
                          disabled={
                            actionLoading ||
                            u._id === currentAdmin._id
                          }
                          onClick={() => handleToggleBlock(u)}
                          className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                            u.isBlocked
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-rose-500 hover:bg-rose-600 text-white"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >

                          {u.isBlocked ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}

                          {u.isBlocked ? "Unblock" : "Block"}

                        </button>

                      </div>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="lg:hidden p-4 space-y-4">

            {currentUsers.map((u) => (
              <div
                key={u._id}
                className="rounded-3xl border border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg">
                      {u.name?.charAt(0)}
                    </div>

                    <div>

                      <h3 className="font-bold text-slate-800 dark:text-white">
                        {u.name}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1 break-all">
                        {u.email}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      u.role === "admin"
                        ? "bg-indigo-500/10 text-indigo-500"
                        : "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {u.role}
                  </span>

                </div>

                <div className="flex items-center justify-between mt-5">

                  <span
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                      u.isBlocked
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>

                  <button
                    disabled={
                      actionLoading ||
                      u._id === currentAdmin._id
                    }
                    onClick={() => handleToggleBlock(u)}
                    className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                      u.isBlocked
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                    } disabled:opacity-40`}
                  >

                    {u.isBlocked ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}

                    {u.isBlocked ? "Unblock" : "Block"}

                  </button>

                </div>

              </div>
            ))}

          </div>

          {/* PAGINATION */}
          {filteredUsers.length > usersPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 border-t border-slate-200 dark:border-slate-800">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-cyan-500">
                  {indexOfFirstUser + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-cyan-500">
                  {Math.min(
                    indexOfLastUser,
                    filteredUsers.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-cyan-500">
                  {filteredUsers.length}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-2 flex-wrap">

                {/* PREV */}
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => prev - 1)
                  }
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* PAGE BUTTONS */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                          : "border border-slate-200 dark:border-slate-700 hover:bg-cyan-500 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* NEXT */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => prev + 1)
                  }
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default UserManager;