"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Calendar, Star, Upload, Search, Bell, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProjectMilestones } from "@/lib/hooks/useProjectMilestones";
import { MilestonesTimeline } from "@/components/milestones-timeline";
import { ProjectProgress } from "@/components/project-progress";
import Image from "next/image";

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
    getCurrentMilestone
  } = useProjectMilestones(projectId);

  const currentMilestone = getCurrentMilestone();

  const handleMilestoneComplete = async () => {
    if (!currentMilestone) return;

    try {
      await updateMilestoneStatus(currentMilestone.id, 'completed');
      setMilestoneCompleted(true);
      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error('Error completing milestone:', error);
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
      {/* Top Navigation */}
      <nav className="bg-gray-900/50 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="Koopay" 
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search profile..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

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
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Current milestone:
                </h2>
                
                {currentMilestone ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-blue-500" />
                      <span className="text-white text-lg">{currentMilestone.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-white/80">Deadline: {new Date(project.expected_delivery_date).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Badge className="bg-blue-500 text-white">
                        Receive for this milestone: {currentMilestone.percentage}%
                      </Badge>
                      <Badge className="bg-blue-500 text-white">
                        {getDaysLeft(project.expected_delivery_date)} days left
                      </Badge>
                    </div>

                    <div className="mt-6 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={milestoneCompleted}
                          onChange={(e) => setMilestoneCompleted(e.target.checked)}
                          className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">Marcar hito como completado</span>
                      </label>
                      
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2">
                        <Upload className="h-4 w-4" />
                        Subir evidencia
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60">
                    No hay hitos pendientes
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Milestones Timeline */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
            <MilestonesTimeline milestones={milestones} totalAmount={project.total_amount} />
          </div>

          {/* Project Progress */}
          <ProjectProgress milestones={milestones} />

          {/* Save Changes Button */}
          <div className="flex justify-end">
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
