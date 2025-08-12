package com.airassist.backend.controller;

import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.exception.document.DocumentNotFoundException;
import com.airassist.backend.model.enums.DocumentTypes;
import com.airassist.backend.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class DocumentControllerTest {
    @Mock
    private DocumentService documentService;

    @InjectMocks
    private DocumentController documentController;

    @Test
    void getDocument_WhenNotFound_ShouldThrowException() {
        UUID documentId = UUID.randomUUID();
        when(documentService.getDocument(documentId)).thenThrow(new DocumentNotFoundException());
        assertThrows(DocumentNotFoundException.class, () -> documentController.getDocument(documentId));
    }

    @Test
    void getDocument_WhenServiceReturnsNull_ShouldReturnNullBody() {
        UUID documentId = UUID.randomUUID();
        when(documentService.getDocument(documentId)).thenReturn(null);
        var response = documentController.getDocument(documentId);
        assertNull(response.getBody());
    }

    @Test
    void getDocument_WhenFound_ShouldReturnDocumentDTO() {
        UUID documentId = UUID.randomUUID();
        DocumentDTO dto = new DocumentDTO();
        when(documentService.getDocument(documentId)).thenReturn(dto);

        var response = documentController.getDocument(documentId);

        assertEquals(dto, response.getBody());
        verify(documentService).getDocument(documentId);
    }

    @Test
    void getDocumentsForCase_WhenNoDocuments_ShouldReturnEmptyList() {
        UUID caseId = UUID.randomUUID();
        when(documentService.getDocumentsForCase(caseId)).thenReturn(List.of());
        var response = documentController.getDocumentsForCase(caseId);
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void getDocumentsForCase_WhenDocumentsExist_ShouldReturnListOfDocumentSummaryDTOs() {
        UUID caseId = UUID.randomUUID();
        List<DocumentSummaryDTO> dtos = List.of(new DocumentSummaryDTO());
        when(documentService.getDocumentsForCase(caseId)).thenReturn(dtos);

        var response = documentController.getDocumentsForCase(caseId);

        assertEquals(dtos, response.getBody());
        verify(documentService).getDocumentsForCase(caseId);
    }

    @Test
    void addDocument_WhenServiceThrowsIOException_ShouldPropagate() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        UUID caseId = UUID.randomUUID();
        when(documentService.addDocument(file, "Doc", DocumentTypes.JPG, caseId)).thenThrow(new IOException());
        assertThrows(IOException.class, () ->
                documentController.addDocument(file, "Doc", DocumentTypes.JPG, caseId));
    }

    @Test
    void addDocument_WhenInvalidInput_ShouldThrowException() throws IOException {
        MultipartFile file = null;
        String name = "";
        DocumentTypes type = null;
        UUID caseId = UUID.randomUUID();
        when(documentService.addDocument(file, name, type, caseId)).thenThrow(new IllegalArgumentException());
        assertThrows(IllegalArgumentException.class, () -> documentController.addDocument(file, name, type, caseId));
    }

    @Test
    void addDocument_ValidInput_ShouldReturnDocumentDTO() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        String name = "Doc";
        DocumentTypes type = DocumentTypes.JPG;
        UUID caseId = UUID.randomUUID();
        DocumentDTO dto = new DocumentDTO();
        when(documentService.addDocument(file, name, type, caseId)).thenReturn(dto);

        var response = documentController.addDocument(file, name, type, caseId);

        assertEquals(dto, response.getBody());
        verify(documentService).addDocument(file, name, type, caseId);
    }

    @Test
    void deleteDocument_WhenNotFound_ShouldThrowException() {
        UUID documentId = UUID.randomUUID();
        doThrow(new DocumentNotFoundException()).when(documentService).deleteDocument(documentId);
        assertThrows(DocumentNotFoundException.class, () -> documentController.deleteDocument(documentId));
    }

    @Test
    void deleteDocument_WhenFound_ShouldReturnNoContent() {
        UUID documentId = UUID.randomUUID();

        var response = documentController.deleteDocument(documentId);

        assertNull(response.getBody());
        assertEquals(204, response.getStatusCodeValue());
        verify(documentService).deleteDocument(documentId);
    }
}
