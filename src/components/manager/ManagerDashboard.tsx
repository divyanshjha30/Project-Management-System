import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FolderKanban, Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { TaskManager } from './TaskManager';

interface Project {
  project_id: string;
  project_name: string;
  description: string | null;
  owner_manager_id: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_manager_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data: projectsData } = await supabase
      .from('projects')
      .select('project_id')
      .eq('owner_manager_id', user.id);

    const projectIds = projectsData?.map(p => p.project_id) || [];

    if (projectIds.length === 0) {
      setStats({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
      });
      return;
    }

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('status')
      .in('project_id', projectIds);

    const completedTasks = tasksData?.filter(t => t.status === 'COMPLETED').length || 0;
    const inProgressTasks = tasksData?.filter(t => t.status === 'IN_PROGRESS').length || 0;

    setStats({
      totalProjects: projectIds.length,
      totalTasks: tasksData?.length || 0,
      completedTasks,
      inProgressTasks,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <TaskManager
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
            <p className="text-gray-600">Manage your projects and tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowProjectForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProjects}</p>
            </div>
            <FolderKanban className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-800">{stats.inProgressTasks}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <ProjectList
        projects={projects}
        onSelectProject={setSelectedProject}
        onRefresh={fetchProjects}
      />

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={() => {
            setShowProjectForm(false);
            fetchProjects();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
