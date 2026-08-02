"use client";

import { Badge } from "@/components/ui/badge";

import type { components } from "@/lib/api.types";

type FormQuestion = components["schemas"]["FormQuestion"];
type ResponseAnswer = components["schemas"]["ResponseAnswer"];

function Answer({
  question,
  answer,
}: {
  question: FormQuestion;
  answer?: ResponseAnswer;
}) {
  if (!answer) {
    return <p className="text-muted-foreground">(no answer)</p>;
  }

  if (question.answer_type === "text") {
    const value = answer.text_answer?.trim();
    if (!value) {
      return <p className="text-muted-foreground">(no answer)</p>;
    }
    return <p className="whitespace-pre-wrap">{value}</p>;
  }

  const values = answer.select_answer ?? [];
  if (values.length === 0) {
    return <p className="text-muted-foreground">(no answer)</p>;
  }

  if (question.answer_select_multiple) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} variant="secondary">
            {value}
          </Badge>
        ))}
      </div>
    );
  }

  return <p>{values[0]}</p>;
}

export function ResponseAnswers({
  questions,
  answers,
}: {
  questions: FormQuestion[];
  answers: ResponseAnswer[];
}) {
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.question_id, answer]),
  );

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id}>
          <p className="text-base font-semibold">
            <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
            {question.text}
          </p>
          <div className="mt-1.5">
            <Answer question={question} answer={answerByQuestion.get(question.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}
