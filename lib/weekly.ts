import { prisma } from "@/lib/prisma";

export function getChinaNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 60 * 60000);
}

export function getChinaWeekRange() {
  const chinaNow = getChinaNow();

  const day = chinaNow.getDay() || 7;
  const monday = new Date(chinaNow);
  monday.setDate(chinaNow.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);

  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  const weekKey = monday.toISOString().slice(0, 10);

  return {
    weekKey,
    startAt: monday,
    endAt: nextMonday,
  };
}

export async function ensureWeeklyPromptRolledOver() {
  const { weekKey, startAt, endAt } = getChinaWeekRange();

  const active = await prisma.weeklyPrompt.findFirst({
    where: { isActive: true },
    orderBy: { startAt: "desc" },
  });

  const existingThisWeek = await prisma.weeklyPrompt.findUnique({
    where: { weekKey },
  });

  if (!active) {
    if (existingThisWeek) {
      await prisma.weeklyPrompt.update({
        where: { id: existingThisWeek.id },
        data: { isActive: true },
      });
    } else {
      await prisma.weeklyPrompt.create({
        data: {
          prompt: "",
          weekKey,
          startAt,
          endAt,
          isActive: true,
        },
      });
    }
    return;
  }

  if (active.weekKey !== weekKey) {
    await prisma.$transaction([
      prisma.weeklyPrompt.update({
        where: { id: active.id },
        data: { isActive: false },
      }),
      existingThisWeek
        ? prisma.weeklyPrompt.update({
            where: { id: existingThisWeek.id },
            data: { isActive: true },
          })
        : prisma.weeklyPrompt.create({
            data: {
              prompt: "",
              weekKey,
              startAt,
              endAt,
              isActive: true,
            },
          }),
    ]);
  }
}

export async function publishCurrentWeekPrompt(prompt: string) {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Prompt 不能为空");
  }

  await ensureWeeklyPromptRolledOver();

  const { weekKey, startAt, endAt } = getChinaWeekRange();

  const current = await prisma.weeklyPrompt.findUnique({
    where: { weekKey },
  });

  if (current) {
    return prisma.weeklyPrompt.update({
      where: { id: current.id },
      data: {
        prompt: cleanPrompt,
        isActive: true,
      },
    });
  }

  return prisma.weeklyPrompt.create({
    data: {
      prompt: cleanPrompt,
      weekKey,
      startAt,
      endAt,
      isActive: true,
    },
  });
}