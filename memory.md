# LLM Memory Feature

The LLM endpoint now supports multi-turn conversations. Each response includes a `conversation_id` that the frontend must send back on subsequent calls to maintain context.

## Endpoint

**`POST /api/v1/llm`**

### Request

```json
{
  "prompt": "Add a phone number field",
  "conversation_id": "0195f...",         // omit or null on first call
  "current_state": {                      // the FormQuestionList from the previous response
    "questions": [
      { "id": "q1", "text": "Name", "answer_type": "text", "required": true }
    ]
  }
}
```

| Field | Required | Description |
|---|---|---|
| `prompt` | **yes** | The new instruction |
| `conversation_id` | first call: no / subsequent: yes | Omit or send `null` to start a new conversation |
| `current_state` | no | The `data` (i.e. `FormQuestionList`) from the **previous** `LLMResponse`. If omitted the model starts fresh. |

### Response

```json
{
  "status_code": 200,
  "message": "Form questions generated successfully",
  "data": {
    "questions": [ /* updated FormQuestionList */ ]
  },
  "conversation_id": "0195f..."
}
```

### Typical flow

```
Call 1:  POST /llm  { prompt: "Create a contact form" }
         → { data: [...], conversation_id: "abc" }

Call 2:  POST /llm  { prompt: "Add an email field",
                       conversation_id: "abc",
                       current_state: <data from Call 1> }
         → { data: [...], conversation_id: "abc" }

Call 3:  POST /llm  { prompt: "Make email required",
                       conversation_id: "abc",
                       current_state: <data from Call 2> }
         → { data: [...], conversation_id: "abc" }
```

### Important notes

- **`current_state` must be the exact `data` from the previous response.** The model uses it to determine what to modify. Sending stale or mismatched state may produce incorrect results.
- **Conversations expire after 30 minutes** of inactivity. If you send a stale `conversation_id`, the server treats it as a new conversation (fresh start).
- The model **modifies** the existing state by default — it does not regenerate from scratch unless the current state is empty or the prompt explicitly asks for a new form.
- The `questions` array uses ids `q1, q2, q3, ...` that reflect display order. The model may renumber them when inserting or removing questions.

### Handling manual edits

When the user edits the form state directly in the UI (adds, removes, or changes a question), **bake a summary of those edits into the `prompt` field**. The server stores every `prompt` verbatim as a prior instruction, so the summary appears in chronological order and the model understands the full context.

**Example: after creating a contact form, the user deletes "Email" manually, then adds a new requirement.**

```
Call 1:  POST /llm  { prompt: "Create a contact form" }
         → { data: [...], conversation_id: "abc" }

         User deletes "Email" question in the UI

Call 2:  POST /llm  {
           prompt: "[User deleted: Email]\nMake Phone required",
           conversation_id: "abc",
           current_state: <data with Email removed>
         }
         → { data: [...], conversation_id: "abc" }
```

On turn 2 the server sees:

```
Prior instructions (already applied):
1. "Create a contact form"
2. "[User deleted: Email]\nMake Phone required"

Current form state: {questions without Email}

New instruction: {the next prompt}
```

The edit note lives inline among the prior instructions, so the model understands *what happened* between turns — no backend changes needed.
