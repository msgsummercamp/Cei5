package com.airassist.backend.controller;

import com.airassist.backend.dto.document.CreateDocumentDTO;
import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Retrieves a document by its ID
     * @param documentId - the ID of the document to retrieve
     * @return ResponseEntity containing the Document if found, or 404 Not Found if not found
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentDTO> getDocument(@PathVariable UUID documentId) {
        return ResponseEntity.ok(documentService.getDocument(documentId));
    }

    /**
     * Retrieves all documents associated with a specific case
     * @param caseId - the ID of the case for which to retrieve documents
     * @return ResponseEntity containing a list of DocumentSummaryDTOs
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentSummaryDTO>> getDocumentsForCase(@PathVariable UUID caseId) {
        return ResponseEntity.ok(documentService.getDocumentsForCase(caseId));
    }

    /**
     * Adds a new document to a case
     * @param createDocumentDTO - the DTO containing the document details
     * @param caseId - the ID of the case to which the document will be added
     * @return ResponseEntity containing the created DocumentDTO
     * @throws IOException if there is an error processing the file upload
     */
    @PostMapping("/case/{caseId}/upload")
    public ResponseEntity<DocumentDTO> addDocument(
            @ModelAttribute CreateDocumentDTO createDocumentDTO,
            @PathVariable UUID caseId
    ) throws IOException {
        return ResponseEntity.ok(documentService.addDocument(createDocumentDTO, caseId));
    }

    /**
     * Deletes a document by its ID
     * @param documentId - the ID of the document to delete
     * @return ResponseEntity with no content if deletion is successful, or 404 Not Found if the document does not exist
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
