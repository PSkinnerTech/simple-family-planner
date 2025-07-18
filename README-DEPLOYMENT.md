# Family Hub Calendar - Deployment Guide

This Family Hub Calendar application can be deployed in two ways:
1. **Web Application** - for remote access
2. **Desktop Application** - using Electron for home touch screens

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account and project
- Google Cloud Platform account with Calendar API enabled

## Web Deployment

### Build for Web
```bash
npm run build:web
```

This creates a static web application in the `dist/` folder that can be deployed to any static hosting service.

### Recommended Hosting Platforms
- **Vercel** (recommended for React apps)
- **Netlify**
- **Firebase Hosting**
- **GitHub Pages**

### Environment Variables
When deploying to web, ensure your hosting platform has access to:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Desktop Application (Electron)

### Install Electron Dependencies
First, install the required Electron packages:

```bash
npm install -D electron electron-builder vite-plugin-electron vite-plugin-electron-renderer
```

### Build for Desktop
```bash
npm run build:electron
```

This will:
1. Compile TypeScript
2. Build the React application
3. Package it as a desktop application using Electron Builder

### Development Mode
To run the desktop version in development:

```bash
npm run dev:electron
```

### Platform-Specific Builds

The application will build for your current platform by default. To build for specific platforms, modify the `electron-builder.json` configuration.

**Available targets:**
- **macOS**: DMG installer (supports both Intel and Apple Silicon)
- **Windows**: NSIS installer
- **Linux**: AppImage

### Distribution

Built applications will be available in the `release/` folder:
- `release/Family Hub Calendar-{version}.dmg` (macOS)
- `release/Family Hub Calendar Setup {version}.exe` (Windows)
- `release/Family Hub Calendar-{version}.AppImage` (Linux)

## Configuration

### Supabase Setup
1. Create a Supabase project
2. Run the database migrations (already created in this project)
3. Configure Google OAuth in Supabase Auth settings
4. Add your Google Client ID and Secret to Supabase secrets

### Google Calendar API Setup
1. Create a project in Google Cloud Console
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - For web: Your domain + `/auth/callback`
   - For Supabase: `https://your-project.supabase.co/auth/v1/callback`

## Architecture

This single codebase approach allows you to:
- Maintain one React/TypeScript codebase
- Deploy as both web and desktop applications
- Share all business logic and UI components
- Use the same Supabase backend for both versions

The desktop version is ideal for:
- Home touch screen displays
- Offline-capable family stations
- Kiosk-mode deployments
- Private family networks

The web version is perfect for:
- Remote access from any device
- Mobile and tablet access
- Sharing with extended family
- Cloud-based deployment