document.addEventListener('DOMContentLoaded', function() {
    const defaultSpeedInput = document.getElementById('defaultSpeed');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['defaultSpeed'], function(result) {
        if (result.defaultSpeed) {
            defaultSpeedInput.value = result.defaultSpeed;
        }
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const defaultSpeed = parseFloat(defaultSpeedInput.value);
        
        // Validate input
        if (isNaN(defaultSpeed) || defaultSpeed < 0.1 || defaultSpeed > 16) {
            showStatus('Please enter a valid speed between 0.1 and 16', 'error');
            return;
        }

        // Save to storage
        chrome.storage.sync.set({
            defaultSpeed: defaultSpeed
        }, function() {
            showStatus('Settings saved successfully!', 'success');
            
            // Notify all tabs to update video speeds
            chrome.tabs.query({}, function(tabs) {
                tabs.forEach(function(tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'updateDefaultSpeed',
                        speed: defaultSpeed
                    });
                });
            });
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        // Hide status after 3 seconds
        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}); 