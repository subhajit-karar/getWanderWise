
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateItinerary,
  type GenerateItineraryOutput,
} from '@/ai/flows/generate-itinerary';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Wand2, Sun, Moon, Sunset } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  location: z.string().min(2, 'Please enter a location.'),
  interests: z.string().min(2, 'Please enter your interests.'),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 day.').max(14, 'Duration cannot exceed 14 days.'),
});

export default function ItineraryPlannerPage() {
  const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      interests: '',
      duration: 3,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    try {
      const result = await generateItinerary(values);
      setItinerary(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="text-center mb-12 flex flex-col items-center">
         <Link href="/" className="w-full max-w-md mb-8">
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
        <h1 className="text-4xl font-bold font-headline">Your Smart Trip Companion</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Share your travel goals — getWanderWise designs the perfect journey for you.</p>
      </header>

      <main>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Art museums, street food, jazz clubs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Duration (days)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="14" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                     <Wand2 className="mr-2 h-4 w-4" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {itinerary && (
          <div className="mt-12 max-w-4xl mx-auto animate-in fade-in-50 duration-500">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">Your Custom Itinerary</h2>
            <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
              {itinerary.itinerary.map(({ day, plan }) => (
                <AccordionItem key={day} value={`day-${day}`}>
                  <AccordionTrigger className="text-xl font-semibold">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-primary"/>
                      Day {day}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 border-l-2 ml-4 border-primary/50">
                    <div className="space-y-6 mt-4">
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><Sun className="h-5 w-5 text-yellow-500"/> Morning</h4>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {plan.morning.map((activity, index) => (
                                    <li key={`morning-${index}`}><b>{activity.title}:</b> {activity.description}</li>
                                ))}
                            </ul>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><Sunset className="h-5 w-5 text-orange-500"/> Afternoon</h4>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {plan.afternoon.map((activity, index) => (
                                    <li key={`afternoon-${index}`}><b>{activity.title}:</b> {activity.description}</li>
                                ))}
                            </ul>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><Moon className="h-5 w-5 text-indigo-500"/> Evening</h4>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {plan.evening.map((activity, index) => (
                                    <li key={`evening-${index}`}><b>{activity.title}:</b> {activity.description}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </main>
    </div>
  );
}
