-- Create places table to store highlighted places
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  recommended_by TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Create policies - for now, allow public access since no auth is implemented
CREATE POLICY "Places are viewable by everyone" 
ON public.places 
FOR SELECT 
USING (true);

CREATE POLICY "Places can be created by everyone" 
ON public.places 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Places can be updated by everyone" 
ON public.places 
FOR UPDATE 
USING (true);

CREATE POLICY "Places can be deleted by everyone" 
ON public.places 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();