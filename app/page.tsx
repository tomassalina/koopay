import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DonutChart } from "@/components/donut-chart";
import { 
  Search, 
  Bell, 
  ArrowRight, 
  Plus, 
  Star, 
  FileText, 
  User, 
  Calendar,
  ChevronDown,
  LogIn
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="Koopay" 
                className="h-8 w-auto"
              />
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search profile..." 
                  className="pl-10 bg-muted/50 border-muted-foreground/20"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Profile & Create Project */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center p-2">
                      <img 
                        src="/logo.svg" 
                        alt="Koopay" 
                        className="h-8 w-auto"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Paytrust Labs</h3>
                      <p className="text-white/80 text-sm">Empresa</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                    Edit profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Create Project Card */}
            <Card className="bg-muted/50 border-muted-foreground/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create a new payment project</h3>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Statistics */}
          <div className="lg:col-span-2">
            <DonutChart />
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Tus Proyectos</h2>
            <Badge variant="secondary" className="gap-1">
              18
              <ChevronDown className="h-3 w-3" />
            </Badge>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Card 1 - In Progress */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Logo Design</CardTitle>
                  <div className="flex items-center gap-1 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">In progress</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Colaborated with Juan Barcos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>From 14/02/25 to 14/04/25</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Divide in 5 Milestones</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-lg">Total Pay: $4000USD</p>
                  <Button className="w-full mt-3">View project</Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Card 2 - Canceled */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Landing Page</CardTitle>
                  <div className="flex items-center gap-1 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm">Canceled</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Colaborated with Micaela Gomez</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>From 13/02/25 to 29/05/25</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Divide in 23 Milestones</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-lg">Total Pay: $1000USD</p>
                  <Button className="w-full mt-3">View project</Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Card 3 - Done */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Logo Design</CardTitle>
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Done</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Colaborated with Juan Barcos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>From 14/02/25 to 14/04/25</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Divide in 5 Milestones</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-lg">Total Pay: $3000USD</p>
                  <Button className="w-full mt-3">View project</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
