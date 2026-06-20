import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    content: v.string(),
    createdAt: v.number(),
  }),
  evidence: defineTable({
    noteId: v.optional(v.id("notes")),
    type: v.string(), // e.g., 'meeting_note', 'risk', etc.
    content: v.string(),
    sourceReference: v.string(),
    status: v.string(), // 'pending', 'approved', 'rejected'
    createdAt: v.number(),
  }),
  reports: defineTable({
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }),
  qa_reviews: defineTable({
    reportId: v.id("reports"),
    flags: v.array(
      v.object({
        issueType: v.string(),
        description: v.string(),
      })
    ),
    createdAt: v.number(),
  }),
});
