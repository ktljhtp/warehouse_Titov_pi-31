export type ProductType = 'wheat' | 'soap' | 'fabric' | 'meat';
export type CellStatus = 'healthy' | 'infected' | 'spoiled' | 'stolen' | 'empty';
export type PestType = 'mouse' | 'moth' | 'thief';

export interface SimulationSettings {
  speed: number;
  pestChance: number;
  treatmentAmount: number;
  rent: number;
  poisonCost: number;
  importAmount: number;
  exportAmount: number;
}

export interface ProductPrices {
  wheat: number;
  soap: number;
  fabric: number;
  meat: number;
}