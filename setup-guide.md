# Google Authentication Setup Guide

## Overview
This personal website consists of two pages:
1. **index.html** - Public welcome/splash page that anyone can view
2. **portal.html** - Secure family portal that requires Google authentication

Only authorized Google accounts can access the family portal.

## File Structure
```
your-website/
├── index.html      # Public splash page
├── portal.html     # Secure portal page (requires authentication)
└── setup-guide.md  # This documentation
```

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Family Portal")

### 2. Enable Google Sign-In API

1. In the Google Cloud Console, go to "APIs & Services" → "Dashboard"
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for "Google Identity" or "Google+ API"
4. Enable the API

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: "Family Portal"
   - User support email: Your email
   - Developer contact: Your email
4. Add your domain if you have one
5. Save and continue through the scopes (you don't need to add any)
6. Add test users (the email addresses of family members)

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Web application" as the application type
4. Name it "Family Portal Web"
5. Under "Authorized JavaScript origins", add:
   - `http://localhost` (for local testing)
   - `http://localhost:8080` (if using a specific port)
   - Your actual domain (e.g., `https://yourdomain.com`)
6. Under "Authorized redirect URIs", add the same URLs
7. Click "CREATE"
8. Copy the Client ID (it will look like: `XXXXXXXX.apps.googleusercontent.com`)

### 5. Configure the Portal Page

1. Open `portal.html` in a text editor
2. Find this line (around line 478):
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```
3. Replace `YOUR_CLIENT_ID` with your actual Client ID from step 4

4. Find this line (around line 479):
   ```javascript
   const ADMIN_EMAIL = 'your-admin-email@gmail.com';
   ```
5. Replace with your admin Google account email

6. Find the authorized users list (around line 482):
   ```javascript
   const AUTHORIZED_USERS = [
       'your-admin-email@gmail.com',
       'family-member1@gmail.com',
       'family-member2@gmail.com'
   ];
   ```
7. Replace with the actual email addresses of family members who should have access

## Page Descriptions

### Public Splash Page (index.html)
The public-facing landing page includes:
- Welcome message and description
- Feature highlights
- About section
- Login button that links to portal.html
- Fully responsive design
- No sensitive information displayed

### Secure Portal Page (portal.html)
The authenticated portal includes:
- Google OAuth 2.0 sign-in
- User verification against authorized list
- Portal sections for household information
- Admin-only sections for user management
- Access logging capabilities

## Security Features

### Authentication
- Uses Google OAuth 2.0 for secure authentication
- No passwords stored on your server
- Google handles all authentication security

### Authorization Levels
1. **Regular Users**: Can access all standard portal sections
2. **Admin User**: Can additionally access:
   - User Management section
   - Access Logs section

### Access Control
- Only emails in the `AUTHORIZED_USERS` list can access the portal
- Unauthorized users are automatically rejected
- Admin privileges are only granted to the specified admin email

## Hosting Options

### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload both index.html and portal.html files
3. Go to Settings → Pages
4. Enable GitHub Pages
5. Your site will be available at `https://[username].github.io/[repository-name]`

### Option 2: Netlify (Free tier available)
1. Sign up at [netlify.com](https://netlify.com)
2. Create a folder with both HTML files
3. Drag and drop your project folder
4. Get instant hosting with HTTPS

### Option 3: Traditional Web Hosting
1. Upload both files to your web hosting provider
2. Ensure HTTPS is enabled (required for Google Sign-In)
3. The index.html will be your default homepage

## Testing Locally

To test the website locally:

1. Install a local web server (if you don't have one):
   ```bash
   # Using Python 3
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   ```

2. Open your browser and go to `http://localhost:8080`
   - This will load the public splash page
   - Click "Family Login" to access the portal

3. Test the Google Sign-In with an authorized account

## Navigation Flow

1. **Visitors** arrive at `index.html` (public splash page)
2. **Family members** click "Family Login" or "Access Portal"
3. **Authentication** happens on `portal.html` with Google Sign-In
4. **Authorized users** gain access to the secure portal
5. **Unauthorized users** see an error message

## Troubleshooting

### "You are not authorized to access this portal"
- Ensure the email is added to the `AUTHORIZED_USERS` list in portal.html
- Check for typos in the email address
- Make sure the email is exactly as it appears in the Google account

### Google Sign-In button not appearing
- Verify the Client ID is correctly set in portal.html
- Check browser console for errors
- Ensure you're accessing via HTTP/HTTPS (not file://)

### "Invalid Client" error
- Verify the domain is added to "Authorized JavaScript origins"
- Check that the Client ID is correct
- Wait a few minutes after creating credentials (Google needs time to propagate)

## Security Best Practices

1. **Regular Updates**: Review authorized users list regularly
2. **Access Logs**: If you're the admin, check access logs periodically
3. **HTTPS Only**: Always use HTTPS in production
4. **Backup**: Keep backups of your configuration
5. **Client ID**: Never share your OAuth client credentials
6. **Public Page**: Don't put any sensitive information on index.html

## Customization

### Modifying the Public Page
Edit `index.html` to:
- Change welcome text and descriptions
- Update feature highlights
- Modify colors via CSS variables
- Add company/family branding

### Adding New Portal Sections
In `portal.html`, add new cards in the portal grid section:
```html
<div class="portal-card" onclick="openSection('newsection')">
    <div class="card-icon">
        <svg>...</svg>
    </div>
    <h3 class="card-title">New Section</h3>
    <p class="card-description">Description here</p>
</div>
```

### Admin-Only Sections
Add `class="admin-only"` and `style="display: none;"` to make sections admin-only.

## Support

For Google OAuth issues, refer to:
- [Google Identity Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Troubleshooting](https://developers.google.com/identity/protocols/oauth2/troubleshooting)

## Notes

- The website stores no data locally or on servers
- All authentication is handled by Google
- Access logs are currently only shown in browser console (implement server-side logging for production)
- Consider implementing a backend service for additional features like:
  - Persistent access logs
  - Dynamic content management
  - File storage for documents
  - Real-time notifications