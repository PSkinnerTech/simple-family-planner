import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle OAuth callback and store tokens
        if (event === 'SIGNED_IN' && session?.provider_refresh_token) {
          setTimeout(async () => {
            await storeGoogleTokens(session);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        scopes: 'https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline', // Required to get a refresh_token
          prompt: 'consent',     // Ensures the user is prompted for refresh tokens
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };
}

async function storeGoogleTokens(session: Session) {
  if (!session.provider_refresh_token || !session.user?.email) {
    return;
  }

  try {
    const { error } = await supabase
      .from('linked_accounts')
      .upsert({
        user_id: session.user.id,
        email: session.user.email,
        provider_refresh_token: session.provider_refresh_token,
        display_color: '#3788D8',
      }, {
        onConflict: 'user_id,email'
      });

    if (error) {
      console.error('Error storing Google tokens:', error);
    }
  } catch (error) {
    console.error('Error storing Google tokens:', error);
  }
}