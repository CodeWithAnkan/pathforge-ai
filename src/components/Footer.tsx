import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold">PathForge AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Transform your career with AI-powered learning paths tailored to your unique skills and goals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors">About</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Terms</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Documentation</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© 2024 PathForge AI. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            Built with AI
          </div>
        </div>
      </div>
    </footer>
  );
}
