# Full Stack Development (FSD) Assignments

| # | Assignment | Project | Folder | How to run |
|---|------------|---------|--------|------------|
| 1 | Responsive dashboard with sidebar and statistic cards (HTML, CSS, Bootstrap 5) | **Monsoon Club**: an artist's music-streaming dashboard with playable track previews, date ranges, dark mode and CSV export | `Assignment1-Dashboard` | Open `index.html` in a browser |
| 2 | Git & GitHub version control | this repository | | see the commands below |
| 3 | Student Management System in React (CRUD) | **Rollcall**: a chalkboard-style student register with search, filters, sorting, grid/table views and undo | `Assignment3-StudentManagement` | `npm install`, then `npm run dev` and open http://localhost:5173 |
| 4 | Node.js application that serves a static website | **Pixel Pit**: a retro arcade cafe site with a playable Snake game, served by Node's `http` module | `Assignment4-NodeStaticSite` | `node server.js`, then open http://localhost:3000 |
| 5 | Four CRUD APIs with Node.js, Express.js and MongoDB | **Verdant**: a houseplant care tracker that stores every plant in MongoDB | `Assignment5-CRUD-API` | start MongoDB, `npm install`, `npm run seed`, `npm start`, then open http://localhost:5000 |
| 6 | Mobile website with jQuery Mobile | **Stargazer**: a night-sky guide with a live moon phase, sky events, planets, an observation log and a red night-vision mode | `Assignment6-jQueryMobile` | Open `index.html` in a browser (phone size) |

## Assignment 5: API endpoints

| # | Method | Endpoint | What it does |
|---|--------|----------|--------------|
| 1 | POST | `/api/plants` | Create a plant |
| 2 | GET | `/api/plants` (optional `?room=`, `?search=`, `?sort=thirsty\|name\|newest`) and `/api/plants/:id` | Read plants |
| 3 | PUT | `/api/plants/:id` | Update a plant (the "Water now" button sends `lastWatered`) |
| 4 | DELETE | `/api/plants/:id` | Delete a plant |

The MongoDB connection string defaults to `mongodb://127.0.0.1:27017/verdant`. Copy `.env.example` to `.env` to change it (for example to a MongoDB Atlas URL).

## Git commands used (Assignment 2)

```bash
git --version
git init
git add .
git status
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Lakshya-Agarwal-2005/fsd-assignments.git
git push -u origin main
```
