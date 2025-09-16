// app/(dashboard)/projects/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Check, Edit, User, Loader2 } from "lucide-react";
import { useFullProjectCreation } from "@/lib/hooks/useFullProjectCreation"; // New Hook
import { MilestoneEditModal } from "@/components/milestone-edit-modal";
import { CollaboratorAssignmentModal } from "@/components/collaborator-assignment-modal";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  // Use our new hook
  const { createAndFundProject, isLoading, error } = useFullProjectCreation();

  // Add a step state to manage the UI
  const [step, setStep] = useState<"form" | "processing" | "complete">("form");

  // All other existing states remain the same...
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(8000);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [assignedCollaborator, setAssignedCollaborator] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<{ id: string; full_name: string; position: string; } | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([{
    id: "1",
    title: "Hero section",
    description: "Create the wireframes and high quality mockup design of the hero section...",
    deadline: "2025-05-14",
    percentage: 50,
  }]);

  const handleBack = () => router.back();

  // ... (handleAddMilestone, handleEditMilestone, handleSaveMilestone, handleDeleteMilestone, handleSelectCollaborator functions remain unchanged)
  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (id: string) => {
    const milestone = milestones.find((m) => m.id === id);
    setEditingMilestone(milestone || null);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    if (editingMilestone) {
      setMilestones(milestones.map((m) => (m.id === milestone.id ? milestone : m)));
    } else {
      setMilestones([...milestones, { ...milestone, id: Date.now().toString() }]);
    }
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSelectCollaborator = (freelancer: { id: string; full_name: string; position: string; }) => {
    setSelectedCollaborator(freelancer);
    setAssignedCollaborator(freelancer.id);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // This is the new function that triggers the blockchain + DB flow
  const handlePublishProject = async () => {
    if (!projectTitle || !projectDescription || !expectedDeliveryDate || !acceptTerms) {
      return;
    }
    setStep("processing");

    const projectData = {
      title: projectTitle,
      description: projectDescription,
      total_amount: totalAmount,
      expected_delivery_date: expectedDeliveryDate,
      freelancer_id: assignedCollaborator,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
      })),
    };

    const result = await createAndFundProject(projectData);

    if (result.success && result.project) {
        setStep("complete");
        // Optionally redirect after a delay
        setTimeout(() => router.push(`/projects/${result.project.id}`), 3000);
    } else {
        // If it fails, go back to the form to show the error
        setStep("form");
    }
  };

  // Conditional Rendering based on the step
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Processing Project</CardTitle>
            <CardDescription>Your project is being created and funded on the blockchain. Please wait.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "complete") {
     return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
            <CardTitle>🎉 Project Created & Funded! 🎉</CardTitle>
            <CardDescription>You will be redirected to your new project shortly.</CardDescription>
            </CardHeader>
             <CardContent className="flex justify-center items-center p-8">
                <Check className="h-16 w-16 text-green-500" />
            </CardContent>
        </Card>
      </div>
    );
  }

  // The original form is rendered when step === 'form'
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-8 text-foreground hover:bg-muted/50 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - New Project (No changes here) */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                New Project
              </h1>
            </div>
            {/* Project Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Project Title
                </label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Brief Description
                </label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  className="bg-muted/50 border-border text-foreground resize-none"
                />
              </div>
            </div>
            {/* Budget Allocation */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Total money allocated to the collaborator:
                </label>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">
                      ${totalAmount.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$100</span>
                      <span>$20,000</span>
                    </div>
                    <Slider
                      value={[totalAmount]}
                      onValueChange={(value) => setTotalAmount(value[0])}
                      min={100}
                      max={20000}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Expected Delivery Date */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Expected Delivery Date
              </label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="bg-muted/50 border-border text-foreground"
              />
            </div>
            {/* Assign Collaborator */}
            <div>
              {selectedCollaborator ? (
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {selectedCollaborator.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCollaborator.position}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCollaborator(null);
                        setAssignedCollaborator(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCollaboratorModalOpen(true)}
                  className="w-full gap-2 border-border text-foreground hover:bg-muted/50 h-12"
                >
                  <span className="text-foreground">Assign Collaborator</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </Button>
              )}
            </div>
          </div>

          {/* Right Section - Define Milestones (No changes here) */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Define Milestones
              </h2>
            </div>
            {/* Milestones List */}
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="bg-muted/30 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">
                        {milestone.title || "Untitled Milestone"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMilestone(milestone.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {milestone.description || "No description provided"}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Deadline: {formatDate(milestone.deadline)}</div>
                      <div>Percent of total: {milestone.percentage}%</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Add Milestone Button */}
            <Button
              variant="outline"
              onClick={handleAddMilestone}
              className="w-full gap-2 border-border text-foreground hover:bg-muted/50"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Terms and Create Project Button */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-foreground cursor-pointer"
            >
              I accept the terms and conditions of the established contract
            </label>
          </div>
          <Button
            onClick={handlePublishProject}
            disabled={
              isLoading ||
              !projectTitle ||
              !projectDescription ||
              !expectedDeliveryDate ||
              !acceptTerms
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg gap-2 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Project"}
            {!isLoading && <Check className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <MilestoneEditModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={editingMilestone}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
      />
      <CollaboratorAssignmentModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        onSelect={handleSelectCollaborator}
        selectedFreelancer={selectedCollaborator}
      />
    </div>
  );
}