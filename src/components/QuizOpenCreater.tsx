"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircleQuestion, BookCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import LoadingQuestions from "../components/LoadingQuestions";

import { customAlphabet } from "nanoid";
const nid = customAlphabet("1234567890abcdef", 10); // Adjust length as needed
type openQuestion = {
  question: string;
  answer: string;
};
type Props = {
  topic: string;
  type: string;
  amount: number;
  GameName: string;
  creater: string;
  mode: string;
};

const QuizCreater = ({
  topic,
  type,
  mode,
  creater,
  amount,
  GameName,
}: Props) => {
  const router = useRouter();
  const [formattedData, setFormattedData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const { toast } = useToast();
  const { mutate: getQuestions } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/newgame", data);
      return response.data;
    },
  });
  const [nanoid, setnanoid] = useState("");
  const [questions, setQuestions] = useState(
    Array.from({ length: amount }, () => ({
      question: "",
      answer: "",
    }))
  );

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    // Validation
    for (let q of questions) {
      if (!q.question.trim()) {
        toast({
          title: "Error",
          description: "All questions must be filled out.",
          variant: "destructive",
        });
        return;
      }
      if (!q.answer.trim()) {
        toast({
          title: "Error",
          description: "Each question must have an answer.",
          variant: "destructive",
        });
        return;
      }
    }

    const quizData = {
      topic,
      type,
      mode,
      creater,
      GameName,
      nanoid, // Include the nanoid in the data sent to the backend
      questions: questions.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    };

    console.log("Submitted Quiz Data:", quizData);

    const formattedQuestions = quizData.questions.map(
      (question: openQuestion) => {
        return {
          question: question.question,
          answer: question.answer,
          GameName: GameName,
          type: "open_ended",
          Creater: creater,
          topic: quizData.topic,
          mode: quizData.mode,
          nanoid: quizData.nanoid,
        };
      }
    );

    setFormattedData(formattedQuestions);

    console.log(
      "Submitted Quiz Data:",
      JSON.stringify(formattedQuestions, null, 2)
    );
    setShowLoader(true);

    getQuestions(formattedQuestions, {
        onError: (error) => {
            setShowLoader(false);
            if (error instanceof AxiosError) {
                if (error.response?.status === 500) {
                    toast({
                        title: "Error",
                        description: "Something went wrong. Please try again later.",
                        variant: "destructive",
                    });
                }
            }
        },
        onSuccess: ({ gameId, nanoid }: { gameId: string; nanoid: string }) => {
            setFinishedLoading(true);
            setTimeout(() => {
                router.push(`/play/open-ended/${gameId}`);
            }, 2000);
            toast({
                title: "Game Created",
                description: `Your game ID is ${gameId} and your nanoid is ${nanoid}.`,
                variant: "success",
            });
        },
    });
  };

  return (
    <div className="absolute -translate-x-1/2 -translate-y-2/5 md:w-[80vw] max-w-4xl w-[90vw] top-[20vh] left-1/2">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Mode:</span> {mode}
        </p>
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Creator:</span> {creater}
        </p>
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Game Name:</span> {GameName}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Number of Questions:</span> {amount}
        </p>
      </div>
      <Card className="w-full mt-4 p-6">
        <CardHeader className="flex flex-row items-center mb-4">
          <CardTitle className="text-center text-2xl font-bold">
            Write questions, the system will generate fill in the blanks itself
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-block space-y-4">
              <div className="flex items-center space-x-2">
                <MessageCircleQuestion className="w-6 h-6" />
                <Input
                  className="p-2 mb-2"
                  placeholder={`Question ${qIndex + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <BookCheck className="w-6 h-6" />
                <Input
                  className="p-2 mb-2"
                  placeholder="Answer"
                  value={q.answer}
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button className="mt-4" onClick={() => setnanoid(nid(6))}>
            Generate nanoid
          </Button>
          {nanoid && (
            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-semibold">nanoid:</span> {nanoid}
              </p>
            </div>
          )}
          <Button className="mt-4" onClick={handleSubmit}>
            Submit Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreater;
