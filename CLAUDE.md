# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application that serves as the installer and downloader for Sunshine-AIO, a game streaming application. The website provides installation scripts, documentation, and an AI-powered chat assistant to help users with setup and troubleshooting.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server on port 5180
- `npm run dev:functions` - Start local function development server using dev-server.js
- `npm run dev:netlify` - Start Netlify development environment on port 8890
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase (ALWAYS run after code changes)
- `npm run preview` - Preview production build locally

### Build Commands
- `npm run build:styles` - Build CSS styles using PostCSS

## Architecture

### Frontend Stack
- **React 18** with TypeScript for the main application
- **Vite** for development server and build tooling
- **React Router** for client-side routing
- **TailwindCSS** for styling with custom Sunshine-AIO branding colors
- **i18next** for internationalization with 9 supported languages (en, fr, de, es, it, ja, ko, pt, ru, zh)

### Deployment
- **Netlify** hosting with serverless functions
- **Node.js 18** runtime environment
- Functions deployed to `netlify/functions/` directory

### Key Components Structure
- `src/App.tsx` - Main application with React Router setup
- `src/components/` - Reusable UI components including Header, Footer, Hero, ChatAssistant
- `src/pages/` - Route-specific page components (Home, Tools, Guide, About, Contact)
- `src/hooks/` - Custom React hooks (useTheme for dark/light mode)
- `src/i18n.ts` - Internationalization configuration

### AI Chat Assistant
The ChatAssistant component integrates with a Netlify function (`netlify/functions/chat.js`) that:
- Uses Google Generative AI (Gemini) for responses
- Includes a built-in knowledge base for common Sunshine-AIO questions
- Supports both French and English interactions
- Requires `GEMINI_API_KEY` environment variable

### Internationalization
- Translation files located in `public/locales/{lang}/translation.json`
- Automatic language detection with localStorage persistence
- Fallback language: English

### Custom Theming
The application uses custom TailwindCSS colors for the Sunshine-AIO brand:
- `sunshine-violet` and `sunshine-blue` for gradients and primary elements
- Dark/light mode support throughout the application

### PowerShell Integration
- Main installation script: `public/script.ps1`
- Test infrastructure in `tests/` directory with comprehensive testing guides
- Supports automatic updates and dependency management

## Development Notes

### File Structure Patterns
- Components use TypeScript with React functional components
- Consistent use of React hooks for state management
- All styling done through TailwindCSS classes
- Icons from Lucide React and FontAwesome

### Environment Requirements
- Node.js 18+
- For AI features: GEMINI_API_KEY environment variable
- For Netlify deployment: appropriate build and function configurations

### Testing
- Test infrastructure located in `tests/` directory
- Comprehensive test guide available in `tests/TEST-GUIDE.md`
- PowerShell test scripts for installation process validation

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Development port: 5180 (proxied through 8890 for Netlify dev)

## Development Workflow

### Before Making Changes
1. Run `npm run lint` to ensure code quality
2. Test locally with `npm run dev` or `npm run dev:netlify` for function testing

### TypeScript Compilation
- The project uses TypeScript with strict type checking
- Build process runs `tsc && vite build` - both must pass for successful deployment