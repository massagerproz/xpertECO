import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createNote = mutation({
  args: { content: v.string(), sourceType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      content: args.content,
      sourceType: args.sourceType,
      createdAt: Date.now(),
    });
  },
});

export const addEvidence = mutation({
  args: {
    noteId: v.optional(v.id("notes")),
    type: v.string(),
    content: v.string(),
    sourceReference: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("evidence", {
      noteId: args.noteId,
      type: args.type,
      content: args.content,
      sourceReference: args.sourceReference,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const updateEvidenceStatus = mutation({
  args: {
    id: v.id("evidence"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const createReport = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      title: args.title,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

export const addQAReview = mutation({
  args: {
    reportId: v.id("reports"),
    flags: v.array(
      v.object({
        issueType: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("qa_reviews", {
      reportId: args.reportId,
      flags: args.flags,
      createdAt: Date.now(),
    });
  },
});
