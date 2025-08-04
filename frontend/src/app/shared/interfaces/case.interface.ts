import {Statuses} from '../enums/status.enum';
import {DisruptionReason} from '../enums/disruptionReason.enum';
import {User} from './user.interface';
import {Reservation} from './reservation.interface';
import {Document} from './document.interface';


export type Case  = {
  id?: string;
  status?: Statuses;
  disruptionReason: DisruptionReason;
  disruptionInfo: string;
  date: Date|null;
  client: User;
  assignedColleague?: User|null;
  reservation: Reservation;
  documentList?: Document[];
}
