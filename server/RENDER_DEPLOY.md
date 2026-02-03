# Render deployment (Backend API)

## Quick deploy (Blueprint)
1. Push the repo to GitHub.
2. In Render, choose **New +** → **Blueprint** and select the repo.
3. Render reads `render.yaml` and creates the web service.
4. Set required environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `SESSION_SECRET`
5. Click **Deploy**.

## Health check
- Base URL should respond at `/` with: `Backend is running successfully!`

## Notes
- Uploads are stored in the `uploads/` folder; Render storage is ephemeral.
- If you need persistent uploads, use an external storage service.
