import { Injectable } from '@angular/core';
import { FlightDetails } from '../../features/case-form/views/flight-form.component';

@Injectable({
  providedIn: 'root',
})
export class FlightManagementService {
  // CONSTANTS
  private readonly MAX_FLAGS = 1;

  // Private state
  private connectionFlights: [string, string][] = [];
  private connectionFlightData: { [key: number]: FlightDetails | null } = {};
  private allFlights: { flightDetails: FlightDetails; isFlagged: boolean }[] = [];
  private isFlagged: boolean[] = [];
  private flags = 0;

  // Public methods
  public getConnectionFlights(): [string, string][] {
    return [...this.connectionFlights];
  }

  public setConnectionStrings(
    airports: string[],
    departingAirport: string,
    destinationAirport: string
  ): void {
    // Clear existing connections
    this.connectionFlights = [];

    if (airports.length === 0) {
      return;
    }

    // Create first connection: departing -> first connection airport
    this.connectionFlights.push([departingAirport, airports[0]]);

    // Create intermediate connections between consecutive airports
    airports.forEach((airport, index) => {
      if (index < airports.length - 1) {
        this.connectionFlights.push([airport, airports[index + 1]]);
      }
    });

    // Create final connection: last connection airport -> destination
    this.connectionFlights.push([airports[airports.length - 1], destinationAirport]);

    // Initialize flags array if empty
    if (this.isFlagged.length === 0) {
      this.isFlagged = Array(this.connectionFlights.length).fill(false);
    }
  }

  public clearConnectionFlights(): void {
    this.connectionFlights = [];
  }

  public getConnectionIndices(): number[] {
    return Array.from({ length: this.connectionFlights.length }, (_, i) => i);
  }

  public updateConnectionFlightData(connectionIndex: number, data: FlightDetails | null): void {
    this.connectionFlightData[connectionIndex] = data;
  }

  public getConnectionInitialData(connectionIndex: number): FlightDetails | null {
    return this.connectionFlightData[connectionIndex] || null;
  }

  public areAllConnectionFlightsValid(): boolean {
    for (let i = 0; i < this.connectionFlights.length; i++) {
      if (!this.connectionFlightData[i]) {
        return false; // No data means form is not valid
      }
    }
    return true;
  }

  public toggleFlag(index: number): boolean {
    if (this.flags === this.MAX_FLAGS && !this.isFlagged[index]) {
      return false; // Cannot add more flags
    }

    this.flags = this.isFlagged[index] ? this.flags - 1 : this.flags + 1;
    this.isFlagged[index] = !this.isFlagged[index];
    return true;
  }

  public getFlags(): number {
    return this.flags;
  }

  public getFlagStatus(): boolean[] {
    return [...this.isFlagged];
  }

  public getMaxFlags(): number {
    return this.MAX_FLAGS;
  }

  public initializeFlagsArray(length: number): void {
    if (this.isFlagged.length === 0) {
      this.isFlagged = Array(length).fill(false);
    }
  }

  public createAllFlights(reservationNumber: string): void {
    this.allFlights = [];
    this.connectionFlights.forEach((connection, index) => {
      const flightDetails: FlightDetails = {
        flightNumber: this.connectionFlightData[index]?.flightNumber || '',
        airline: this.connectionFlightData[index]?.airline || '',
        reservationNumber: reservationNumber,
        departingAirport: connection[0],
        destinationAirport: connection[1],
        plannedDepartureTime: this.connectionFlightData[index]?.plannedDepartureTime || null,
        plannedArrivalTime: this.connectionFlightData[index]?.plannedArrivalTime || null,
      };
      this.allFlights.push({ flightDetails, isFlagged: this.isFlagged[index] || false });
    });
  }

  public addDirectFlight(flightDetails: FlightDetails): void {
    this.allFlights.push({ flightDetails, isFlagged: true });
  }

  public getAllFlights(): { flightDetails: FlightDetails; isFlagged: boolean }[] {
    return [...this.allFlights];
  }

  public clearAllFlights(): void {
    this.allFlights = [];
  }

  // Reset methods
  public resetConnectionData(): void {
    this.connectionFlights = [];
    this.connectionFlightData = {};
    this.isFlagged = [];
    this.flags = 0;
  }

  public resetAllData(): void {
    this.connectionFlights = [];
    this.connectionFlightData = {};
    this.allFlights = [];
    this.isFlagged = [];
    this.flags = 0;
  }

  // Utility methods
  public hasConnectionFlights(): boolean {
    return this.connectionFlights.length > 0;
  }

  public getConnectionFlightCount(): number {
    return this.connectionFlights.length;
  }
}
