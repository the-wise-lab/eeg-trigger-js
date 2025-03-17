import eegTrigger from './triggers.js';

/**
 * TriggerManager - A singleton module to manage EEG trigger functionality
 */
class TriggerManager {
    constructor() {
        this.isInitialized = false;
        this.eegTrigger = eegTrigger;
        this.triggerHistory = [];
        this.triggerMappings = null;
    }

    /**
     * Load trigger mappings from a JSON file
     * @param {string} path - Path to the JSON file containing trigger mappings
     * @returns {Promise} - Promise that resolves when mappings are loaded
     */
    async loadMappings(path = './triggerMappings.json') {
        console.log('Attempting to load trigger mappings from:', path);
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load trigger mappings: ${response.status}`);
            }
            this.triggerMappings = await response.json();
            console.log('Trigger mappings loaded successfully:', this.triggerMappings);
            return this.triggerMappings;
        } catch (error) {
            console.error('Failed to load trigger mappings:', error);
            // Create a basic fallback mapping
            this.triggerMappings = {
                "system.test": 99,
                "system.initialized": 1,
                "system.error": 2
            };
            console.log('Using fallback trigger mappings:', this.triggerMappings);
            return this.triggerMappings;
        }
    }

    /**
     * Initialize the trigger manager with configuration settings
     * @param {string} host - The host address for the EEG trigger server
     * @param {number} port - The port for the EEG trigger server
     * @param {string} mappingsPath - Path to trigger mappings JSON file
     * @returns {Promise<boolean>} - Promise resolving to success status of initialization
     */
    async initialize(host = '127.0.0.1', port = 5001, mappingsPath = './triggerMappings.json') {
        try {
            // Configure the server
            this.eegTrigger.configureServer(host, port);
            this.eegTrigger.toggleVerbose(true);
            this.eegTrigger.setPerformanceMode(true, true);
            
            // Load mappings
            await this.loadMappings(mappingsPath);
            
            this.isInitialized = true;
            
            // Send a test trigger
            await this.sendTriggerByEvent('system.test', 'Test trigger on initialization');
            
            console.log('Trigger manager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize trigger manager:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Lookup a trigger value from an event path
     * @param {string} eventPath - Event path (e.g., "scenes.intro.click_to_play")
     * @returns {number|null} - The trigger value or null if not found
     */
    getTriggerValue(eventPath) {
        if (!this.triggerMappings) {
            console.error('Trigger mappings not loaded');
            return null;
        }

        try {
            // First try direct access (for flat structure)
            if (this.triggerMappings[eventPath] !== undefined) {
                const value = this.triggerMappings[eventPath];
                if (typeof value === 'number') {
                    return value;
                }
            }
            
            // Fall back to hierarchical lookup if not found or not a number
            const pathParts = eventPath.split('.');
            let current = this.triggerMappings;
            
            for (const part of pathParts) {
                if (current[part] === undefined) {
                    console.error(`Trigger path not found: ${eventPath}`);
                    return null;
                }
                current = current[part];
            }
            
            if (typeof current !== 'number') {
                console.error(`Invalid trigger value at path ${eventPath}: ${current}`);
                return null;
            }
            
            return current;
        } catch (error) {
            console.error(`Error looking up trigger value for ${eventPath}:`, error);
            return null;
        }
    }

    /**
     * Send a trigger by event name
     * @param {string} eventPath - Event path in dot notation (e.g., "scenes.intro.click_to_play") 
     * @param {string} [label] - Optional additional description
     * @returns {Promise} - Promise resolving when trigger is sent
     */
    sendTriggerByEvent(eventPath, label = '') {
        const triggerValue = this.getTriggerValue(eventPath);
        
        if (triggerValue === null) {
            return Promise.reject(new Error(`No trigger value found for event: ${eventPath}`));
        }
        
        // Combine eventPath and label for logging
        const fullLabel = eventPath + (label ? ` - ${label}` : '');
        
        return this.sendTrigger(triggerValue, fullLabel);
    }

    /**
     * Send a trigger to the EEG system
     * @param {number} value - The trigger value to send
     * @param {string} [label] - Optional label for logging the trigger
     * @returns {Promise} - Promise resolving when trigger is sent
     */
    sendTrigger(value, label = '') {
        return new Promise((resolve, reject) => {
            try {
                if (!this.isInitialized) {
                    console.warn('Trigger manager not initialized. Trigger not sent.');
                    reject(new Error('Trigger manager not initialized'));
                    return;
                }

                if (typeof this.eegTrigger !== 'undefined' && typeof this.eegTrigger.sendTrigger === 'function') {
                    // Log this trigger
                    const triggerEvent = {
                        value,
                        label,
                        timestamp: Date.now()
                    };
                    this.triggerHistory.push(triggerEvent);
                    
                    // Send the trigger
                    this.eegTrigger.sendTrigger(value)
                        .then(() => {
                            console.log(`Trigger sent: ${value}${label ? ' (' + label + ')' : ''}`);
                            resolve();
                        })
                        .catch(error => {
                            console.error(`Failed to send trigger ${value}:`, error);
                            reject(error);
                        });
                } else {
                    console.warn('EEG trigger functionality not available');
                    reject(new Error('EEG trigger functionality not available'));
                }
            } catch (error) {
                console.error('Error sending trigger:', error);
                reject(error);
            }
        });
    }

    /**
     * Get the history of sent triggers
     * @returns {Array} - Array of trigger events
     */
    getTriggerHistory() {
        return this.triggerHistory;
    }
}

// Create and export a singleton instance
const triggerManager = new TriggerManager();
export default triggerManager;

// Also export the class for users who want to extend or customize it
export { TriggerManager };
