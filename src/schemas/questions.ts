import { z } from "zod";

export const getQuestionsSchema = z.object({
  topic: z.string(),
  amount: z.number().int().positive().min(1).max(10),
  type: z.enum(["mcq", "open_ended"]),
});

export const checkAnswerSchema = z.object({
  userInput: z.string(),
  questionId: z.string(),
});

export const endGameSchema = z.object({
  gameId: z.string(),
});
// export const getCrQuestionsSchema = z.object({
//   topic: z.string(),
//   amount: z.number().int().positive().min(1).max(10),
//   type: z.enum(["mcq", "open_ended"]),
//         question: question.question,
//         answer: question.answer,
//         options: JSON.stringify(options),
//         GameName: GameName,
//         type: "mcq",
//         Creater : creater,
//         topic : z.string(),
//         mode : quizData.mode,

