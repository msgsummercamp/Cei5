import { DisruptionReason } from '../enums/disruptionReason.enum';
import { Statuses } from '../enums/status.enum';
import { UserDTO } from './user.dto';
import { ReservationDTO } from './reservation.dto';

export type CaseDTO = {
  id?: string;
  status?: Statuses;
  disruptionReason: DisruptionReason;
  disruptionInfo: string;
  date: string | null; 
  clientID: string; 
  assignedColleague?: UserDTO;
  reservation: ReservationDTO;
  documentList?: Array<{
    id?: string;
    name: string;
    type: string;
    content: Uint8Array;
  }>; 
};
