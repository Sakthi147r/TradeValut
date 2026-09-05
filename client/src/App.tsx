import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import SupplierPage from "@/pages/SupplierPage";
import BuyerGuide from "@/pages/BuyerGuide";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import StorefrontLayout from "./components/StorefrontLayout";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/product/:handle" component={ProductPage} />
    <Route path="/supplier/:slug" component={SupplierPage} />
    <Route path="/buyer-guide" component={BuyerGuide} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><CartProvider><StorefrontLayout><Router /></StorefrontLayout></CartProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
