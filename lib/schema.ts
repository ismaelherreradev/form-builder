import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// Export auth tables
export { user, session, account, verification } from "./auth-schema";
import { user } from "./auth-schema";

export const forms = sqliteTable(
  "Form",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    content: text("content").notNull().default("[]"),
    visits: integer("visits").notNull().default(0),
    submissions: integer("submissions").notNull().default(0),
    shareURL: text("shareURL").notNull().unique(),
  },
  (table) => ({
    uniqueNameUserId: unique().on(table.name, table.userId),
  }),
);

export const formSubmissions = sqliteTable("FormSubmissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  formId: integer("formId")
    .notNull()
    .references(() => forms.id),
  content: text("content").notNull(),
});

export const formsRelations = relations(forms, ({ many, one }) => ({
  FormSubmissions: many(formSubmissions),
  user: one(user, {
    fields: [forms.userId],
    references: [user.id],
  }),
}));

export const formSubmissionsRelations = relations(
  formSubmissions,
  ({ one }) => ({
    form: one(forms, {
      fields: [formSubmissions.formId],
      references: [forms.id],
    }),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  forms: many(forms),
}));
