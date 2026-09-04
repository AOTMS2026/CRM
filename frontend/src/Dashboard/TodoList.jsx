import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  RotateCw, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  User, 
  Tag, 
  Filter, 
  Check, 
  AlertTriangle,
  ShieldCheck,
  LayoutGrid,
  List,
  Calendar,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modal & Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [toast, setToast] = useState(null);

  // Form Fill State
  const [formData, setFormData] = useState({
    title: '',
    assignee: 'Kavita Menon',
    dueDate: 'Today, 6:00 PM',
    priority: 'High',
    category: 'Callback',
    status: 'Pending'
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

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch Todo Tasks from MongoDB Atlas
  const fetchTodos = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/todos`);
      const data = await res.json();
      if (res.ok && data && data.success && Array.isArray(data.todos)) {
        setTodos(data.todos);
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error("Failed to fetch todos from MongoDB:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Directly Update Task Status in MongoDB
  const handleUpdateStatus = async (id, newStatus, title) => {
    try {
      const res = await fetch(`${getApiBase()}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(`Task '${title.slice(0, 25)}...' status updated to ${newStatus}!`, "success");
        await fetchTodos();
      }
    } catch (err) {
      showToastMsg("Error updating task status.", "error");
    }
  };

  // Toggle Checkbox Status (Pending <-> Completed)
  const handleToggleTask = async (id, currentDone, title) => {
    const nextStatus = currentDone ? 'Pending' : 'Completed';
    await handleUpdateStatus(id, nextStatus, title);
  };

  // Delete Task from MongoDB
  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete task '${title.slice(0, 35)}...'?`)) return;

    try {
      const res = await fetch(`${getApiBase()}/api/todos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("Task deleted successfully.", "success");
        await fetchTodos();
      }
    } catch (err) {
      showToastMsg("Error deleting task.", "error");
    }
  };

  // Add Task Submit to MongoDB
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate.trim()) {
      showToastMsg("Task Title and Due Date are required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          assignee: formData.assignee.trim() || 'Admin Manager',
          dueDate: formData.dueDate.trim(),
          priority: formData.priority,
          category: formData.category.trim(),
          status: formData.status
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(data.message || "New task saved in MongoDB!", "success");
        setShowAddModal(false);
        setFormData({
          title: '',
          assignee: 'Kavita Menon',
          dueDate: 'Today, 6:00 PM',
          priority: 'High',
          category: 'Callback',
          status: 'Pending'
        });
        await fetchTodos();
      } else {
        throw new Error(data.message || "Failed to create task.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error creating task.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Task Submit to MongoDB
  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    if (!editTodo) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/todos/${editTodo._id || editTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTodo.title.trim(),
          assignee: editTodo.assignee.trim(),
          dueDate: editTodo.dueDate.trim(),
          priority: editTodo.priority,
          category: editTodo.category.trim(),
          status: editTodo.status
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg("Task updated successfully!", "success");
        setEditTodo(null);
        await fetchTodos();
      } else {
        throw new Error(data.message || "Failed to update task.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error updating task.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Remove Duplicate Tasks from MongoDB
  const handleRemoveDuplicates = async () => {
    setDeduplicating(true);
    try {
      const res = await fetch(`${getApiBase()}/api/todos/remove-duplicates`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToastMsg(data.message || `Removed ${data.removed_count} duplicate tasks!`, "success");
        await fetchTodos();
      } else {
        throw new Error(data.message || "Failed to remove duplicates.");
      }
    } catch (err) {
      showToastMsg(err.message || "Error purging duplicates.", "error");
    } finally {
      setDeduplicating(false);
    }
  };

  // Filter Tasks
  const filteredTodos = todos.filter(t => {
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const currentTaskStatus = t.status || (t.done ? 'Completed' : 'Pending');
    const matchesStatus = filterStatus === 'ALL' || currentTaskStatus.toUpperCase() === filterStatus.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(query) ||
      (t.assignee || '').toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query);

    return matchesPriority && matchesStatus && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPriority, filterStatus]);

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE) || 1;
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const priorityStyles = {
    Critical: 'bg-rose-100 text-rose-800 border-rose-300',
    High: 'bg-amber-100 text-amber-800 border-amber-300',
    Medium: 'bg-sky-100 text-sky-800 border-sky-300',
    Normal: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const statusStyles = {
    Pending: 'bg-sky-50 text-sky-700 border-sky-200',
    'In Progress': 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                CRM Team Todo & Action Items
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                {todos.filter(t => (t.status || (t.done ? 'Completed' : 'Pending')) !== 'Completed').length} Active Tasks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time MongoDB Atlas sync with Status tracking (Pending, In Progress, Completed), Card view, and duplicate cleanup.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Card / List View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Remove Duplicate Data Button */}
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            disabled={deduplicating}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs shrink-0"
            title="Remove redundant duplicate task items from database"
          >
            <ShieldCheck className={`w-4 h-4 ${deduplicating ? 'animate-spin text-rose-600' : 'text-slate-600'}`} />
            <span>{deduplicating ? 'Cleaning...' : 'Remove Duplicate Data'}</span>
          </button>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                assignee: 'Kavita Menon',
                dueDate: 'Today, 6:00 PM',
                priority: 'High',
                category: 'Callback',
                status: 'Pending'
              });
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, assignee, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 shadow-2xs"
          />
        </div>

        {/* Priority & Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'PENDING', 'IN PROGRESS', 'COMPLETED'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterStatus === statusKey
                  ? 'bg-slate-900 text-white shadow-2xs font-mono'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {statusKey}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Priority:
          </span>
          {['ALL', 'Critical', 'High', 'Medium', 'Normal'].map((prioKey) => (
            <button
              key={prioKey}
              onClick={() => setFilterPriority(prioKey)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterPriority === prioKey
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {prioKey}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchTodos}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh</span>
        </button>

      </div>

      {/* TODO LIST CONTENT (CARD STYLE GRID VS TABLE VIEW) */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Todo items from MongoDB...</p>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Todo Tasks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add action items to track callbacks, invoice clearances, and team responsibilities.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Task</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* CARD STYLE GRID VIEW WITH INTERACTIVE STATUS DROPDOWN */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedTodos.map((todo) => {
              const taskId = todo._id || todo.id;
              const currentStatus = todo.status || (todo.done ? 'Completed' : 'Pending');
              const isCompleted = currentStatus === 'Completed';

              return (
                <div
                  key={taskId}
                  className={`p-5 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                    isCompleted
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Category Tag & Priority Badge */}
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-full font-semibold text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200">
                        🏷️ {todo.category || 'General'}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold border ${priorityStyles[todo.priority] || priorityStyles.Normal}`}>
                        {todo.priority}
                      </span>
                    </div>

                    {/* Task Title & Checkbox */}
                    <div className="flex items-start gap-3 pt-1">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleTask(taskId, isCompleted, todo.title)}
                        className="mt-1 w-4.5 h-4.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
                      />
                      <h3 className={`text-sm font-semibold leading-snug transition-colors ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-sky-600'
                      }`}>
                        {todo.title}
                      </h3>
                    </div>

                    {/* Details Grid: Assignee & Due Date */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Assignee: <strong className="text-slate-900">{todo.assignee || 'Admin Manager'}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600 font-medium font-mono">
                        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Due: <strong className="text-slate-800 font-sans">{todo.dueDate}</strong></span>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Interactive Status Selector & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    {/* Interactive Status Selector Dropdown */}
                    <select
                      value={currentStatus}
                      onChange={(e) => handleUpdateStatus(taskId, e.target.value, todo.title)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono border cursor-pointer focus:outline-none transition-colors ${
                        statusStyles[currentStatus] || statusStyles.Pending
                      }`}
                    >
                      <option value="Pending">Pending ⏳</option>
                      <option value="In Progress">In Progress ⚡</option>
                      <option value="Completed">Completed ✓</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditTodo({ ...todo, status: currentStatus })}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer border border-slate-200"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(taskId, todo.title)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Footer Controls */}
          {filteredTodos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedTodos.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTodos.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredTodos.length}</span> tasks
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

        /* LIST STYLE TABLE VIEW */
        <div className="space-y-6">
          <div className="space-y-3">
            {paginatedTodos.map((todo) => {
              const taskId = todo._id || todo.id;
              const currentStatus = todo.status || (todo.done ? 'Completed' : 'Pending');
              const isCompleted = currentStatus === 'Completed';

              return (
                <div
                  key={taskId}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-sky-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleTask(taskId, isCompleted, todo.title)}
                      className="w-4.5 h-4.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className={`text-xs font-semibold leading-relaxed ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {todo.title}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap font-medium">
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>{todo.dueDate}</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Assignee: <strong className="text-slate-900">{todo.assignee}</strong></span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{todo.category}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Dropdown */}
                    <select
                      value={currentStatus}
                      onChange={(e) => handleUpdateStatus(taskId, e.target.value, todo.title)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono border cursor-pointer focus:outline-none ${
                        statusStyles[currentStatus] || statusStyles.Pending
                      }`}
                    >
                      <option value="Pending">Pending ⏳</option>
                      <option value="In Progress">In Progress ⚡</option>
                      <option value="Completed">Completed ✓</option>
                    </select>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${priorityStyles[todo.priority] || priorityStyles.Normal}`}>
                      {todo.priority}
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditTodo({ ...todo, status: currentStatus })}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(taskId, todo.title)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer Controls */}
          {filteredTodos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-3">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{paginatedTodos.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="text-slate-900 font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTodos.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredTodos.length}</span> tasks
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD TASK FORM                                                    */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-slate-900">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Add New Action Task</h3>
                  <p className="text-xs text-slate-500 font-medium">Assign action item, status, due date, category, and priority level.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} id="todo-add-form" className="space-y-4 text-xs font-medium">
              
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Task Title / Action Description <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Follow up with Dr. Srinivas Rao on corporate invoice clearance..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Assignee & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Assignee Employee <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Menon"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Callback">Callback</option>
                    <option value="Invoice Check">Invoice Check</option>
                    <option value="Database Verification">Database Verification</option>
                    <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                    <option value="Client Follow-up">Client Follow-up</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Task Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Task Work Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Pending">Pending ⏳</option>
                    <option value="In Progress">In Progress ⚡</option>
                    <option value="Completed">Completed ✓</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Due Date & Time <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Today, 6:00 PM or March 5"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

            </form>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="todo-add-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Saving to Database...' : 'Save Action Task'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT TASK FORM                                                   */}
      {/* ========================================================================= */}
      {editTodo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-slate-900">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Edit Action Task</h3>
                  <p className="text-xs text-slate-500 font-medium">Update title, status, assignee, category, or due date.</p>
                </div>
              </div>
              <button onClick={() => setEditTodo(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditTaskSubmit} id="todo-edit-form" className="space-y-4 text-xs font-medium">
              
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Task Title</label>
                <textarea
                  rows={2}
                  required
                  value={editTodo.title || ''}
                  onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Task Work Status</label>
                  <select
                    value={editTodo.status || 'Pending'}
                    onChange={(e) => setEditTodo({ ...editTodo, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Pending">Pending ⏳</option>
                    <option value="In Progress">In Progress ⚡</option>
                    <option value="Completed">Completed ✓</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Assignee</label>
                  <input
                    type="text"
                    required
                    value={editTodo.assignee || ''}
                    onChange={(e) => setEditTodo({ ...editTodo, assignee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Due Date & Time</label>
                  <input
                    type="text"
                    required
                    value={editTodo.dueDate || ''}
                    onChange={(e) => setEditTodo({ ...editTodo, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Priority</label>
                  <select
                    value={editTodo.priority || 'High'}
                    onChange={(e) => setEditTodo({ ...editTodo, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

            </form>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditTodo(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="todo-edit-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Updating...' : 'Update Task'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
