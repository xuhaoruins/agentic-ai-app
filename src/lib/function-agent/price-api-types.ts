export interface PricingItem {
  armSkuName: string;
  retailPrice: number;
  unitOfMeasure: string;
  armRegionName: string;
  meterName: string;
  productName: string;
  type: string;
  location?: string;
  reservationTerm?: string;
  savingsPlan?: Array<{ term: string, retailPrice: string }>;
}

export interface PricingAPIResponse {
  BillingCurrency: string;
  CustomerEntityId: string;
  CustomerEntityType: string;
  Items: PricingItem[];
  NextPageLink?: string;
  Count: number;
}

export interface PriceQueryResult {
  filter: string;
  Items: PricingItem[];
  totalCount?: number;
  error?: string;
}