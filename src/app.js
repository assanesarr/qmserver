import express from 'express';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';

import { createServer } from 'http';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import apiRouter from './routes/api.routes.js';

import cors from 'cors';
import session from 'express-session';

import { Server } from "socket.io";
import { callNext } from '../database/db.js';

const app = express();


app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  name: 'dashboard.sid',
  secret: 'SUPER_SECRET_KEY',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// views engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static('public'));

// layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // layout par défaut

app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/api', apiRouter);




const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on('call-next', data => {
      callNext(data, io);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

export default server;