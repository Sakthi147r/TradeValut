import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import StorefrontLayout from "./components/StorefrontLayout";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("@/pages/Home"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const SupplierPage = lazy(() => import("@/pages/SupplierPage"));
const BuyerGuide = lazy(() => import("@/pages/BuyerGuide"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const SavedPage = lazy(() => import("@/pages/SavedPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#8c8e87]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b47d22] border-t-transparent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:handle" component={ProductPage} />
        <Route path="/supplier/:slug" component={SupplierPage} />
        <Route path="/buyer-guide" component={BuyerGuide} />
        <Route path="/account" component={AccountPage} />
        <Route path="/saved" component={SavedPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CartProvider>
            <StorefrontLayout>
              <Router />
            </StorefrontLayout>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
