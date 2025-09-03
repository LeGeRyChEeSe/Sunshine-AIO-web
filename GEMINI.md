# Project: Sunshine-AIO Web Installer

## Project Overview

This project is the web installer for the Sunshine-AIO application. It's a modern, responsive website built with React, TypeScript, and Tailwind CSS. The primary purpose of the site is to provide users with a simple, one-line command to install Sunshine-AIO on their systems.

The application is structured as a single-page application (SPA) using React Router for navigation. It includes pages for Home, Tools, Guide, About, and Contact. The UI is styled with Tailwind CSS and features a dark mode option. The project is also set up for internationalization using `i18next`, with translations stored in JSON files.

The project is deployed on Netlify, with the build and deployment settings configured in `netlify.toml`.

## Building and Running

### Development

To run the development server:

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5180`.

### Building

To build the project for production:

```bash
npm run build
```

This will create a `dist` directory with the optimized and minified assets.

### Linting

To lint the codebase:

```bash
npm run lint
```

## Development Conventions

### Versioning and Releases

The project uses a custom Node.js script (`scripts/release.js`) to manage versioning and releases. The version is stored in `package.json` and a `version.txt` file.

To bump the version, use the following commands:

*   `npm run version:bump:patch`
*   `npm run version:bump:minor`
*   `npm run version:bump:major`

To create a new release, use the `scripts/release.js` script with one of the following commands:

*   `node scripts/release.js patch [message]`
*   `node scripts/release.js minor [message]`
*   `node scripts/release.js major [message]`

This will update the version, create a new git tag, and commit the changes.

### Styling

The project uses Tailwind CSS for styling. Customizations to the default theme are defined in `tailwind.config.js`.

### Internationalization

The project uses `i18next` for internationalization. Translation files are located in the `public/locales` directory. To add a new language, create a new directory with the language code and a `translation.json` file.
