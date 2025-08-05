import { Reservation } from './reservation';

export type Flight = {
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
};
