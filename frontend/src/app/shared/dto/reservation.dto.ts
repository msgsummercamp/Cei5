
export type ReservationDTO = {
  id?: string;
  reservationNumber: string;
  flights: Array<{
    id?: string;
    flightDate: string;
    flightNumber: string;
    departingAirport: string;
    destinationAirport: string;
    departureTime: string;
    arrivalTime: string;
    airLine: string;
    isProblematic: boolean;
  }>;
};