import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  listFavoriteHandles: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  subscribeToNewsletter: vi.fn(),
  createQuoteRequest: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function makeCtx(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const user = {
  id: 7,
  openId: "buyer-7",
  name: "Buyer",
  email: "buyer@example.com",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("customer router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires authentication for profile and favorites", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.customer.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.customer.favorites.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns the authenticated buyer profile and saved handles", async () => {
    dbMocks.listFavoriteHandles.mockResolvedValue(["organic-oyster-mushrooms"]);
    const caller = appRouter.createCaller(makeCtx(user));
    await expect(caller.customer.profile()).resolves.toMatchObject({ id: 7, email: "buyer@example.com" });
    await expect(caller.customer.favorites.list()).resolves.toEqual(["organic-oyster-mushrooms"]);
  });

  it("adds and removes a saved product", async () => {
    const caller = appRouter.createCaller(makeCtx(user));
    await expect(caller.customer.favorites.add({ productHandle: "golden-sesame-seeds" })).resolves.toEqual({ success: true, productHandle: "golden-sesame-seeds" });
    await expect(caller.customer.favorites.remove({ productHandle: "golden-sesame-seeds" })).resolves.toEqual({ success: true, productHandle: "golden-sesame-seeds" });
    expect(dbMocks.addFavorite).toHaveBeenCalledWith(7, "golden-sesame-seeds");
    expect(dbMocks.removeFavorite).toHaveBeenCalledWith(7, "golden-sesame-seeds");
  });

  it("validates and stores newsletter subscriptions and quote requests", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.customer.newsletter.subscribe({ email: "BUYER@EXAMPLE.COM", source: "footer" })).resolves.toEqual({ success: true });
    expect(dbMocks.subscribeToNewsletter).toHaveBeenCalledWith("buyer@example.com", "footer");
    await expect(caller.customer.quotes.create({ email: "buyer@example.com", productHandle: "cold-pressed-coconut-oil", quantity: 24, message: "Need custom packaging." })).resolves.toEqual({ success: true });
    expect(dbMocks.createQuoteRequest).toHaveBeenCalledWith({ email: "buyer@example.com", productHandle: "cold-pressed-coconut-oil", quantity: 24, message: "Need custom packaging." });
    await expect(caller.customer.newsletter.subscribe({ email: "not-an-email", source: "footer" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
