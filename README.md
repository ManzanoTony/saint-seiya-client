# 🏛️ Saint Seiya: The Hades Chapter – Sanctuary

A full-stack React and Vite strategy game inspired by *Saint Seiya: The Hades Chapter – Sanctuary*. Manage Athena’s Saints, awaken custom warriors with AI-generated lore, and defend the Sanctuary from Hades' forces in a Holy War campaign.

## ✨ Features

* **Saint Roster Management:** Browse, search, and filter Athena's Saints by rank and status.
* **Custom Saint Creation:** Forge new Saints by choosing their rank, constellation, and gender—complete with AI-generated backstories powered by the Groq API.
* **Detailed Saint Profiles:** Inspect Cosmos power levels, combat status, canonical or custom lore, and personal notes. Custom Saints can be edited or deleted, while official Saints are protected.
* **Holy War Campaign:** Launch campaigns to defend the Sanctuary, scan for incoming threats from the Underworld, and deploy available Saints into battle.
* **Battle & Campaign History:** Track past skirmishes, victories, and defeats across Holy Wars.
* **Immersive Audio & Video:** Features route-based background music, volume controls, and victory/defeat cutscenes.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, daisyUI (`luxury` theme)
* **Backend:** Node.js, JSON Server, Custom REST API routes
* **AI Integration:** Groq API (server-side lore and threat generation)
* **Deployment:** Vercel (Frontend) & Render (Backend)

---

## 📁 Project Structure

```text
saint-seiya-app/
├── saint-seiya-client/          # React + Vite frontend
│   └── public/                  # Character portraits, music, and video assets
└── saint-seiya-project/         # Node.js + JSON Server backend
    └── db.json                  # Mock database for Saints, campaigns, and battles
```

---

## ⚔️ Holy War Rules

* **Victory & Defeat:** A Holy War campaign concludes when you reach **3 victories** (saving Athena and the world) or **3 defeats** (allowing Hades to complete the Greater Eclipse).
* **Combat & Cosmos:** Victory chances depend on the Cosmos gap between your deployed Saint and the threat. Even when outmatched, a Saint with lower Cosmos has a **20% chance to awaken their Seventh Sense** and turn the tide.
* **Battle Consequences:** Winning a battle increases a Saint's Cosmos power; losing leaves the Saint temporarily injured and unavailable for immediate deployment.

---

## ☁️ Deployment

The frontend and backend are deployed separately:

### Backend (Render)


### Frontend (Vercel)

---

## 📌 Notes on Data Persistence & Security

* **Mock Storage:** The backend uses `db.json` for lightweight file-based storage rather than a persistent database. Any newly created Saints or battle records will reset if the hosting provider spins down or restarts the container.
* **API Usage:** All AI requests route through the backend so the Groq key is never sent to the browser. Because this is a portfolio/practice project without user authentication, standard backend rate limiting is used to manage public API traffic.
