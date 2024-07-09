// pages/api/[nanoid]/route.ts

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { NextResponse } from "next/server";

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
    const url = new URL(req.url);
    const nanoid = url.searchParams.get("nanoid");
    if (!nanoid) {
      return NextResponse.json(
        { error: "You must provide a nano id." },
        {
          status: 400,
        }
      );
    }
    console.log(nanoid);
    const game = await prisma.game.findUnique({
      where: {
        gameID: String(nanoid),
      },
      include: {
        questions: true, // Include related questions if needed
      },
    });
    console.log("API Response:", game); // Debugging log
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
