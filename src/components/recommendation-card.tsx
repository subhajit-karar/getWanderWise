
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import type { GenerateRecommendationsOutput } from '@/ai/flows/generate-recommendations';
import { MapPin } from 'lucide-react';

type Recommendation = GenerateRecommendationsOutput['restaurants'][0];

interface RecommendationCardProps {
    recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recommendation.address)}`;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 ease-in-out flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
                <CardTitle className="font-headline text-lg mb-2">{recommendation.name}</CardTitle>
                <CardDescription className="mb-4 flex-grow">{recommendation.description}</CardDescription>
                <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm text-muted-foreground mt-auto hover:text-primary transition-colors"
                >
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{recommendation.address}</span>
                </a>
            </CardContent>
        </Card>
    );
}
