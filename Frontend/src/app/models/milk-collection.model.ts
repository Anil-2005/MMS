import { Farmer } from './farmer.model';

export interface MilkCollection {
  id: number;
  farmerId: number;
  collectionDate: Date;
  collectionTime: string;
  quantity: number;
  fatPercentage: number;
  snfPercentage: number;
  ratePerLiter: number;
  totalAmount: number;
  remarks?: string;
  farmer?: Farmer;
}