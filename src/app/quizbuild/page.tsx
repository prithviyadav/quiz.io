import React, { useState } from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import QuizCreater from "@/components/QuizCreater";
import QuizOpenCreater from "@/components/QuizOpenCreater";

interface Props {
  searchParams: {};
}

const Quiza = async ({ searchParams }: Props) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  const data = searchParams.data ? JSON.parse(searchParams.data) : null;
  const { topic, type, mode, creater, amount, GameName } = data;
  if (type == "mcq") {
    return (
      <QuizCreater
        topic={topic}
        type={type}
        amount={amount}
        creater={creater}
        GameName={GameName}
        mode={mode}
      ></QuizCreater>
    );
  }
  else{
    return (
      <QuizOpenCreater
        topic={topic}
        type={type}
        amount={amount}
        creater={creater}
        GameName={GameName}
        mode={mode}
      ></QuizOpenCreater>
    );
  }
};
export default Quiza;
