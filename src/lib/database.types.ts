export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER';
export type TaskStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          username: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          email: string;
          role: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          username?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          project_id: string;
          project_name: string;
          description: string | null;
          owner_manager_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id?: string;
          project_name: string;
          description?: string | null;
          owner_manager_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          project_name?: string;
          description?: string | null;
          owner_manager_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          task_id: string;
          project_id: string;
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          status: TaskStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          task_id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          task_id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_assignments: {
        Row: {
          assignment_id: string;
          task_id: string;
          developer_id: string;
          assigned_at: string;
        };
        Insert: {
          assignment_id?: string;
          task_id: string;
          developer_id: string;
          assigned_at?: string;
        };
        Update: {
          assignment_id?: string;
          task_id?: string;
          developer_id?: string;
          assigned_at?: string;
        };
      };
      files: {
        Row: {
          file_id: string;
          project_id: string;
          task_id: string | null;
          uploaded_by_user_id: string;
          file_name: string;
          file_path_in_storage: string;
          file_size: number | null;
          mime_type: string | null;
          upload_date: string;
        };
        Insert: {
          file_id?: string;
          project_id: string;
          task_id?: string | null;
          uploaded_by_user_id: string;
          file_name: string;
          file_path_in_storage: string;
          file_size?: number | null;
          mime_type?: string | null;
          upload_date?: string;
        };
        Update: {
          file_id?: string;
          project_id?: string;
          task_id?: string | null;
          uploaded_by_user_id?: string;
          file_name?: string;
          file_path_in_storage?: string;
          file_size?: number | null;
          mime_type?: string | null;
          upload_date?: string;
        };
      };
    };
  };
}
