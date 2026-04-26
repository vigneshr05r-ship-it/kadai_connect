# Kadai Connect - Project Guide 🛍️

Kadai Connect is a full-stack AI-powered hyperlocal commerce platform with a premium vintage UI.

## 🚀 Quick Start Instructions

### 1. Backend Setup (Django)
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Run migrations
python manage.py makemigrations
python manage.py migrate
# Start server
python manage.py runserver
```
The API will be available at: `http://127.0.0.1:8000/api/`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
# Install dependencies
npm install
# Start development server
npm run dev
```
The App will be available at: `http://localhost:3000`

---

## 🎨 UI Design System
- **Theme**: Premium Vintage
- **Colors**: Cream (#F5F0E8), Maroon (#6B1F2A), Gold (#C8963E)
- **Typography**: Playfair Display (Serif), Inter (Sans-serif)

## 🧠 AI Features
- **Price Prediction**: Found in `Add Product` page (Suggest Price button).
- **Marketing Generator**: Found in `Add Product` page (Generate Marketing button).
- **Voice Assistant**: Integrated across categories and add product for previews.
- **Festival Engine**: Powers suggestions on the Home page.

## 🌍 Multilingual Support
- Supports **English** and **Tamil**. Use the Globe icon in the header to toggle.

## 👥 User Portals
- **Customer**: Home, Search Nearby, Cart, Tracking.
- **Shopkeeper**: Dashboard, AI Product Creation, Insights.
- **Delivery**: Assignments, Pickup/Delivery flow, Verified Badge.

---

## 🏗️ Architecture
- **Backend**: Python/Django, Django REST Framework, JWT Auth.
- **Frontend**: React, Vite, Tailwind CSS, i18next, Lucide Icons.
- **Database**: SQLite (default for development).
