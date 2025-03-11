import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  longitude: number;
  latitude: number;
  address?: string;
}

export interface LocationHookReturn {
  location: LocationData | null;
  errorMsg: string | null;
  loading: boolean;
  getLocation: () => Promise<LocationData | null>;
  getAddressFromCoords: (coords: { latitude: number; longitude: number }) => Promise<string | null>;
  getCoordsFromAddress: (address: string) => Promise<{ latitude: number; longitude: number } | null>;
}

export function useLocation(): LocationHookReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Request current location from device
   */
  const getLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Location Permission Required', 
          'To find trades near you, please allow SwopKasi to access your location.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // Attempt to get the address
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });

        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          const addressString = [
            address.street,
            address.district,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

          locationData.address = addressString;
        }
      } catch (addressError) {
        console.error('Error getting address:', addressError);
        // We still return the coordinates even if address lookup fails
      }

      setLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Could not get your location. Please check your device settings.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get address from coordinates
   */
  const getAddressFromCoords = async (
    coords: { latitude: number; longitude: number }
  ): Promise<string | null> => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        return [
          address.street,
          address.district,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  /**
   * Get coordinates from address
   */
  const getCoordsFromAddress = async (
    address: string
  ): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const geocodeResponse = await Location.geocodeAsync(address);

      if (geocodeResponse && geocodeResponse.length > 0) {
        return {
          latitude: geocodeResponse[0].latitude,
          longitude: geocodeResponse[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // You can initialize location when the hook is first used
  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    errorMsg,
    loading,
    getLocation,
    getAddressFromCoords,
    getCoordsFromAddress,
  };
}