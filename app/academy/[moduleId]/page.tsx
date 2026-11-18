import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CURRICULUM_MODULES, getModuleById } from "@/content/modules";
import { ModuleOverview } from "@/components/academy/module-overview";

interface ModulePageProps {
  params: {
    moduleId: string;
  };
}

export function generateStaticParams() {
  const params: { moduleId: string }[] = [];
  CURRICULUM_MODULES.forEach((mod) => {
    params.push({ moduleId: mod.id });
    params.push({ moduleId: mod.slug });
  });
  return params;
}

export function generateMetadata({ params }: ModulePageProps): Metadata {
  const mod = getModuleById(params.moduleId);
  if (!mod) {
    return {
      title: "Module Not Found | PromptForge Academy",
    };
  }

  return {
    title: `Module ${String(mod.number).padStart(2, "0")}: ${mod.title} | PromptForge Academy`,
    description: mod.summary || mod.description,
  };
}

export default function ModulePage({ params }: ModulePageProps) {
  const mod = getModuleById(params.moduleId);

  if (!mod || mod.lessons.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModuleOverview module={mod} />
    </div>
  );
}
