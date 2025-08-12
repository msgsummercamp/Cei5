package com.airassist.backend.controller;

import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.model.Document;
import com.airassist.backend.model.enums.DocumentTypes;
import com.airassist.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
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
    public ResponseEntity<Document> getDocument(@PathVariable UUID documentId) {
        Optional<Document> responseDocument = documentService.getDocument(documentId);
        return responseDocument.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

    /**
     * Retrieves all documents associated with a specific case
     * @param caseId - the ID of the case for which to retrieve documents
     * @return ResponseEntity containing a list of DocumentSummaryDTOs
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentSummaryDTO>> getDocumentsForCase(@PathVariable UUID caseId) {
        List<DocumentSummaryDTO> responseDocument = documentService.getDocumentsForCase(caseId);
        return ResponseEntity.ok(responseDocument);
    }

    /**
     * Uploads a document for a specific case
     * @param file - the file we want to upload - should be sent as multipart/form-data
     * @param name - the name of the document - should be a non empty-string
     * @param type - the type of the document - should be from the ENUM DocumentTypes
     * @param caseId - the id of the case we want to add the document to
     * @return the saved document obj
     * @throws IOException if there is an error reading the file
     */
    @PostMapping("/case/{caseId}/upload")
    public ResponseEntity<Document> addDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("type") DocumentTypes type,
            @PathVariable UUID caseId
    ) throws IOException {
        Document document = new Document();
        document.setName(name);
        document.setType(type);
        document.setContent(file.getBytes());
        Document savedDocument = documentService.addDocument(document, caseId);
        return ResponseEntity.ok(savedDocument);
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
