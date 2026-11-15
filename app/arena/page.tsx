import { Metadata } from "next";
import { SecurityArenaClient } from "./client";

export const metadata: Metadata = {
  title: "Security Arena | PromptForge",
  description:
    "Safe, game-like sandbox teaching prompt injection vectors and multi-layered defenses with real-time heuristic feedback.",
};

export default function ArenaPage() {
  return <SecurityArenaClient />;
}
