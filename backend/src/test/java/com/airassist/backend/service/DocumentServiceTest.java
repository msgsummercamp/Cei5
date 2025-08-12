package com.airassist.backend.service;

import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.document.DocumentNotFoundException;
import com.airassist.backend.mapper.DocumentMapper;
import com.airassist.backend.model.Document;
import com.airassist.backend.model.enums.DocumentTypes;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.DocumentRepository;
import com.airassist.backend.service.impl.DocumentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {
    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private CaseRepository caseRepository;
    @Mock
    private DocumentMapper documentMapper;

    @InjectMocks
    private DocumentServiceImpl documentService;

    @Test
    void getDocument_WhenDocumentExists_ShouldReturnDocumentDTO() {
        UUID documentId = UUID.randomUUID();
        Document document = new Document();
        document.setId(documentId);
        document.setName("TestDoc");

        DocumentDTO expectedDTO = new DocumentDTO();
        expectedDTO.setId(documentId);
        expectedDTO.setName("TestDoc");

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(documentMapper.documentToDocumentDTO(document)).thenReturn(expectedDTO);

        DocumentDTO actualDTO = documentService.getDocument(documentId);

        assertEquals(expectedDTO, actualDTO);
    }

    @Test
    void getDocument_WhenDocumentDoesNotExist_ShouldThrowDocumentNotFoundException() {
        UUID documentId = UUID.randomUUID();
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThrows(DocumentNotFoundException.class, () -> documentService.getDocument(documentId));
    }

    @Test
    void getDocumentsForCase_WhenCaseExists_ShouldReturnListOfDocumentSummaryDTOs() {
        UUID caseId = UUID.randomUUID();
        Document doc1 = new Document();
        doc1.setId(UUID.randomUUID());
        doc1.setName("Doc1");
        doc1.setType(DocumentTypes.JPG);

        Document doc2 = new Document();
        doc2.setId(UUID.randomUUID());
        doc2.setName("Doc2");
        doc2.setType(DocumentTypes.JPEG);

        List<Document> documents = List.of(doc1, doc2);

        when(caseRepository.existsById(caseId)).thenReturn(true);
        when(documentRepository.findByCaseEntityId(caseId)).thenReturn(documents);

        List<DocumentSummaryDTO> expectedList = List.of(
                new DocumentSummaryDTO(doc1.getId(), doc1.getName(), doc1.getType()),
                new DocumentSummaryDTO(doc2.getId(), doc2.getName(), doc2.getType())
        );

        List<DocumentSummaryDTO> actualList = documentService.getDocumentsForCase(caseId);

        assertEquals(expectedList, actualList);
    }

    @Test
    void getDocumentsForCase_WhenCaseExistsButNoDocuments_ShouldReturnEmptyList() {
        UUID caseId = UUID.randomUUID();

        when(caseRepository.existsById(caseId)).thenReturn(true);
        when(documentRepository.findByCaseEntityId(caseId)).thenReturn(List.of());

        List<DocumentSummaryDTO> actualList = documentService.getDocumentsForCase(caseId);

        assertTrue(actualList.isEmpty());
    }

    @Test
    void getDocumentsForCase_WhenCaseDoesNotExist_ShouldThrowCaseNotFoundException() {
        UUID caseId = UUID.randomUUID();
        when(caseRepository.existsById(caseId)).thenReturn(false);

        assertThrows(CaseNotFoundException.class, () -> documentService.getDocumentsForCase(caseId));
    }
}
