import { useState } from "react";
import { ExternalLink, BookOpen, Users, Building2, MapPin, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizCard } from "./QuizCard";
import type { Quiz } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuizDisplayProps {
  quiz: Quiz;
}

export function QuizDisplay({ quiz }: QuizDisplayProps) {
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
    setAnsweredCount(c => c + 1);
  };

  const resetQuiz = () => {
    setIsQuizMode(false);
    setScore(0);
    setAnsweredCount(0);
  };

  const allAnswered = answeredCount === quiz.quiz.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="quiz-card hero-gradient text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
              {quiz.title}
            </h1>
            {quiz.summary && (
              <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
                {quiz.summary}
              </p>
            )}
          </div>
          <a
            href={quiz.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            View on Wikipedia
          </a>
        </div>
      </div>

      {/* Key Entities */}
      {(quiz.key_entities.people.length > 0 || 
        quiz.key_entities.organizations.length > 0 || 
        quiz.key_entities.locations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quiz.key_entities.people.length > 0 && (
            <div className="quiz-card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">People</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quiz.key_entities.people.map((person, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {quiz.key_entities.organizations.length > 0 && (
            <div className="quiz-card">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">Organizations</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quiz.key_entities.organizations.map((org, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {org}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {quiz.key_entities.locations.length > 0 && (
            <div className="quiz-card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">Locations</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quiz.key_entities.locations.map((loc, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Quiz Questions ({quiz.quiz.length})
        </h2>
        <div className="flex items-center gap-3">
          {isQuizMode && (
            <div className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm",
              allAnswered ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}>
              Score: {score}/{quiz.quiz.length}
            </div>
          )}
          {isQuizMode ? (
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Quiz
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsQuizMode(true)}>
              <Play className="w-4 h-4 mr-2" />
              Take Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="grid gap-4">
        {quiz.quiz.map((q, index) => (
          <QuizCard 
            key={index} 
            question={q} 
            index={index} 
            isQuizMode={isQuizMode}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {/* Related Topics */}
      {quiz.related_topics.length > 0 && (
        <div className="quiz-card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Related Topics for Further Reading
          </h3>
          <div className="flex flex-wrap gap-2">
            {quiz.related_topics.map((topic, i) => (
              <a
                key={i}
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/ /g, "_"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                {topic}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}