import {DocumentType} from '../enums/documentType.enum';
import {Case} from './case.interface';

export type Document = {
  id?: string;
  name: string;
  type: DocumentType;
  content: Uint8Array;
  caseEntity: Case
}
