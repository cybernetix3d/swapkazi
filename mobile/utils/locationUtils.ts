/**
 * Location utilities for handling geocoding and reverse geocoding
 */

import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '../config/maps';
import api from '../services/api';

/**
 * Get the current location coordinates
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject> => {
  // Request permission to access location
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Location permission not granted');
  }

  // Get current location
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
};

/**
 * Reverse geocode coordinates to get address information
 * This uses our secure server-side API which protects the Google Maps API key
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ address: string; city?: string; region?: string; country?: string }> => {
  try {
    // First try using our server-side geocoding API
    try {
      const response = await api.get('/geocoding/reverse', {
        params: { latitude, longitude }
      });

      if (response.data && response.data.success) {
        const addressData = response.data.data;

        return {
          address: addressData.address,
          city: addressData.city,
          region: addressData.region,
          country: addressData.country
        };
      }
    } catch (error) {
      console.log('Server geocoding failed, falling back to Expo geocoding');
    }

    // Fallback to Expo's geocoding (might fail due to deprecation)
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const addressString = [
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        return {
          address: addressString,
          city: address.city,
          region: address.region,
          country: address.country
        };
      }
    } catch (error) {
      console.log('Expo geocoding failed');
    }

    // If both methods fail, return a placeholder with coordinates
    return {
      address: `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Unknown City',  // Provide default values that can be edited by the user
      region: 'Unknown Region',
      country: 'Unknown Country'
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
};

/**
 * Get location information including coordinates and address
 */
export const getLocationInfo = async () => {
  try {
    // Get current location coordinates
    const location = await getCurrentLocation();

    // Get address from coordinates
    const addressInfo = await reverseGeocode(
      location.coords.latitude,
      location.coords.longitude
    );

    return {
      coordinates: [location.coords.longitude, location.coords.latitude] as [number, number],
      address: addressInfo.address,
      city: addressInfo.city,
      region: addressInfo.region,
      country: addressInfo.country
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    throw error;
  }
};
