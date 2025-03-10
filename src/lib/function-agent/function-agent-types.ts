// This file contains the types used in the function agent.

/**
 * Azure pricing item from the retail pricing API
 */
export interface PricingItem {
  armSkuName: string;
  retailPrice: number;
  unitOfMeasure: string;
  armRegionName: string;
  meterName: string;
  productName: string;
  type: string;
  location?: string;
  reservationTerm?: string | null;
  savingsPlan?: Array<{ term: string, retailPrice: string }> | null;
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

/**
 * Tool definition
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  functionDefinition: any;
  enabled: boolean;
}

/**
 * Tool selection for passing to the API
 */
export interface ToolSelection {
  toolIds: string[];
}