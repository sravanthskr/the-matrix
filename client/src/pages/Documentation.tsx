import { Copy, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Documentation() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">API Documentation</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Complete API reference and examples
          </p>
        </div>

        {/* Getting Started */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            The Movie API provides simple, RESTful endpoints to fetch comprehensive movie data including titles, years, cast, directors, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Authentication Required</h4>
                  <p className="text-sm text-muted-foreground">All endpoints require a valid API key in the request header.</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Rich Dataset</h4>
                  <p className="text-sm text-muted-foreground">Access movie data across 100+ films with cast, crew and metadata.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Base URL</h2>
          <div className="bg-card border border-border rounded-lg p-4 relative group">
            <code className="text-primary font-mono text-xs sm:text-sm break-all">https://thematrix.sravanthskr2004.workers.dev</code>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard("https://thematrix.sravanthskr2004.workers.dev")}
              data-testid="button-copy-base-url"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Authentication */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Authentication</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Include your API key in the request header:
          </p>
          <div className="bg-card border border-border rounded-lg p-4 relative group">
            <code className="text-primary font-mono text-xs sm:text-sm break-all">X-API-Key: your_api_key_here</code>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard("X-API-Key: your_api_key_here")}
              data-testid="button-copy-auth-header"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: You can find your API key through your dashboard after signing up.
          </p>
        </div>

        {/* API Endpoints */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">API Endpoints</h2>
          
          {/* GET /api/movies */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
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
                  <div className="font-mono text-muted-foreground">page</div>
                  <div className="text-muted-foreground">integer</div>
                  <div className="col-span-2 text-muted-foreground">Page number (default: 1)</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div className="font-mono text-muted-foreground">limit</div>
                  <div className="text-muted-foreground">integer</div>
                  <div className="col-span-2 text-muted-foreground">Results per page (default: 20)</div>
                </div>
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
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/movies?genre=action&limit=10"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/movies?genre=action&limit=10"`)}
                  data-testid="button-copy-movies-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET /api/movies/{id} */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
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
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/movies/1"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/movies/1"`)}
                  data-testid="button-copy-movie-id-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET /api/genres */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
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
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/genres"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/genres"`)}
                  data-testid="button-copy-genres-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET /api/years */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
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
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/years"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/years"`)}
                  data-testid="button-copy-years-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET /api/search */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                <span className="font-mono text-sm">/api/search</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Search movies by title, director, or plot
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
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/search?q=matrix"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/search?q=matrix"`)}
                  data-testid="button-copy-search-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET /api/stats */}
          <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-semibold">GET</span>
                <span className="font-mono text-sm">/api/stats</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Retrieve database statistics
              </p>

              <h4 className="text-sm font-semibold mb-3">Example Request</h4>
              <div className="bg-background/50 border border-border/50 rounded-md p-3 font-mono text-xs relative group">
                <pre className="text-primary whitespace-pre-wrap break-all">
{`curl -H "X-API-Key: your_api_key" \\
  "https://thematrix.sravanthskr2004.workers.dev/api/stats"`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(`curl -H "X-API-Key: your_api_key" \\\n  "https://thematrix.sravanthskr2004.workers.dev/api/stats"`)}
                  data-testid="button-copy-stats-example"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Response Format */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Response Format</h2>
          <p className="text-muted-foreground mb-4">
            All responses are returned in JSON format.
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Success</h4>
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
      "genres": ["Action", "Sci-Fi"],
      "cast": [
        { "name": "Keanu Reeves", "role": "Neo" }
      ]
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
          <p className="text-muted-foreground mb-4">
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
              <span className="text-sm text-muted-foreground">Unauthorized – Invalid or missing API key</span>
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
    </div>
  );
}
