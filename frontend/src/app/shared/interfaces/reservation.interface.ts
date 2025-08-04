import {Flight} from './flight.interface';
import {Case} from './case.interface';

export type Reservation = {
  id?: string;
  reservationNumber: string;
  flights: Flight[];
  caseEntity: Case | null;
}
