import { Metadata } from "next";
import { WorkflowStudioWrapper } from "@/components/workflow/workflow-studio";

export const metadata: Metadata = {
  title: "Workflow Builder | PromptForge",
  description:
    "Interactive visual prompt chaining studio. Build, test, and execute multi-stage DAG prompt pipelines with typed handles and cycle prevention.",
};

export default function WorkflowPage() {
  return <WorkflowStudioWrapper />;
}
