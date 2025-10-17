
'use server';

/**
 * @fileOverview Generates personalized recommendations for restaurants, hotels, attractions, and shops based on user-provided location and interests.
 *
 * - generateRecommendations - A function that takes location and interests as input and returns recommendations.
 * - GenerateRecommendationsInput - The input type for the generateRecommendations function.
 * - GenerateRecommendationsOutput - The return type for the generateRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateRecommendationsInputSchema = z.object({
  location: z.string().describe('The location for which to generate recommendations.'),
  interests: z.string().describe('The user interests (e.g., food, art, beaches).'),
});
export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;

const RecommendationSchema = z.object({
  name: z.string().describe('The name of the place.'),
  description: z.string().describe('A short description of the place.'),
  address: z.string().describe('The address of the place.'),
  photoUrl: z.string().url().describe('A URL for a photo of the place.'),
});

const GenerateRecommendationsOutputSchema = z.object({
  restaurants: z.array(RecommendationSchema).describe('Recommended restaurants.').optional(),
  hotels: z.array(RecommendationSchema).describe('Recommended hotels.').optional(),
  attractions: z.array(RecommendationSchema).describe('Recommended local attractions.').optional(),
  shops: z.array(RecommendationSchema).describe('Recommended local shops.').optional(),
  nightlife: z.array(RecommendationSchema).describe('Recommended nightlife spots.').optional(),
});
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

export async function generateRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `You are a travel expert. Given a location and the user's interests, generate personalized recommendations for restaurants, hotels, attractions, shops and nightlife. For each recommendation, provide a publicly accessible high-quality photo URL.

Location: {{{location}}}
Interests: {{{interests}}}

Format your output as a JSON object. Provide 3-5 recommendations for each category. Do not include any additional explanation. Only return a valid JSON object.
`,
});

export const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
