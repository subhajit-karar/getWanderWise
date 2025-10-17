'use server';

/**
 * @fileOverview Generates a travel itinerary based on user preferences.
 *
 * - generateItinerary - A function that takes location, interests, and duration to generate a day-by-day itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ActivitySchema = z.object({
  title: z.string().describe('The title of the activity.'),
  description: z.string().describe('A brief description of the activity.'),
});

const DayPlanSchema = z.object({
  morning: z.array(ActivitySchema).describe('Activities for the morning.'),
  afternoon: z.array(ActivitySchema).describe('Activities for the afternoon.'),
  evening: z.array(ActivitySchema).describe('Activities for the evening.'),
});

const GenerateItineraryInputSchema = z.object({
  location: z.string().describe('The destination for the trip.'),
  interests: z.string().describe('The user\'s interests (e.g., history, food, adventure).'),
  duration: z.number().int().min(1).max(14).describe('The duration of the trip in days.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(z.object({
    day: z.number(),
    plan: DayPlanSchema,
  })).describe('A day-by-day itinerary.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;


export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItineraryPrompt',
  input: { schema: GenerateItineraryInputSchema },
  output: { schema: GenerateItineraryOutputSchema },
  prompt: `You are an expert travel planner. Create a detailed day-by-day itinerary for a trip based on the user's input.

Location: {{{location}}}
Interests: {{{interests}}}
Duration: {{{duration}}} days

For each day, provide a plan with distinct activities for the morning, afternoon, and evening. Include a mix of popular attractions and hidden gems that align with the user's interests.

Format your output as a JSON object.
`,
});

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
