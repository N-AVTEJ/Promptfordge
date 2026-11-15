import { Metadata } from "next";
import dynamic from "next/dynamic";
import WorkflowLoading from "./loading";

export const metadata: Metadata = {
  title: "Workflow Builder | PromptForge",
  description:
    "Interactive visual prompt chaining studio. Build, test, and execute multi-stage DAG prompt pipelines with typed handles and cycle prevention.",
};

const WorkflowStudioWrapper = dynamic(
  () =>
    import("@/components/workflow/workflow-studio").then(
      (m) => m.WorkflowStudioWrapper
    ),
  {
    ssr: false,
    loading: () => <WorkflowLoading />,
  }
);

export default function WorkflowPage() {
  return <WorkflowStudioWrapper />;
}
