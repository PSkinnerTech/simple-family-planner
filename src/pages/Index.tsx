import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/AuthPage";
import { CalendarView } from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Family Hub</h1>
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Calendar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <CalendarView />
    </div>
  );
};

export default Index;
