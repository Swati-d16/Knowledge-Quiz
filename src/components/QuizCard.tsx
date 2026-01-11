import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  isQuizMode?: boolean;
  onAnswer?: (correct: boolean) => void;
}

export function QuizCard({ question, index, isQuizMode = false, onAnswer }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(!isQuizMode);
  const [isRevealed, setIsRevealed] = useState(!isQuizMode);

  const handleOptionClick = (option: string) => {
    if (!isQuizMode || isRevealed) return;
    
    setSelectedOption(option);
    setIsRevealed(true);
    setShowExplanation(true);
    
    const isCorrect = option === question.answer;
    onAnswer?.(isCorrect);
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "difficulty-badge-easy";
      case "medium":
        return "difficulty-badge-medium";
      case "hard":
        return "difficulty-badge-hard";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div 
      className="quiz-card opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm">
            {index + 1}
          </span>
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
            getDifficultyStyles(question.difficulty)
          )}>
            {question.difficulty}
          </span>
        </div>
      </div>

      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        {question.question}
      </h3>

      <div className="space-y-2 mb-4">
        {question.options.map((option, optIndex) => {
          const isCorrect = option === question.answer;
          const isSelected = option === selectedOption;
          const showResult = isRevealed && isQuizMode;

          return (
            <button
              key={optIndex}
              onClick={() => handleOptionClick(option)}
              disabled={isRevealed && isQuizMode}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3",
                isQuizMode && !isRevealed && "hover:border-primary hover:bg-primary/5 cursor-pointer",
                showResult && isCorrect && "border-success bg-success/10",
                showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                !showResult && "border-border bg-card"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border",
                showResult && isCorrect && "bg-success text-success-foreground border-success",
                showResult && isSelected && !isCorrect && "bg-destructive text-destructive-foreground border-destructive",
                !showResult && "bg-muted text-muted-foreground border-border"
              )}>
                {showResult && isCorrect ? (
                  <Check className="w-3.5 h-3.5" />
                ) : showResult && isSelected && !isCorrect ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  String.fromCharCode(65 + optIndex)
                )}
              </span>
              <span className={cn(
                "flex-1",
                !isRevealed && !isQuizMode && isCorrect && "font-medium text-success"
              )}>
                {option}
              </span>
              {!isQuizMode && isCorrect && (
                <Check className="w-4 h-4 text-success" />
              )}
            </button>
          );
        })}
      </div>

      {!isQuizMode && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showExplanation ? "Hide" : "Show"} explanation
        </button>
      )}

      {showExplanation && (
        <div className={cn(
          "mt-3 p-3 rounded-lg bg-muted/50 border border-border",
          isQuizMode && "animate-fade-in"
        )}>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Explanation: </span>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}