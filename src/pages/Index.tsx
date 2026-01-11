import { useState } from "react";
import { BookOpen, History, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateQuizTab } from "@/components/GenerateQuizTab";
import { HistoryTab } from "@/components/HistoryTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                WikiQuiz
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Powered Wikipedia Quiz Generator
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger value="generate" className="h-10 font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </TabsTrigger>
            <TabsTrigger value="history" className="h-10 font-medium">
              <History className="w-4 h-4 mr-2" />
              Past Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <GenerateQuizTab />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by AI • Generate quizzes from any Wikipedia article
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;