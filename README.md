# Full Stack Development (FSD) Assignments

| # | Assignment | Folder | How to run |
|---|------------|--------|------------|
| 1 | Responsive dashboard with sidebar and statistic cards (HTML, CSS, Bootstrap 5) | `Assignment1-Dashboard` | Open `index.html` in a browser |
| 2 | Git & GitHub version control | this repository | see commands below |
| 3 | Student Management System (React JS, CRUD) | `Assignment3-StudentManagement` | `npm install` then `npm run dev` → http://localhost:5173 |
| 4 | Node.js application serving a static website | `Assignment4-NodeStaticSite` | `node server.js` → http://localhost:3000 |
| 5 | Four CRUD APIs with Node.js, Express.js and MongoDB | `Assignment5-CRUD-API` | start MongoDB, `npm install`, `node server.js` → http://localhost:5000 |
| 6 | Mobile website using jQuery Mobile | `Assignment6-jQueryMobile` | Open `index.html` in a browser (mobile view) |

## Assignment 5 – API endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| POST | `/api/products` | Create a product |
| GET | `/api/products` and `/api/products/:id` | Read products |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

MongoDB URL defaults to `mongodb://127.0.0.1:27017/stylecart` (override with the `MONGO_URI` environment variable).

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
