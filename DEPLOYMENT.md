# Kadai Connect - Deployment Guide

This guide covers deploying the Kadai Connect platform using **Render** for the Django backend and **Vercel** for the React frontend.

## 1. Prerequisites

1.  A GitHub account with the code pushed to a repository.
2.  A [Render](https://render.com/) account.
3.  A [Vercel](https://vercel.com/) account.
4.  A managed MySQL database (e.g., Aiven, PlanetScale, or AWS RDS).
5.  A Firebase account with a project setup for notifications.

---

## 2. Backend Deployment (Render)

We have already included a `render.yaml` blueprint. Render will use this to automatically configure your service.

1.  Log in to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will read the `render.yaml` file and prompt you to enter the required Environment Variables.

### Required Backend Environment Variables (Render Dashboard)

You will need to manually set these variables in the Render dashboard after creating the blueprint (or during creation):

| Key | Description |
| :--- | :--- |
| `DJANGO_DEBUG` | Set to `False` |
| `DJANGO_SECRET_KEY` | Generate a strong, random 50-character string. |
| `ALLOWED_HOSTS` | Your Render URL (e.g., `kadai-connect-backend.onrender.com`). |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL (e.g., `https://kadai-connect.vercel.app`). |
| `DB_NAME` | Your MySQL database name. |
| `DB_USER` | Your MySQL database username. |
| `DB_PASSWORD` | Your MySQL database password. |
| `DB_HOST` | Your MySQL database host address. |
| `DB_PORT` | Your MySQL database port (usually `3306`). |
| `FIREBASE_CREDENTIALS_JSON` | The **entire raw JSON string** from your `firebase-adminsdk.json` file. Copy the contents of the file and paste it directly as the value. |

5.  Click **Apply**. Render will run `build.sh` (which installs dependencies, collects static files, and runs migrations) and then start the Gunicorn server.

---

## 3. Frontend Deployment (Vercel)

Vercel is optimized for Vite/React applications.

1.  Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Important:** Set the **Root Directory** to `frontend`.
5.  Vercel will automatically detect the Vite framework. The build command (`npm run build`) and output directory (`dist`) should be pre-filled correctly.
6.  Expand the **Environment Variables** section and add the following:

### Required Frontend Environment Variables (Vercel Dashboard)

| Key | Description |
| :--- | :--- |
| `VITE_API_URL` | Your Render backend URL (e.g., `https://kadai-connect-backend.onrender.com`). **Note:** Do not include a trailing slash. |
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain. |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID. |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID. |
| `VITE_FIREBASE_VAPID_KEY` | Your Firebase Web Push Certificate Key Pair (VAPID Key). |

7.  Click **Deploy**.

---

## 4. Post-Deployment Checks

1.  **Backend Check:** Visit `https://<your-render-url>/api/stores/` to ensure the API is responding (you might see an empty list or an authentication error, which is fine, it means the server is running).
2.  **Frontend Check:** Visit your Vercel URL. Ensure the site loads correctly.
3.  **Integration Check:** Try registering a new user or logging in to verify the connection between the frontend and backend.
4.  **Notification Check:** Test the push notifications feature to ensure Firebase is configured correctly on both ends.

## 5. Security Note

**Never commit** the `firebase-adminsdk.json`, `.env`, or `.env.production` files to GitHub. They contain sensitive credentials. They are already included in `.gitignore`.
