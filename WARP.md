# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a static family portal website with Google OAuth 2.0 authentication. It consists of two HTML pages:

- **index.html**: Public landing page accessible to anyone
- **portal.html**: Secure portal requiring Google authentication with authorized email list

The application is client-side only (no backend server) and uses Google Sign-In for authentication and authorization.

## Development Commands

### Local Testing
```bash
# Start a local web server (Python 3)
python -m http.server 8080

# Alternative using Node.js
npx http-server -p 8080
```

After starting the server, navigate to `http://localhost:8080` to view the public page, then click "Family Login" to test authentication.

### Version Control
```bash
# View changes
git --no-pager diff

# View status
git --no-pager status

# Commit with co-authoring
git commit -m "Your message

Co-Authored-By: Warp <agent@warp.dev>"
```

## Architecture

### Authentication Flow
1. User visits `index.html` (public splash page)
2. Clicks "Family Login" → redirects to `portal.html`
3. Google OAuth 2.0 Sign-In button renders
4. User authenticates with Google
5. JWT token is decoded client-side to extract email
6. Email is checked against `AUTHORIZED_USERS` array
7. If authorized: portal loads with user info and appropriate access level
8. If unauthorized: error message displayed and user signed out

### Authorization Levels
- **Regular Users**: Access to all standard portal sections (utilities, maintenance, emergency contacts, documents, network, calendar)
- **Admin User**: Access to all regular sections plus admin-only sections (user management, access logs)
- Admin status is determined by matching email against `ADMIN_EMAIL` constant

### Configuration Constants (portal.html)
Located around lines 601-610:
- `GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID from Google Cloud Console
- `ADMIN_EMAIL`: Email address of the admin user
- `AUTHORIZED_USERS`: Array of authorized family member emails

### Key Functions (portal.html)
- `handleCredentialResponse()`: Processes Google Sign-In JWT token and authorizes user
- `decodeJwtResponse()`: Decodes JWT to extract user email, name, and profile picture
- `loadPortal()`: Displays portal content and shows/hides admin features based on user role
- `signOut()`: Clears session and returns to welcome screen
- `openSection()`: Placeholder for section navigation with admin permission checks
- `logAccess()` / `logSectionAccess()`: Console logging (production would send to backend)

### Portal Sections
Standard sections accessible to all authorized users:
- Utilities & Services
- Home Maintenance
- Emergency Contacts
- Important Documents
- Network & Devices
- Family Calendar

Admin-only sections (dynamically shown based on user role):
- User Management
- Access Logs

### UI Architecture
Both pages use:
- CSS custom properties for consistent theming (warm/earthy color palette)
- Google Fonts: 'Crimson Text' for headings, 'DM Sans' for body
- Fully responsive design with mobile breakpoints at 768px and 480px
- Gradient backgrounds with radial patterns
- Card-based portal layout (CSS Grid)

## Configuration Setup

Before deployment, configure `portal.html`:

1. Set `GOOGLE_CLIENT_ID` (line ~601) with OAuth 2.0 Client ID from Google Cloud Console
2. Set `ADMIN_EMAIL` (line ~602) with admin Google account
3. Update `AUTHORIZED_USERS` array (lines ~605-610) with family member emails
4. Ensure meta tag `google-signin-client_id` (line 6) matches `GOOGLE_CLIENT_ID`

See `setup-guide.md` for complete Google Cloud Console setup instructions.

## Deployment Considerations

- Requires HTTPS in production (Google Sign-In requirement)
- No backend needed - can be hosted on static hosting services (GitHub Pages, Netlify, etc.)
- Authorized JavaScript origins and redirect URIs must be configured in Google Cloud Console
- Access logging currently only writes to browser console - implement backend service for persistent logs

## Customization

### Adding New Portal Sections
Add new cards in the portal grid (around line 513 in portal.html):
```html
<div class="portal-card" onclick="openSection('newsection')">
    <div class="card-icon">
        <svg viewBox="0 0 24 24"><!-- icon path --></svg>
    </div>
    <h3 class="card-title">Section Title</h3>
    <p class="card-description">Description here</p>
</div>
```

For admin-only sections, add `class="admin-only"`, `id="adminCardX"`, and `style="display: none;"` attributes, then show via `loadPortal()` function.

### Modifying Styling
CSS custom properties are defined at the top of each HTML file (`:root` selector). Key variables:
- `--primary-dark`, `--primary-warm`: Main brand colors
- `--accent-gold`, `--accent-sage`: Accent colors
- `--cream`, `--soft-gray`: Background colors
- `--shadow-soft`, `--shadow-medium`, `--shadow-large`: Box shadows

## File Structure
```
Family Portal/
├── index.html         # Public splash/landing page
├── portal.html        # Authenticated portal (configuration required)
└── setup-guide.md     # Google Cloud Console setup documentation
```
