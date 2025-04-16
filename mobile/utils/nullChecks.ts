/**
 * Utility functions for handling null and undefined values
 */

/**
 * Safely access a property of an object that might be null or undefined
 * @param obj The object to access
 * @param path The path to the property, using dot notation
 * @param defaultValue The default value to return if the property is null or undefined
 * @returns The property value or the default value
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === null || result === undefined) ? defaultValue : result;
};

/**
 * Check if an array is valid (not null, undefined, and is actually an array)
 * @param arr The array to check
 * @returns True if the array is valid, false otherwise
 */
export const isValidArray = (arr: any): boolean => {
  return Array.isArray(arr) && arr !== null && arr !== undefined;
};

/**
 * Safely map over an array that might be null or undefined
 * @param arr The array to map over
 * @param mapFn The mapping function
 * @returns The mapped array or an empty array if the input is not a valid array
 */
export const safeMap = <T, U>(arr: T[] | null | undefined, mapFn: (item: T, index: number) => U): U[] => {
  return isValidArray(arr) ? (arr as T[]).map(mapFn) : [];
};

/**
 * Safely join an array that might be null or undefined
 * @param arr The array to join
 * @param separator The separator to use
 * @returns The joined string or an empty string if the input is not a valid array
 */
export const safeJoin = (arr: any[] | null | undefined, separator: string = ', '): string => {
  return isValidArray(arr) ? arr.join(separator) : '';
};

/**
 * Get a default value if the input is null or undefined
 * @param value The value to check
 * @param defaultValue The default value to return
 * @returns The input value or the default value
 */
export const defaultIfNull = <T>(value: T | null | undefined, defaultValue: T): T => {
  return (value === null || value === undefined) ? defaultValue : value;
};

/**
 * Safely parse a JSON string
 * @param jsonString The JSON string to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed object or the default value
 */
export const safeJsonParse = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};
