import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

type ApprovalsItem = {
  id: string;
  document_id: string;
  format: string;
  status: string;
  total_amount: number;
  currency: string;
  sender_id: string;
  confidence_score: number;
  validation_results?: any;
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ApprovalsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    loadApprovals()
    loadUserRole()
  }, [])

  async function loadUserRole() {
    if (!user?.id) return
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    setUserRole(data?.role || null)
  }

  async function loadApprovals() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('einvoice_documents')
        .select('*')
        .in('status', ['validated', 'received'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Failed to load approvals:', error)
      toast.error('Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  async function approve(documentId: string) {
    // Check user has approver or admin role
    if (!userRole || !['admin', 'approver'].includes(userRole)) {
      toast.error('You do not have permission to approve invoices')
      return
    }

    try {
      const { error } = await supabase
        .from('einvoice_documents')
        .update({ status: 'sent' })
        .eq('id', documentId)

      if (error) throw error
      toast.success('Invoice approved')
      await loadApprovals()
    } catch (error) {
      console.error('Approval failed:', error)
      toast.error('Failed to approve invoice')
    }
  }

  async function toHIL(documentId: string) {
    try {
      const { error } = await supabase
        .from('review_queue')
        .insert({
          invoice_id: documentId,
          reason: 'Manual review requested from approvals page',
          priority: 2
        })

      if (error) throw error
      toast.success('Routed to Human-in-Loop review')
      await loadApprovals()
    } catch (error) {
      console.error('HIL routing failed:', error)
      toast.error('Failed to route to review queue')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Approvals</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const canApprove = userRole && ['admin', 'approver'].includes(userRole)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">E-Invoice Approvals</h1>
        {userRole && (
          <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
            Role: {userRole}
          </span>
        )}
      </div>

      {!canApprove && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ You have view-only access. Approval requires 'approver' or 'admin' role.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/5">
          <p className="text-muted-foreground">No e-invoices pending approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const hasErrors = item.validation_results?.errors?.length > 0
            const hasWarnings = item.validation_results?.warnings?.length > 0
            const confidencePercent = item.confidence_score || 0

            return (
              <div key={item.id} className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.document_id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'validated' ? 'bg-green-100 text-green-800' :
                        item.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {item.format.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Sender: {item.sender_id}</p>
                      <p>Amount: {item.total_amount} {item.currency}</p>
                      <p>Confidence: {confidencePercent}%</p>
                    </div>

                    {hasErrors && (
                      <div className="mt-3 text-sm text-destructive">
                        ❌ Validation errors: {item.validation_results.errors.length}
                      </div>
                    )}
                    {hasWarnings && (
                      <div className="mt-2 text-sm text-amber-600">
                        ⚠️ Warnings: {item.validation_results.warnings.length}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => approve(item.id)}
                      disabled={!canApprove || hasErrors}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => toHIL(item.id)}
                      className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      Send to HIL
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}