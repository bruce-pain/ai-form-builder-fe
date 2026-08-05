import { auth } from "@/auth";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { Showcase } from "@/components/landing/showcase";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader isAuthed={Boolean(session)} />
      <main className="flex-1">
        <Hero isAuthed={Boolean(session)} />
        <HowItWorks />
        <Features />
        <Showcase />
        <Faq />
        <FinalCta isAuthed={Boolean(session)} />
      </main>
      <LandingFooter />
    </div>
  );
}
