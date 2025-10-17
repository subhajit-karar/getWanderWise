/**
 * @fileoverview Defines a Genkit tool for converting latitude and longitude coordinates into a human-readable address.
 *
 * - getAddressFromCoordinates - A tool that performs reverse geocoding.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetAddressInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});

export const getAddressFromCoordinates = ai.defineTool(
  {
    name: 'getAddressFromCoordinates',
    description:
      'Converts latitude and longitude coordinates into a human-readable address.',
    inputSchema: GetAddressInputSchema,
    outputSchema: z.string().describe('The human-readable address.'),
  },
  async ({ latitude, longitude }) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('Using GEMINI_API_KEY for Geocoding:', apiKey ? 'found' : 'not found');

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch address from Google Maps API');
      }
      const data = await response.json();
      if (data.status !== 'OK' || !data.results?.[0]) {
        throw new Error(
          `Google Maps API could not find an address for the given coordinates. Status: ${data.status}`
        );
      }
      // Return a formatted address, preferring locality and country.
      const addressComponents = data.results[0].address_components;
      const locality =
        addressComponents.find((c: any) => c.types.includes('locality'))
          ?.long_name || '';
      const country =
        addressComponents.find((c: any) => c.types.includes('country'))
          ?.long_name || '';

      if (locality && country) {
        return `${locality}, ${country}`;
      }

      return data.results[0].formatted_address;
    } catch (error: any) {
      console.error('Error in getAddressFromCoordinates tool:', error);
      // Fallback to returning coordinates as a string if the API fails.
      return `${latitude}, ${longitude}`;
    }
  }
);
