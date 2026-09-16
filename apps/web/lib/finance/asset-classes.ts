// Frontend mirror of apps/api/src/modules/finance/constants/asset-classes.ts —
// there's no shared package between apps/api and apps/web, so keep these two
// lists in sync by hand when the taxonomy changes.

export type AssetClass =
  | 'financial' | 'realEstate' | 'vehicles' | 'equipment'
  | 'metals' | 'currency' | 'business' | 'digital';

export type Liquidity = 'liquid' | 'illiquid';

export const ASSET_CLASSES: Record<AssetClass, { label: string; types: string[] }> = {
  financial: {
    label: 'Financial',
    types: [
      'Fixed income — CD',
      'Fixed income — government bond',
      'Fixed income — LCI / LCA',
      'Fixed income — debenture',
      'Stocks',
      'REIT (real estate fund)',
      'Investment fund',
      'Private pension — PGBL',
      'Private pension — VGBL',
      'Life insurance with investment component',
      'Cryptocurrency',
      'NFT / digital asset',
    ],
  },
  realEstate: {
    label: 'Real estate',
    types: [
      'Urban land',
      'Rural land / farm / ranch',
      'Residential property',
      'Commercial property',
      'Under construction / pre-construction',
    ],
  },
  vehicles: {
    label: 'Vehicles & vessels',
    types: ['Car', 'Motorcycle', 'Watercraft (boat, yacht)'],
  },
  equipment: {
    label: 'Equipment',
    types: ['Machinery', 'Tools', 'Industrial equipment'],
  },
  metals: {
    label: 'Metals & collectibles',
    types: ['Precious metals (gold, silver)', 'Collectibles (art, watches, wine)'],
  },
  currency: {
    label: 'Currency & commodities',
    types: ['Foreign currency', 'Agricultural commodity'],
  },
  business: {
    label: 'Business',
    types: [
      'Loan granted',
      'Equity in own company',
      'Startup / angel investment',
      'Working capital in own business',
      'Group buying pool / consortium',
      'Franchise',
      'Royalties',
    ],
  },
  digital: {
    label: 'Digital',
    types: ['Internet domain', 'Monetized account', 'Idle e-commerce inventory'],
  },
};

export const ASSET_CLASS_ORDER: AssetClass[] = [
  'financial', 'realEstate', 'vehicles', 'equipment', 'metals', 'currency', 'business', 'digital',
];

// Which classes reveal the "vehicles+equipment" field group (year, plate/serial,
// depreciation, reference table) vs the "currency+metals" group (quantity,
// unit, unit price, price source) in the Add-panel Investment form.
export function isVehicleLikeClass(c: AssetClass) {
  return c === 'vehicles' || c === 'equipment';
}
export function isCurrencyLikeClass(c: AssetClass) {
  return c === 'currency' || c === 'metals';
}
