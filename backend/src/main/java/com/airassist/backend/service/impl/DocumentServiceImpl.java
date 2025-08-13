package com.airassist.backend.service.impl;

import com.airassist.backend.dto.document.CreateDocumentDTO;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
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
     * @param caseId - the ID of the case for which documents are beinCg fetched
     * @return the list of documents
     */
    @Transactional
    public List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId) {
        if(!caseRepository.existsById(caseId)) {
            throw new CaseNotFoundException();
        }
        logger.info("Document Service - fetching a list of documents for the case {}", caseId);
        List<Document> documents = documentRepository.findByCaseEntityId(caseId);
        return documents.stream()
                .map(doc -> new DocumentSummaryDTO(doc.getId(), doc.getName(), doc.getType()))
                .toList();
    }


    /**
     * Function to add a document to a case
     * @param createDocumentDTO - the DTO containing the document details
     * @param caseId - the ID of the case to which the document will be added
     * @return - the saved document as a DocumentDTO
     * @throws IOException - if there is an error reading the file
     */
    @Override
    public DocumentDTO addDocument(CreateDocumentDTO createDocumentDTO, UUID caseId) throws IOException {
        if(!checkAllNotNull(createDocumentDTO.getFile(), createDocumentDTO.getName(), createDocumentDTO.getType(), caseId)) {
            throw new IllegalArgumentException("Invalid input parameters for adding a document.");
        }

        Case caseEntity = caseRepository.findById(caseId).orElseThrow(CaseNotFoundException::new);

        Document document = new Document();
        document.setName(createDocumentDTO.getName());
        document.setType(createDocumentDTO.getType());
        document.setContent(createDocumentDTO.getFile().getBytes());
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
    private boolean checkAllNotNull(MultipartFile file, String name, DocumentTypes type, UUID caseId) {
        return file != null && !file.isEmpty()
                && StringUtils.hasText(name)
                && type != null
                && caseId != null;
    }
}
