import { useState } from "react";
import { Search, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuizDisplay } from "./QuizDisplay";
import { generateQuiz } from "@/lib/api";
import type { Quiz } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

export function GenerateQuizTab() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Wikipedia article URL",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes("wikipedia.org/wiki/")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Wikipedia article URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const response = await generateQuiz(url);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to generate quiz");
      }

      setQuiz(response.data!);
      toast({
        title: "Quiz Generated!",
        description: `Created ${response.data!.quiz.length} questions from "${response.data!.title}"`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* URL Input Form */}
      <div className="quiz-card">
        <div className="text-center mb-6">
          <h2 className="font-display text-xl font-semibold mb-2">
            Generate Quiz from Wikipedia
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter any Wikipedia article URL to automatically generate an interactive quiz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 h-12"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading}
            className="h-12 px-6 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="mt-6 flex flex-col items-center gap-3 py-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse-soft" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Generating your quiz...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Scraping article and creating questions with AI
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && !isLoading && (
        <div className="quiz-card border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Generation Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {quiz && !isLoading && <QuizDisplay quiz={quiz} />}

      {/* Empty State */}
      {!quiz && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">Ready to Learn?</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Enter a Wikipedia article URL above to generate an interactive quiz with AI-powered questions.
          </p>
        </div>
      )}
    </div>
  );
}