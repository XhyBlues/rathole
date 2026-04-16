import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishCurrentWeekPrompt, ensureWeeklyPromptRolledOver } from "@/lib/weekly";
import { revalidatePath } from "next/cache";

async function saveWeeklyPrompt(formData: FormData) {
  "use server";

  await requireAdmin();

  const prompt = String(formData.get("prompt") || "").trim();

  await publishCurrentWeekPrompt(prompt);

  revalidatePath("/");
  revalidatePath("/weekly");
  revalidatePath("/weekly/history");
  revalidatePath("/admin/weekly");
}

export default async function AdminWeeklyPage() {
  await requireAdmin();
  await ensureWeeklyPromptRolledOver();

  const currentPrompt = await prisma.weeklyPrompt.findFirst({
    where: { isActive: true },
    orderBy: { startAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin / Weekly Prompt</h1>
      <p className="text-sm text-neutral-500 mb-8">
        在这里发布或修改本周的 weekly prompt。
      </p>

      <form action={saveWeeklyPrompt} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            本周 Weekly Prompt
          </label>
          <textarea
            name="prompt"
            defaultValue={currentPrompt?.prompt || ""}
            rows={8}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            placeholder="输入本周新的 weekly prompt..."
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-black text-white px-5 py-3 hover:opacity-90 transition"
        >
          保存 Weekly Prompt
        </button>
      </form>

      {currentPrompt && (
        <div className="mt-8 rounded-2xl border border-neutral-200 p-5 bg-neutral-50">
          <div className="text-sm text-neutral-500 mb-2">当前激活周</div>
          <div className="text-sm text-neutral-500 mb-3">
            {new Date(currentPrompt.startAt).toLocaleDateString("zh-CN")} -{" "}
            {new Date(currentPrompt.endAt).toLocaleDateString("zh-CN")}
          </div>
          <div className="whitespace-pre-wrap text-base">
            {currentPrompt.prompt || "（当前还没有设置 prompt）"}
          </div>
        </div>
      )}
    </main>
  );
}