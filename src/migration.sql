-- Membuat skema tabel untuk AI Builder

-- Tabel untuk proyek AI
CREATE TABLE public.ai_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel untuk konfigurasi AI
CREATE TABLE public.ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.ai_projects(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel untuk API keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aktifkan ekstensi uuid-ossp jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Atur policy Row Level Security (RLS)
ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy untuk ai_projects
CREATE POLICY "Users can only see their own projects" 
  ON public.ai_projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
  ON public.ai_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.ai_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.ai_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy untuk ai_configs
CREATE POLICY "Users can only see configs for their own projects" 
  ON public.ai_configs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_projects 
    WHERE ai_projects.id = ai_configs.project_id 
    AND ai_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert configs for their own projects" 
  ON public.ai_configs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_projects 
    WHERE ai_projects.id = ai_configs.project_id 
    AND ai_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update configs for their own projects" 
  ON public.ai_configs
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ai_projects 
    WHERE ai_projects.id = ai_configs.project_id 
    AND ai_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete configs for their own projects" 
  ON public.ai_configs
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ai_projects 
    WHERE ai_projects.id = ai_configs.project_id 
    AND ai_projects.user_id = auth.uid()
  ));

-- Policy untuk api_keys
CREATE POLICY "Users can only see their own API keys" 
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id); 