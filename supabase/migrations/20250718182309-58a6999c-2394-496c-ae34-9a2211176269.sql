-- Create the linked_accounts table for storing Google Calendar account information
CREATE TABLE public.linked_accounts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider_refresh_token TEXT NOT NULL,
  display_color TEXT NOT NULL DEFAULT '#3788D8'
);

-- Enable Row Level Security
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own linked accounts
CREATE POLICY "Users can view their own linked accounts" 
ON public.linked_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own linked accounts" 
ON public.linked_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked accounts" 
ON public.linked_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked accounts" 
ON public.linked_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_linked_accounts_user_id ON public.linked_accounts(user_id);