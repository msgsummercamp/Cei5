import { Flight } from './flight';
import { Case } from './case';

export type Reservation = {
  id?: string;
  reservationNumber: string;
  flights: Flight[];
  caseEntity: Case | null;
};
