"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// Validation schema for the private quiz join code
const privateQuizSchema = z.object({
  joinCode: z
    .string()
    .length(6, { message: "Join code must be exactly 6 digits" }),
});

type Props = {
  topic: string;
};

type PrivateQuizFormValues = z.infer<typeof privateQuizSchema>;

type Quiz = {
  id: string;
  GameName: string;
  Creater: string;
  gameType: string;
  topic: string;
};

const QuizJoin = ({ topic: topicParam }: Props) => {
  const router = useRouter();
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState(topicParam);
  const privateQuizForm = useForm<PrivateQuizFormValues>({
    resolver: zodResolver(privateQuizSchema),
    defaultValues: {
      joinCode: "",
    },
  });

  const fetchPublicQuizzes = async () => {
    try {
      const response = await axios.get("/api/publicquizzes");
      console.log("API Response:", response.data.game); // Debugging log
      if (Array.isArray(response.data.game)) {
        setPublicQuizzes(response.data.game);
      } else {
        console.error("Unexpected response data format:", response.data.game);
        console.log("error1");
      }
    } catch (error) {
      console.error("Error fetching public quizzes:", error);
      console.log("error2");
      // Handle error
    }
  };

  useEffect(() => {
    setSearchTerm(topicParam);
    fetchPublicQuizzes();
  }, [topicParam]);

  const onPrivateQuizSubmit = async (data: PrivateQuizFormValues) => {
    try {
      const joinCode = data.joinCode;
      const response = await axios.get("/api/findgame?nanoid=" + joinCode);
      console.log("API Response:", response.data.game); // Debugging log
      if (response.data.game.gameType == "mcq") {
        router.push(`/play/mcq/${response.data.game.id}`);
      } else {
        router.push(`/play/open-ended/${response.data.game.id}`);
      }
    } catch (error) {
      console.error("Error fetching private quiz:", error);
      // console.log("error3");
      // Handle error
    }
  };

  if (!Array.isArray(publicQuizzes)) {
    return <div>Error: publicQuizzes is not an array.</div>;
  }

  const filteredQuizzes = publicQuizzes.filter(
    (quiz: Quiz) =>
      quiz.GameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Join a Quiz</CardTitle>
          <CardDescription>Select a quiz to join</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Public Quizzes</h2>
              <Input
                placeholder="Search public quizzes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <ul>
                {filteredQuizzes.map((quiz: Quiz) => (
                  <li
                    key={quiz.id}
                    className="border border-black rounded-lg p-1 mb-4"
                  >
                    <div className="ml-2 flex justify-between w-full">
                      <a
                        href={
                          quiz.gameType === "mcq"
                            ? `/play/mcq/${quiz.id}`
                            : `/play/open-ended/${quiz.id}`
                        }
                        className="text-blue-600 font-bold"
                      >
                        {quiz.GameName}
                      </a>
                      <p className="text-gray-500 text-sm mr-4">
                        By: {quiz.Creater}
                      </p>{" "}
                    </div>

                    <div className="ml-2 text-sm text-gray-700">
                      <p> ( {quiz.topic} )</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h2 className="text-xl font-semibold">Private Quiz</h2>
              <Form {...privateQuizForm}>
                <form
                  onSubmit={privateQuizForm.handleSubmit(onPrivateQuizSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={privateQuizForm.control}
                    name="joinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Join Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 6 digit code"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the 6-digit join code provided by the quiz
                          creator.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Join Private Quiz</Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizJoin;
