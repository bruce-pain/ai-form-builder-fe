import type { FormQuestion } from "@/types/form";

interface FormPreviewProps {
  questions: FormQuestion[];
  title: string;
  description: string;
}

export function FormPreview({ questions, title, description }: FormPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-text-primary">
          {title || "Untitled Form"}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-text-placeholder">No questions yet.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="mb-3 text-sm font-medium text-text-primary">
                {question.text}
                {question.required && (
                  <span className="ml-0.5 text-red-500">*</span>
                )}
              </p>

              {question.answer_type === "text" ? (
                <input
                  type="text"
                  disabled
                  placeholder="Your answer"
                  className="w-full rounded-lg border border-border-input bg-input px-3 py-2 text-sm text-text-primary placeholder-text-placeholder opacity-60"
                />
              ) : (
                <div className="space-y-2">
                  {(question.answer_select_options ?? []).map((option) => (
                    <label
                      key={option}
                      className="flex cursor-not-allowed items-center gap-2"
                    >
                      <input
                        type={question.answer_select_multiple ? "checkbox" : "radio"}
                        name={`preview-q-${question.id}`}
                        value={option}
                        disabled
                        className="opacity-60"
                      />
                      <span className="text-sm text-text-secondary">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
