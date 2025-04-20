console.log("Video Speed Controller script loaded.");

const SPEED_STEP = 0.1;
const MIN_SPEED = 0.1;
const MAX_SPEED = 16;

// Load default speed from storage
let defaultSpeed = 1.0;
chrome.storage.sync.get(['defaultSpeed'], function(result) {
    if (result.defaultSpeed) {
        defaultSpeed = result.defaultSpeed;
        console.log("Loaded default speed:", defaultSpeed);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateDefaultSpeed') {
        defaultSpeed = request.speed;
        console.log("Updated default speed to:", defaultSpeed);
        
        // Update all existing videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.hasAttribute('data-speed-controller-added')) {
                video.playbackRate = defaultSpeed;
            }
        });
    }
});

function createSpeedController(videoElement) {
    if (videoElement.hasAttribute('data-speed-controller-added')) {
        return; // Controller already added
    }

    // Set initial speed to default
    videoElement.playbackRate = defaultSpeed;

    const controller = document.createElement('div');
    controller.className = 'video-speed-controller';

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.title = 'Decrease Speed (Ctrl + <)';
    decreaseButton.onclick = (e) => {
        e.stopPropagation(); // Prevent video click-to-play/pause
        changeSpeed(videoElement, -SPEED_STEP);
    };

    const speedDisplay = document.createElement('span');
    speedDisplay.textContent = `${videoElement.playbackRate.toFixed(1)}x`;
    speedDisplay.title = 'Current Speed';

    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.title = 'Increase Speed (Ctrl + >)';
    increaseButton.onclick = (e) => {
        e.stopPropagation(); // Prevent video click-to-play/pause
        changeSpeed(videoElement, SPEED_STEP);
    };

    const pipButton = document.createElement('button');
    pipButton.textContent = 'PiP';
    pipButton.title = 'Picture-in-Picture (Ctrl + Shift + P)';
    pipButton.onclick = (e) => {
        e.stopPropagation();
        togglePictureInPicture(videoElement);
    };

    // Disable PiP button if not supported or disabled for this video
    if (!document.pictureInPictureEnabled || videoElement.disablePictureInPicture) {
        pipButton.disabled = true;
        pipButton.title = 'Picture-in-Picture not available';
    }

    controller.appendChild(decreaseButton);
    controller.appendChild(speedDisplay);
    controller.appendChild(increaseButton);
    controller.appendChild(pipButton);

    // Position the controller relative to the video
    videoElement.parentNode.style.position = 'relative';
    videoElement.parentNode.insertBefore(controller, videoElement);
    videoElement.setAttribute('data-speed-controller-added', 'true');

    // Update speed display when rate changes
    videoElement.addEventListener('ratechange', () => {
        speedDisplay.textContent = `${videoElement.playbackRate.toFixed(1)}x`;
    });

    console.log("Controller added for:", videoElement);
}

function changeSpeed(videoElement, delta) {
    let newSpeed = videoElement.playbackRate + delta;
    newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed)); // Clamp speed
    videoElement.playbackRate = newSpeed;
    // The 'ratechange' event listener will update the display
    console.log(`Speed changed to ${newSpeed.toFixed(1)}x for:`, videoElement);
}

// --- New Function for PiP ---
async function togglePictureInPicture(videoElement) {
    if (!document.pictureInPictureEnabled) {
        console.warn('Picture-in-Picture is not enabled in this browser.');
        return;
    }
    if (videoElement.disablePictureInPicture) {
        console.warn('Picture-in-Picture is disabled for this video.');
        return;
    }

    try {
        if (document.pictureInPictureElement === videoElement) {
            await document.exitPictureInPicture();
            console.log('Exited Picture-in-Picture for:', videoElement);
        } else {
            await videoElement.requestPictureInPicture();
            console.log('Entered Picture-in-Picture for:', videoElement);
        }
    } catch (error) {
        console.error('Error toggling Picture-in-Picture:', error);
    }
}
// --- End New Function ---

function initializeControllers() {
    const videos = document.querySelectorAll('video');
    console.log(`Found ${videos.length} video(s) on the page.`);
    videos.forEach(video => {
        // Check if video is actually visible and has dimensions
        if (video.offsetParent !== null && video.offsetWidth > 0 && video.offsetHeight > 0) {
             // Small delay to ensure video is potentially ready and parent is positioned
             setTimeout(() => createSpeedController(video), 100);
        } else {
            // Handle cases where video might become visible later (basic check)
            const visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target.offsetWidth > 0 && entry.target.offsetHeight > 0) {
                        setTimeout(() => createSpeedController(entry.target), 100);
                        visibilityObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            visibilityObserver.observe(video);
        }
    });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Use event.key for modern browsers. Check for Mac Meta key or general Ctrl key.
    if ((event.metaKey || event.ctrlKey)) {
        let targetVideo = document.activeElement.tagName === 'VIDEO' ? document.activeElement : null;

        // If no video is focused, try to find a video under the mouse
        if (!targetVideo) {
            const hoveredElements = document.querySelectorAll(':hover');
            for (let i = hoveredElements.length - 1; i >= 0; i--) {
                if (hoveredElements[i].tagName === 'VIDEO') {
                    targetVideo = hoveredElements[i];
                    break;
                }
            }
        }
        
        // If still no target video, find the first controllable video on the page
        if (!targetVideo) {
             targetVideo = document.querySelector('video[data-speed-controller-added]');
        }

        if (targetVideo) {
            if (event.key === ',') { // '<' key often represented as ','
                event.preventDefault();
                changeSpeed(targetVideo, -SPEED_STEP);
            } else if (event.key === '.') { // '>' key often represented as '.'
                event.preventDefault();
                changeSpeed(targetVideo, SPEED_STEP);
            }
            // --- Add PiP Shortcut ---
            else if (event.shiftKey && event.key.toUpperCase() === 'P') { // Ctrl/Cmd + Shift + P
                 event.preventDefault();
                 togglePictureInPicture(targetVideo);
            }
            // --- Add Reset Speed Shortcut ---
            else if (event.key === '1') { // Ctrl/Cmd + 1
                event.preventDefault();
                targetVideo.playbackRate = 1.0;
                console.log('Speed reset to 1.0x for:', targetVideo);
            }
            // --- End Reset Speed Shortcut ---
        }
    }
});

// Initial run
initializeControllers();

// Use MutationObserver to detect videos added later (e.g., on dynamic pages like YouTube)
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node is a video or contains video elements
                    if (node.tagName === 'VIDEO') {
                       if (node.offsetParent !== null && node.offsetWidth > 0 && node.offsetHeight > 0) {
                            setTimeout(() => createSpeedController(node), 100);
                       }
                    } else {
                        node.querySelectorAll('video').forEach(video => {
                             if (video.offsetParent !== null && video.offsetWidth > 0 && video.offsetHeight > 0) {
                                setTimeout(() => createSpeedController(video), 100);
                             }
                        });
                    }
                }
            });
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("Mutation observer started."); 