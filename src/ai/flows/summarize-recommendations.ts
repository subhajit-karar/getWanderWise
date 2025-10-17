'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing travel recommendations.
 *
 * - summarizeRecommendations - A function that takes location and interest data and generates a summary of recommendations.
 * - SummarizeRecommendationsInput - The input type for the summarizeRecommendations function.
 * - SummarizeRecommendationsOutput - The return type for the summarizeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecommendationsInputSchema = z.object({
  location: z.string().describe('The location for which to generate recommendations.'),
  interests: z.string().describe('The interests of the user, such as food, art, or beaches.'),
  restaurantRecommendations: z.array(z.string()).describe('A list of restaurant recommendations.'),
  hotelRecommendations: z.array(z.string()).describe('A list of hotel recommendations.'),
  attractionRecommendations: z.array(z.string()).describe('A list of attraction recommendations.'),
  shopRecommendations: z.array(z.string()).describe('A list of shop recommendations.'),
});
export type SummarizeRecommendationsInput = z.infer<typeof SummarizeRecommendationsInputSchema>;

const SummarizeRecommendationsOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the recommendations.'),
});
export type SummarizeRecommendationsOutput = z.infer<typeof SummarizeRecommendationsOutputSchema>;

export async function summarizeRecommendations(input: SummarizeRecommendationsInput): Promise<SummarizeRecommendationsOutput> {
  return summarizeRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecommendationsPrompt',
  input: {schema: SummarizeRecommendationsInputSchema},
  output: {schema: SummarizeRecommendationsOutputSchema},
  prompt: `You are a travel expert summarizing recommendations for a user.

  Location: {{location}}
  Interests: {{interests}}
  Restaurant Recommendations: {{#each restaurantRecommendations}}- {{this}}\n{{/each}}
  Hotel Recommendations: {{#each hotelRecommendations}}- {{this}}\n{{/each}}
  Attraction Recommendations: {{#each attractionRecommendations}}- {{this}}\n{{/each}}
 Shop Recommendations: {{#each shopRecommendations}}- {{this}}\n{{/each}}

  Based on the location, interests, and recommendations provided, generate a concise summary of what is available for the user. The summary should be no more than two sentences.
  `,
});

const summarizeRecommendationsFlow = ai.defineFlow(
  {
    name: 'summarizeRecommendationsFlow',
    inputSchema: SummarizeRecommendationsInputSchema,
    outputSchema: SummarizeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
