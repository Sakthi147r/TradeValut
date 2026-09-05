import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addFavorite, createQuoteRequest, listFavoriteHandles, removeFavorite, subscribeToNewsletter } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const emailSchema = z.string().trim().toLowerCase().email().max(320);

function internalError(error: unknown): never {
  console.error("[Customer] Database operation failed:", error);
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "We could not save that request right now." });
}

export const customerRouter = router({
  profile: protectedProcedure.query(({ ctx }) => ({
    id: ctx.user.id,
    name: ctx.user.name,
    email: ctx.user.email,
    role: ctx.user.role,
  })),
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await listFavoriteHandles(ctx.user.id);
      } catch (error) {
        return internalError(error);
      }
    }),
    add: protectedProcedure.input(z.object({ productHandle: z.string().trim().min(1).max(255) })).mutation(async ({ ctx, input }) => {
      try {
        await addFavorite(ctx.user.id, input.productHandle);
        return { success: true, productHandle: input.productHandle } as const;
      } catch (error) {
        return internalError(error);
      }
    }),
    remove: protectedProcedure.input(z.object({ productHandle: z.string().trim().min(1).max(255) })).mutation(async ({ ctx, input }) => {
      try {
        await removeFavorite(ctx.user.id, input.productHandle);
        return { success: true, productHandle: input.productHandle } as const;
      } catch (error) {
        return internalError(error);
      }
    }),
  }),
  newsletter: router({
    subscribe: publicProcedure.input(z.object({ email: emailSchema, source: z.string().trim().min(1).max(64).default("footer") })).mutation(async ({ input }) => {
      try {
        await subscribeToNewsletter(input.email, input.source);
        return { success: true } as const;
      } catch (error) {
        return internalError(error);
      }
    }),
  }),
  quotes: router({
    create: publicProcedure.input(z.object({
      email: emailSchema,
      productHandle: z.string().trim().min(1).max(255).optional(),
      quantity: z.number().int().min(1).max(1000000).optional(),
      message: z.string().trim().max(4000).optional(),
    })).mutation(async ({ input }) => {
      try {
        await createQuoteRequest(input);
        return { success: true } as const;
      } catch (error) {
        return internalError(error);
      }
    }),
  }),
});

export type CustomerRouter = typeof customerRouter;
