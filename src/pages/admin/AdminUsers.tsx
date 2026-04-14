import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, X, Check, Shield, User, Mail, Activity, ArrowUpDown } from "lucide-react";
import { getAdminUsers, updateAdminUser, deleteAdminUser, type AdminUser } from "../../api/admin";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", isAdmin: false, status: "active" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers(page, limit, search || undefined);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin || false,
      status: user.status || "active",
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      await updateAdminUser(editingUser.id, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteAdminUser(id);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">
            User_Registry
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">
            Database_Identity_Management
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search_Neural_IDs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-12 pr-6 py-4 w-full md:w-80 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    <User size={14} />
                    Identity
                  </div>
                </th>
                <th className="px-8 py-6 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    <Mail size={14} />
                    Terminal_Address
                  </div>
                </th>
                <th className="px-8 py-6 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    <Activity size={14} />
                    Status
                  </div>
                </th>
                <th className="px-8 py-6 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    <Shield size={14} />
                    Privileges
                  </div>
                </th>
                <th className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing_Database...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No_Identities_Found</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <span className="text-white font-black text-lg">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">
                            {user.name || "Unknown_Entity"}
                          </p>
                          <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-medium text-gray-400">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                          user.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full mr-2 ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                          user.isAdmin
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                        }`}
                      >
                        {user.isAdmin ? "Root_Access" : "Standard_User"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                          title="Modify_Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="Purge_Identity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/20">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Showing_Segment: <span className="text-white">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> / {total}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Node_{page} / {totalPages}
                </span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0b0b1a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              {/* Decorative background for modal */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
              
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    Modify_Entity
                  </h2>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">
                    Updating_Neural_Permissions
                  </p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Entity_Alias
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Terminal_Link
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Neural_Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 appearance-none transition-all"
                  >
                    <option value="active" className="bg-[#0b0b1a]">Active_Stream</option>
                    <option value="inactive" className="bg-[#0b0b1a]">Idle_State</option>
                    <option value="suspended" className="bg-[#0b0b1a]">Access_Severed</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={editForm.isAdmin}
                      onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                  <label htmlFor="isAdmin" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                    Elevate_to_Root_Permissions
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-8 py-4 bg-white/[0.03] border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest rounded-2xl hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  Abort_Operation
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Commit_Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
