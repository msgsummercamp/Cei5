package com.airassist.backend.service.impl;

import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.document.DocumentNotFoundException;
import com.airassist.backend.mapper.DocumentMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Document;
import com.airassist.backend.model.enums.DocumentTypes;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.DocumentRepository;
import com.airassist.backend.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final CaseRepository caseRepository;
    private final DocumentMapper documentMapper;
    private static final Logger logger = LoggerFactory.getLogger(DocumentServiceImpl.class);


    public DocumentServiceImpl(DocumentRepository documentRepository, CaseRepository caseRepository, DocumentMapper documentMapper) {
        this.documentRepository = documentRepository;
        this.caseRepository = caseRepository;
        this.documentMapper = documentMapper;
    }

    /**
     * This function is returning a Document WITH CONTENT
     * @param documentId - the ID of the document to be fetched
     * @return the requested document
     */
    public DocumentDTO getDocument(UUID documentId) {
        logger.info("Document Service - fetching the document: {}", documentId);
        return documentMapper.documentToDocumentDTO(
                documentRepository.findById(documentId).orElseThrow(DocumentNotFoundException::new)
        );
    }

    /**
     * This function returns a list of documents from a case, but WITHOUT the CONTENT (only ids, types and names)
     * @param caseId - the ID of the case for which documents are being fetched
     * @return the list of documents
     */
    public List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId) {
        if(!caseRepository.existsById(caseId)) {
            throw new CaseNotFoundException();
        }
        logger.info("Document Service - fetching a list of documents for the case {}", caseId);
        return documentRepository.findByCaseEntityId(caseId);
    }


    /**
     * Function to add a document to a case
     * @param file - the file we want to upload - should be sent as multipart/form-data
     * @param name - the name of the document - should be a non empty-string
     * @param type - the type of the document - should be from the ENUM DocumentTypes
     * @param caseId - the id of the case we want to add the document to
     * @return - the saved document obj
     * @throws IOException - if there is an error reading the file
     */
    @Override
    public DocumentDTO addDocument(MultipartFile file, String name, DocumentTypes type, UUID caseId) throws IOException {
        if(!inputValidations(file, name, type, caseId)) {
            throw new IllegalArgumentException("Invalid input parameters for adding a document.");
        }

        Case caseEntity = caseRepository.findById(caseId).orElseThrow(CaseNotFoundException::new);

        Document document = new Document();
        document.setName(name);
        document.setType(type);
        document.setContent(file.getBytes());
        document.setCaseEntity(caseEntity);

        logger.info("Document Service - A document has been added to the case: {}", caseId);
        return documentMapper.documentToDocumentDTO(documentRepository.save(document));
    }

    /**
     * Function to delete a document
     * @param documentId - the ID of the document to be deleted
     */
    @Override
    public void deleteDocument(UUID documentId) {
        if(!documentRepository.existsById(documentId)) {
            throw new DocumentNotFoundException();
        }

        logger.info("Document Service - Deleted the document: {}", documentId);
        documentRepository.deleteById(documentId);
    }

    /**
     * Validates the input parameters for adding a document
     * @param file - the file to be uploaded
     * @param name - the name of the document
     * @param type - the type of the document
     * @param caseId - the ID of the case to which the document belongs
     * @return true if all validations pass, false otherwise
     */
    public boolean inputValidations(MultipartFile file, String name, DocumentTypes type, UUID caseId) {
        return file != null && !file.isEmpty()
                && name != null && !name.trim().isEmpty()
                && type != null
                && caseId != null;
    }
}
