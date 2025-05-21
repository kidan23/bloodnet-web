# 🩸 BloodNet Frontend

This is the frontend for **BloodNet**, a digital blood donation network platform aimed at streamlining donor-recipient matching, real-time availability tracking, and communication between blood banks, donors, and patients.

Built with **React**, **PrimeReact**, and **Vite**, this frontend interacts with a **NestJS** backend and utilizes real-time updates via **WebSockets**, **Firebase**, and third-party APIs for enhanced UX.

---

## 🚀 Tech Stack

- **React** (with functional components & hooks)
- **PrimeReact** – UI components
- **Vite** – Fast bundler & dev server
- **Pinia** – State management (if you're using it, update this)
- **Socket.IO / Firebase** – Realtime data
- **Axios** – HTTP client
- **Tailwind CSS** (optional; remove if not used)
- **React Router** – Navigation & routing
- **Google Maps API** – Geolocation & map views
- **Twilio / SendGrid** – Communication (via backend)

---

## 🧠 Project Structure
```
src/
├── components/       # Reusable UI components
├── pages/            # Route-based pages (e.g., Dashboard, DonorList)
├── stores/           # Pinia stores for state management
├── hooks/            # Custom React hooks
├── services/         # Axios instances and API calls
├── utils/            # Helper functions
├── assets/           # Images, icons, etc.
└── App.jsx           # Root component
```
---

## 🛠️ Setup & Run

### 1. Clone the repo

```bash
git clone https://github.com/your-username/bloodnet-frontend.git
cd bloodnet-frontend
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root with your config:

```
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_key_here
VITE_GOOGLE_MAPS_KEY=your_key_here
```

### 4. Run the dev server

```bash
npm run dev
# or
yarn dev
```

---

## 🧪 Lint & Format

```bash
npm run lint
npm run format
```

---

## 📦 Build

```bash
npm run build
```

---

## 📸 Screenshots

> Add screenshots here once your UI is more fleshed out. Can include:

* Donor registration form
* Admin dashboard
* Real-time donor map
* Blood request notifications

---

## 📄 License

MIT – free to use, modify, and distribute.

---

## 👨‍💻 Author

Developed by **Abraham Michael** and the **Group 4** team.
