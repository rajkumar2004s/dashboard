import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/login";
import EmployeeForm from "./pages/employee-form";
import ManagerDashboard from "./pages/manager-dashboard";
import DirectorDashboard from "./pages/director-dashboard";
import CeoDashboard from "./pages/ceo-dashboard";
import Onboarding from "./pages/onboarding";
import NotFound from "./pages/not-found";

type RouteGuardProps = {
  component: React.ComponentType;
  allowedRoles?: string[];
};

function ProtectedRoute({ component: Component, allowedRoles }: RouteGuardProps) {
  const { session, profile, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/login" />;
  }

  if (needsOnboarding) {
    return <Redirect to="/onboarding" />;
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function HomePage() {
  const { session, profile, needsOnboarding } = useAuth();

  if (!session) {
    return <Redirect to="/login" />;
  }

  if (needsOnboarding || !profile) {
    return <Redirect to="/onboarding" />;
  }

  switch (profile.role) {
    case "employee":
      return <Redirect to="/employee/contribute" />;
    case "manager":
      return <Redirect to="/manager/dashboard" />;
    case "director":
      return <Redirect to="/director/dashboard" />;
    case "ceo":
      return <Redirect to="/ceo/dashboard" />;
    default:
      return <Redirect to="/login" />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/onboarding">
        {() => <ProtectedRoute component={Onboarding} />}
      </Route>
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
