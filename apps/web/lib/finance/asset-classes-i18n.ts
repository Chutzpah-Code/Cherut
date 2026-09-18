// Display-only translations for the asset-class taxonomy in ./asset-classes.ts.
// The English strings there are the values actually stored in Firestore
// (assetType has no separate id — the label IS the value), so this file never
// changes what gets saved. It only maps those stable English strings to a
// pt-BR label for rendering. Falls back to the English string for any locale
// without an entry (or any type added to asset-classes.ts but not mirrored
// here yet), so nothing ever renders blank.
import { AssetClass } from './asset-classes';

const ASSET_CLASS_LABEL_PT_BR: Record<AssetClass, string> = {
  financial: 'Financeiro',
  realEstate: 'Imóveis',
  vehicles: 'Veículos e embarcações',
  equipment: 'Equipamentos',
  metals: 'Metais e colecionáveis',
  currency: 'Moeda e commodities',
  business: 'Negócios',
  digital: 'Digital',
};

const ASSET_TYPE_LABEL_PT_BR: Record<string, string> = {
  'Fixed income — CD': 'Renda fixa — CDB',
  'Fixed income — government bond': 'Renda fixa — título público',
  'Fixed income — LCI / LCA': 'Renda fixa — LCI / LCA',
  'Fixed income — debenture': 'Renda fixa — debênture',
  'Stocks': 'Ações',
  'REIT (real estate fund)': 'FII (fundo imobiliário)',
  'Investment fund': 'Fundo de investimento',
  'Private pension — PGBL': 'Previdência privada — PGBL',
  'Private pension — VGBL': 'Previdência privada — VGBL',
  'Life insurance with investment component': 'Seguro de vida com componente de investimento',
  'Cryptocurrency': 'Criptomoeda',
  'NFT / digital asset': 'NFT / ativo digital',
  'Urban land': 'Terreno urbano',
  'Rural land / farm / ranch': 'Terreno rural / fazenda / sítio',
  'Residential property': 'Imóvel residencial',
  'Commercial property': 'Imóvel comercial',
  'Under construction / pre-construction': 'Em construção / na planta',
  'Car': 'Carro',
  'Motorcycle': 'Moto',
  'Watercraft (boat, yacht)': 'Embarcação (barco, iate)',
  'Machinery': 'Maquinário',
  'Tools': 'Ferramentas',
  'Industrial equipment': 'Equipamento industrial',
  'Precious metals (gold, silver)': 'Metais preciosos (ouro, prata)',
  'Collectibles (art, watches, wine)': 'Colecionáveis (arte, relógios, vinho)',
  'Foreign currency': 'Moeda estrangeira',
  'Agricultural commodity': 'Commodity agrícola',
  'Loan granted': 'Empréstimo concedido',
  'Equity in own company': 'Participação em empresa própria',
  'Startup / angel investment': 'Startup / investimento anjo',
  'Working capital in own business': 'Capital de giro em negócio próprio',
  'Group buying pool / consortium': 'Consórcio',
  'Franchise': 'Franquia',
  'Royalties': 'Royalties',
  'Internet domain': 'Domínio de internet',
  'Monetized account': 'Conta monetizada',
  'Idle e-commerce inventory': 'Estoque parado de e-commerce',
};

export function getAssetClassLabel(assetClass: AssetClass, label: string, locale: string): string {
  if (locale === 'pt-BR') return ASSET_CLASS_LABEL_PT_BR[assetClass] ?? label;
  return label;
}

export function getAssetTypeLabel(type: string, locale: string): string {
  if (locale === 'pt-BR') return ASSET_TYPE_LABEL_PT_BR[type] ?? type;
  return type;
}
