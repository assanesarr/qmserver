import { mysqlTable, int, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core'

export const ticketStatusEnum = mysqlEnum('ticket_status', [
  'WAITING',
  'CALLED',
  'SERVED',
])

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const tickets = mysqlTable('tickets', {
  id: int('id').primaryKey().autoincrement(),
  status: varchar('status', { length: 50 }).notNull().default('WAITING'),
  guichet: int('guichet'),
  priority: int('priority').default(0),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  calledAt: timestamp('called_at'),
})

// export const desks = mysqlTable('desks', {
//   id: int('id').primaryKey().autoincrement(),
//   name: varchar('name', { length: 100 }).notNull(),
//   createdAt: timestamp('created_at').defaultNow(),
// })

// export const serviceTypes = mysqlTable('service_types', {
//   id: int('id').primaryKey().autoincrement(),
//   name: varchar('name', { length: 100 }).notNull(),
//   createdAt: timestamp('created_at').defaultNow(),
// })
