-- Create quizzes table to store all generated quizzes
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  key_entities JSONB DEFAULT '{}',
  sections TEXT[] DEFAULT '{}',
  quiz JSONB DEFAULT '[]',
  related_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write access (since this is a public quiz generator)
CREATE POLICY "Allow public read access to quizzes" 
ON public.quizzes 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (true);

-- Create index on url for faster lookups
CREATE INDEX idx_quizzes_url ON public.quizzes (url);

-- Create index on created_at for sorting history
CREATE INDEX idx_quizzes_created_at ON public.quizzes (created_at DESC);