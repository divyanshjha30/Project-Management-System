import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Clock, CheckCircle } from 'lucide-react';
import { TaskStatus } from '../../lib/database.types';

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  project: {
    project_name: string;
    description: string | null;
  };
}

export const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('task_assignments')
      .select(`
        task_id,
        task:tasks(
          task_id,
          title,
          description,
          start_date,
          end_date,
          status,
          project:projects(project_name, description)
        )
      `)
      .eq('developer_id', user.id);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      const formattedTasks = data?.map((item: any) => ({
        task_id: item.task.task_id,
        title: item.task.title,
        description: item.task.description,
        start_date: item.task.start_date,
        end_date: item.task.end_date,
        status: item.task.status,
        project: item.task.project,
      })) || [];
      setTasks(formattedTasks);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTask(taskId);

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('task_id', taskId);

    if (error) {
      alert('Error updating task: ' + error.message);
    } else {
      fetchTasks();
    }

    setUpdatingTask(null);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return { total, inProgress, completed };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-lg">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Developer Dashboard</h1>
            <p className="text-gray-600">View and manage your assigned tasks</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <CheckSquare className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-800">{stats.inProgress}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks assigned yet</p>
            <p className="text-gray-400 text-sm">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.task_id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Project: <span className="font-medium">{task.project.project_name}</span>
                    </p>
                    <p className="text-gray-600 mb-3">{task.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.start_date && (
                        <span>Start: {new Date(task.start_date).toLocaleDateString()}</span>
                      )}
                      {task.end_date && (
                        <span>End: {new Date(task.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusUpdate(task.task_id, 'IN_PROGRESS')}
                      disabled={updatingTask === task.task_id}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50"
                    >
                      {updatingTask === task.task_id ? 'Updating...' : 'Start Task'}
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate(task.task_id, 'COMPLETED')}
                      disabled={updatingTask === task.task_id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                    >
                      {updatingTask === task.task_id ? 'Updating...' : 'Mark Complete'}
                    </button>
                  )}
                  {task.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusUpdate(task.task_id, 'IN_PROGRESS')}
                      disabled={updatingTask === task.task_id}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium disabled:opacity-50"
                    >
                      {updatingTask === task.task_id ? 'Updating...' : 'Reopen Task'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
