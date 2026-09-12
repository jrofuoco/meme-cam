# Meme Cam

Run `node server.mjs`, then open http://localhost:5173 in Chrome or Edge. Node.js is the only server dependency. The browser downloads the pinned MediaPipe runtime and pose model on first use; webcam frames stay in the browser.

For Facebook calls, install dependencies once with `pnpm install`, then run `pnpm desktop`. The desktop launcher disables Chromium background throttling, so the tracker continues while Facebook is the active window. Use its Call output with OBS Virtual Camera as before.

Start the camera and allow permission. Keep both hands visible. Raise two open or cupped hands near your chest or face as if holding an invisible ball, hold for 550 ms, and the basketball meme replaces your camera for 2.5 seconds. Adjust sensitivity if needed. Test meme previews the effect without a camera. This is an approximate hand-geometry rule, not a trained basketball action classifier.

## Video calls

Open Call output. In OBS Studio, add Window Capture for the output window, crop the browser borders, and fit the source to your scene. Start Virtual Camera. Select OBS Virtual Camera in Zoom, Meet or Discord. Use your usual microphone. Keep the app and output window running and visible; background browser throttling may slow recognition. If camera access is busy, release the physical webcam in other apps first.

OBS must be installed separately: https://obsproject.com/kb/virtual-camera-guide . The website does not itself install or create a virtual camera.

`node --test` runs the pose rule checks. Real camera accuracy and the OBS route need a live manual test on your machine.
