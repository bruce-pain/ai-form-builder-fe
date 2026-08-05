"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "How does the AI build a form?",
    answer:
      "You describe what you need in plain English, and the AI writes the title, description, and questions. It runs on the Formbrew backend. No prompt engineering or AI experience required.",
  },
  {
    question: "Do I need a credit card?",
    answer:
      "No. Create an account with an email and start brewing. No payment details, no trial clock.",
  },
  {
    question: "What question types can I use?",
    answer:
      "Short text, single choice, and multiple choice. You can toggle each question as required and edit the options anytime.",
  },
  {
    question: "What happens to the responses I collect?",
    answer:
      "They're stored securely with your form. View aggregate summaries or browse individual responses from the form page, and delete the form, and its responses, whenever you like.",
  },
  {
    question: "Can I edit a published form?",
    answer:
      "Published forms are read-only so your public link stays stable. Unpublish the form to edit it again, then republish.",
  },
  {
    question: "Who can see my forms and responses?",
    answer:
      "Only you when you're signed in. Public forms are visible to anyone with the link: exactly what you published, nothing else.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Before you brew.
          </h2>
        </div>

        <Accordion type="multiple" className="mt-10 max-w-2xl">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
