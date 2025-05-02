import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UIProvider } from "@/contexts/UIContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Tasks from "@/pages/Tasks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/tasks" component={Tasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <Router />
        <Toaster />
      </UIProvider>
    </QueryClientProvider>
  );
}

export default App;
