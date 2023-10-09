"use server"

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

  if(visits > 0) {
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
