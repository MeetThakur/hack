-- Policy Stress Testing Engine - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Policies
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: Structured Inputs (Parsed from Document)
CREATE TABLE public.structured_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table: Simulation Results (Deterministic Math Output)
CREATE TABLE public.simulation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Setup Storage for Document Uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('policy-documents', 'policy-documents', false) ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

-- Allow authenticates users to read/insert (simplified for MVP)
CREATE POLICY "Enable read access for all authenticated users" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.policies FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all authenticated users" ON public.structured_inputs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.structured_inputs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all authenticated users" ON public.simulation_results FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.simulation_results FOR INSERT WITH CHECK (true);
