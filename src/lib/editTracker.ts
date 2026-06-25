import type { FormQuestion } from "@/types/form";

export interface FormSnapshot {
  title: string;
  description: string;
  questions: FormQuestion[];
}

function diffQuestion(before: FormQuestion, after: FormQuestion): string[] {
  const edits: string[] = [];
  const label = after.text.trim() || before.text.trim() || "a question";

  if (before.text !== after.text) {
    const oldLabel = before.text.trim() || "empty";
    const newLabel = after.text.trim() || "empty";
    edits.push(`[User changed "${oldLabel}" to "${newLabel}"]`);
  }

  if (before.answer_type !== after.answer_type) {
    edits.push(
      `[User changed "${label}" answer type from "${before.answer_type}" to "${after.answer_type}"]`,
    );
  }

  if (before.required !== after.required) {
    edits.push(
      `[User ${after.required ? "marked" : "unmarked"} "${label}" as ${after.required ? "required" : "not required"}]`,
    );
  }

  if (before.answer_select_multiple !== after.answer_select_multiple) {
    edits.push(
      `[User ${after.answer_select_multiple ? "allowed" : "disallowed"} multiple selections for "${label}"]`,
    );
  }

  const beforeOpts = before.answer_select_options ?? [];
  const afterOpts = after.answer_select_options ?? [];

  for (const opt of afterOpts) {
    if (!beforeOpts.includes(opt)) {
      edits.push(`[User added option "${opt}" to "${label}"]`);
    }
  }
  for (const opt of beforeOpts) {
    if (!afterOpts.includes(opt)) {
      edits.push(`[User removed option "${opt}" from "${label}"]`);
    }
  }

  return edits;
}

export function buildEditsSummary(
  before: FormSnapshot,
  after: FormSnapshot,
): string {
  if (before.questions.length === 0) return "";

  const edits: string[] = [];

  if (before.title !== after.title) {
    const old = before.title || "empty";
    const neu = after.title || "empty";
    edits.push(`[User changed title from "${old}" to "${neu}"]`);
  }

  if (before.description !== after.description) {
    const old = before.description || "empty";
    const neu = after.description || "empty";
    edits.push(`[User changed description from "${old}" to "${neu}"]`);
  }

  for (const bq of before.questions) {
    const aq = after.questions.find((q) => q.id === bq.id);
    if (!aq) {
      const label = bq.text.trim() || "a question";
      edits.push(`[User deleted: "${label}"]`);
    }
  }

  for (const aq of after.questions) {
    const bq = before.questions.find((q) => q.id === aq.id);
    if (!bq) {
      const label = aq.text.trim() || "a question";
      edits.push(`[User added: "${label}"]`);
    }
  }

  for (const aq of after.questions) {
    const bq = before.questions.find((q) => q.id === aq.id);
    if (bq) {
      edits.push(...diffQuestion(bq, aq));
    }
  }

  return edits.join("\n");
}
