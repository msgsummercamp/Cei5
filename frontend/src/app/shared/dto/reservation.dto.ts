export type FlightsInfo = {
  id?: string;
  flightDate: string | null;
  flightNumber: string | null;
  departingAirport: string | null;
  destinationAirport: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  airLine: string | null;
  problematic: boolean;
};

export type ReservationDTO = {
  id?: string;
  reservationNumber: string;
  flights: FlightsInfo[];
};
