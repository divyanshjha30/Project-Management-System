import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, Task } from "../../lib/api";
import {
  CheckSquare,
  Code,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  X,
  Send,
  MessageSquare,
  User,
} from "lucide-react";

interface DashboardStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  assignedTasks: number;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    assignedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchDeveloperTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDeveloperTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiClient.getTasks();
      const developerTasks = response.tasks || [];
      setTasks(developerTasks);

      // Calculate stats
      const totalTasks = developerTasks.length;
      const inProgressTasks = developerTasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length;
      const completedTasks = developerTasks.filter(
        (t) => t.status === "COMPLETED"
      ).length;
      const assignedTasks = developerTasks.filter(
        (t) => t.status === "ASSIGNED"
      ).length;

      setStats({
        totalTasks,
        inProgressTasks,
        completedTasks,
        assignedTasks,
      });
    } catch (error) {
      console.error("Error fetching developer tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // Load mock comments (replace with API call)
    setComments([
      {
        id: "1",
        user: "John Doe",
        text: "Started working on this task",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: "2",
        user: "Jane Smith",
        text: "Please update the documentation as well",
        timestamp: new Date(Date.now() - 43200000),
      },
    ]);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: user.username,
      text: newComment,
      timestamp: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setComments([]);
    setNewComment("");
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
      case "ASSIGNED":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-400" />;
      case "COMPLETED":
        return <CheckSquare className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 opacity-50" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return "bg-[var(--brand)]/20 text-[var(--brand)]";
      case "ASSIGNED":
        return "bg-yellow-500/20 text-yellow-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400";
      case "COMPLETED":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <Code className="w-8 h-8" style={{ color: "var(--brand)" }} />
            </div>
            <div className="text-lg opacity-70">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
              <Code className="w-7 h-7" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Developer Dashboard</h1>
              <p className="text-sm opacity-70 mt-1">Track your assigned tasks and progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckSquare className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalTasks}</h3>
          <p className="text-sm opacity-70">Total Tasks</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.assignedTasks}</h3>
          <p className="text-sm opacity-70">Assigned</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.inProgressTasks}</h3>
          <p className="text-sm opacity-70">In Progress</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.completedTasks}</h3>
          <p className="text-sm opacity-70">Completed</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 opacity-70" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select"
            >
              <option value="all">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="w-6 h-6" style={{ color: "var(--brand)" }} />
            My Assigned Tasks ({filteredTasks.length})
          </h2>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="neo-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl">
              <CheckSquare className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No tasks match your filters"
                : "No tasks assigned yet"}
            </p>
            <p className="text-sm opacity-70">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Your assigned tasks will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTasks.map((task) => (
              <div
                key={task.task_id}
                className="p-6 hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold group-hover:text-[var(--brand)] transition-colors">
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="opacity-70 mb-3 text-sm">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs opacity-60">
                      {task.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Start: {new Date(task.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {task.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Due: {new Date(task.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neo-tile rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedTask.status)}
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              </div>
              <button
                onClick={closeTaskModal}
                className="neo-icon hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Task Details */}
              <div>
                <h3 className="text-sm font-semibold opacity-70 mb-2">Description</h3>
                <p className="text-white">{selectedTask.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold opacity-70 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold opacity-70 mb-2">Priority</h3>
                  <span className="px-3 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: "var(--brand)", opacity: 0.2, color: "var(--brand)" }}>
                    High
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.start_date && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">Start Date</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedTask.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {selectedTask.end_date && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">Due Date</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedTask.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" style={{ color: "var(--brand)" }} />
                  Comments ({comments.length})
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="glass rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="neo-icon w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">
                          <User className="w-4 h-4" style={{ color: "var(--brand)" }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{comment.user}</span>
                            <span className="text-xs opacity-50">
                              {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="opacity-80 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    className="input flex-1"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
