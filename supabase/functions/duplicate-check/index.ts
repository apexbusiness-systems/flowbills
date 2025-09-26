import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const InvoiceIn = z.object({
  vendor_id: z.string().uuid(),
  invoice_number: z.string().min(1).max(100),
  amount_cents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  invoice_date: z.string().min(4),
  po_number: z.string().optional(),
});

function minusDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function plusDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const parsed = InvoiceIn.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "invalid input" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const invoice = parsed.data;
    
    console.log('Duplicate check for invoice:', invoice.invoice_number);

    // Generate hash for duplicate detection
    const hashString = `${invoice.vendor_id}-${invoice.amount_cents}-${invoice.invoice_date}-${invoice.po_number || 'no-po'}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const duplicateHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for exact hash match using safe queries
    const { data: exactDuplicate, error: exactError } = await supabase
      .from('invoices')
      .select('id, invoice_number, vendor_id, amount_cents')
      .eq('duplicate_hash', duplicateHash)
      .neq('id', invoice.invoice_number)
      .limit(1);

    if (exactError) {
      console.error('Exact duplicate check error:', exactError);
      throw exactError;
    }

    // Fuzzy matching with safe parameterized queries
    const { data: fuzzyDuplicates, error: fuzzyError } = await supabase
      .from('invoices')
      .select('id, invoice_number, vendor_id, amount_cents, invoice_date')
      .eq('vendor_id', invoice.vendor_id)
      .gte('invoice_date', minusDays(invoice.invoice_date, 7))
      .lte('invoice_date', plusDays(invoice.invoice_date, 7))
      .gte('amount_cents', Math.round(invoice.amount_cents * 0.99))
      .lte('amount_cents', Math.round(invoice.amount_cents * 1.01))
      .neq('id', invoice.invoice_number)
      .limit(5);

    if (fuzzyError) {
      console.error('Fuzzy duplicate check error:', fuzzyError);
      throw fuzzyError;
    }

    const result = {
      duplicate_hash: duplicateHash,
      is_exact_duplicate: exactDuplicate && exactDuplicate.length > 0,
      exact_match: exactDuplicate?.[0] || null,
      potential_duplicates: fuzzyDuplicates || [],
      risk_score: exactDuplicate && exactDuplicate.length > 0 ? 100 : 
                  (fuzzyDuplicates && fuzzyDuplicates.length > 0 ? 75 : 0)
    };

    console.log('Duplicate check result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Duplicate check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      duplicate_hash: null,
      is_exact_duplicate: false,
      risk_score: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});