export type CsvRow = Record<string, string>;

export interface UploadResponse {
  headers: string[];
  preview: CsvRow[];
  totalRows: number;
  rows: CsvRow[];
}

export type CrmStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE"
  | "";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots"
  | "";

export const CRM_STATUS_OPTIONS: CrmStatus[] = [
  "",
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

export const DATA_SOURCE_OPTIONS: DataSource[] = [
  "",
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

export type ConfidenceLevel = "high" | "medium" | "low";

export type CrmFieldKey =
  | "created_at"
  | "name"
  | "email"
  | "country_code"
  | "mobile_without_country_code"
  | "company"
  | "city"
  | "state"
  | "country"
  | "lead_owner"
  | "crm_status"
  | "crm_note"
  | "data_source"
  | "possession_time"
  | "description";

export type FieldConfidence = Partial<Record<CrmFieldKey, ConfidenceLevel>>;

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
  field_confidence?: FieldConfidence;
}

export interface SkippedRecord {
  row: CsvRow;
  reason: string;
}

export interface ExtractResponse {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
}

export const CRM_COLUMNS: CrmFieldKey[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];
