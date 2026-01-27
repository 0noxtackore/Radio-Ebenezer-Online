# JavaScript Module (`/js`)

This folder contains the core logic for the **Radio Ebenezer** app.

## Main contents

- `app.js`:
  - Defines the `STREAM_URL` constant, where the station streaming URL must be configured.
  - Initializes references to UI elements (player, buttons, screens).
  - Controls the **player state**:
    - Play / pause (`audio.play()` / `audio.pause()`).
    - Update the UI based on playback state (play/pause icon, status text, status dot).
    - Handle audio events (`playing`, `pause`, `waiting`, `error`).
  - Handles **network monitoring** and server/offline overlays.
  - Implements the **bottom navigation**:
    - Shows/hides the Home, Calendar, and Notifications screens as a lightweight SPA.
  - Provides a **search mock** and basic calendar/notification rendering.

## Module goal

Separate dynamic behavior and user interaction from HTML markup so that:

- HTML focuses on structure.
- CSS focuses on styling.
- JS focuses on app logic, state, and events.
