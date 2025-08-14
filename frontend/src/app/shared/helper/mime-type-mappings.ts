export class MimeTypeMapper {
  private static readonly mappings: { [key: string]: string } = {
    PDF: 'application/pdf',
    JPEG: 'image/jpeg',
    JPG: 'image/jpeg',
  };

  private static readonly reversedMappings: { [key: string]: string } = Object.entries(
    this.mappings
  ).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

  public static mapDocumentTypeToMimeType(documentType: string): string {
    return this.mappings[documentType];
  }

  public static mapMimeTypeToDocumentType(mimeType: string): string {
    return this.reversedMappings[mimeType];
  }
}
