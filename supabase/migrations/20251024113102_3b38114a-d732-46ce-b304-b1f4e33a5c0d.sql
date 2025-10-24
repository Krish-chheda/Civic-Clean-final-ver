-- Create issues table for storing civic problems
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  issue_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own issues" 
ON public.issues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own issues" 
ON public.issues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues" 
ON public.issues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own issues" 
ON public.issues 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_issues_updated_at
BEFORE UPDATE ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();