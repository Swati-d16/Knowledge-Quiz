import { useState, useEffect } from "react";
import { History, ExternalLink, Eye, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuizDisplay } from "./QuizDisplay";
import { fetchQuizHistory } from "@/lib/api";
import type { Quiz } from "@/types/quiz";
import { formatDistanceToNow } from "date-fns";

export function HistoryTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchQuizHistory();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading quiz history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-card border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Failed to Load History</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadHistory}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-2">No Quizzes Yet</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Generate your first quiz from a Wikipedia article and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Past Quizzes ({quizzes.length})
          </h2>
        </div>

        <div className="quiz-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Title</th>
                  <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">Questions</th>
                  <th className="text-left p-4 font-semibold text-sm hidden sm:table-cell">Created</th>
                  <th className="text-right p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz, index) => (
                  <tr 
                    key={quiz.id} 
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground line-clamp-1">
                        {quiz.title}
                      </div>
                      <a 
                        href={quiz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="line-clamp-1">{quiz.url}</span>
                      </a>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {quiz.quiz.length} questions
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedQuiz(quiz)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quiz Detail Modal */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          {selectedQuiz && <QuizDisplay quiz={selectedQuiz} />}
        </DialogContent>
      </Dialog>
    </>
  );
}