"use client"

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  percentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  contractor_id: string;
  freelancer_id: string | null;
  title: string;
  description: string;
  image_url: string | null;
  total_amount: number;
  expected_delivery_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export function useProjectMilestones(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      setLoading(true);
      setError(null);

      try {
        const [projectResult, milestonesResult] = await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single(),
          supabase
            .from('milestones')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })
        ]);

        if (projectResult.error) {
          throw new Error(`Error fetching project: ${projectResult.error.message}`);
        }

        if (milestonesResult.error) {
          throw new Error(`Error fetching milestones: ${milestonesResult.error.message}`);
        }

        setProject(projectResult.data);
        setMilestones(milestonesResult.data || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, supabase]);

  const fetchProject = async () => {
    setError(null);

    try {
      const { data, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw new Error(`Error fetching project: ${projectError.message}`);
      }

      setProject(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching project:', error);
      return null;
    }
  };

  const fetchMilestones = async () => {
    setError(null);

    try {
      const { data, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (milestonesError) {
        throw new Error(`Error fetching milestones: ${milestonesError.message}`);
      }

      setMilestones(data || []);
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching milestones:', error);
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchProject(), fetchMilestones()]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('milestones')
        .update({ status })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating milestone: ${error.message}`);
      }

      // Update local state
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.id === milestoneId ? { ...milestone, status } : milestone
        )
      );

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating milestone:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData: {
    title: string;
    description?: string;
    percentage: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          title: milestoneData.title,
          description: milestoneData.description || null,
          percentage: milestoneData.percentage,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating milestone: ${error.message}`);
      }

      // Update local state
      setMilestones(prev => [...prev, data]);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating milestone:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMilestone = () => {
    return milestones.find(m => m.status === 'in_progress') || 
           milestones.find(m => m.status === 'pending') || 
           null;
  };

  const calculateProgress = () => {
    if (!milestones.length) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    return Math.round((completedMilestones.length / milestones.length) * 100);
  };

  const getMilestoneAmount = (milestone: Milestone, totalAmount: number) => {
    return Math.round(totalAmount * (milestone.percentage / 100));
  };

  return {
    project,
    milestones,
    loading,
    error,
    fetchProject,
    fetchMilestones,
    fetchAllData,
    updateMilestoneStatus,
    createMilestone,
    getCurrentMilestone,
    calculateProgress,
    getMilestoneAmount
  };
}
