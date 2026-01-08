===============================================
SHADOW WOLVES PRODUCTIONS - WEBSITE DEPLOYMENT
===============================================

This folder contains your complete, production-ready website.


--- HOW TO UPLOAD TO YOUR WEB HOST (VentraIP) ---

1. Log in to your VentraIP cPanel.

2. Navigate to "File Manager" and open your public_html folder
   (or the folder where your domain points to).

3. Delete any existing files in that folder (if this is a fresh install).

4. Upload ALL the files and folders from this package:
   - index.html
   - .htaccess (IMPORTANT: This file may be hidden. Ensure you upload it!)
   - /static/ folder (contains CSS and JavaScript)
   - asset-manifest.json

5. Ensure the .htaccess file is uploaded. This file is essential for the
   website's internal page routing to work correctly. Without it, visiting
   pages like /films or /contact directly will result in a 404 error.

6. Done! Visit your domain to see your live website.


--- FILE STRUCTURE ---

/
├── index.html          (Main entry point)
├── .htaccess           (CRITICAL: Apache routing for single-page app)
├── asset-manifest.json (Build manifest)
└── /static/
    ├── /css/           (Stylesheets)
    └── /js/            (JavaScript bundles)


--- TROUBLESHOOTING ---

Problem: Pages like /films or /contact show a 404 error.
Solution: Ensure the .htaccess file was uploaded. If your host uses
          Nginx instead of Apache, you'll need to configure URL rewriting
          in your server settings - contact VentraIP support for help.

Problem: Website looks broken or unstyled.
Solution: Ensure the entire /static/ folder was uploaded correctly.


--- SUPPORT ---

For changes to the website content, design, or functionality,
please contact your developer.

Website: Shadow Wolves Productions
Build Date: January 2026

===============================================
