import { useState, useEffect } from "react";
import { apiClient, Project } from "../../lib/api";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  TrendingUp,
  Briefcase,
} from "lucide-react";

interface ProjectStats {
  total: number;
  byManager: Record<string, number>;
}

export const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProjects();
      setProjects(response.projects || []);
      
      // Calculate stats
      const total = response.projects.length;
      const byManager = response.projects.reduce((acc: Record<string, number>, p) => {
        acc[p.owner_manager_id] = (acc[p.owner_manager_id] || 0) + 1;
        return acc;
      }, {});
      
      setStats({ total, byManager });
    } catch (error) {
      console.error("Error fetching projects:", error);
      showNotification("error", "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    try {
      await apiClient.deleteProject(deletingProject.project_id);
      await fetchProjects();
      setDeletingProject(null);
      showNotification("success", "Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      showNotification("error", "Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin neo-icon w-16 h-16 flex items-center justify-center rounded-lg">
              <FolderKanban className="w-8 h-8" style={{ color: "var(--brand)" }} />
            </div>
            <div className="text-lg opacity-70">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="neo-icon w-14 h-14 flex items-center justify-center rounded-xl">
              <FolderKanban className="w-7 h-7" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Project Management</h1>
              <p className="text-sm opacity-70 mt-1">
                Manage all projects across the system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchProjects} className="btn-ghost" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <FolderKanban className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.total || 0}</h3>
          <p className="text-sm opacity-70">Total Projects</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Briefcase className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {Object.keys(stats?.byManager || {}).length}
          </h3>
          <p className="text-sm opacity-70">Active Managers</p>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-soft transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
              <Calendar className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {projects.filter(p => {
              const date = new Date(p.created_at);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return date > monthAgo;
            }).length}
          </h3>
          <p className="text-sm opacity-70">Created This Month</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span>{filteredProjects.length} of {projects.length} projects</span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass rounded-xl p-16 text-center">
          <div className="neo-icon w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-sm opacity-70 mb-6">
            {searchTerm ? "Try adjusting your search" : "Create your first project to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              className="glass rounded-xl p-6 hover:glass-soft transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
                  <FolderKanban className="w-6 h-6" style={{ color: "var(--brand)" }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="neo-icon w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingProject(project)}
                    className="neo-icon w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" style={{ color: "var(--brand)" }} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2">{project.project_name}</h3>
              <p className="text-sm opacity-70 mb-4 line-clamp-2">
                {project.description || "No description"}
              </p>

              <div className="flex items-center gap-4 text-xs opacity-70 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Manager
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {(showCreateModal || editingProject) && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowCreateModal(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingProject(null);
            fetchProjects();
            showNotification(
              "success",
              editingProject ? "Project updated successfully" : "Project created successfully"
            );
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletingProject(null)}
          />
          <div className="glass rounded-xl p-6 w-full max-w-md relative z-10 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
                <Trash2 className="w-6 h-6" style={{ color: "var(--brand)" }} />
              </div>
              <h3 className="text-xl font-bold">Delete Project</h3>
            </div>

            <p className="text-sm opacity-70 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">{deletingProject.project_name}</span>?
              This will also delete all associated tasks and cannot be undone.
            </p>

            <div className="glass-soft rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 opacity-70" />
                <div>
                  <div className="font-medium">{deletingProject.project_name}</div>
                  <div className="text-xs opacity-70">
                    Created {new Date(deletingProject.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProject(null)}
                className="flex-1 btn-ghost justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 btn-primary justify-center bg-red-900/20 border-red-800 hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Project Form Modal Component
interface ProjectFormModalProps {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectFormModal = ({ project, onClose, onSuccess }: ProjectFormModalProps) => {
  const [name, setName] = useState(project?.project_name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (project) {
        await apiClient.updateProject(project.project_id, {
          project_name: name,
          description,
        });
      } else {
        await apiClient.createProject({
          project_name: name,
          description,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass rounded-xl p-6 w-full max-w-md relative z-10 animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg">
            <FolderKanban className="w-6 h-6" style={{ color: "var(--brand)" }} />
          </div>
          <h3 className="text-xl font-bold">
            {project ? "Edit Project" : "Create New Project"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="glass-soft rounded-lg p-3 border-l-4 border-red-500">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Enter project description (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary justify-center"
            >
              {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};