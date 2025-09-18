# voting-app

# 🗳️ Real-Time Polling API

A backend challenge implementation using **Bun + TypeScript + Express + Prisma + PostgreSQL + Socket.IO**.  
Provides REST APIs and real-time updates for live polling.

---

## 🚀 Tech Stack
- **Runtime:** [Bun](https://bun.sh) + TypeScript  
- **Framework:** Express.js  
- **Database:** PostgreSQL  
- **ORM:** Prisma  
- **Real-time:** Socket.IO  
- **Containerized DB:** Docker Compose  

---

## 📂 Project Structure
`` voting app/
 ├── prisma/
│ └── schema.prisma # Prisma DB schema
├── src/
│ ├── config/ # Configs (Prisma client)
│ ├── controllers/ # Express controllers
│ ├── routes/ # Route definitions
│ ├── services/ # Business logic
│ ├── sockets/ # WebSocket handlers
│ ├── app.ts # Express setup
│ └── server.ts # Entry point (Express + Socket.IO)
├── docker-compose.yml # PostgreSQL container
├── tsconfig.json # TypeScript config
├── package.json # Bun dependencies
└── README.md

``

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/aknankpuria/voting-app.git
cd realtime-polling
bun install 
```
### 2. Run PostgreSQL (Docker)

```
docker-compose up -d

 ```

DB runs on: postgres://postgres:postgres@localhost:5432/realtime_polling

### 3. Environmental Valriables
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realtime_polling"
PORT=4000
```
### 4. Database Migration 
```
bunx prisma migrate dev --name init
bunx prisma generate
```
### 5. Run Server 
```
bun --watch src/server.ts
```
Server available at: http://localhost:4000

## 📌 API Endpoints

### 👤 Users
Create User
POST /users

```
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret"
}
```


Get User
GET /users/1

### 📊 Polls

Create Poll
POST /polls
```
{
  "question": "Which color?",
  "options": ["Red", "Green", "Blue"],
  "creatorId": 1,
  "isPublished": true
}
```

Get Poll
GET /polls/1

### 🗳️ Votes

Cast Vote
POST /votes/:pollId
```
{
  "userId": 1,
  "optionId": 2
}
```

### WebSocket (Real-time)
Connect with Socket.IO client:

```
<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
<script>
  const socket = io("http://localhost:4000");

  // Join poll room
  socket.emit("join_poll", 1);

  // Listen for live updates
  socket.on("poll_update", (data) => {
    console.log("Updated results:", data);
  });
</script>
```
Events:

join_poll <pollId> → subscribe to updates

poll_update → receive live results after each vote

### Example flow
``
POST /users → create user

POST /polls → create poll with options

Client joins via WebSocket: socket.emit("join_poll", pollId)

POST /votes/:pollId → cast vote

poll_update broadcast with updated results 🎉
``