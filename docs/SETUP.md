# Setup

This project is a static web app for **Radio Ebenezer** (HTML/CSS/JS). You can run it locally without a build step.

## Requirements

- A modern browser (Chrome, Edge, Firefox).
- Optional: a local static server (recommended for audio autoplay policies).

## Configure the stream

1. Open `js/app.js`.
2. Update the `STREAM_URL` constant with your station streaming URL:

```js
const STREAM_URL = "https://your-stream-url/stream";
```

## Run locally

### Option 1: Open directly

- Open `index.html` in your browser.

### Option 2: Use a static server (recommended)

If you have a local server (VS Code Live Server, http-server, etc.), serve the project root:

```
http://localhost:PORT/
```

This helps browsers allow audio autoplay more consistently.
