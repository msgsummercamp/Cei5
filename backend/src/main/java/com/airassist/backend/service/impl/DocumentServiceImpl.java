package com.airassist.backend.service.impl;

import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.document.DocumentNotFoundException;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Document;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.DocumentRepository;
import com.airassist.backend.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final CaseRepository caseRepository;
    private static final Logger logger = LoggerFactory.getLogger(DocumentServiceImpl.class);


    public DocumentServiceImpl(DocumentRepository documentRepository, CaseRepository caseRepository) {
        this.documentRepository = documentRepository;
        this.caseRepository = caseRepository;
    }

    /**
     * This function is returning a Document WITH CONTENT
     * @param documentId - the ID of the document to be fetched
     * @return the requested document
     */
    public Optional<Document> getDocument(UUID documentId) {
        logger.info("Document Service - fetching the document: {}", documentId);
        return documentRepository.findById(documentId);
    }

    /**
     * This function returns a list of documents from a case, but WITHOUT the CONTENT (only ids, types and names)
     * @param caseId - the ID of the case for which documents are being fetched
     * @return the list of documents
     */
    public List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId) {
        if(!caseRepository.existsById(caseId)) {
            logger.warn("Document Service - Attempted to retrieve a case with a non-existing ID: {}", caseId);
            throw new CaseNotFoundException();
        }

        logger.info("Document Service - fetching a list of documents for the case {}", caseId);
        return documentRepository.findByCaseEntityId(caseId);
    }

    /**
     * Function for adding a document to a case
     * @param document - the document to be added
     * @param caseId - the ID of the case to which the document is being added
     * @return the added document
     */
    @Override
    public Document addDocument(Document document, UUID caseId) {
        if(document.getType() == null) {
            throw new IllegalArgumentException("Cannot have an empty document type.");
        }
        if(document.getName() == null || document.getName().isEmpty()) {
            throw new IllegalArgumentException("Cannot have an empty document name.");
        }
        if(document.getContent() == null || document.getContent().length == 0) {
            throw new IllegalArgumentException("Cannot have an empty document content.");
        }
        Case caseEntity = caseRepository.findById(caseId).orElseThrow(() -> new IllegalArgumentException("Case not found."));
        document.setCaseEntity(caseEntity);
        logger.info("Document Service - A document: {} has been added to the case: {}", document, caseId);
        return documentRepository.save(document);
    }

    /**
     * Function to delete a document
     * @param documentId - the ID of the document to be deleted
     */
    @Override
    public void deleteDocument(UUID documentId) {
        if(!documentRepository.existsById(documentId)) {
            logger.warn(("Document Service - Attempted to delete a document with non-existing ID: {}"), documentId);
            throw new DocumentNotFoundException();
        }

        logger.info("Document Service - Deleted the document: {}", documentId);
        documentRepository.deleteById(documentId);
    }
}
