package com.airassist.backend.service;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.exception.user.UserNotFoundException;
import java.util.List;
import java.util.UUID;

public interface CommentService {
    /**
     * Retrieves all comments associated with a specific case.
     *
     * @param caseId the UUID of the case for which comments are to be retrieved
     * @return a list of CommentDTO objects representing the comments for the specified case
     */
    List<CommentDTO> getCommentsForCase(UUID caseId);

    /**
     * Adds a new comment to a specific case.
     *
     * @param caseId the UUID of the case to which the comment will be added
     * @param createCommentDTO the DTO containing the details of the comment to be added
     * @return a CommentDTO representing the newly added comment
     * @throws UserNotFoundException if the user associated with the comment is not found
     */
    CommentDTO addCommentToCase(UUID caseId, CreateCommentDTO createCommentDTO) throws UserNotFoundException;
}
