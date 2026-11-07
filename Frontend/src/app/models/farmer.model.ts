export interface Farmer {
  id: number;
  farmerCode: string;
  name: string;
  phoneNumber: string;
  address: string;
  registrationDate: Date;
  isActive: boolean;
  accountBalance: number;
}