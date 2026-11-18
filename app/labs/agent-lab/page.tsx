import { Metadata } from "next";
import { AgentLab } from "@/components/labs/agent-lab";

export const metadata: Metadata = {
  title: "AI Agent & Context Engineering Lab | PromptForge",
  description:
    "Autonomous agent loop visualizer (plan-act-observe), real-time token context window meter, and Model Context Protocol (MCP) explorer.",
};

export default function AgentLabPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AgentLab />
    </div>
  );
}
