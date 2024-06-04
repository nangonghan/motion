

// Define the URLs for different environments
const develop_url = "http://127.0.0.1:9001"; // Assuming local development URL
const production_url = "https://motion-s.17ae.com";

// Use environment variable to determine the current environment
// Default to development URL if the environment variable is not set
export const BASE_URL = process.env.NODE_ENV === 'production' ? production_url : develop_url;
