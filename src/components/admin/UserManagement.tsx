import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import {
  Search,
  Edit2,
  Trash2,
  Shield,
  UserCog,
  Users as UsersIcon,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  Briefcase,
  Code,
} from "lucide-react";

interface User {
  user_id: string;
  username: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
  created_at: string;
}

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

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"ADMIN" | "MANAGER" | "DEVELOPER">("DEVELOPER");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "MANAGER" | "DEVELOPER">("ALL");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/dashboard"),
      ]);
      setUsers(usersResponse.users || []);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.patch(`/admin/users/${selectedUser.user_id}/role`, {
        role: newRole,
      });
      await fetchData();
      setShowRoleModal(false);
      setSelectedUser(null);
      showNotification("success", `User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      showNotification("error", "Failed to update user role");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.delete(`/admin/users/${userToDelete.user_id}`);
      await fetchData();
      setShowDeleteModal(false);
      setUserToDelete(null);
      showNotification("success", "User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("error", "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "MANAGER":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "DEVELOPER":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return Crown;
      case "MANAGER":
        return Briefcase;
      case "DEVELOPER":
        return Code;
      default:
        return UserCog;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="dark glass rounded-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin w-16 h-16 border-4 border-white/10 border-t-[var(--brand)] rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-[var(--brand)]" />
              </div>
            </div>
            <div className="text-lg font-medium text-[#eaeaea]">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark space-y-6 pb-8">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div
            className={`glass rounded-xl p-4 flex items-center gap-3 ${
              notification.type === "success"
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-7 h-7 text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#eaeaea]">User Management</h2>
              <p className="text-sm mt-1 text-white/60">
                Manage user roles and permissions across the system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="btn-ghost" title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </button>
        
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="neo-tile rounded-2xl p-6 feature-card">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-[var(--brand)]" />
            </div>
            <span className="text-xs font-medium text-white/50">Total</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-[#eaeaea]">{stats?.users.total || 0}</h3>
          <p className="text-sm text-white/60">All Users</p>
        </div>

        {/* Admin Stats */}
        <div
          className="neo-tile rounded-2xl p-6 feature-card cursor-pointer border-l-4 border-red-500/50"
          onClick={() => setRoleFilter(roleFilter === "ADMIN" ? "ALL" : "ADMIN")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-red-400" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor("ADMIN")}`}>
              ADMIN
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-[#eaeaea]">
            {stats?.users.byRole.ADMIN || 0}
          </h3>
          <p className="text-sm text-red-300/80">System Administrators</p>
        </div>

        {/* Manager Stats */}
        <div
          className="neo-tile rounded-2xl p-6 feature-card cursor-pointer border-l-4 border-blue-500/50"
          onClick={() => setRoleFilter(roleFilter === "MANAGER" ? "ALL" : "MANAGER")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor("MANAGER")}`}>
              MANAGER
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-[#eaeaea]">
            {stats?.users.byRole.MANAGER || 0}
          </h3>
          <p className="text-sm text-blue-300/80">Project Managers</p>
        </div>

        {/* Developer Stats */}
        <div
          className="neo-tile rounded-2xl p-6 feature-card cursor-pointer border-l-4 border-green-500/50"
          onClick={() => setRoleFilter(roleFilter === "DEVELOPER" ? "ALL" : "DEVELOPER")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor("DEVELOPER")}`}>
              DEVELOPER
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-[#eaeaea]">
            {stats?.users.byRole.DEVELOPER || 0}
          </h3>
          <p className="text-sm text-green-300/80">Development Team</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-white/50" />
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as "ALL" | "ADMIN" | "MANAGER" | "DEVELOPER")
              }
              className="select"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-white/60">
            Showing {filteredUsers.length} of {users.length} users
          </span>
          {roleFilter !== "ALL" && (
            <button
              onClick={() => setRoleFilter("ALL")}
              className="font-medium text-[var(--brand)] hover:underline transition-all"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="preview-panel rounded-2xl overflow-hidden ">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="neo-icon w-16 h-16 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[var(--brand)]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#eaeaea]">No users found</h3>
            <p className="text-sm text-center max-w-md text-white/60">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "No users available in the system"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#1e1e1e]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-semibold text-white/60">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/60">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/60">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/60">Joined</th>
                  <th className="text-right p-4 text-sm font-semibold text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr
                      key={user.user_id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="neo-icon w-10 h-10 rounded-lg flex items-center justify-center">
                            <RoleIcon className="w-5 h-5 text-[var(--brand)]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#eaeaea]">{user.username}</div>
                            <div className="text-xs text-white/40">{user.user_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-white">{user.email}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-white/60">
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="neo-icon w-9 h-9 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                            title="Edit role"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="neo-icon w-9 h-9 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRoleModal(false)}
          />
          <div className="preview-panel rounded-2xl p-6 w-full max-w-md relative z-10 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="neo-icon w-12 h-12 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold text-[#eaeaea]">Update User Role</h3>
            </div>

            <div className="glass-soft rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 rounded-lg flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <div>
                  <div className="font-medium text-[#eaeaea]">{selectedUser.username}</div>
                  <div className="text-xs text-white/60">{selectedUser.email}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3 text-[#eaeaea]">
                  Select New Role
                </label>
                <div className="space-y-2">
                  {["DEVELOPER", "MANAGER", "ADMIN"].map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        newRole === role
                          ? "border-[var(--brand)] bg-[var(--brand)]/10"
                          : "border-white/10 hover:border-[var(--brand)]/30 bg-white/[0.02]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={newRole === role}
                        onChange={(e) =>
                          setNewRole(e.target.value as "ADMIN" | "MANAGER" | "DEVELOPER")
                        }
                        className="w-4 h-4"
                        style={{ accentColor: "var(--brand)" }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[#eaeaea]">{role}</div>
                        <div className="text-xs text-white/60">
                          {role === "ADMIN" && "Full system access"}
                          {role === "MANAGER" && "Project and team management"}
                          {role === "DEVELOPER" && "Task execution and updates"}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}>
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowRoleModal(false)} className="flex-1 btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="flex-1 btn-primary"
                  disabled={newRole === selectedUser.role}
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="preview-panel rounded-2xl p-6 w-full max-w-md relative z-10 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="neo-icon w-12 h-12 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-[#eaeaea]">Delete User</h3>
            </div>

            <p className="text-sm mb-6 text-white/60">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#eaeaea]">{userToDelete.username}</span>? This
              action cannot be undone and will remove all associated data.
            </p>

            <div className="glass-soft rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="neo-icon w-10 h-10 rounded-lg flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#eaeaea]">{userToDelete.username}</div>
                  <div className="text-xs text-white/60">{userToDelete.email}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userToDelete.role)}`}>
                  {userToDelete.role}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 btn-ghost border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};