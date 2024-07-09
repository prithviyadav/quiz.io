// pages/api/publicquizzes.ts
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

export async function GET(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        {
          status: 401,
        }
      );
    }
    const game = await prisma.game.findMany({
      where: {
        GameMode: "public", // Fetch only public games
      },
      select: {
        id: true,
        GameName: true,
        Creater: true,
        gameType: true,
        topic: true,
      },
    });
    console.log(game);
    const games = await prisma.game.findMany({
    select: {
    id: true,
    user: true,   
  },      
});
console.log(games);

    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { game },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      {
        status: 500,
      }
    );
  }
}
