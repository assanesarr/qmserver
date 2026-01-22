import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { eq, sql, desc, and, count } from 'drizzle-orm'
import { tickets } from '../drizzle/schema.js'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

export const db = drizzle(pool)

export const callNext = async (data, io) => {
    return db.update(tickets)
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
        });
}