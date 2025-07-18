import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch linked accounts for this user
    const { data: accounts, error: accountsError } = await supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) {
      console.error('Error fetching linked accounts:', accountsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch linked accounts' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ events: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const allEvents = [];

    // For each linked account, refresh token and fetch events
    for (const account of accounts) {
      try {
        // Refresh the access token
        const tokenResponse = await fetch(`${supabaseUrl}/functions/v1/refresh-google-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            refresh_token: account.provider_refresh_token,
          }),
        });

        if (!tokenResponse.ok) {
          console.error(`Failed to refresh token for account ${account.email}`);
          continue;
        }

        const { access_token } = await tokenResponse.json();

        // Fetch calendar events from Google
        const eventsResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250&singleEvents=true&orderBy=startTime',
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        );

        if (!eventsResponse.ok) {
          console.error(`Failed to fetch events for account ${account.email}`);
          continue;
        }

        const eventsData = await eventsResponse.json();
        
        // Transform events for FullCalendar
        const transformedEvents = eventsData.items?.map((event: any) => ({
          id: event.id,
          title: event.summary || 'No Title',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          backgroundColor: account.display_color,
          borderColor: account.display_color,
          textColor: '#ffffff',
          allDay: !event.start?.dateTime,
          extendedProps: {
            email: account.email,
            description: event.description,
            location: event.location,
          },
        })) || [];

        allEvents.push(...transformedEvents);

      } catch (error) {
        console.error(`Error processing account ${account.email}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ events: allEvents }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-calendar-events function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});