import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="text-xl font-semibold text-primary">
              The Matrix
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/documentation">
              <span className="text-sm text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-nav-docs">
                Documentation
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="default" data-testid="button-nav-login">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="default" data-testid="button-nav-signup">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/documentation" onClick={() => setOpen(false)}>
                    <span className="text-base text-foreground hover:text-primary transition-colors cursor-pointer block" data-testid="link-mobile-docs">
                      Documentation
                    </span>
                  </Link>
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="default" className="w-full" data-testid="button-mobile-login">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)}>
                      <Button variant="default" size="default" className="w-full" data-testid="button-mobile-signup">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
