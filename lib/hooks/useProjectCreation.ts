"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface MilestoneData {
  title: string;
  description: string;
  percentage: number;
  deadline: string;
}

interface ProjectData {
  title: string;
  description: string;
  total_amount: number;
  expected_delivery_date: string;
  freelancer_id?: string | null;
  milestones: MilestoneData[];
}

export function useProjectCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const createProject = async (data: ProjectData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Get user profile to verify they are a contractor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      if (profile.role !== "contractor") {
        throw new Error("Only contractors can create projects");
      }

      console.log("Creating project with data:", data);

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          contractor_id: user.id,
          freelancer_id: data.freelancer_id || null,
          title: data.title,
          description: data.description,
          total_amount: data.total_amount,
          expected_delivery_date: data.expected_delivery_date,
          status: "draft",
        })
        .select()
        .single();

      if (projectError) {
        console.error("Project creation error:", projectError);
        throw new Error(`Error creating project: ${projectError.message}`);
      }

      console.log("Project created successfully:", project);

      // Create milestones if provided
      if (data.milestones && data.milestones.length > 0) {
        console.log("Creating milestones:", data.milestones);

        const milestonesData = data.milestones.map((milestone) => ({
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          percentage: milestone.percentage,
          status: "pending" as const,
        }));

        const { data: createdMilestones, error: milestonesError } =
          await supabase.from("milestones").insert(milestonesData).select();

        if (milestonesError) {
          console.error("Error creating milestones:", milestonesError);
          throw new Error(
            `Error creating milestones: ${milestonesError.message}`
          );
        }

        console.log("Milestones created successfully:", createdMilestones);
      }

      // Create project invitation if freelancer is assigned
      if (data.freelancer_id) {
        console.log(
          "Creating project invitation for freelancer:",
          data.freelancer_id
        );

        // Get freelancer email from their profile
        const { data: freelancerProfile, error: freelancerError } =
          await supabase
            .from("profiles")
            .select("email")
            .eq("id", data.freelancer_id)
            .single();

        if (freelancerError) {
          console.error("Error fetching freelancer profile:", freelancerError);
          throw new Error(
            `Error fetching freelancer profile: ${freelancerError.message}`
          );
        }

        // Create project invitation
        const { data: invitation, error: invitationError } = await supabase
          .from("project_invitations")
          .insert({
            project_id: project.id,
            contractor_id: user.id,
            freelancer_email: freelancerProfile.email,
            freelancer_id: data.freelancer_id,
            status: "pending",
          })
          .select()
          .single();

        if (invitationError) {
          console.error("Error creating project invitation:", invitationError);
          throw new Error(
            `Error creating project invitation: ${invitationError.message}`
          );
        }

        console.log("Project invitation created successfully:", invitation);

        // Create notification for freelancer
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: data.freelancer_id,
            type: "project_invitation",
            title: "New Project Invitation",
            message: `You have been invited to work on the project "${data.title}"`,
            project_id: project.id,
            read: false,
          });

        if (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Don't throw error here, invitation was created successfully
        } else {
          console.log("Notification created successfully");
        }
      }

      console.log("Project creation completed successfully");
      return { success: true, project };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error creating project:", error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProject,
    isLoading,
    error,
  };
}
