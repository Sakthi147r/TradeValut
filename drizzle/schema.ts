import { integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const quoteStatusEnum = pgEnum("status", ["new", "in_review", "closed"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn", { mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productHandle: varchar("productHandle", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, table => [
  uniqueIndex("favorites_user_product_unique").on(table.userId, table.productHandle),
]);

export type Favorite = typeof favorites.$inferSelect;

export const newsletterSubscriptions = pgTable("newsletterSubscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("footer").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export const quoteRequests = pgTable("quoteRequests", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  productHandle: varchar("productHandle", { length: 255 }),
  quantity: integer("quantity"),
  message: text("message"),
  status: quoteStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
