# EEG Trigger JS

A lightweight JavaScript module for sending trigger values to EEG recording systems through a REST API.

## Overview

This module provides a simple interface to send trigger markers to an EEG recording system via HTTP requests. 

## Installation

### Via CDN (Browser)

Include the script in your HTML file using the CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js"></script>
```

The module will be available as a global object called `eegTrigger`.

### ES Modules

Import the module in your JavaScript file:

```javascript
// Import everything as a namespace
import * as eegTrigger from './path/to/triggers.js';

// OR import default export
import eegTrigger from './path/to/triggers.js';

// OR import individual functions
import { sendTrigger, configureServer } from './path/to/triggers.js';
```

When using CDN with ES modules:

```javascript
// Import the module from CDN
import eegTrigger from 'https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js';
// OR
import { sendTrigger, configureServer } from 'https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js';
```

### Git Submodule

You can include this library as a git submodule in your project:

```bash
# Add the submodule to your project
git submodule add https://github.com/the-wise-lab/eeg-trigger-js.git external/eeg-trigger-js

# Later, to update the submodule to the latest version
git submodule update --remote --merge

# When cloning a project that uses this submodule
git clone --recurse-submodules https://github.com/your-username/your-project.git
```

Then import it in your project:

```javascript
// As ES module
import eegTrigger from './external/eeg-trigger-js/triggers.js';
// OR 
import { sendTrigger } from './external/eeg-trigger-js/triggers.js';

// In HTML (standard script tag)
<script src="./external/eeg-trigger-js/triggers.js"></script>
```

## Usage

### Configuring the Server

Before sending triggers, you can configure the server address and port (optional - defaults to 127.0.0.1:5000):

```javascript
// Configure the server (do this once at the start of your application)
eegTrigger.configureServer('localhost', 8080);
```

### Verbose Mode

Enable verbose mode to log timestamps when triggers are sent and responses are received:

```javascript
// Enable verbose mode
eegTrigger.toggleVerbose(true);

// Disable verbose mode
eegTrigger.toggleVerbose(false);
```

When verbose mode is enabled, timestamps in the format `HH:MM:SS.mmm` will be logged to the console:

```
[14:22:35.123] Sending trigger: 1
[14:22:35.231] Response received for trigger: 1
```

### Sending Triggers

Send trigger values to the EEG recording system:

```javascript
// Send a trigger with value 1
eegTrigger.sendTrigger(1)
  .then(response => {
    console.log('Trigger sent successfully:', response);
  })
  .catch(error => {
    console.error('Failed to send trigger:', error);
  });
  
// Send another trigger with a different value
eegTrigger.sendTrigger(42);
```

### Getting the Server URL

If you need to check the current server URL:

```javascript
const url = eegTrigger.getServerUrl();
console.log(`Currently sending triggers to: ${url}`);
```

### Performance Optimization

For timing-critical applications, enable low-latency mode to reduce overhead:

```javascript
// Enable low-latency mode
eegTrigger.setPerformanceMode(true);

// Enable ultra-low-latency mode by skipping response processing
eegTrigger.setPerformanceMode(true, true);

// Disable low-latency optimizations
eegTrigger.setPerformanceMode(false);
```

In low-latency mode:
- Objects are reused to minimize memory allocation
- String concatenation is optimized
- Response handling is optional

For sending multiple triggers at once (when applicable):
```javascript
// Send multiple triggers in a single request
eegTrigger.sendTriggerBatch([1, 2, 3, 4])
  .then(response => console.log('Batch sent'));
```

## API Reference

### `configureServer(host, port)`

Configure the server address and port.

- `host`: String - The server host address (e.g., '127.0.0.1', 'localhost')
- `port`: Number - The server port

### `sendTrigger(triggerValue)`

Send a trigger value to the EEG recording system.

- `triggerValue`: Number - The trigger value to send
- Returns: Promise - Resolves with the server response or rejects with an error

### `getServerUrl()`

Get the current server URL based on the configuration.

- Returns: String - The complete server URL

### `toggleVerbose(enable)`

Enable or disable verbose mode with timestamps.

- `enable`: Boolean - Whether to enable verbose logging (default: true if not specified)

### `setPerformanceMode(enable, skipResponse)`

Enable or disable low-latency optimizations.

- `enable`: Boolean - Whether to enable low-latency mode (default: true if not specified)
- `skipResponse`: Boolean - Whether to skip waiting for and processing responses (optional)

### `sendTriggerBatch(triggerValues)`

Send multiple trigger values in a single request.

- `triggerValues`: Number[] - Array of trigger values to send
- Returns: Promise - Resolves with the server response or rejects with an error

## Advanced Features

### TriggerManager

The library includes a TriggerManager class that provides additional functionality:

- Named triggers using a mapping system
- Trigger history tracking
- Hierarchical trigger naming with dot notation
- Loading trigger mappings from JSON files

```javascript
// Import TriggerManager singleton instance
import triggerManager from './path/to/triggerManager.js';

// Initialize with server configuration
await triggerManager.initialize('127.0.0.1', 5001, './triggerMappings.json');

// Send a trigger using an event name
triggerManager.sendTriggerByEvent('scenes.intro.start', 'Intro animation started');

// Get trigger history
const history = triggerManager.getTriggerHistory();
console.log('Sent triggers:', history);
```

#### TriggerManager API

##### `initialize(host, port, mappingsPath)`

Initialize the trigger manager with configuration.

- `host`: String - The server host address
- `port`: Number - The server port
- `mappingsPath`: String - Path to JSON file containing trigger mappings
- Returns: Promise - Resolves to success status

##### `loadMappings(path)`

Load trigger mappings from a JSON file.

- `path`: String - Path to the JSON file
- Returns: Promise - Resolves to the loaded mappings

##### `sendTriggerByEvent(eventPath, label)`

Send a trigger using an event path name.

- `eventPath`: String - Path in dot notation (e.g., "scenes.intro.start")
- `label`: String - Optional description for logging
- Returns: Promise - Resolves when the trigger is sent

##### `sendTrigger(value, label)`

Send a raw trigger value.

- `value`: Number - The trigger value to send
- `label`: String - Optional description for logging
- Returns: Promise - Resolves when the trigger is sent

##### `getTriggerHistory()`

Get the history of all sent triggers.

- Returns: Array - Array of trigger events with values, labels and timestamps

#### Example Trigger Mappings JSON

```json
{
  "system": {
    "initialized": 1,
    "error": 2,
    "test": 99
  },
  "scenes": {
    "intro": {
      "start": 10,
      "end": 11,
      "click_to_play": 12
    },
    "tutorial": {
      "start": 20,
      "complete": 21
    }
  },
  "events": {
    "keypress": 50,
    "mouseclick": 51
  }
}
```

## Examples

### Using TriggerManager in a Web Application

```html
<!DOCTYPE html>
<html>
<head>
    <title>EEG Experiment with TriggerManager</title>
</head>
<body>
    <div id="stimulus">Ready</div>
    <button id="start-button">Start Experiment</button>

    <script type="module">
        import { triggerManager } from 'https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js';
        
        // Initialize the trigger manager
        triggerManager.initialize('127.0.0.1', 5000, './triggerMappings.json')
          .then(success => {
            if (success) {
              console.log('TriggerManager initialized successfully');
              document.getElementById('start-button').disabled = false;
            } else {
              console.error('Failed to initialize TriggerManager');
            }
          });

        // Function to present a stimulus and send a trigger
        function presentStimulus(stimulusType) {
            // Display the stimulus
            document.getElementById('stimulus').innerText = `Stimulus ${stimulusType}`;
            
            // Send the trigger using an event path
            triggerManager.sendTriggerByEvent(`stimuli.${stimulusType}.display`, 'Stimulus displayed')
                .then(() => console.log(`Trigger for ${stimulusType} sent`))
                .catch(err => console.error('Trigger error:', err));
        }

        // Use in your experiment
        document.getElementById('start-button').addEventListener('click', () => {
            // Present different stimuli with timed intervals
            setTimeout(() => presentStimulus('visual'), 1000);
            setTimeout(() => presentStimulus('auditory'), 3000);
        });
    </script>
</body>
</html>
```

## Example: Web-Based Experiment

```html
<!DOCTYPE html>
<html>
<head>
    <title>EEG Experiment</title>
    <!-- Include the EEG Trigger JS library -->
    <script src="https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js"></script>
</head>
<body>
    <div id="stimulus">Ready</div>
    <button id="start-button">Start Experiment</button>

    <script>
        // Configure the server
        eegTrigger.configureServer('127.0.0.1', 5000);

        // Function to present a stimulus and send a trigger
        function presentStimulus(stimulusId) {
            // Display the stimulus
            document.getElementById('stimulus').innerText = `Stimulus ${stimulusId}`;
            
            // Send the trigger
            eegTrigger.sendTrigger(stimulusId)
                .then(() => console.log(`Trigger ${stimulusId} sent`))
                .catch(err => console.error('Trigger error:', err));
        }

        // Use in your experiment
        document.getElementById('start-button').addEventListener('click', () => {
            // Present stimulus 1 after 1 second
            setTimeout(() => presentStimulus(1), 1000);
            
            // Present stimulus 2 after 2 seconds
            setTimeout(() => presentStimulus(2), 2000);
        });
    </script>
</body>
</html>
```

## Example: Web-Based Experiment with ES Modules

```html
<!DOCTYPE html>
<html>
<head>
    <title>EEG Experiment with ES Modules</title>
</head>
<body>
    <div id="stimulus">Ready</div>
    <button id="start-button">Start Experiment</button>

    <script type="module">
        // Import from CDN
        import { sendTrigger, configureServer, setPerformanceMode } from 'https://cdn.jsdelivr.net/gh/the-wise-lab/eeg-trigger-js@main/triggers.js';
        
        // Configure the server
        configureServer('127.0.0.1', 5000);
        
        // Enable performance mode
        setPerformanceMode(true, true);

        // Function to present a stimulus and send a trigger
        function presentStimulus(stimulusId) {
            // Display the stimulus
            document.getElementById('stimulus').innerText = `Stimulus ${stimulusId}`;
            
            // Send the trigger
            sendTrigger(stimulusId)
                .then(() => console.log(`Trigger ${stimulusId} sent`))
                .catch(err => console.error('Trigger error:', err));
        }

        // Use in your experiment
        document.getElementById('start-button').addEventListener('click', () => {
            // Present stimulus 1 after 1 second
            setTimeout(() => presentStimulus(1), 1000);
            
            // Present stimulus 2 after 2 seconds
            setTimeout(() => presentStimulus(2), 2000);
        });
    </script>
</body>
</html>
```

## Notes

- Ensure you have a corresponding API endpoint listening at the configured address.
- The module expects the server to accept POST requests with JSON content.
- All trigger communication is asynchronous using Promises.
- For precise timing, consider browser limitations and network latency.
- Cross-Origin Resource Sharing (CORS) may need to be enabled on your server if the web page is hosted on a different domain.
- For maximum timing precision:
  1. Enable performance mode with `eegTrigger.setPerformanceMode(true, true)`
  2. Minimize browser activity during critical measurements
  3. Consider using a dedicated machine for experiments
  4. If possible, run the API server locally on the same machine
