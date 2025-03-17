/**
 * Trigger client module for EEG experiments
 */

// Create the module content
const createEegTriggerModule = function() {
    // Server configuration with defaults
    let serverConfig = {
        host: "127.0.0.1",
        port: 5000,
        verboseMode: false,
        lowLatencyMode: false,
        skipResponseProcessing: false,
    };

    // Pre-create fetch options to avoid object creation during high-performance scenarios
    let fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: "{}",
    };

    // Prepare a reusable request body template to avoid string concatenation
    let requestBodyTemplate = '{"trigger_value":';

    /**
     * Configure the server address
     * @param {string} host - The server host address
     * @param {number} port - The server port
     */
    function configureServer(host, port) {
        if (host) serverConfig.host = host;
        if (port) serverConfig.port = port;
    }

    /**
     * Toggle verbose mode on/off
     * @param {boolean} enable - Whether to enable verbose mode
     */
    function toggleVerbose(enable) {
        serverConfig.verboseMode =
            enable === undefined ? true : Boolean(enable);
    }

    /**
     * Enable or disable low-latency optimizations
     * @param {boolean} enable - Whether to enable low-latency mode
     * @param {boolean} skipResponse - Whether to skip waiting for and processing responses
     */
    function setPerformanceMode(enable, skipResponse) {
        serverConfig.lowLatencyMode =
            enable === undefined ? true : Boolean(enable);
        if (skipResponse !== undefined) {
            serverConfig.skipResponseProcessing = Boolean(skipResponse);
        }
    }

    /**
     * Format the current time as HH:MM:SS.mmm
     * @returns {string} - Formatted timestamp
     */
    function getFormattedTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    /**
     * Get the current server URL based on configuration
     * @returns {string} - The complete server URL
     */
    function getServerUrl() {
        return `http://${serverConfig.host}:${serverConfig.port}/set_data`;
    }

    /**
     * Sends multiple trigger values in a single batch request
     * @param {number[]} triggerValues - Array of trigger values to send
     * @returns {Promise} - A promise that resolves when the request completes
     */
    function sendTriggerBatch(triggerValues) {
        const timestamp = serverConfig.verboseMode
            ? getFormattedTimestamp()
            : null;

        if (serverConfig.verboseMode) {
            console.log(`[${timestamp}] Sending trigger batch:`, triggerValues);
        }

        return fetch(getServerUrl() + "/batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trigger_values: triggerValues,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (serverConfig.verboseMode) {
                    const responseTimestamp = getFormattedTimestamp();
                    console.log(
                        `[${responseTimestamp}] Response received for trigger batch`
                    );
                }

                return response.json();
            })
            .catch((error) => {
                if (serverConfig.verboseMode) {
                    const errorTimestamp = getFormattedTimestamp();
                    console.error(
                        `[${errorTimestamp}] Error for trigger batch:`,
                        error
                    );
                } else {
                    console.error("Error sending trigger batch:", error);
                }
                throw error;
            });
    }

    /**
     * Sends a trigger value to the API endpoint
     * @param {number} triggerValue - The value to send as a trigger
     * @returns {Promise} - A promise that resolves when the request completes
     */
    function sendTrigger(triggerValue) {
        // If in low latency mode, use optimized code path
        if (serverConfig.lowLatencyMode) {
            if (serverConfig.verboseMode) {
                const timestamp = getFormattedTimestamp();
                console.log(`[${timestamp}] Sending trigger: ${triggerValue}`);
            }

            // Modify the existing fetchOptions object instead of creating a new one
            fetchOptions.body = requestBodyTemplate + triggerValue + "}";

            const fetchPromise = fetch(getServerUrl(), fetchOptions);

            if (serverConfig.skipResponseProcessing) {
                // Don't wait for response in ultra-low-latency mode
                return new Promise((resolve) => {
                    resolve({ status: "pending", triggerValue });
                });
            } else {
                return fetchPromise
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                `HTTP error! Status: ${response.status}`
                            );
                        }

                        if (serverConfig.verboseMode) {
                            const responseTimestamp = getFormattedTimestamp();
                            console.log(
                                `[${responseTimestamp}] Response received for trigger: ${triggerValue}`
                            );
                        }

                        return response.json();
                    })
                    .catch((error) => {
                        console.error("Error sending trigger:", error);
                        throw error;
                    });
            }
        }

        // Standard mode (more reliability, slightly more overhead)
        const timestamp = serverConfig.verboseMode
            ? getFormattedTimestamp()
            : null;

        if (serverConfig.verboseMode) {
            console.log(`[${timestamp}] Sending trigger: ${triggerValue}`);
        }

        return fetch(getServerUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trigger_value: triggerValue,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (serverConfig.verboseMode) {
                    const responseTimestamp = getFormattedTimestamp();
                    console.log(
                        `[${responseTimestamp}] Response received for trigger: ${triggerValue}`
                    );
                }

                return response.json();
            })
            .catch((error) => {
                if (serverConfig.verboseMode) {
                    const errorTimestamp = getFormattedTimestamp();
                    console.error(
                        `[${errorTimestamp}] Error for trigger ${triggerValue}:`,
                        error
                    );
                } else {
                    console.error("Error sending trigger:", error);
                }
                throw error;
            });
    }

    // Return the public API
    return {
        sendTrigger,
        sendTriggerBatch,
        configureServer,
        getServerUrl,
        toggleVerbose,
        setPerformanceMode,
    };
};

// Create the module instance
const eegTriggerInstance = createEegTriggerModule();

// UMD pattern for CommonJS, AMD, and global
(function (root, eegTrigger) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module
        define([], function() { return eegTrigger; });
    } else if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports
        module.exports = eegTrigger;
        // Also add named exports for ESM compatibility
        Object.keys(eegTrigger).forEach(key => {
            module.exports[key] = eegTrigger[key];
        });
    } else {
        // Browser globals (root is window)
        root.eegTrigger = eegTrigger;
    }
})(typeof self !== "undefined" ? self : this, eegTriggerInstance);

// Remove circular import - we'll handle the triggerManager import separately
// import triggerManager, { TriggerManager } from './triggerManager.js';

// Add ES Module export compatibility
export const sendTrigger = eegTriggerInstance.sendTrigger;
export const sendTriggerBatch = eegTriggerInstance.sendTriggerBatch;
export const configureServer = eegTriggerInstance.configureServer;
export const getServerUrl = eegTriggerInstance.getServerUrl;
export const toggleVerbose = eegTriggerInstance.toggleVerbose;
export const setPerformanceMode = eegTriggerInstance.setPerformanceMode;

// Default export for ES modules
export default eegTriggerInstance;

// Export a function to access TriggerManager when needed (lazy loading)
export const getTriggerManager = async () => {
    // Dynamically import to avoid circular reference
    const module = await import('./triggerManager.js');
    return {
        triggerManager: module.default,
        TriggerManager: module.TriggerManager
    };
};
