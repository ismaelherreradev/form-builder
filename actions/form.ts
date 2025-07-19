"use server";

import { FormSchema, FormSchemaType } from "@/schemas/form";
import { getServerSession } from "@/lib/session";
import { eq, sum, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

import db from "@/lib/db";
import { forms, formSubmissions } from "@/lib/schema";

async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

export async function GetFormStats() {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const stats = await db
    .select({
      totalVisits: sum(forms.visits),
      totalSubmissions: sum(forms.submissions),
    })
    .from(forms)
    .where(eq(forms.userId, user.id));

  const visits = Number(stats[0]?.totalVisits) || 0;
  const submissions = Number(stats[0]?.totalSubmissions) || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreateForm(data: FormSchemaType) {
  const validation = FormSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }

  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const { name, description } = data;

  const result = await db
    .insert(forms)
    .values({
      userId: user.id,
      name,
      description,
      shareURL: randomUUID(),
    })
    .returning({ id: forms.id });

  if (!result[0]) {
    throw new Error("something went wrong");
  }

  return result[0].id;
}

export async function GetForms() {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  return await db
    .select()
    .from(forms)
    .where(eq(forms.userId, user.id))
    .orderBy(desc(forms.createdAt));
}

export async function GetFormById(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const result = await db
    .select()
    .from(forms)
    .where(and(eq(forms.userId, user.id), eq(forms.id, id)))
    .limit(1);

  return result[0];
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const result = await db
    .update(forms)
    .set({ content: jsonContent })
    .where(and(eq(forms.userId, user.id), eq(forms.id, id)))
    .returning();

  return result[0];
}

export async function PublishForm(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const result = await db
    .update(forms)
    .set({ published: true })
    .where(and(eq(forms.userId, user.id), eq(forms.id, id)))
    .returning();

  return result[0];
}

export async function GetFormContentByUrl(formUrl: string) {
  const result = await db
    .update(forms)
    .set({ visits: sql`${forms.visits} + 1` })
    .where(eq(forms.shareURL, formUrl))
    .returning({ content: forms.content });

  return result[0];
}

export async function SubmitForm(formUrl: string, content: string) {
  // First get the form to get its ID
  const form = await db
    .select({ id: forms.id })
    .from(forms)
    .where(and(eq(forms.shareURL, formUrl), eq(forms.published, true)))
    .limit(1);

  if (!form[0]) {
    throw new Error("Form not found or not published");
  }

  // Create the submission
  await db.insert(formSubmissions).values({
    formId: form[0].id,
    content,
  });

  // Update the submissions count
  const result = await db
    .update(forms)
    .set({ submissions: sql`${forms.submissions} + 1` })
    .where(eq(forms.id, form[0].id))
    .returning();

  return result[0];
}

export async function GetFormWithSubmissions(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const form = await db
    .select()
    .from(forms)
    .where(and(eq(forms.userId, user.id), eq(forms.id, id)))
    .limit(1);

  if (!form[0]) {
    return null;
  }

  const submissions = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, id));

  return {
    ...form[0],
    FormSubmissions: submissions,
  };
}
