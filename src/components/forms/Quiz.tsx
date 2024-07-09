"use client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
type Props = {
  topic: string;
};
const Quiz = ({ topic: topicParam }: Props) => {
  const router = useRouter();

  const handleJoinQuiz = () => {
    router.push("/quiz/join?topic=" + topicParam);
  };

  const handleCreateQuiz = () => {
    router.push("/quiz/create?topic=" + topicParam);
  };

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Get Your Quiz Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex flex-col space-y-4">
              <Button className="w-full" onClick={handleJoinQuiz}>
                Join Quiz
              </Button>
              <Button className="w-full" onClick={handleCreateQuiz}>
                Create Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
