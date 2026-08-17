/* ODHYAY style: Quiet Editorial — near-black reading-room surfaces, warm ivory type, and restrained Chapter Amethyst accents. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AboutPage } from "./pages/Odhyay";
import { BookPersistentPage, CategoriesPersistentPage, HomePersistentPage, LibraryPersistentPage, ReaderPersistentPage, SearchPersistentPage } from "./pages/OdhyayPersistent";
import { AdminPersistentBooksPage, AdminPersistentDashboardPage, AdminPersistentNewBookPage } from "./pages/OdhyayPersistentAdmin";
import { FavoritesPage } from "./pages/FavoritesPage";
import { LoginPersistentPage } from "./pages/LoginPersistentPage";


function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePersistentPage} />
      <Route path="/library" component={LibraryPersistentPage} />
      <Route path="/categories" component={CategoriesPersistentPage} />
      <Route path="/search" component={SearchPersistentPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/book/:slug" component={BookPersistentPage} />
      <Route path="/read/:slug" component={ReaderPersistentPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/login" component={LoginPersistentPage} />
      <Route path="/admin" component={AdminPersistentDashboardPage} />
      <Route path="/admin/books" component={AdminPersistentBooksPage} />
      <Route path="/admin/books/new" component={AdminPersistentNewBookPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}


export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
