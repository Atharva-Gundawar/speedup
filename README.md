# Video Speed Controller Extension

A simple Chrome extension that adds speed controls to any HTML5 video player.

## Features

- Adds speed control buttons (+/-) to all HTML5 videos
- Adds a Picture-in-Picture (PiP) button to pop videos out
- Set default playback speed for all videos
- Keyboard shortcuts for speed control and PiP
- Works on most websites with video content
- Speed range: 0.1x to 16x
- Real-time speed display

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Atharva-Gundawar/speedup.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

## Usage

- Click the `+` button to increase video speed
- Click the `-` button to decrease video speed
- Click the `PiP` button to toggle Picture-in-Picture mode
- Click the extension icon to set default playback speed
- Use keyboard shortcuts:
  - `Ctrl + >` (or `Cmd + >` on Mac): Increase speed
  - `Ctrl + <` (or `Cmd + <` on Mac): Decrease speed
  - `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac): Toggle Picture-in-Picture

The controls will automatically appear above any HTML5 video player on the page.

## Default Speed

- Set your preferred default playback speed in the extension popup
- The default speed will be applied to all new videos
- Speed range: 0.1x to 16x
- Changes are saved across browser sessions

## Speed Range

- Minimum speed: 0.1x
- Maximum speed: 16x
- Speed increment/decrement: 0.1x

## License

MIT License 