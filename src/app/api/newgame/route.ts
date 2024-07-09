import { getAuthSession } from "@/lib/nextauth";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { prisma } from "@/lib/db";
export const runtime = "nodejs";
export const maxDuration = 500;

const GameSchema = z.object({
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).optional(),
  GameName: z.string(),
  type: z.enum(["mcq", "open_ended"]),
  Creater: z.string(),
  topic: z.string(),
  mode: z.enum(["public", "private"]),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }

    const body = await req.json();
    // const validation = z.array(GameSchema).safeParse(body);
    // if (!validation.success) {
    //   throw new ZodError(validation.error.errors);
    // }
    console.log(body);
    const { question, answer, options, GameName, type, Creater, topic, mode , nanoid } =
      body[0];
    const CreaterName = Creater === "user" ? session.user.name : Creater;
    const generatedNonoid = nanoid;
    const game = await prisma.game.create({
      data: {
        gameType: type,
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
        GameName,
        Creater: CreaterName,
        GameMode: mode,
        gameID: generatedNonoid,
      },
    });

    await prisma.topic_count.upsert({
      where: { topic },
      create: { topic, count: 1 },
      update: { count: { increment: 1 } },
    });

    if (type === "mcq") {
      const mcqQuestions = body.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        options: JSON.stringify(
          shuffleArray([q.options[0], q.options[1], q.options[2], q.answer])
        ),
        gameId: game.id,
        questionType: "mcq",
      }));

      await prisma.question.createMany({ data: mcqQuestions });
    } else if (type === "open_ended") {
      const openQuestions = body.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        gameId: game.id,
        questionType: "open_ended",
      }));

      await prisma.question.createMany({ data: openQuestions });
    }

    return NextResponse.json({ gameId: game.id, nanoid: generatedNonoid }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}
