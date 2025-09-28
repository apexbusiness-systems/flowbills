// E-Invoice validation library for EN 16931, BIS 3.0, XRechnung, and Factur-X
import { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  confidence_score: number;
}

// EN 16931 Core validation
export function validateEN16931(xmlContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required elements check
  if (!xmlContent.includes('cbc:ID')) {
    errors.push('Missing required element: Invoice identifier (cbc:ID)');
  }
  
  if (!xmlContent.includes('cbc:IssueDate')) {
    errors.push('Missing required element: Invoice issue date (cbc:IssueDate)');
  }
  
  if (!xmlContent.includes('cac:AccountingSupplierParty')) {
    errors.push('Missing required element: Supplier party information');
  }
  
  if (!xmlContent.includes('cac:AccountingCustomerParty')) {
    errors.push('Missing required element: Customer party information');
  }
  
  if (!xmlContent.includes('cbc:DocumentCurrencyCode')) {
    warnings.push('Missing recommended element: Document currency code');
  }
  
  const confidenceScore = errors.length === 0 ? 95 : Math.max(20, 80 - (errors.length * 15));
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    confidence_score: confidenceScore
  };
}

// Peppol BIS Billing 3.0 validation
export function validateBIS30(xmlContent: string): ValidationResult {
  const en16931Result = validateEN16931(xmlContent);
  const errors = [...en16931Result.errors];
  const warnings = [...en16931Result.warnings];
  
  // BIS 3.0 specific requirements
  if (!xmlContent.includes('urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0')) {
    errors.push('Invalid or missing CustomizationID for Peppol BIS Billing 3.0');
  }
  
  if (!xmlContent.includes('urn:fdc:peppol.eu:2017:poacc:billing:01:1.0')) {
    errors.push('Invalid or missing ProfileID for Peppol BIS Billing 3.0');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    confidence_score: errors.length === 0 ? 95 : Math.max(20, 80 - (errors.length * 10))
  };
}

// XRechnung (Germany) validation
export function validateXRechnung(xmlContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!xmlContent.includes('CrossIndustryInvoice')) {
    errors.push('Missing root element: CrossIndustryInvoice (required for XRechnung)');
  }
  
  if (!xmlContent.includes('ram:ID')) {
    errors.push('Missing required element: ram:ID (XRechnung identifier)');
  }
  
  if (!xmlContent.includes('urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung')) {
    errors.push('Missing XRechnung CustomizationID');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    confidence_score: errors.length === 0 ? 90 : Math.max(20, 70 - (errors.length * 15))
  };
}

// Factur-X (France/Germany) validation
export function validateFacturX(xmlContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!xmlContent.includes('CrossIndustryDocument')) {
    errors.push('Missing root element: CrossIndustryDocument (required for Factur-X)');
  }
  
  if (!xmlContent.includes('ram:ID')) {
    errors.push('Missing required element: ram:ID (Factur-X identifier)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    confidence_score: errors.length === 0 ? 90 : Math.max(20, 70 - (errors.length * 15))
  };
}

// BIS 3.0 envelope serializer
export function buildBIS30(invoiceXml: string, metadata: {
  sender_participant_id: string;
  receiver_participant_id: string;
  document_type_id?: string;
  process_id?: string;
}): string {
  const { sender_participant_id, receiver_participant_id } = metadata;
  const document_type_id = metadata.document_type_id || "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2";
  const process_id = metadata.process_id || "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0";
  const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<StandardBusinessDocument xmlns="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader">
  <StandardBusinessDocumentHeader>
    <HeaderVersion>1.0</HeaderVersion>
    <Sender>
      <Identifier Authority="iso6523-actorid-upis">${sender_participant_id}</Identifier>
    </Sender>
    <Receiver>
      <Identifier Authority="iso6523-actorid-upis">${receiver_participant_id}</Identifier>
    </Receiver>
    <DocumentIdentification>
      <Standard>urn:oasis:names:specification:ubl:schema:xsd:Invoice-2</Standard>
      <TypeVersion>2.1</TypeVersion>
      <InstanceIdentifier>${messageId}</InstanceIdentifier>
      <Type>${document_type_id}</Type>
      <CreationDateAndTime>${new Date().toISOString()}</CreationDateAndTime>
    </DocumentIdentification>
    <BusinessScope>
      <Scope><Type>DOCUMENTID</Type><InstanceIdentifier>${document_type_id}</InstanceIdentifier></Scope>
      <Scope><Type>PROCESSID</Type><InstanceIdentifier>${process_id}</InstanceIdentifier></Scope>
    </BusinessScope>
  </StandardBusinessDocumentHeader>
  ${invoiceXml}
</StandardBusinessDocument>`;
}