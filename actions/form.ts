"use server"

import { formSchema, FormSchemaType } from "@/schemas/form"
import { currentUser } from "@clerk/nextjs"

import prisma from "@/lib/prisma"

export async function GetFormStasts() {
  const user = await currentUser()
  if (!user) {
    return { error: "You must be logged in to do this." }
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  })

  const visits = stats._sum.visits || 0
  const summisions = stats._sum.submissions || 0

  let submissionsRate = 0

  if (visits > 0) {
    submissionsRate = (summisions / visits) * 100
  }

  const bounceRate = 100 - submissionsRate

  return {
    visits,
    summisions,
    submissionsRate,
    bounceRate,
  }
}

export async function CreateForm(data: FormSchemaType) {
  const validation = formSchema.safeParse(data)

  if (!validation.success) {
    throw new Error("form not valid")
  }

  const user = await currentUser()
  if (!user) {
    throw new Error("You must be logged in to do this.")
  }

  const form = await prisma.form.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  if (!form) {
    throw new Error("form not created")
  }

  return form.id
}
