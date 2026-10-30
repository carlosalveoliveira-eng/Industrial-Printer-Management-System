export type ConnectionType = 'ethernet' | 'wifi' | 'usb' | 'serial' | 'outro';

export type InspectionPower = 'Sim' | 'Não';
export type InspectionPrinting = 'Sim' | 'Não' | 'Não testado';
export type InspectionQuality = 'Boa' | 'Regular' | 'Ruim';
export type InspectionPhysical = 'Bom' | 'Regular' | 'Ruim';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type InspectionResult = 
  | 'Funcionando'
  | 'Funcionando com ressalva'
  | 'Requer manutenção'
  | 'Fora de operação'
  | 'Não testada';

export type PrinterStatus = 'pending' | 'ok' | 'warning' | 'issue';

export type UserRole = 'admin' | 'tech' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Printer {
  id: string;
  name: string;
  sector: string;
  model?: string;
  ip?: string;
  serial?: string;
  patrimony?: string;
  connectionType?: ConnectionType;
  notes?: string;
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Inspection {
  id: string;
  printerId: string;
  date: string; // YYYY-MM-DD
  tech?: string;
  userId?: string;
  power: InspectionPower;
  printing: InspectionPrinting;
  quality: InspectionQuality;
  physical: InspectionPhysical;
  problemType: string;
  errorMessage?: string;
  actionNeeded?: string;
  priority: PriorityLevel;
  result: InspectionResult;
  observations?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface InspectionDatabase {
  printers: Printer[];
  inspections: Inspection[];
  defaultTech?: string;
}

export type FilterStatus = 'all' | 'pending' | 'ok' | 'issue' | 'warning';
