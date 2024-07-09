import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z
    .string()
    .min(4, {
      message: "Topic must be at least 4 characters long",
    })
    .max(50, {
      message: "Topic must be at most 50 characters long",
    }),
  type: z.enum(["mcq", "open_ended"]),
  mode : z.enum(["public", "private"]),
  creater : z.string(),
  amount: z.number().min(1).max(10),
  GameName: z.string().min(4).max(50),
});
