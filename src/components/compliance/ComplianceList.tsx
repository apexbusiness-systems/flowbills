import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompliance } from '@/hooks/useCompliance';
import { CheckCircle } from 'lucide-react';
import CreateComplianceDialog from './CreateComplianceDialog';

const ComplianceList = () => {
  const { records, loading, fetchRecords } = useCompliance();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compliance Records</CardTitle>
            <CardDescription>
              Manage and track compliance requirements and audits
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            Add Compliance Record
          </Button>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No compliance records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{record.regulation}</h3>
                  <p className="text-sm text-muted-foreground">{record.entity_type}</p>
                  <p className="text-sm">Status: {record.status}</p>
                  <p className="text-sm">Risk Level: {record.risk_level}</p>
                  {record.next_audit_date && (
                    <p className="text-sm">Next Audit: {record.next_audit_date}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateComplianceDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onRecordCreated={() => fetchRecords()}
      />
    </div>
  );
};

export default ComplianceList;