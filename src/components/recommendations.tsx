
"use client";

import { useEffect, useState } from 'react';
import { generateRecommendations, type GenerateRecommendationsOutput } from '@/ai/flows/generate-recommendations';
import { generateRecommendationsFromCoordinates } from '@/ai/flows/generate-recommendations-from-coordinates';
import { LoadingSkeletons } from './loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bed, Landmark, MapPin, ShoppingBag, Utensils, AlertTriangle, Frown, Martini } from 'lucide-react';
import { RecommendationCard } from './recommendation-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';


interface RecommendationsProps {
  location: string;
  interests: string;
}

const isCoordinates = (location: string) => {
    const regex = /^-?([1-8]?[0-9]|[1-9]0)\.{1}\d{1,6},-?([1]?[0-7]?[0-9]|[1]?[0-8]?[0])\.{1}\d{1,6}$/;
    return regex.test(location.replace(/\s/g, ''));
}

export function Recommendations({ location, interests }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GenerateRecommendationsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location && interests) {
      setLoading(true);
      setError(null);
      setRecommendations(null);

      let promise;
      if (isCoordinates(location)) {
        const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
        promise = generateRecommendationsFromCoordinates({ latitude, longitude, interests });
      } else {
        promise = generateRecommendations({ location, interests });
      }

      promise
        .then(setRecommendations)
        .catch((e) => {
          console.error(e);
          setError("We couldn't generate recommendations at this time. Our AI might be taking a coffee break. Please try again later.");
        })
        .finally(() => setLoading(false));
    }
  }, [location, interests]);

  if (loading) {
    return <LoadingSkeletons />;
  }

  if (!location || !interests) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <MapPin className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Enter a destination and your interests to begin your journey.</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!recommendations) {
    return null;
  }
  
  const allEmpty = !recommendations.restaurants?.length && !recommendations.hotels?.length && !recommendations.attractions?.length && !recommendations.shops?.length && !recommendations.nightlife?.length;

  if (allEmpty) {
     return (
        <div className="text-center py-16 text-muted-foreground">
            <Frown className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg max-w-lg mx-auto">No recommendations found for "{location}" with interests in "{interests}". Try being more specific or using different keywords.</p>
        </div>
     );
  }

  const recommendationCategories = [
    {
      value: "restaurants",
      title: "Restaurants",
      icon: Utensils,
      data: recommendations.restaurants,
    },
    {
      value: "hotels",
      title: "Hotels",
      icon: Bed,
      data: recommendations.hotels,
    },
    {
      value: "attractions",
      title: "Attractions",
      icon: Landmark,
      data: recommendations.attractions,
    },
    {
      value: "shops",
      title: "Shops",
      icon: ShoppingBag,
      data: recommendations.shops,
    },
    {
      value: "nightlife",
      title: "Nightlife",
      icon: Martini,
      data: recommendations.nightlife,
    },
  ].filter(category => category.data && category.data.length > 0);

  return (
    <div className="animate-in fade-in-50 duration-500">
      <Card>
        <CardContent className="p-4 md:p-6">
            <Tabs defaultValue={recommendationCategories[0].value} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
                    {recommendationCategories.map(category => (
                        <TabsTrigger key={category.value} value={category.value} className="flex gap-2 items-center">
                            <category.icon className="h-5 w-5"/>
                            {category.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {recommendationCategories.map(category => (
                    <TabsContent key={category.value} value={category.value} className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.data.map((rec, index) => (
                                <RecommendationCard key={`${category.title}-${index}`} recommendation={rec} />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
