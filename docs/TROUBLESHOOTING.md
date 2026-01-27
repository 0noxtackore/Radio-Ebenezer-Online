# Troubleshooting

## No audio / autoplay blocked

- Many browsers block autoplay with sound.
- Tap the play button to start the stream.
- If needed, interact with the page to unlock audio.

## Offline screen shows

- Check your internet connection.
- When back online, the app will hide the offline screen and retry playback.

## Server down message

- This appears when the stream server fails while the device is online.
- The app will reload automatically when playback resumes.

## Stream URL not configured

- Make sure `STREAM_URL` in `js/app.js` points to a valid streaming endpoint.

## Caching issues

- Hard refresh the page (Ctrl + F5) if changes are not reflected.
