import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  Shield,
  FolderKanban,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { apiClient } from "../../lib/api";

interface DashboardStats {
  users: {
    total: number;
    byRole: {
      ADMIN?: number;
      MANAGER?: number;
      DEVELOPER?: number;
    };
  };
  projects: {
    total: number;
  };
  tasks: {
    total: number;
    byStatus: {
      NEW?: number;
      ASSIGNED?: number;
      IN_PROGRESS?: number;
      COMPLETED?: number;
    };
  };
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/admin/dashboard");
      console.log("Dashboard API Response:", response);
      setStats(response);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <Shield className="w-8 h-8" style={{ color: "var(--brand)" }} />
            </div>
            <div className="text-lg opacity-70">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8 max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <AlertCircle className="w-8 h-8" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Failed to Load Dashboard
              </h3>
              <p className="text-sm opacity-70 mb-4">{error}</p>
              <button onClick={fetchDashboardStats} className="btn-primary">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inProgressTasks =
    (stats?.tasks.byStatus.IN_PROGRESS || 0) + (stats?.tasks.byStatus.ASSIGNED || 0);
  const completedTasks = stats?.tasks.byStatus.COMPLETED || 0;
  const newTasks = stats?.tasks.byStatus.NEW || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
            <Shield className="w-7 h-7" style={{ color: "var(--brand)" }} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm opacity-70 mt-1">Welcome back, {user?.username}</p>
          </div>
          <div className="hidden md:block">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-900/20 text-red-300 border border-red-800">
              System Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Users className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.users.total || 0}</h3>
          <p className="text-sm opacity-70 mb-3">Total Users</p>
          <div className="space-y-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Admins</span>
              <span className="font-medium px-2 py-1 rounded bg-red-900/20 text-red-300">
                {stats?.users.byRole.ADMIN || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Managers</span>
              <span className="font-medium px-2 py-1 rounded bg-blue-900/20 text-blue-300">
                {stats?.users.byRole.MANAGER || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Developers</span>
              <span className="font-medium px-2 py-1 rounded bg-green-900/20 text-green-300">
                {stats?.users.byRole.DEVELOPER || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <FolderKanban className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.projects.total || 0}</h3>
          <p className="text-sm opacity-70">Active Projects</p>
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs opacity-70">System-wide project count</div>
          </div>
        </div>

        {/* In Progress Tasks Card */}
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <PlayCircle className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{inProgressTasks}</h3>
          <p className="text-sm opacity-70 mb-3">Active Tasks</p>
          <div className="space-y-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">In Progress</span>
              <span className="font-medium">
                {stats?.tasks.byStatus.IN_PROGRESS || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Assigned</span>
              <span className="font-medium">
                {stats?.tasks.byStatus.ASSIGNED || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <CheckCircle className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{completedTasks}</h3>
          <p className="text-sm opacity-70 mb-3">Completed Tasks</p>
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Completion Rate</span>
              <span className="font-medium">
                {stats?.tasks.total
                  ? Math.round((completedTasks / stats.tasks.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Task Distribution</h3>
            <span className="text-sm opacity-70">
              Total: {stats?.tasks.total || 0}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70">New Tasks</span>
                <span className="text-sm font-medium">{newTasks}</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${(newTasks / (stats?.tasks.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70">Assigned</span>
                <span className="text-sm font-medium">
                  {stats?.tasks.byStatus.ASSIGNED || 0}
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((stats?.tasks.byStatus.ASSIGNED || 0) / (stats?.tasks.total || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70">In Progress</span>
                <span className="text-sm font-medium">
                  {stats?.tasks.byStatus.IN_PROGRESS || 0}
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((stats?.tasks.byStatus.IN_PROGRESS || 0) / (stats?.tasks.total || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70">Completed</span>
                <span className="text-sm font-medium">{completedTasks}</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedTasks / (stats?.tasks.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm opacity-70">Total Users</span>
              </div>
              <span className="text-xl font-bold">{stats?.users.total || 0}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <span className="text-sm opacity-70">Active Projects</span>
              </div>
              <span className="text-xl font-bold">{stats?.projects.total || 0}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-sm opacity-70">Pending Tasks</span>
              </div>
              <span className="text-xl font-bold">{newTasks}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm opacity-70">Completion Rate</span>
              </div>
              <span className="text-xl font-bold">
                {stats?.tasks.total
                  ? Math.round((completedTasks / stats.tasks.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-ghost justify-start p-4">
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </button>
          <button className="btn-ghost justify-start p-4">
            <FolderKanban className="w-5 h-5" />
            <span>View All Projects</span>
          </button>
          <button className="btn-ghost justify-start p-4">
            <Settings className="w-5 h-5" />
            <span>System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
