export async function urlToFile(url, filename, mimeType) {
    try {

        // Use a proxy server in development environment to avoid CORS issues
        let proxyUrl = process.env.NODE_ENV === 'development' ? ' ' : '';

        // Ensure the proxy URL ends with a slash
        if (proxyUrl && !proxyUrl.endsWith('/')) {
            proxyUrl += '/';
        }

        // Fetch the file content from the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the blob from the response
        const blob = await response.blob();

        // Convert the blob to a file
        const file = new File([blob], filename, { type: mimeType });

        return file;
    } catch (error) {
        console.error("Error in urlToFile: ", error);
        return null;
    }
}