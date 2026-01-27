# Assets Module (`/assets`)

This folder is intended to store the static assets for the **Radio Ebenezer** app.

## Intended usage

You can place here:

- Images (logos, backgrounds, program covers, etc.).
- SVG or PNG icons.
- Custom fonts (typography files).
- Any other static file the app needs.

## Referencing from code

- From HTML or CSS, reference files in this folder using relative paths, for example:

  ```html
  <img src="../assets/logo-radio-ebenezer.png" alt="Radio Ebenezer Logo" />
  ```

  ```css
  .hero {
    background-image: url("../assets/worship-background.jpg");
  }
  ```

Keeping assets grouped in `/assets` makes the project easier to organize and maintain.
