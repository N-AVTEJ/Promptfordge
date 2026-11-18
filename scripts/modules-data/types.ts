export interface Chapter {
  time: number;
  label: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface PracticeChallenge {
  title: string;
  objective: string;
  instructions: string;
  starterPrompt: string;
  hint?: string;
  solutionNotes?: string;
}

export interface VideoSource {
  id: string;
  title: string;
  channel: string;
  minutes: number;
  covers: string[];
  relatedTo?: string[];
  level?: "beginner" | "intermediate" | "advanced";
  status: "ok" | "unavailable" | "slot";
  resolvedBy?: "seed" | "agent-search";
  role?: "core" | "optional";
  source?: "external" | "own";
  thumbnailUrl?: string;
  whyThisVideo?: string;
  reviewed?: boolean;
  notes?: string;
  chapters?: Chapter[];
}

export interface CheckYourself {
  question: string;
  answer: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  status?: "ok" | "slot" | "unavailable";
  videos?: VideoSource[];
  beforeYouWatch?: [string, string];
  checkYourself?: CheckYourself;
  chapters: Chapter[];
  summary: string;
  keyConcepts: string[];
  practiceChallenge: PracticeChallenge;
  quiz: QuizQuestion[];
  relatedLab: string;
  notesMarkdown?: string;
}

export interface LabReference {
  id: string;
  route: string;
  title: string;
  status: "full" | "lite";
  loadsTask?: string | Record<string, any>;
}

export interface CurriculumModule {
  id: string;
  number: number;
  slug: string;
  legacySlugs?: string[];
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  outcome: string;
  duration: string;
  lessonCount: number;
  videoCount: number;
  totalWatchTime?: string;
  level: "Foundational" | "Core" | "Advanced" | "Specialized";
  tags: string[];
  topics: string[];
  labs: LabReference[];
  videos?: VideoSource[];
  youtubeVideoId: string;
  accent: "amber" | "cyan";
  keyTakeaway: string;
  lessons: Lesson[];
  keyConcepts: string[];
  practiceChallenge: PracticeChallenge;
  quiz: QuizQuestion[];
}
