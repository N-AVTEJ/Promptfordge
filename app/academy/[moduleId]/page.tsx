import { redirect, notFound } from "next/navigation";
import { CURRICULUM_MODULES, getModuleById } from "@/content/modules";

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

export default function ModuleRedirectPage({ params }: ModulePageProps) {
  const mod = getModuleById(params.moduleId);

  if (!mod || mod.lessons.length === 0) {
    notFound();
  }

  // Redirect to first lesson of this module
  redirect(`/academy/${mod.id}/${mod.lessons[0].id}`);
}
