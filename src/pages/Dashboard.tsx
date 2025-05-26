
import DashboardStatsCards from "@/components/DashboardStatsCards";
import DashboardServiceTutorials from "@/components/DashboardServiceTutorials";
import DashboardCreditsCard from "@/components/DashboardCreditsCard";
import JobProgressTracker from "@/components/JobProgressTracker";

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your account and quick access to our AI services.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards />

      {/* Job Progress and Credits */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <JobProgressTracker />
        </div>
        <div>
          <DashboardCreditsCard />
        </div>
      </div>

      {/* Service Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Learn How to Use Our Services</h2>
        <DashboardServiceTutorials />
      </div>
    </div>
  );
};

export default Dashboard;
