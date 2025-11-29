import { useState, useEffect } from "react";
import { Project, Task, apiClient } from "../../lib/api";
import {
  ArrowLeft,
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { TaskForm } from "./TaskForm";

interface TaskManagerProps {
  project: Project;
  onBack: () => void;
  onTaskUpdate?: () => void; // Add callback for parent updates
}

export const TaskManager = ({
  project,
  onBack,
  onTaskUpdate,
}: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks(project.project_id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [project.project_id]);

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "ASSIGNED":
        return <User className="w-5 h-5 text-yellow-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {project.project_name}
          </h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Tasks ({tasks.length})
          </h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first task to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.task_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {task.title}
                  </h3>
                  {getStatusIcon(task.status)}
                </div>

                {task.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  {task.assigned_developers &&
                    task.assigned_developers.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {task.assigned_developers.length} assigned
                      </span>
                    )}
                </div>

                <div className="space-y-1 text-xs text-gray-500">
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
            ))}
          </div>
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          project={project}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            fetchTasks();
            onTaskUpdate?.(); // Notify parent dashboard
          }}
        />
      )}
    </div>
  );
};
