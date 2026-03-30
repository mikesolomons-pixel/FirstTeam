"use client";

import { useRouter } from "next/navigation";
import { TutorialWalkthrough } from "@/components/tutorial/tutorial-walkthrough";

export default function TutorialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-warm-50">
      <TutorialWalkthrough
        embedded
        onComplete={() => router.push("/")}
      />
    </div>
  );
}
