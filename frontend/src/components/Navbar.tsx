import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Sparkles, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
      { label: "Home", to: "/" },
      { label: "Upload", to: "/upload" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Profile", to: "/profile" },
    ]
    : [
      { label: "Home", to: "/" },
    ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="PathForge AI"
            className="h-8 w-8 object-contain rounded-lg"
          />
          <span className="text-[15px] font-semibold tracking-tight text-[#E5E7EB]">
            Path<span className="text-[#3B82F6]">Forge</span> AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <Button variant="outline" size="sm" className="hidden md:flex rounded-lg" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="outline" size="sm" className="rounded-lg">
                Sign In
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border/30"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
