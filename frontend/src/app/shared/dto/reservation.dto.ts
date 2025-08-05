export type FlightsInfo = {
  id?: string;
  flightDate: string;
  flightNumber: string;
  departingAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  airLine: string;
  isProblematic: boolean;
};

export type ReservationDTO = {
  id?: string;
  reservationNumber: string;
  flights: FlightsInfo[];
};
