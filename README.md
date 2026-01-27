# Radio Ebenezer Web App

A responsive web radio app for **Radio Ebenezer Online**. It streams the live broadcast, provides a weekly calendar of services, and displays real‑time notifications with countdowns. The UI is optimized for mobile and adapts smoothly to tablets and desktop screens.

## What this app does

- Plays the live radio stream with a modern player UI.
- Shows a calendar of recurring services and special broadcasts.
- Displays notifications with countdowns to upcoming events.
- Alerts users when the device is offline or when the stream server is down.
- Automatically resumes or reloads the app when connectivity returns.

## Tech stack

- **HTML** for layout
- **CSS** for styling and responsive design
- **Vanilla JavaScript** for app logic

## Quick start

1. Open `js/app.js` and set the stream URL:

   ```js
   const STREAM_URL = "https://your-stream-url/stream";
   ```

2. Open `index.html` in your browser (or serve the folder with a static server).

## Folder structure

- `index.html` — main app entry
- `css/styles.css` — global styling
- `js/app.js` — player logic, navigation, notifications
- `assets/` — static assets (images, fonts)
- `docs/` — English documentation

## Documentation

See `docs/README.md` for a full documentation index.
