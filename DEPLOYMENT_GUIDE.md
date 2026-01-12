# Deployment Guide: GitHub & Netlify

This guide will help you deploy your website to Netlify using GitHub.

## Prerequisite: Local Setup (Already Completed by Agent)
Your local project has been initialized as a Git repository, and all files have been committed.
A remote URL has been added: `https://github.com/taejinins3706/website2026.git`

## Step 1: Create the Repository on GitHub
1. Go to [GitHub - Create New Repository](https://github.com/new).
2. Set the **Repository name** to: `website2026`
3. Include a description if you want (e.g., "Taejin Inc Website 2026").
4. **Public/Private**: Choose whichever you prefer (Public is free and easy).
5. **Do NOT** check "Initialize this repository with a README", "Add .gitignore", or "Choose a license". (We already have the code locally).
6. Click **Create repository**.

## Step 2: Push Your Code to GitHub
1. Open your terminal (PowerShell or Command Prompt) in the project folder:
   `c:\Users\EFHYDRO\Desktop\개인\태진아이엔에스(수호)\taejininc_web2026`
2. Run the following command to push your code:
   ```powershell
   git push -u origin master
   ```
   *Note: You may be asked to log in to GitHub if you haven't already.*

## Step 3: Connect to Netlify
1. Log in to your [Netlify](https://www.netlify.com/) account.
2. Click **"Add new site"** > **"Import from an existing project"**.
3. Select **GitHub**.
4. Authorize Netlify to access your GitHub account if prompted.
5. Search for and select your repository: `taejinins3706/website2026`.

## Step 4: Configure Build Settings
Since this is a static HTML/CSS/JS site, the settings are simple:
*   **Branch to deploy**: `master`
*   **Base directory**: (leave empty)
*   **Build command**: (leave empty)
*   **Publish directory**: (leave empty, or type `.`)

Click **"Deploy website2026"**.

## Step 5: Success!
Netlify will build (instantly, since it's just copying files) and give you a URL (e.g., `random-name-12345.netlify.app`).
You can later configure a custom domain in Netlify settings.
