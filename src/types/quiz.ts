export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

export interface Quiz {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  key_entities: KeyEntities;
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  created_at: string;
}

export interface QuizApiResponse {
  success: boolean;
  data?: Quiz;
  error?: string;
}