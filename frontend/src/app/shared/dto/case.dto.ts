import { DisruptionReason } from '../types/enums/disruption-reason';
import { Statuses } from '../types/enums/status';
import { UserDTO } from './user.dto';
import { ReservationDTO } from './reservation.dto';

type DocumentInfo = {
  id?: string;
  name: string;
  type: string;
  content: Uint8Array;
};

export type CaseDTO = {
  id?: string;
  status?: Statuses;
  disruptionReason: string;
  disruptionInfo: string;
  date: string | null;
  clientID: string;
  assignedColleague?: UserDTO;
  reservation: ReservationDTO;
  documentList?: DocumentInfo[];
};
