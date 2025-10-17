
import { RecommendationForm } from '@/components/recommendation-form';
import { Recommendations } from '@/components/recommendations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Wand2, Languages } from 'lucide-react';


type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function Home({
  searchParams,
}: {
  searchParams: PageProps['searchParams'];
}) {
  const location = (searchParams.location as string) || '';
  const interests = (searchParams.interests as string) || '';

  return (
    <div className="flex flex-col bg-background text-foreground">
      <header className="container mx-auto px-4 py-12 md:py-20 text-center flex flex-col items-center">
        {/* Custom SVG Logo */}
        <Link href="/" className="w-full max-w-md">
          <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <g id="logo-icon">
              <circle cx="60" cy="60" r="35" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"/>
              <line x1="60" y1="28" x2="60" y2="35" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="85" x2="60" y2="92" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
              <line x1="28" y1="60" x2="35" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
              <line x1="85" y1="60" x2="92" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
              <path d="M 60 45 C 52 45 46 51 46 59 C 46 69 60 80 60 80 C 60 80 74 69 74 59 C 74 51 68 45 60 45 Z" 
                    fill="hsl(var(--primary))" stroke="hsl(var(--destructive))" strokeWidth="2"/>
              <circle cx="60" cy="59" r="5" fill="hsl(var(--primary-foreground))"/>
              <g transform="rotate(45 60 60)">
                <path d="M 60 50 L 65 60 L 60 70 L 55 60 Z" fill="hsl(var(--foreground))" opacity="0.8"/>
              </g>
            </g>
            <g id="logo-text">
              <text x="110" y="70" fontFamily="var(--font-headline), serif" fontSize="40" fontWeight="700" fill="hsl(var(--foreground))">
                Get<tspan fill="hsl(var(--primary))">Wander</tspan><tspan>Wise</tspan>
              </text>
              <text x="110" y="90" fontFamily="var(--font-body), sans-serif" fontSize="12" fontWeight="400" fill="hsl(var(--muted-foreground))" letterSpacing="1">
                YOUR PERSONAL TRAVEL GUIDE
              </text>
            </g>
          </svg>
        </Link>
        <div className="mt-8 flex gap-4">
            <Button asChild>
                <Link href="/itinerary">
                    <Wand2 className="mr-2 h-4 w-4" />
                    AI Itinerary Planner
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/translate">
                    <Languages className="mr-2 h-4 w-4" />
                    Language Assistant
                </Link>
            </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 flex-grow w-full">
        <div className="max-w-2xl mx-auto mb-12">
          <RecommendationForm
            defaultLocation={location}
            defaultInterests={interests}
          />
        </div>
        
        <Recommendations location={location} interests={interests} />

      </main>
    </div>
  );
}
