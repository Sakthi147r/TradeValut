import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { favorites, InsertUser, newsletterSubscriptions, quoteRequests, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // prepare: false is required for Supabase transaction pooler (port 6543 / PgBouncer)
      _client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listFavoriteHandles(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ productHandle: favorites.productHandle }).from(favorites).where(eq(favorites.userId, userId));
  return rows.map(row => row.productHandle);
}

export async function addFavorite(userId: number, productHandle: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(favorites).values({ userId, productHandle }).onConflictDoNothing();
}

export async function removeFavorite(userId: number, productHandle: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productHandle, productHandle)));
}

export async function subscribeToNewsletter(email: string, source = "footer"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(newsletterSubscriptions)
    .values({ email, source })
    .onConflictDoUpdate({
      target: newsletterSubscriptions.email,
      set: { source },
    });
}

export async function createQuoteRequest(input: {
  email: string;
  productHandle?: string;
  quantity?: number;
  message?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(quoteRequests).values(input);
}

export async function listRecentQuoteRequests(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(limit);
}
