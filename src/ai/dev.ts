import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recommendations.ts';
import '@/ai/flows/summarize-recommendations.ts';
import '@/ai/flows/generate-recommendations-from-coordinates.ts';
import '@/ai/flows/generate-itinerary.ts';
import '@/ai/flows/translate-audio.ts';
import '@/ai/flows/text-to-speech.ts';
