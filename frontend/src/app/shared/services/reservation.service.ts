import { Injectable } from '@angular/core';

export interface ReservationInformation {
  reservationNumber: string;
  departingAirport: string;
  destinationAirport: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private reservationInformation: ReservationInformation = {
    reservationNumber: '',
    departingAirport: '',
    destinationAirport: '',
  };

  public setReservationInformation(info: ReservationInformation): void {
    this.reservationInformation = { ...info };
  }

  public getReservationInformation(): ReservationInformation {
    return { ...this.reservationInformation };
  }

  public updateReservationInformation(field: keyof ReservationInformation, value: string): void {
    this.reservationInformation[field] = value;
  }

  public isReservationValid(): boolean {
    return !!(
      this.reservationInformation.reservationNumber &&
      this.reservationInformation.departingAirport &&
      this.reservationInformation.destinationAirport
    );
  }

  public resetReservation(): void {
    this.reservationInformation = {
      reservationNumber: '',
      departingAirport: '',
      destinationAirport: '',
    };
  }
}
