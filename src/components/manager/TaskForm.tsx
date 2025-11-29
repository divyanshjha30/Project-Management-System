import { useState, useEffect } from "react";
import { Project, User, apiClient } from "../../lib/api";
import { X, Calendar, FileText, Type, Users } from "lucide-react";

interface TaskFormProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskForm = ({ project, onClose, onSuccess }: TaskFormProps) => {
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    assigned_developer: "",
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    setLoadingDevelopers(true);
    try {
      const response = await apiClient.getUsersByRole("DEVELOPER");
      setDevelopers(response.users || []);
    } catch (error) {
      console.error("Error fetching developers:", error);
      setDevelopers([]);
    } finally {
      setLoadingDevelopers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const task = await apiClient.createTask(project.project_id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      });

      // Assign developer if selected
      if (formData.assigned_developer) {
        try {
          await apiClient.assignDeveloper(
            task.task_id,
            formData.assigned_developer
          );
        } catch (assignError) {
          console.error("Error assigning developer:", assignError);
          // Still show success as task was created
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Project:</strong> {project.project_name}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4" />
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Assign to Developer
            </label>
            {loadingDevelopers ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading developers...
              </div>
            ) : (
              <select
                name="assigned_developer"
                value={formData.assigned_developer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a developer (optional)</option>
                {developers.map((dev) => (
                  <option key={dev.user_id} value={dev.user_id}>
                    {dev.username} ({dev.email})
                  </option>
                ))}
              </select>
            )}
            {developers.length === 0 && !loadingDevelopers && (
              <p className="text-xs text-gray-500 mt-1">
                No developers available. Task can be assigned later.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
