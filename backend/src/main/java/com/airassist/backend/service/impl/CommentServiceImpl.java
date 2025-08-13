package com.airassist.backend.service.impl;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.mapper.CommentMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Comment;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.CommentRepository;
import com.airassist.backend.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final CaseRepository caseRepository;
    private final CommentMapper commentMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);

    public CommentServiceImpl(CommentRepository commentRepository, CaseRepository caseRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.caseRepository = caseRepository;
        this.commentMapper = commentMapper;
    }

    /**
     * Retrieves all comments associated with a specific case.
     *
     * @param caseId the ID of the case for which comments are to be retrieved
     * @return a list of CommentDTO objects representing the comments for the specified case
     * @throws CaseNotFoundException if no case with the given ID exists
     */
    public List<CommentDTO> getCommentsForCase(UUID caseId) {
        if(!caseRepository.existsById(caseId)) {
            throw new CaseNotFoundException();
        }

        return commentRepository.findByCaseEntityIdOrderByTimestampAsc(caseId)
                .stream()
                .map(commentMapper::commentToCommentDTO)
                .toList();
    }

    /**
     * Validates the CreateCommentDTO object.
     *
     * @param createCommentDTO the CreateCommentDTO object to validate
     * @return true if the DTO is invalid, false otherwise
     */
    public boolean invalidDTO(CreateCommentDTO createCommentDTO) {
        return createCommentDTO.getText() == null ||
                createCommentDTO.getText().isBlank() ||
                createCommentDTO.getText().length() > 1000 ||
                createCommentDTO.getUserId() == null;
    }

    /**
     * Adds a new comment to a specific case.
     *
     * @param caseId the ID of the case to which the comment is being added
     * @param createCommentDTO the CreateCommentDTO object containing the details of the comment to be added
     * @return the added CommentDTO object
     * @throws CaseNotFoundException if no case with the given ID exists
     * @throws IllegalArgumentException if the CreateCommentDTO is invalid
     */
    public CommentDTO addCommentToCase(UUID caseId, CreateCommentDTO createCommentDTO) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(CaseNotFoundException::new);

        if(invalidDTO(createCommentDTO)) {
            throw new IllegalArgumentException("Invalid comment.");
        }

        Comment comment = commentMapper.createCommentDtoToComment(createCommentDTO);
        comment.setCaseEntity(caseEntity);
        return commentMapper.commentToCommentDTO(commentRepository.save(comment));
    }
}
