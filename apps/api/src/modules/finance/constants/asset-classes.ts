// Backend source of truth for the Portfolio asset-class → type taxonomy.
// Mirrored manually in apps/web/lib/finance/asset-classes.ts for the Add-panel
// UI — there's no shared package between apps/api and apps/web, so keep the
// two lists in sync by hand when this changes.

export enum AssetClass {
  FINANCIAL = 'financial',
  REAL_ESTATE = 'realEstate',
  VEHICLES = 'vehicles',
  EQUIPMENT = 'equipment',
  METALS = 'metals',
  CURRENCY = 'currency',
  BUSINESS = 'business',
  DIGITAL = 'digital',
}

export const ASSET_CLASSES: Record<AssetClass, { label: string; types: string[] }> = {
  [AssetClass.FINANCIAL]: {
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
  [AssetClass.REAL_ESTATE]: {
    label: 'Real estate',
    types: [
      'Urban land',
      'Rural land / farm / ranch',
      'Residential property',
      'Commercial property',
      'Under construction / pre-construction',
    ],
  },
  [AssetClass.VEHICLES]: {
    label: 'Vehicles & vessels',
    types: ['Car', 'Motorcycle', 'Watercraft (boat, yacht)'],
  },
  [AssetClass.EQUIPMENT]: {
    label: 'Equipment',
    types: ['Machinery', 'Tools', 'Industrial equipment'],
  },
  [AssetClass.METALS]: {
    label: 'Metals & collectibles',
    types: ['Precious metals (gold, silver)', "Collectibles (art, watches, wine)"],
  },
  [AssetClass.CURRENCY]: {
    label: 'Currency & commodities',
    types: ['Foreign currency', 'Agricultural commodity'],
  },
  [AssetClass.BUSINESS]: {
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
  [AssetClass.DIGITAL]: {
    label: 'Digital',
    types: ['Internet domain', 'Monetized account', 'Idle e-commerce inventory'],
  },
};

export function isValidAssetType(assetClass: AssetClass, assetType: string): boolean {
  return ASSET_CLASSES[assetClass]?.types.includes(assetType) ?? false;
}
