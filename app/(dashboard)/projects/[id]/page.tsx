"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Calendar,
  Upload,
  Settings,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProjectMilestones } from "@/lib/hooks/useProjectMilestones";
import { CompletedMilestoneIcon } from "@/components/milestone-icons/completed-milestone-icon";
import { PendingMilestoneIcon } from "@/components/milestone-icons/pending-milestone-icon";

export default function ProjectPage() {
  const [milestoneCompleted, setMilestoneCompleted] = useState(false);

  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const {
    project,
    milestones,
    loading,
    fetchAllData,
    updateMilestoneStatus,
    getCurrentMilestone,
  } = useProjectMilestones(projectId);

  const currentMilestone = getCurrentMilestone();

  const handleViewContract = () => {
    const contractUrl = project?.contract_url;
    if (contractUrl) {
      window.open(contractUrl, "_blank");
    } else {
      console.error("No contract URL found for this project");
      // Optionally show a toast or alert to the user
      alert("No contract available for this project yet.");
    }
  };

  const handleMilestoneComplete = async () => {
    if (!currentMilestone) return;

    try {
      await updateMilestoneStatus(currentMilestone.id, "completed");
      setMilestoneCompleted(true);
      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error("Error completing milestone:", error);
    }
  };

  const getDaysLeft = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Proyecto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 gap-2 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Panel - Project Details */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">
                  {project.title}
                </h1>
                <p className="text-white/80 text-lg mb-8">
                  {project.description}
                </p>
                <Badge className="bg-black text-white px-4 py-2 text-lg">
                  Total: ${project.total_amount.toLocaleString()} USD
                </Badge>
              </CardContent>
            </Card>

            {/* Right Panel - Current Milestone */}
            <Card className="bg-blue-600 border-blue-500">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Current milestone:
                </h2>

                {currentMilestone ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-white" />
                      <span className="text-white text-lg">
                        {currentMilestone.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-white/80" />
                      <span className="text-white/80">
                        Deadline:{" "}
                        {new Date(
                          project.expected_delivery_date
                        ).toLocaleDateString("es-ES")}
                      </span>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Badge className="bg-white/20 text-white border-white/30">
                        Receive for this milestone:{" "}
                        {currentMilestone.percentage}%
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {getDaysLeft(project.expected_delivery_date)} days left
                      </Badge>
                    </div>

                    <div className="mt-6 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={milestoneCompleted}
                          onChange={(e) =>
                            setMilestoneCompleted(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">
                          Marcar hito como completado
                        </span>
                      </label>

                      <Button className="w-full bg-white text-blue-600 hover:bg-white/90 gap-2">
                        <Upload className="h-4 w-4" />
                        Subir evidencia
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60">No hay hitos pendientes</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Milestones Timeline */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>

            {milestones.length === 0 ? (
              /* No milestones - Show message */
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Este proyecto no tiene milestones
                    </h3>
                    <p className="text-white/80">
                      Los milestones deben ser creados al momento de crear el
                      proyecto.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Has milestones - Show timeline */
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-600"></div>

                {/* Milestones */}
                <div className="flex justify-between items-start">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex flex-col items-center relative z-10"
                    >
                      {/* Milestone icon */}
                      <div className="w-16 h-16 mb-4">
                        {milestone.status === "completed" ? (
                          <CompletedMilestoneIcon
                            id={`completed-${milestone.id}`}
                          />
                        ) : (
                          <PendingMilestoneIcon />
                        )}
                      </div>

                      {/* Milestone title and amount */}
                      <div className="text-center max-w-32">
                        <h3 className="text-white text-sm font-medium mb-2 leading-tight">
                          {milestone.title}
                        </h3>
                        <p className="text-blue-400 text-sm font-semibold">
                          $
                          {Math.round(
                            project.total_amount * (milestone.percentage / 100)
                          ).toLocaleString()}{" "}
                          USD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-white text-lg">Progreso del proyecto:</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      milestones.length > 0
                        ? (milestones.filter((m) => m.status === "completed")
                            .length /
                            milestones.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-white text-lg">
                {milestones.length > 0
                  ? Math.round(
                      (milestones.filter((m) => m.status === "completed")
                        .length /
                        milestones.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="flex justify-end gap-4">
            <Button onClick={handleViewContract} variant="secondary">
              <FileText className="h-5 w-5" />
              Ver Contrato
            </Button>
            <Button
              onClick={handleMilestoneComplete}
              disabled={!milestoneCompleted}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg gap-2 disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              Guardar cambios
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
