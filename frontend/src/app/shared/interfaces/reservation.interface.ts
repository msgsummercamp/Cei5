import {Flight} from './flight.interface';
import {Case} from './case.interface';

export interface Reservation {
  id?: string;
  reservationNumber: string;
  flights: Flight[];
  caseEntity: Case | null;
}
