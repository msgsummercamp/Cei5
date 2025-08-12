package com.airassist.backend.service;

import com.airassist.backend.controller.DocumentController;
import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class DocumentControllerTest {
    @Mock
    private DocumentService documentService;

    @InjectMocks
    private DocumentController documentController;

    @Test
    void getDocument_ShouldReturnDocumentDTO() {
        UUID documentId = UUID.randomUUID();
        DocumentDTO dto = new DocumentDTO();
        when(documentService.getDocument(documentId)).thenReturn(dto);

        var response = documentController.getDocument(documentId);

        assertEquals(dto, response.getBody());
        verify(documentService).getDocument(documentId);
    }

    @Test
    void getDocumentsForCase_ShouldReturnListOfDocumentSummaryDTOs() {
        UUID caseId = UUID.randomUUID();
        List<DocumentSummaryDTO> dtos = List.of(new DocumentSummaryDTO());
        when(documentService.getDocumentsForCase(caseId)).thenReturn(dtos);

        var response = documentController.getDocumentsForCase(caseId);

        assertEquals(dtos, response.getBody());
        verify(documentService).getDocumentsForCase(caseId);

    }
}
