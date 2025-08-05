import { DocumentType } from '../enums/documentType.enum';
import { Case } from './case';

export type Document = {
  id?: string;
  name: string;
  type: DocumentType;
  content: Uint8Array;
  caseEntity: Case;
};
