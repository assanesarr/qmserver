import { Router } from 'express';
import { eq, sql, desc, and, count } from 'drizzle-orm'
import { tickets } from '../../drizzle/schema.js'
import { db } from '../../database/db.js';
import { io } from '../app.js';


var api = Router();

// apiv2.get('/', function(req, res) {
//   res.send('Hello from APIv2 root route.');
// });

// apiv2.get('/users', function(req, res) {
//   res.json({"foo": "bar"});
// });

api.get('/next', async (req, res) => {
    const [tkts] = await db.select().from(tickets)
        .where(eq(tickets.status, 'WAITING'))
        .limit(1);

    const [result] = await db
        .select({ total: count() })
        .from(tickets)
        .where(eq(tickets.status, 'WAITING'))

    res.json({ ...tkts, totalWaiting: result.total })
})

api.post('/ticket', async (req, res) => {
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

api.get('/history', async (req, res) => {
    const tkts = await db.select().from(tickets)
        .where(eq(tickets.status, 'CALLED'))
        .orderBy(desc(tickets.id))
        .limit(4);

    res.json(tkts)
})

api.post('/reset', async (req, res) => {
    'TRUNCATE [TABLE] tbl_name'
    const table = 'tickets';
    await db.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
    // await db.delete(tickets).where(eq(tickets.status, 'WAITING'));
    res.json({ message: 'All WAITING tickets have been deleted.' });
});

export default api;