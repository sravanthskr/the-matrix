import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 px-2">
            Enter{" "}
            <span className="text-primary animate-pulse">The Matrix</span>{" "}
            get into the APIs
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
            You take the red pill, you stay in Database, and I show you how deep the movie-world goes
          </p>
          <Link href="/signup">
            <Button 
              size="default" 
              className="gap-2" 
              data-testid="button-get-api-key"
            >
              Get Your API Key
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Heading before API blocks */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-8 sm:mb-12 px-4">
          Sic Mundus Creatus Est
        </h2>

        {/* API Request and Response Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <Card className="p-4 sm:p-6 bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground ml-2 truncate">GET /api/movies</span>
            </div>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2">API Request</h3>
            </div>
            <div className="bg-background/50 rounded-md p-3 sm:p-4 border border-border/50 font-mono text-[10px] sm:text-xs space-y-1 mb-4 overflow-x-auto">
              <div className="text-muted-foreground whitespace-nowrap">curl -H "X-API-Key: your_api_key" \</div>
              <div className="text-muted-foreground pl-2 sm:pl-4 break-all">"https://thematrix.sravanthskr2004.workers.dev/api/search?q=the%20matrix"</div>
            </div>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary rounded"></div>
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2">Secure API Access</p>
          </Card>

          <Card className="p-4 sm:p-6 bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground ml-2">200 OK</span>
            </div>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2">JSON Response</h3>
            </div>
            <div className="bg-background/50 rounded-md p-3 sm:p-4 border border-border/50 font-mono text-[10px] sm:text-xs space-y-1 overflow-auto max-h-48">
              <div className="text-muted-foreground">&#123;</div>
              <div className="text-muted-foreground pl-2">"movies": [</div>
              <div className="text-muted-foreground pl-4">&#123;</div>
              <div className="text-primary pl-4 sm:pl-6">"id": 1,</div>
              <div className="text-primary pl-4 sm:pl-6">"title": "The Matrix",</div>
              <div className="text-primary pl-4 sm:pl-6">"year": 1999,</div>
              <div className="text-primary pl-4 sm:pl-6 break-all">"director": "Lana Wachowski, Lilly Wachowski",</div>
              <div className="text-primary pl-4 sm:pl-6">"rating": 8.7,</div>
              <div className="text-primary pl-4 sm:pl-6 break-all">"genres": ["Action", "Sci-Fi"],</div>
              <div className="text-primary pl-4 sm:pl-6">"cast": [</div>
              <div className="text-muted-foreground pl-6 sm:pl-8 break-all">&#123;"name": "Keanu Reeves", "role": "Neo"&#125;,</div>
              <div className="text-muted-foreground pl-6 sm:pl-8 break-all">&#123;"name": "Laurence Fishburne", "role": "Morpheus"&#125;,</div>
              <div className="text-muted-foreground pl-6 sm:pl-8 break-all">&#123;"name": "Carrie-Anne Moss", "role": "Trinity"&#125;</div>
              <div className="text-primary pl-4 sm:pl-6">],</div>
              <div className="text-primary pl-4 sm:pl-6 break-all">"plot": "A computer hacker learns about the true nature of reality...",</div>
              <div className="text-primary pl-4 sm:pl-6 break-all">"poster_url": "https://m.media-amazon.com/images/M/MV5B....jpg"</div>
              <div className="text-muted-foreground pl-4">&#125;</div>
              <div className="text-muted-foreground pl-2">]</div>
              <div className="text-muted-foreground">&#125;</div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
