import { DocumentType } from './enums/document-type';
import { Case } from './case';

export type Document = {
  id?: string;
  name: string;
  type: DocumentType;
  contentBase64: string;
  caseEntity: Case;
};
