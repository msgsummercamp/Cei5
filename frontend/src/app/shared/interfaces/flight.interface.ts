import {Reservation} from './reservation.interface';

export interface Flight {
  id?: string;
  flightDate: Date;
  flightNumber: string;
  departingAirport: string;
  destinationAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  reservation: Reservation | null;
  airLine: string;
  isProblematic: boolean;
}
