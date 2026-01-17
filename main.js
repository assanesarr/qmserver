import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import apiV2Router from './controllers/api_v2.js'
import cors from 'cors';

import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { eq, sql, desc, and, count } from 'drizzle-orm'
import { tickets } from './drizzle/schema.js'
import dotenv from 'dotenv'
dotenv.config()



const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

const db = drizzle(pool)


const app = express()
const port = 3000

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));

app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on('call-next', data => {

        db.update(tickets)
            .set({ status: 'CALLED', calledAt: new Date(), guichet: data.guichet })
            .where(and(eq(tickets.id, data.id), eq(tickets.status, 'WAITING')))
            .then(async ([tk]) => {

                if (tk.affectedRows === 1) {
                    const [tkts] = await db.select().from(tickets)
                        .where(eq(tickets.status, 'WAITING'))
                        // .orderBy(desc(tickets.id))
                        .limit(1);

                    io.emit('ticket-called', data);

                    const [result] = await db
                        .select({ total: count() })
                        .from(tickets)
                        .where(eq(tickets.status, 'WAITING'))
                    io.emit('ticket-next', { ...tkts, totalWaiting: result.total });
                    return;
                }
                console.log("No ticket updated. It might have been already called.");
            }).catch(err => {
                console.error("Error updating ticket status:", err);
            });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
// app.use('/api/v1', require('./controllers/api_v1'));
app.use('/api/v2', apiV2Router);


app.get('/next', async (req, res) => {
    const [tkts] = await db.select().from(tickets)
        .where(eq(tickets.status, 'WAITING'))
        .limit(1);

    const [result] = await db
        .select({ total: count() })
        .from(tickets)
        .where(eq(tickets.status, 'WAITING'))

    res.json({ ...tkts, totalWaiting: result.total })
})

app.post('/ticket', async (req, res) => {
    const { serviceType, priority } = req.body;
    const [ticket] = await db.insert(tickets).values({
        status: 'WAITING',
        serviceType: serviceType ? serviceType : 'Caisse',
        priority: priority ?? 0
    });

    const [tck] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticket.insertId))

    const [result] = await db
        .select({ total: count() })
        .from(tickets)
        .where(eq(tickets.status, 'WAITING'))

    const [tkts] = await db.select().from(tickets)
        .where(eq(tickets.status, 'WAITING'))
        .limit(1);
    const totalWaiting = result.total
    io.emit('ticket-next', { ...tkts, totalWaiting });
    res.json({ ...tck, ticketId: tck.id, totalWaiting });
});

app.get('/history', async (req, res) => {
    const tkts = await db.select().from(tickets)
        .where(eq(tickets.status, 'CALLED'))
        .orderBy(desc(tickets.id))
        .limit(4);

    res.json(tkts)
})

app.post('/reset', async (req, res) => {
    'TRUNCATE [TABLE] tbl_name'
    const table = 'tickets';
    await db.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
    // await db.delete(tickets).where(eq(tickets.status, 'WAITING'));
    res.json({ message: 'All WAITING tickets have been deleted.' });
});


server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
})