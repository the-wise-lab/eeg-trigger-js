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
        port: 5000
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
                return response.json();
            })
            .catch((error) => {
                console.error("Error sending trigger:", error);
                throw error;
            });
    }

    // Return the public API
    return {
        sendTrigger,
        configureServer,
        getServerUrl
    };
}));
