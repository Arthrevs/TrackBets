# Deployment Guide (Render)

Your app is now configured for a "merged" deployment where the Python backend serves the React frontend.

## Prerequisites
1. Push all your latest changes to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

## Deploying on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Failexe`).
4. **Configuration**:
    - **Name**: `trackbets` (or any name)
    - **Language**: `Docker` (This is important! It will use the Dockerfile we created).
    - **Region**: Any (e.g. Singapore, Frankfurt).
    - **Branch**: `main`
5. **Environment Variables**:
   Add the following environment variables (copy from your `.env` file):
    - `OPENAI_API_KEY`: `sk-proj-...`
    - `REDDIT_CLIENT_ID`: (If you have it)
    - `REDDIT_CLIENT_SECRET`: (If you have it)
6. Click **Create Web Service**.

## What happens next?
Render will:
1. Build the frontend using Node.js (Stage 1).
2. Set up the Python environment (Stage 2).
3. Start the server on port 8000.

Your app will be live at `https://trackbets.onrender.com` (or similar).
