// Document type enum for standard document types
export enum DocumentTypeEnum {
  W2 = 'W-2',
  W2G = 'W-2G',
  FORM_1099K = '1099-K',
  FORM_1099G = '1099-G',
  FORM_1099INT = '1099-INT',
  FORM_1099DIV = '1099-DIV',
  FORM_1099NEC = '1099-NEC',
  FORM_1099R = '1099-R',
  SSA_1099 = 'SSA-1099',
  FORM_1099MISC = '1099-MISC',
  FORM_1095A = '1095-A',
  BANK_STATEMENTS = 'Bank Statements',
  RECEIPT = 'Receipt',
  OTHER = 'Other',
}

// Interface for document type information
export interface DocumentTypeInfo {
  id: DocumentTypeEnum | string;
  label: string;
  description: string;
}

// Document types with descriptions
export const documentTypes: DocumentTypeInfo[] = [
  {
    id: DocumentTypeEnum.W2,
    label: DocumentTypeEnum.W2,
    description: "Form W-2 shows your wages from employers. Here's what to do if you didn't get a W-2."
  },
  {
    id: DocumentTypeEnum.W2G,
    label: DocumentTypeEnum.W2G,
    description: "Form W-2G for lottery and gambling winnings."
  },
  {
    id: DocumentTypeEnum.FORM_1099K,
    label: DocumentTypeEnum.FORM_1099K,
    description: "For payments from payment cards and online marketplaces."
  },
  {
    id: DocumentTypeEnum.FORM_1099G,
    label: DocumentTypeEnum.FORM_1099G,
    description: "For government payments such as unemployment benefits."
  },
  {
    id: DocumentTypeEnum.FORM_1099INT,
    label: DocumentTypeEnum.FORM_1099INT,
    description: "From banks and brokers showing interest you received."
  },
  {
    id: DocumentTypeEnum.FORM_1099DIV,
    label: DocumentTypeEnum.FORM_1099DIV,
    description: "For dividends and distributions paid to you."
  },
  {
    id: DocumentTypeEnum.FORM_1099NEC,
    label: DocumentTypeEnum.FORM_1099NEC,
    description: "For freelance and gig economy independent contractor work."
  },
  {
    id: DocumentTypeEnum.FORM_1099R,
    label: DocumentTypeEnum.FORM_1099R,
    description: "Retirement plan distributions, pensions, or annuities."
  },
  {
    id: DocumentTypeEnum.SSA_1099,
    label: DocumentTypeEnum.SSA_1099,
    description: "For Social Security benefits."
  },
  {
    id: DocumentTypeEnum.FORM_1099MISC,
    label: DocumentTypeEnum.FORM_1099MISC,
    description: "For other miscellaneous income."
  },
  {
    id: DocumentTypeEnum.FORM_1095A,
    label: DocumentTypeEnum.FORM_1095A,
    description: "Health Insurance Marketplace Statement to reconcile advance payments."
  },
  {
    id: DocumentTypeEnum.BANK_STATEMENTS,
    label: DocumentTypeEnum.BANK_STATEMENTS,
    description: "Bank Statements for deductions."
  },
  {
    id: DocumentTypeEnum.RECEIPT,
    label: DocumentTypeEnum.RECEIPT,
    description: "Receipts for deduction."
  }
];

export default documentTypes; 