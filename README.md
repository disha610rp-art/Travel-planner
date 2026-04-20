# WanderClub — Smart Travel Planner ✈️

WanderClub is a beautifully designed, AI-powered travel planning React application built to streamline the fragmented process of managing trips.

## 🧠 Problem Statement
**Who is the user?** Modern travelers who want to plan trips efficiently without the hassle of fragmented tools.
**What problem are we solving?** Keeping track of itineraries, budgets, hotel concepts, food preferences, and personal documents is incredibly messy when spread across spreadsheets, notes, and browser tabs. WanderClub consolidates inspiration, AI-generated schedules, budget breakdowns, and file storage into a single, cohesive experience.
**Why does this matter?** Better planning limits stress and prevents missed opportunities. WanderClub uses AI matched with user preferences to make optimized travel available to everyone.

## ✨ Features
- **Authentication System:** Secure local login and registration with protected routes.
- **Smart Budgets:** Select a targeted budget and get an editable visual chart breakdown of trip expenses (flight, accommodations, food, etc.).
- **Trip Dashboard:** An overview to seamlessly create, search, and delete all of your upcoming adventures.
- **AI-Powered Builder:** Input destinations, travel dates, and allergies/preferences to dynamically generate day-by-day itineraries, hotel options, and safe dining recommendations using the Groq API.
- **Persistent Storage:** All trips, edits, and file uploads are robustly saved directly into `localStorage`.
- **Docs & Notes Hub:** Dedicated spaces for continuous itinerary custom-notes and actual PDF/image file uploads to keep tickets and passports handy.

## 🛠️ Tech Stack
- **Frontend Core:** React 19 (via Vite)
- **Styling:** Vanilla CSS (Pastel design system & Glassmorphism)
- **Routing:** React Router v7
- **Database/Persistence:** Browser `localStorage` Wrapper
- **AI Integration:** Groq API (Llama 3 Model execution)
- **Icons:** Lucide React

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Travel-planner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the project root and add your Groq API Key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) to view it in your browser. (Note: The port may default to 5174 if 5173 is occupied).

## 📝 Usage Note
This project intentionally uses `localStorage` for complete offline persistence across the web application. Uploaded documents are saved natively inside the local web storage. Clearing the browser cache will reset data unless explicitly exported.
