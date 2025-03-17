/**
 * Trigger client module for EEG experiments
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module
        define([], factory);
    } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.eegTrigger = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    
    // Server configuration with defaults
    let serverConfig = {
        host: '127.0.0.1',
        port: 5000,
        verboseMode: false
    };

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
        serverConfig.verboseMode = enable === undefined ? true : Boolean(enable);
    }

    /**
     * Format the current time as HH:MM:SS.mmm
     * @returns {string} - Formatted timestamp
     */
    function getFormattedTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        
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
     * Sends a trigger value to the API endpoint
     * @param {number} triggerValue - The value to send as a trigger
     * @returns {Promise} - A promise that resolves when the request completes
     */
    function sendTrigger(triggerValue) {
        const timestamp = getFormattedTimestamp();
        
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
                    console.log(`[${responseTimestamp}] Response received for trigger: ${triggerValue}`);
                }
                
                return response.json();
            })
            .catch((error) => {
                if (serverConfig.verboseMode) {
                    const errorTimestamp = getFormattedTimestamp();
                    console.error(`[${errorTimestamp}] Error for trigger ${triggerValue}:`, error);
                } else {
                    console.error("Error sending trigger:", error);
                }
                throw error;
            });
    }

    // Return the public API
    return {
        sendTrigger,
        configureServer,
        getServerUrl,
        toggleVerbose
    };
}));
