# CSS Module (`/css`)

This folder contains the stylesheets for the **Radio Ebenezer** app.

## Main contents

- `styles.css`:
  - Defines the dark UI theme with warm yellow accents and subtle neon highlights.
  - Implements the mobile-first layout (_app shell_):
    - Fixed top header.
    - Main content container with cards and sections.
    - Bottom navigation bar similar to a music app.
  - Includes styles for:
    - “Now playing” card with a gradient cover and turntable visuals.
    - Circular play button with play/pause state.
    - Core UI icons (home, calendar, notifications, volume).
    - Program playlist cards and supporting screens.
    - Offline/server overlays and responsive behavior.
  - Uses media queries to improve layout on larger screens.

## Module goal

Centralize the visual design of the app in a reusable way, ensuring:

- Comfortable reading on small screens.
- A modern, consistent look and feel.
- Easy adjustments to the color palette and components from a single file.
