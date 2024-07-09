"use client";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  BookOpen,
  CopyCheck,
  Bot,
  SquarePen,
  Globe,
  GlobeLock,
} from "lucide-react";
import { Separator } from "../ui/separator";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingQuestions from "../LoadingQuestions";

type Props = {
  topic: string;
};

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ topic: topicParam }: Props) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const { toast } = useToast();
  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({
      amount,
      topic,
      type,
      GameName,
      creater,
      mode,
    }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
        type,
        GameName,
        creater,
        mode,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      topic: topicParam,
      type: "mcq",
      amount: 3,
      GameName: "", // add default value for GameName
      creater: "ai",
      mode: "public",
    },
  });

  const onSubmit = async (data: Input) => {
    setShowLoader(true);

    if (data.creater === "ai") {
      getQuestions(data, {
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
        onSuccess: ({ gameId }: { gameId: string }) => {
          setFinishedLoading(true);
          setTimeout(() => {
            if (form.getValues("type") === "mcq") {
              router.push(`/play/mcq/${gameId}`);
            } else if (form.getValues("type") === "open_ended") {
              router.push(`/play/open-ended/${gameId}`);
            }
          }, 2000);
        },
      });
    } else {
      setFinishedLoading(true);
      router.push(
        `/quizbuild?data=${encodeURIComponent(JSON.stringify(data))}`
      );

    }
  };
  form.watch();

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading} />;
  }

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 "
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
          <CardDescription>Choose a topic</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="GameName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your quiz name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Quiz name should be unique.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a topic" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please provide any topic you would like to be quizzed on
                      here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How many questions?"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                        min={1}
                        max={10}
                      />
                    </FormControl>
                    <FormDescription>
                      You can choose how many questions you would like to be
                      quizzed on here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  variant={
                    form.getValues("type") === "mcq" ? "default" : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-l-lg"
                  onClick={() => {
                    form.setValue("type", "mcq");
                  }}
                  type="button"
                >
                  <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={
                    form.getValues("type") === "open_ended"
                      ? "default"
                      : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-r-lg"
                  onClick={() => form.setValue("type", "open_ended")}
                  type="button"
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Open Ended
                </Button>
              </div>
              <div className="flex justify-between">
                <Button
                  variant={
                    form.getValues("creater") === "ai" ? "default" : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-l-lg"
                  onClick={() => {
                    form.setValue("creater", "ai");
                  }}
                  type="button"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Create with AI
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={
                    form.getValues("creater") === "user"
                      ? "default"
                      : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-r-lg"
                  onClick={() => form.setValue("creater", "user")}
                  type="button"
                >
                  <SquarePen className="w-4 h-4 mr-2" /> Create Yourself
                </Button>
              </div>
              <div className="flex justify-between">
                <Button
                  variant={
                    form.getValues("mode") === "public"
                      ? "default"
                      : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-l-lg"
                  onClick={() => {
                    form.setValue("mode", "public");
                  }}
                  type="button"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Public Quiz
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={
                    form.getValues("mode") === "private"
                      ? "default"
                      : "secondary"
                  }
                  className="w-1/2 rounded-none rounded-r-lg"
                  onClick={() => form.setValue("mode", "private")}
                  type="button"
                >
                  <GlobeLock className="w-4 h-4 mr-2" /> Private Quiz
                </Button>
              </div>
              <Button disabled={isPending} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
