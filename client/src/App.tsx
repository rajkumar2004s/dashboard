import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserSelector } from "@/components/UserSelector";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import EmployeeForm from "./pages/employee-form";
import ManagerDashboard from "./pages/manager-dashboard";
import DirectorDashboard from "./pages/director-dashboard";
import CeoDashboard from "./pages/ceo-dashboard";
import NotFound from "./pages/not-found";

type RouteGuardProps = {
  component: React.ComponentType;
  allowedRoles?: string[];
};

function ProtectedRoute({ component: Component, allowedRoles }: RouteGuardProps) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No user selected</div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function HomePage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No user selected</div>
      </div>
    );
  }

  switch (currentUser.role) {
    case 'employee':
      return <Redirect to="/employee/contribute" />;
    case "manager":
      return <Redirect to="/manager/dashboard" />;
    case "director":
      return <Redirect to="/director/dashboard" />;
    case "ceo":
      return <Redirect to="/ceo/dashboard" />;
    default:
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Unknown role</div>
        </div>
      );
  }
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <UserSelector />
        <Switch>
          <Route path="/">
            {() => <ProtectedRoute component={HomePage} />}
          </Route>
          <Route path="/employee/contribute">
            {() => <ProtectedRoute component={EmployeeForm} allowedRoles={["employee"]} />}
          </Route>
          <Route path="/manager/dashboard">
            {() => <ProtectedRoute component={ManagerDashboard} allowedRoles={["manager"]} />}
          </Route>
          <Route path="/director/dashboard">
            {() => <ProtectedRoute component={DirectorDashboard} allowedRoles={["director"]} />}
          </Route>
          <Route path="/ceo/dashboard">
            {() => <ProtectedRoute component={CeoDashboard} allowedRoles={["ceo"]} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <ToastContainer 
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
