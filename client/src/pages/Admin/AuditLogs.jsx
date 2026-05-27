import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminLogs } from "../../redux/slices/adminSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Search,
  ShieldCheck,
  Activity,
  Globe,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const AuditLogs = () => {
  const dispatch = useDispatch();

  const { logs, loading } = useSelector((state) => state.admin);

  const [searchVal, setSearchVal] = useState("");

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);

  const LOGS_PER_PAGE = 10;

  useEffect(() => {
    dispatch(fetchAdminLogs());
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      return (
        log.adminName
          ?.toLowerCase()
          .includes(searchVal.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchVal.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchVal.toLowerCase()) ||
        log.ipAddress?.includes(searchVal)
      );
    });
  }, [logs, searchVal]);

  /* ================= RESET PAGE ON SEARCH ================= */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(
    filteredLogs.length / LOGS_PER_PAGE
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center  lg:justify-between gap-5"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl text-black dark:text-white font-black tracking-tight">
                Audit Logs
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Monitor administrative actions, IP activity &
                security events.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full text-black dark:text-white lg:w-[350px]">
          <input
            type="text"
            placeholder="Search by admin, action, IP..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
          />

          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-black dark:text-white font-bold tracking-widest">
                Total Logs
              </p>

              <h2 className="text-3xl text-black dark:text-white font-black mt-2">
                {logs.length}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-black dark:text-white font-bold tracking-widest">
                Admin Operators
              </p>

              <h2 className="text-3xl text-black dark:text-white font-black mt-2">
                {
                  [
                    ...new Set(
                      logs
                        .map((l) => l.adminName)
                        .filter(Boolean)
                    ),
                  ].length
                }
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-black dark:text-white font-bold tracking-widest">
                Filtered Results
              </p>

              <h2 className="text-3xl text-black dark:text-white font-black mt-2">
                {filteredLogs.length}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-16">
          <LoadingSpinner />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-500/10 flex items-center justify-center mb-5">
            <ShieldCheck className="w-10 h-10 text-slate-400" />
          </div>

          <h2 className="text-xl font-bold">
            No Audit Logs Found
          </h2>

          <p className="text-slate-500 mt-2 text-sm">
            No security events matched your search query.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr className="text-black dark:text-white uppercase tracking-widest text-[11px]">
                    <th className="px-6 py-5 text-left">
                      Timestamp
                    </th>

                    <th className="px-6 py-5 text-left">
                      Operator
                    </th>

                    <th className="px-6 py-5 text-left">
                      Action
                    </th>

                    <th className="px-6 py-5 text-left">
                      Details
                    </th>

                    <th className="px-6 py-5 text-left">
                      IP Address
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLogs.map((log, index) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      {/* TIME */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <CalendarClock className="w-5 h-5 text-cyan-400" />
                          </div>

                          <div>
                            <p className="font-semibold text-black dark:text-white">
                              {new Date(
                                log.createdAt
                              ).toLocaleDateString()}
                            </p>

                            <p className="text-xs text-slate-500">
                              {new Date(
                                log.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* OPERATOR */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold">
                            {log.adminName}
                          </p>

                          <p className="text-xs text-slate-500 font-mono mt-1">
                            ID: {log.adminId?.slice(0, 10)}...
                          </p>
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-black dark:text-white text-[11px] uppercase font-black tracking-widest">
                          <ChevronRight className="w-3 h-3" />
                          {log.action}
                        </span>
                      </td>

                      {/* DETAILS */}
                      <td className="px-6 py-5 max-w-sm">
                        <p className=" leading-relaxed text-black dark:text-white break-words">
                          {log.details}
                        </p>
                      </td>

                      {/* IP */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                          <Globe className="w-4 h-4 text-indigo-400" />

                          <span>{log.ipAddress}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE + TABLET CARDS */}
          <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 gap-5">
            {paginatedLogs.map((log, index) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-5 relative overflow-hidden"
              >
                {/* glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                <div className="relative z-10 space-y-5">
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>

                      <div>
                        <h2 className="font-black text-base">
                          {log.adminName}
                        </h2>

                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          {log.adminId?.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase font-black tracking-widest">
                      {log.action}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="rounded-2xl bg-black/20 border border-white/5 p-4">
                    <p className="text-sm leading-relaxed text-slate-300 break-words">
                      {log.details}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <CalendarClock className="w-4 h-4 text-cyan-400" />

                      <span>
                        {new Date(
                          log.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono break-all">
                      <Globe className="w-4 h-4 text-indigo-400" />

                      <span>{log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col text-black dark:text-white sm:flex-row items-center justify-between gap-4 pt-2">
              {/* INFO */}
              <div className="text-sm ">
                Showing page{" "}
                <span className="font-bold">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-extrabold">
                  {totalPages}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center text-black dark:text-white flex-wrap justify-center gap-2">
                {/* PREVIOUS */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => prev - 1);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="h-11 px-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-bold disabled:opacity-40 hover:bg-cyan-500 hover:text-white transition-all"
                >
                  Previous
                </button>

                {/* PAGE NUMBERS */}
                {Array.from(
                  { length: totalPages },
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className={`w-11 h-11 rounded-2xl text-sm  font-black transition-all ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-black dark:text-white shadow-lg shadow-cyan-500/20"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                )}

                {/* NEXT */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="h-11 px-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-bold disabled:opacity-40 hover:bg-cyan-500 hover:text-white transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;