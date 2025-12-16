// functions/utils/retryHelper.js

/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls a function with exponential backoff and retries on failure.
 * * @param {Function} apiCall - The async function to execute (e.g., calling Gemini API).
 * @param {number} [maxRetries=3] - Maximum number of retries.
 * @returns {Promise<any>} - The result of the successful API call.
 * @throws {Error} - Throws an error if all retries fail.
 */
exports.withExponentialBackoff = async (apiCall, maxRetries = 3) => {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Attempt the API call
            const result = await apiCall();
            // Success! Return the result immediately
            return result;

        } catch (error) {
            // Log the error and prepare for retry
            lastError = error;
            console.warn(`Attempt ${attempt + 1} failed. Retrying... Error: ${error.message}`);

            if (attempt === maxRetries - 1) {
                // If this was the last attempt, throw the final error
                break;
            }

            // Calculate backoff time (e.g., 2^attempt seconds, converted to milliseconds)
            const backoffTimeMs = Math.pow(2, attempt) * 1000;
            console.log(`Waiting for ${backoffTimeMs / 1000} seconds before next retry.`);

            // Wait before the next attempt
            await sleep(backoffTimeMs);
        }
    }

    // If we exit the loop without returning, all attempts failed
    console.error("All API retry attempts failed.");
    throw new Error(`Critical API failure after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
};