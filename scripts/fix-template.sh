#!/bin/bash
# P12: Targeted Fix Template (when a function breaks)
# Usage: ./scripts/fix-template.sh <function-name>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <function-name>"
  exit 1
fi

FUNCTION_NAME="$1"
FUNCTION_DIR="supabase/functions/$FUNCTION_NAME"
BACKUP_DIR="supabase/functions/.backups/$FUNCTION_NAME-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Applying fix template to: $FUNCTION_NAME"

# Create backup
if [ -d "$FUNCTION_DIR" ]; then
  echo "📦 Creating backup at: $BACKUP_DIR"
  mkdir -p "$(dirname "$BACKUP_DIR")"
  cp -r "$FUNCTION_DIR" "$BACKUP_DIR"
  echo "✓ Backup created"
fi

# Create function directory if it doesn't exist
mkdir -p "$FUNCTION_DIR"

# Write canonical baseline template
cat > "$FUNCTION_DIR/index.ts" << 'EOF'
/**
 * Canonical Edge Function Template (P1)
 * Minimal, parse-safe baseline
 */

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  
  return new Response(JSON.stringify({ 
    ok: true, 
    echo: body,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
EOF

echo "✓ Applied canonical template"

# Verify it works
echo "🔍 Verifying template..."
if deno check --import-map=./supabase/import_map.json "$FUNCTION_DIR/index.ts"; then
  echo "✓ Template verification passed"
else
  echo "❌ Template verification failed"
  exit 1
fi

echo ""
echo "✓ Fix template applied successfully"
echo ""
echo "Next steps:"
echo "1. Test the baseline function deploys successfully"
echo "2. Re-add imports one by one from $BACKUP_DIR"
echo "3. Run 'deno check' after each addition"
echo "4. Run equivalence check: ./scripts/equivalence-check.sh"
echo "5. Commit only when all gates pass"
