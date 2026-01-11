import { supabase } from "@/integrations/supabase/client";
import type { Quiz, QuizApiResponse, QuizQuestion, KeyEntities } from "@/types/quiz";

export async function generateQuiz(url: string): Promise<QuizApiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-quiz", {
      body: { url },
    });

    if (error) {
      console.error("Function invoke error:", error);
      return { success: false, error: error.message };
    }

    return data as QuizApiResponse;
  } catch (err) {
    console.error("API error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Failed to generate quiz" 
    };
  }
}

export async function fetchQuizHistory(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quiz history:", error);
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    url: item.url,
    title: item.title,
    summary: item.summary,
    key_entities: (item.key_entities as unknown as KeyEntities) || { people: [], organizations: [], locations: [] },
    sections: item.sections || [],
    quiz: (item.quiz as unknown as QuizQuestion[]) || [],
    related_topics: item.related_topics || [],
    created_at: item.created_at,
  }));
}

export async function fetchQuizById(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching quiz:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    url: data.url,
    title: data.title,
    summary: data.summary,
    key_entities: (data.key_entities as unknown as KeyEntities) || { people: [], organizations: [], locations: [] },
    sections: data.sections || [],
    quiz: (data.quiz as unknown as QuizQuestion[]) || [],
    related_topics: data.related_topics || [],
    created_at: data.created_at,
  };
}