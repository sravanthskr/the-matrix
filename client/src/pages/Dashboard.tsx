/*
  Matrix World - Created by Sravanth Kumar
*/

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Copy, AlertTriangle, Home, BookOpen, Settings, RefreshCw, TrendingUp, LogOut, Key, Menu } from "lucide-react";
import { Link } from "wouter";

const API_URL = 'https://thematrix.sravanthskr2004.workers.dev';

interface UsageData {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  reset_time: string;
  blocked: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLocation("/login");
        return;
      }

      setUserEmail(user.email || "");

      if (!user.emailVerified) {
        setIsLoading(false);
        setShowVerificationAlert(true);
        return;
      }

      try {
        const idToken = await user.getIdToken();

        const response = await fetch(`${API_URL}/api/auth/get-api-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            uid: user.uid,
            idToken: idToken
          })
        });

        if (response.ok) {
          const data = await response.json();
          const key = data.api_key;
          setApiKey(key);
          localStorage.setItem('apiKey', key);
          
          loadUsageStats(key);
          
          const interval = setInterval(() => loadUsageStats(key), 5000);
          return () => clearInterval(interval);
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.message || 'Failed to load API key',
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error loading API key:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setLocation, toast]);

  const loadUsageStats = async (key: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: key })
      });

      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      } else {
        console.error('Failed to load usage stats');
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: "Success",
          description: "Verification email sent! Please check your inbox.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('apiKey');
    localStorage.removeItem('userEmail');
    setLocation('/');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your API key...</p>
        </div>
      </div>
    );
  }

  if (showVerificationAlert) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary">The Matrix</h1>
              <p className="text-muted-foreground mt-1" data-testid="text-user-email">{userEmail}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Email Not Verified</strong>
              <p className="mt-2">Please check your email and click the verification link to get your API key.</p>
              <Button 
                onClick={handleResendVerification} 
                variant="outline" 
                size="sm" 
                className="mt-3"
                data-testid="button-resend-verification"
              >
                Resend Verification Email
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">The Matrix</h1>
        <p className="text-xs text-muted-foreground">Movie API Platform</p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">API MANAGEMENT</h3>
          <button
            onClick={() => {
              setActiveSection("overview");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === "overview" ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
            data-testid="button-nav-overview"
          >
            <Home className="h-4 w-4" />
            Overview
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">DEVELOPER TOOLS</h3>
          <button
            onClick={() => {
              setActiveSection("documentation");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === "documentation" ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
            data-testid="button-nav-docs"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">ACCOUNT</h3>
          <button
            onClick={() => {
              setActiveSection("settings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === "settings" ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
            data-testid="button-nav-settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{userEmail.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">Account</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="w-full" data-testid="button-logout">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar border-b border-sidebar-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">The Matrix</h1>
          <p className="text-xs text-muted-foreground">Movie API Platform</p>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-mobile-dashboard-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-sidebar border-r border-sidebar-border p-6">
          <SidebarContent />
        </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {activeSection === "overview" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-1">Matrix Dashboard</h2>
                <p className="text-muted-foreground">Manage your movie API access and monitor usage</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <Card className="bg-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">API Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{apiKey ? "1" : "0"}</div>
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Daily Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold" data-testid="text-daily-usage-stat">
                        {usageData ? `${usageData.daily.used}/${usageData.daily.limit}` : "0/100"}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    {usageData && (
                      <>
                        <Progress 
                          value={usageData.daily.percentage} 
                          className="h-1.5 mb-2"
                          data-testid="progress-daily"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span data-testid="text-daily-remaining">{usageData.daily.remaining} remaining</span>
                          <span data-testid="text-reset-time">
                            Resets at {new Date(usageData.reset_time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              timeZone: 'UTC'
                            })} UTC
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold" data-testid="text-monthly-usage-stat">
                        {usageData ? `${usageData.monthly.used}/${usageData.monthly.limit}` : "0/3000"}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    {usageData && (
                      <>
                        <Progress 
                          value={usageData.monthly.percentage} 
                          className="h-1.5 mb-2"
                          data-testid="progress-monthly"
                        />
                        <div className="text-xs text-muted-foreground">
                          <span data-testid="text-monthly-remaining">{usageData.monthly.remaining.toLocaleString()} remaining</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* API Keys Section */}
              <Card className="mb-6 bg-card border border-border">
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  {apiKey ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background/50 border border-border/50 rounded-md">
                      <div className="flex-1 overflow-hidden overflow-x-auto">
                        <code className="text-xs sm:text-sm font-mono break-all" data-testid="text-api-key">{apiKey}</code>
                      </div>
                      <Button onClick={copyToClipboard} variant="outline" size="sm" className="shrink-0 w-full sm:w-auto" data-testid="button-copy-api-key">
                        <Copy className="h-4 w-4 sm:mr-0" />
                        <span className="sm:hidden ml-2">Copy</span>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No API keys found. Create your first API key to get started.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Daily Limit Warning Alert - Only shows when limit is reached */}
              {usageData && (usageData.blocked || usageData.daily.used >= usageData.daily.limit) && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>⚠️ Daily Limit Reached</strong>
                    <p className="mt-1 text-sm">You've reached your daily limit of {usageData.daily.limit} requests. Access will resume after midnight UTC.</p>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Documentation Section */}
          {activeSection === "documentation" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-1">API Documentation</h2>
                <p className="text-muted-foreground">Complete API reference and examples</p>
              </div>

              {/* Base URL */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Base URL</h3>
                <div className="bg-card border border-border rounded-lg p-4">
                  <code className="text-primary font-mono text-xs sm:text-sm break-all">https://thematrix.sravanthskr2004.workers.dev</code>
                </div>
              </div>

              {/* Authentication */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Include your API key in the request header:
                </p>
                <div className="bg-card border border-border rounded-lg p-4">
                  <code className="text-primary font-mono text-xs sm:text-sm break-all">X-API-Key: your_api_key_here</code>
                </div>
              </div>

              {/* API Endpoints */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
                
                {/* GET /api/movies */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/movies</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get all movies with optional filtering and pagination.
                    </p>
                    
                    <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="font-mono text-muted-foreground">genre</div>
                        <div className="text-muted-foreground">string</div>
                        <div className="col-span-2 text-muted-foreground">Filter by genre</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="font-mono text-muted-foreground">year</div>
                        <div className="text-muted-foreground">integer</div>
                        <div className="col-span-2 text-muted-foreground">Filter by year (e.g. 2021)</div>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/movies?genre=Action`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* GET /api/movies/{id} */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/movies/&#123;id&#125;</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get a specific movie by ID.
                    </p>
                    
                    <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="font-mono text-muted-foreground">id</div>
                        <div className="text-muted-foreground">integer</div>
                        <div className="col-span-2 text-muted-foreground">Movie ID</div>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/movies/1`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* GET /api/genres */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/genres</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get all available genres.
                    </p>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/genres`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* GET /api/years */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/years</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get available years.
                    </p>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/years`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* GET /api/search */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/search</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Search movies by title, director, or plot.
                    </p>
                    
                    <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="font-mono text-muted-foreground">q</div>
                        <div className="text-muted-foreground">string</div>
                        <div className="col-span-2 text-muted-foreground">Search query (required)</div>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/search?q=matrix`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* GET /api/stats */}
                <div className="mb-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                      <span className="font-mono text-sm">/api/stats</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Retrieve database statistics.
                    </p>

                    <h4 className="text-sm font-semibold mb-3">Example Request</h4>
                    <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                      <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  https://thematrix.sravanthskr2004.workers.dev/api/stats`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Format */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Response Format</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  All responses are returned in JSON format.
                </p>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs">
                    <pre className="text-sm text-primary whitespace-pre-wrap break-all">
{`{
  "movies": [
    {
      "id": 1,
      "title": "The Matrix",
      "year": 1999,
      "director": "Lana Wachowski, Lilly Wachowski",
      "rating": 8.7,
      "genres": ["Action", "Sci-Fi"]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Error Handling */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Error Handling</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  The API uses HTTP status codes to indicate status.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-mono font-semibold min-w-[40px] text-center">200</span>
                    <span className="text-sm text-muted-foreground">Success</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-mono font-semibold min-w-[40px] text-center">400</span>
                    <span className="text-sm text-muted-foreground">Bad Request – Invalid parameters</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-mono font-semibold min-w-[40px] text-center">401</span>
                    <span className="text-sm text-muted-foreground">Unauthorized – Invalid API key</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-mono font-semibold min-w-[40px] text-center">404</span>
                    <span className="text-sm text-muted-foreground">Not Found – Resource doesn't exist</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-mono font-semibold min-w-[40px] text-center">500</span>
                    <span className="text-sm text-muted-foreground">Internal Server Error</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-1">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences</p>
              </div>

              <Card className="mb-6 bg-card border border-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <p className="text-muted-foreground mt-1">{userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Status</label>
                    <p className="text-primary mt-1">Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6 bg-card border border-border">
                <CardHeader>
                  <CardTitle>API Usage Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Limit</span>
                    <span className="text-sm font-medium">100 requests/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Limit</span>
                    <span className="text-sm font-medium">3,000 requests/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Plan</span>
                    <span className="text-sm font-medium">Free Tier</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
