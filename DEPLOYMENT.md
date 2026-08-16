Beginner-friendly deployment guide

This guide shows how to deploy the frontend to Vercel and the backend to Render (recommended). It assumes the repository is already on GitHub (https://github.com/mitali1391-code/wed).

1) Overview
- Frontend: React (Create React App) in /frontend — deployed to Vercel
- Backend: FastAPI in /backend — deployed to Render (or Railway)

2) Prepare repository (already done)
- You have an up-to-date repo on GitHub: https://github.com/mitali1391-code/wed

3) Deploy backend to Render (step-by-step)
A. Create a Render account and log in: https://render.com
B. Connect your GitHub account to Render (OAuth) and authorize access to your repository.
C. In Render Dashboard, click New → Web Service.
D. Select the repository `mitali1391-code/wed` and choose branch `main`.
E. Set the Root directory to: `backend` (this tells Render to build from the backend folder).
F. Set Build Command: `pip install -r requirements.txt`
G. Set Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
H. Add environment variables (Environment → Add Environment Variable):
   - MONGO_URL (your MongoDB connection string)
   - DB_NAME (database name, e.g., wed_database)
   - CORS_ORIGINS (your frontend URL, e.g., https://<your-vercel-domain>.vercel.app or * for testing)
   - Any other keys from backend/.env (do NOT commit .env to GitHub)
I. Create the service and wait for the build and deploy to finish. Copy the public URL Render gives you (e.g., `https://wed-backend.onrender.com`). Verify with:
   curl https://<your-backend-host>/api/

4) Deploy frontend to Vercel (step-by-step)
A. Create a Vercel account and log in: https://vercel.com
B. Connect your GitHub account to Vercel and import project `mitali1391-code/wed`.
C. When configuring the project in Vercel:
   - Project Root: `/frontend` (or select the frontend folder)
   - Build Command (recommended to avoid peer-dependency failures): `cd frontend && npm ci --legacy-peer-deps && npm run build`
   - Output Directory: `build`
D. Add Environment Variable in Vercel (Settings → Environment Variables):
   - Key: REACT_APP_BACKEND_URL
   - Value: https://<your-backend-host> (no trailing `/api`), OR the exact base URL expected by the frontend (e.g., https://wed-backend.onrender.com)
E. Deploy. After deployment, Vercel provides a public URL (e.g., https://wed-ui-xyz.vercel.app).

5) Finalize and test
- Visit the Vercel URL. The frontend should call the backend using REACT_APP_BACKEND_URL.
- If some frontend calls fail, check the browser console and network tab for errors, and confirm the backend CORS_ORIGINS includes your Vercel domain.

6) Helpful tips
- If Vercel build fails, look at the build logs and copy errors to search or ask for help.
- For the backend, always store secrets in the Render environment variables panel — never commit .env to the repo.
- For audio autoplay: browsers require a user gesture to play audio. If autoplay is blocked, provide a visible play button.

7) If you want me to do the steps for you
- I can create Render service automatically via the Render dashboard if you connect Render to GitHub and approve service creation (Render reads render.yaml added to the repo).
- I can also create the Vercel project if you authenticate the Vercel CLI on this machine and allow me to run vercel --prod. (I won't ask for tokens in chat.)

If anything goes wrong at any step, copy the error text and paste it here and I'll help fix it.
