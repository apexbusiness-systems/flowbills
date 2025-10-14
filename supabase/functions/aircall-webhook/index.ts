import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { withIdempotency } from "../_shared/idempotency.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

interface AircallEvent {
  event: string;
  resource: string;
  data: {
    id: number;
    direction: string;
    from: string;
    to: string;
    status: string;
    started_at?: string;
    answered_at?: string;
    ended_at?: string;
    duration?: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
    tags?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    return await withIdempotency(req, async (body: AircallEvent) => {
      console.log('Aircall webhook received:', { event: body.event, resource: body.resource });

      // Store call log
      const { error: logError } = await supabase
        .from('support_call_logs')
        .insert({
          external_id: body.data.id.toString(),
          direction: body.data.direction,
          from_number: body.data.from,
          to_number: body.data.to,
          status: body.data.status,
          started_at: body.data.started_at,
          answered_at: body.data.answered_at,
          ended_at: body.data.ended_at,
          duration_seconds: body.data.duration,
          agent_name: body.data.user?.name,
          agent_email: body.data.user?.email,
          tags: body.data.tags || [],
          raw_data: body,
        });

      if (logError) {
        console.error('Error storing call log:', logError);
        throw logError;
      }

      // Log to security events for audit trail
      await supabase
        .from('security_events')
        .insert({
          event_type: 'support_call_received',
          severity: 'info',
          details: {
            call_id: body.data.id,
            direction: body.data.direction,
            status: body.data.status,
            agent: body.data.user?.email,
          },
        });

      return new Response(
        JSON.stringify({ success: true, message: 'Call logged successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    });
  } catch (error) {
    console.error('Aircall webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
