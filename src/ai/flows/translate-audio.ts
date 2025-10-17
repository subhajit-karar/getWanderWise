'use server';

/**
 * @fileOverview A Genkit flow for transcribing and translating audio.
 *
 * - translateAudio - A function that takes audio data, transcribes it, and translates it to English.
 * - TranslateAudioInput - The input type for the translateAudio function.
 * - TranslateAudioOutput - The return type for the translateAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateAudioInputSchema = z.object({
  audio: z
    .string()
    .describe(
      "A Base64-encoded audio data URI. Expected format: 'data:audio/webm;base64,...'"
    ),
});
export type TranslateAudioInput = z.infer<typeof TranslateAudioInputSchema>;

const TranslateAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
  translation: z
    .string()
    .describe('The English translation of the transcribed text.'),
});
export type TranslateAudioOutput = z.infer<typeof TranslateAudioOutputSchema>;

export async function translateAudio(
  input: TranslateAudioInput
): Promise<TranslateAudioOutput> {
  return translateAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateAudioPrompt',
  input: { schema: TranslateAudioInputSchema },
  output: { schema: TranslateAudioOutputSchema },
  prompt: `You are a language expert. You will be given an audio file. Your task is to:
1.  Transcribe the audio into text.
2.  Translate the transcribed text into English.

Do not provide any explanation, just the transcription and translation in the specified JSON format.

Audio input: {{media url=audio}}`,
});

const translateAudioFlow = ai.defineFlow(
  {
    name: 'translateAudioFlow',
    inputSchema: TranslateAudioInputSchema,
    outputSchema: TranslateAudioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
