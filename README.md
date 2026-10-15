# Hand Nova

## Frontend

```bash
npm install
npm run dev
```

## Backend

Copy `Backend/.env.example` to `Backend/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`. Then run:

```bash
cd Backend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:5000`. Camera access requires a supported browser and webcam permission.
