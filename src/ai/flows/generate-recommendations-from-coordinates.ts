
'use server';
/**
 * @fileOverview Generates personalized recommendations based on user's geographic coordinates and interests.
 *
 * - generateRecommendationsFromCoordinates - A function that takes coordinates and interests to return recommendations.
 * - GenerateRecommendationsFromCoordinatesInput - The input type for the function.
 * - GenerateRecommendationsFromCoordinatesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  generateRecommendationsFlow,
  type GenerateRecommendationsOutput,
} from './generate-recommendations';
import { getAddressFromCoordinates } from '../tools/get-address-from-coordinates';

const GenerateRecommendationsFromCoordinatesInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
  interests: z
    .string()
    .describe('The user interests (e.g., food, art, beaches).'),
});
export type GenerateRecommendationsFromCoordinatesInput = z.infer<
  typeof GenerateRecommendationsFromCoordinatesInputSchema
>;

export type GenerateRecommendationsFromCoordinatesOutput =
  GenerateRecommendationsOutput;

export async function generateRecommendationsFromCoordinates(
  input: GenerateRecommendationsFromCoordinatesInput
): Promise<GenerateRecommendationsFromCoordinatesOutput> {
  return generateRecommendationsFromCoordinatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsFromCoordinatesPrompt',
  input: {
    schema: z.object({
      location: z.string(),
      interests: z.string(),
    }),
  },
  output: { schema: generateRecommendationsFlow.outputSchema },
  prompt: `You are a travel expert. Given a location and the user's interests, generate personalized recommendations for restaurants, hotels, attractions, shops, and nightlife. For each recommendation, provide a publicly accessible high-quality photo URL.

Location: {{{location}}}
Interests: {{{interests}}}

Format your output as a JSON object. Provide 3-5 recommendations for each category. Do not include any additional explanation. Only return a valid JSON object.
`,
});

const generateRecommendationsFromCoordinatesFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFromCoordinatesFlow',
    inputSchema: GenerateRecommendationsFromCoordinatesInputSchema,
    outputSchema: generateRecommendationsFlow.outputSchema,
    tools: [getAddressFromCoordinates],
  },
  async ({ latitude, longitude, interests }) => {
    const location = await getAddressFromCoordinates({ latitude, longitude });
    const { output } = await prompt({ location, interests });
    return output!;
  }
);
