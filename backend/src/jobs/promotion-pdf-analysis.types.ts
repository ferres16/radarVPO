export type EvidenceSource = 'native_text' | 'ocr' | 'vision';

export type SectionEvidence = {
  source: EvidenceSource;
  page: number | null;
  snippet: string;
};

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type TableExtractionStatus = 'complete' | 'partial' | 'error';

export type TableExtractionMethod = 'pdf_text' | 'ocr' | 'vision' | 'mixed';

export type PromotionUnitRow = {
  id: string | null;
  label: string | null;
  homes: number | null;
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
  extraction_method?: TableExtractionMethod;
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

export type PromotionPdfFinalJson = {
  promotion: {
    title: string | null;
    location: string | null;
    municipality: string | null;
    province: string | null;
    type: string | null;
    status: string | null;
    total_units: number | null;
    developer: string | null;
    developer_cif: string | null;
    regime: string | null;
    expedient_number: string | null;
    qualification_type: string | null;
    qualification_date: string | null;
  };
  important_dates: {
    publication_date: string | null;
    launch_date: string | null;
    application_deadline: string | null;
    other_dates: Array<{
      label: string;
      date: string | null;
      notes: string | null;
    }>;
  };
  main_requirements: {
    income: string | null;
    registration: string | null;
    empadronamiento: string | null;
    age: string | null;
    other: string[];
  };
  economic_info: {
    price_min: number | null;
    price_max: number | null;
    rent_min: number | null;
    rent_max: number | null;
    reservation_amount: number | null;
    deposit: number | null;
    other: string[];
  };
  quotas: Array<{
    type: string | null;
    units: number | null;
    percentage: number | null;
    notes: string | null;
  }>;
  available_units: Array<{
    unit_reference: string | null;
    staircase: string | null;
    floor: string | null;
    door: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    useful_area_m2: number | null;
    computable_area_m2: number | null;
    parking: boolean | null;
    storage: boolean | null;
    adapted: boolean | null;
    price_sale: number | null;
    price_rent: number | null;
    notes: string | null;
  }>;
  contact: {
    email: string | null;
    phone: string | null;
    website: string | null;
    office_address: string | null;
  };
  source: {
    pdf_url: string | null;
    table_extraction_method: TableExtractionMethod;
    pages_used: number[];
  };
  data_quality: {
    confidence_score: number | null;
    missing_fields: string[];
    ambiguous_fields: string[];
  };
};
