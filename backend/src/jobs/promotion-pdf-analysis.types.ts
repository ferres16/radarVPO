export type EvidenceSource = 'native_text' | 'ocr' | 'vision';

export type SectionEvidence = {
  source: EvidenceSource;
  page: number | null;
  snippet: string;
};

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type TableExtractionStatus = 'complete' | 'partial' | 'error';

export type PromotionUnitRow = {
  id: string | null;
  floor: string | null;
  door: string | null;
  bedrooms: number | null;
  useful_area_m2: number | null;
  built_area_m2: number | null;
  max_occupancy: number | null;
  monthly_rent_eur: number | null;
  sale_price_eur: number | null;
  reservation_eur: number | null;
  tenure: string | null;
  accessibility: string | null;
};

export type ContactSection = {
  promoter_name: string | null;
  promoter_tax_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  office_address: string | null;
};

export type DateItem = {
  label: string;
  date: string | null;
  notes: string | null;
};

export type RequirementItem = {
  code: string;
  description: string;
  value: string | null;
};

export type FeeItem = {
  concept: string;
  amount_eur: number | null;
  notes: string | null;
};

export type PromotionCoreData = {
  source_url: string | null;
  pdf_url: string | null;
  title: string | null;
  location: string | null;
  municipality: string | null;
  province: string | null;
  autonomous_community: string | null;
  summary: string | null;
  promotion_type: string | null;
  status: string | null;
  tenure_type: string | null;
};

export type TableResult = {
  status: TableExtractionStatus;
  confidence: ConfidenceLevel;
  rows: PromotionUnitRow[];
  error_reason: string | null;
  missing_columns: string[];
};

export type SectionWithEvidence<TValue> = {
  value: TValue;
  confidence_score: number;
  source_evidence: SectionEvidence[];
};

export type PromotionPdfAnalysisResult = {
  promotion_data: SectionWithEvidence<PromotionCoreData>;
  requirements: SectionWithEvidence<RequirementItem[]>;
  dates: SectionWithEvidence<DateItem[]>;
  contact: SectionWithEvidence<ContactSection>;
  units: SectionWithEvidence<TableResult>;
  fees_or_reservations: SectionWithEvidence<FeeItem[]>;
  confidence_score: number;
  missing_fields: string[];
  ambiguous_fields: string[];
  warnings: string[];
  processing_meta: {
    language_detected: Array<'es' | 'ca'>;
    page_count: number;
    strategy: {
      used_native_text: boolean;
      used_ocr: boolean;
      used_vision: boolean;
      table_strategy_level: 1 | 2 | 3;
    };
  };
};

export type PageExtraction = {
  page: number;
  nativeText: string;
  ocrText: string | null;
  renderedImageBase64Png: string | null;
  visionSummary: Record<string, unknown> | null;
};

export type HybridPipelineOptions = {
  minNativeCharsPerPage?: number;
  maxPagesForVision?: number;
  preferReliability?: boolean;
};
