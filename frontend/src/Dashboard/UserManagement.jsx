import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  RotateCw, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Filter, 
  Lock, 
  User, 
  Calendar, 
  Check, 
  LayoutGrid, 
  List,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IoLogoWhatsapp as WhatsApp } from 'react-icons/io5';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Modals & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: 'AOTMS',
    phone: '',
    role: 'user'
  });

  const getApiBase = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }
    return 'http://localhost:5000';
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Real-Time MongoDB Fetch
  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/users`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users from MongoDB:', err);
      showToast('Failed to connect to MongoDB server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Name, Email and Password are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'User created in MongoDB Atlas!');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', companyName: 'AOTMS', phone: '', role: 'user' });
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to create user', 'error');
      }
    } catch (err) {
      showToast('Error connecting to MongoDB backend', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit/Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/users/${editingUser._id || editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          phone: formData.phone,
          role: formData.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('User profile updated successfully!');
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', companyName: 'AOTMS', phone: '', role: 'user' });
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to update user profile', 'error');
      }
    } catch (err) {
      showToast('Error updating user in MongoDB', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/users/${deletingUser._id || deletingUser.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('User profile deleted from MongoDB!');
        setDeletingUser(null);
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Error deleting user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      companyName: user.companyName || 'AOTMS',
      phone: user.phone || '',
      role: user.role || 'user'
    });
  };

  // Filter Users
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRole === 'ALL' || user.role?.toLowerCase() === selectedRole.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query)) ||
      (user.companyName && user.companyName.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'manager':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Header Banner & Stats Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live MongoDB Atlas ({filteredUsers.length} Users)
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Manage company users, system roles, profiles, and authentication permissions in card or table layout.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          
          {/* View Mode Toggle (Cards vs Table) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid Style View"
            >
              <LayoutGrid className="w-4 h-4 text-tech_orange" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Users List from MongoDB"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: '', email: '', password: '', companyName: 'AOTMS', phone: '', role: 'user' });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, phone, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Role:
          </span>
          {['ALL', 'admin', 'manager', 'employee'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer shrink-0 ${
                selectedRole === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Card Grid vs Table View */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-sm text-center space-y-3">
          <RotateCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Syncing user profiles with MongoDB Atlas...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No User Profiles Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || selectedRole !== 'ALL' 
                ? 'Try clearing your search term or role filter.'
                : 'No users registered in MongoDB yet. Click "Add New User" above to create one.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'cards' ? (

        /* ========================================================================= */
        /* CARD STYLE VIEW FOR USERS                                                 */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedUsers.map((user) => {
              const userId = user._id || user.id;
              const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
              const createdDate = user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A';
              const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';

              return (
                <div
                  key={userId}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Top Accent Gradient Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-tech_orange to-amber-400 opacity-90" />

                  <div className="space-y-4 pt-1">
                    
                    {/* Avatar & Role Badge Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-sky-500 via-indigo-500 to-tech_orange shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-lg font-black text-slate-900">
                            {initials}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-base text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                            {user.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold truncate">
                            <Building2 className="w-3.5 h-3.5 text-tech_orange shrink-0" />
                            <span className="truncate">{user.companyName || 'AOTMS'}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-extrabold uppercase shrink-0 border ${getRoleBadge(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </div>

                    {/* User Information Details */}
                    <div className="space-y-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between gap-2 truncate">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Email:</span>
                        <span className="font-medium text-slate-800 truncate" title={user.email}>{user.email}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Phone:</span>
                        <span className="font-bold text-slate-900 font-mono">{user.phone || 'Not set'}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Joined:</span>
                        <span className="font-medium text-slate-600 font-mono">{createdDate}</span>
                      </div>
                    </div>

                    {/* Quick Direct Communication Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {cleanPhone ? (
                        <a
                          href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <WhatsApp className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <div className="py-2 px-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5">
                          <span>No Phone</span>
                        </div>
                      )}

                      <a
                        href={`mailto:${user.email}`}
                        className="py-2 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4 text-sky-600" />
                        <span>Email</span>
                      </a>
                    </div>

                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: #{String(userId).slice(-6)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(user)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Footer Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredUsers.length}</span> users
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3.5 py-1.5 text-xs font-black text-slate-900 bg-slate-100 rounded-lg font-mono">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      ) : (

        /* ========================================================================= */
        /* TABLE STYLE VIEW FOR USERS                                                */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">User Profile</th>
                    <th className="py-4 px-6">Email & Phone</th>
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedUsers.map((user) => {
                    const userId = user._id || user.id;
                    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                    const createdDate = user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A';

                    return (
                      <tr key={userId} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* User Profile Card Chip */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-sky-500 via-indigo-500 to-tech_orange shadow-sm shrink-0">
                              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-black text-slate-900">
                                {initials}
                              </div>
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                ID: {String(userId).slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                      {/* Company Name */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-tech_orange" />
                          <span>{user.companyName || 'AOTMS'}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase border ${getRoleBadge(user.role)}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {user.role || 'user'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{createdDate}</span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Delete User Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

          {/* Pagination Footer Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-slate-200/80 gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredUsers.length}</span> users
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3.5 py-1.5 text-xs font-black text-slate-900 bg-slate-100 rounded-lg font-mono">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingUser ? 'Edit User Profile' : 'Add New User'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? 'Update user profile in MongoDB' : 'Create new user profile in MongoDB Atlas'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="AOTMS"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  System Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 cursor-pointer"
                >
                  <option value="admin">🛡️ Admin (Full Control Panel)</option>
                  <option value="manager">💼 Manager (Pipeline & Blasts Panel)</option>
                  <option value="employee">👤 Employee (Chat & Tasks Panel)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Delete User Profile?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deletingUser.name}</span> ({deletingUser.email}) from MongoDB Atlas? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
