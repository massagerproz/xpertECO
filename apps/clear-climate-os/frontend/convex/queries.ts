import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNotes = query({
  handler: async (ctx) => {
    return await ctx.db.query("notes").order("desc").collect();
  },
});

export const getEvidence = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("evidence").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});

export const getReports = query({
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const getQAReviews = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("qa_reviews")
      .filter((q) => q.eq(q.field("reportId"), args.reportId))
      .collect();
  },
});

export const getTOCItems = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("theory_of_change").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});

export const getSystemVariables = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("systems_thinking_variables").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});

export const getSystemLinks = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("systems_thinking_links").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});
