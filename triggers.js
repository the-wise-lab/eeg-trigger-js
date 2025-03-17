/**
 * Sends a trigger value to the API endpoint
 * @param {number} triggerValue - The value to send as a trigger
 * @returns {Promise} - A promise that resolves when the request completes
 */
function sendTrigger(triggerValue) {
    return fetch("http://127.0.0.1:5000/set_data", {
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

// Export the function to be used in other modules
module.exports = {
    sendTrigger,
};
