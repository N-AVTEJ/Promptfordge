import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CURRICULUM_MODULES,
  getLessonById,
} from "@/content/modules";
import { LessonStudio } from "@/components/academy/lesson-studio";

interface LessonPageProps {
  params: {
    moduleId: string;
    lessonId: string;
  };
}

export function generateStaticParams() {
  const params: { moduleId: string; lessonId: string }[] = [];
  CURRICULUM_MODULES.forEach((mod) => {
    mod.lessons.forEach((les) => {
      params.push({
        moduleId: mod.id,
        lessonId: les.id,
      });
      // Also support module slug
      params.push({
        moduleId: mod.slug,
        lessonId: les.id,
      });
    });
  });
  return params;
}

export function generateMetadata({ params }: LessonPageProps): Metadata {
  const lessonData = getLessonById(params.moduleId, params.lessonId);
  if (!lessonData) {
    return {
      title: "Lesson Not Found | PromptForge Academy",
    };
  }

  const { module, lesson } = lessonData;
  return {
    title: `${lesson.title} · Module ${module.number} | PromptForge Academy`,
    description: lesson.summary,
  };
}

export default function LessonStudioPage({ params }: LessonPageProps) {
  const lessonData = getLessonById(params.moduleId, params.lessonId);

  if (!lessonData) {
    notFound();
  }

  const { module, lesson, nextLesson, prevLesson } = lessonData;

  return (
    <LessonStudio
      module={module}
      lesson={lesson}
      nextLesson={nextLesson}
      prevLesson={prevLesson}
      allModules={CURRICULUM_MODULES}
    />
  );
}
