import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    content: v.string(),
    sourceType: v.optional(v.string()),
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
  theory_of_change: defineTable({
    category: v.string(),
    description: v.string(),
    status: v.string(), // 'pending', 'approved', 'rejected'
    createdAt: v.number(),
  }),
  systems_thinking_variables: defineTable({
    name: v.string(),
    description: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }),
  systems_thinking_links: defineTable({
    source: v.string(),
    target: v.string(),
    effect: v.string(),
    description: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }),
});
