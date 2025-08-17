package com.airassist.backend.controller;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) { this.commentService = commentService; }

    /**
     * Retrieves all comments associated with a specific case.
     *
     * @param caseId the ID of the case for which comments are to be retrieved
     * @return a list of CommentDTO objects representing the comments for the specified case
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<CommentDTO>> getCommentsForCase(@PathVariable UUID caseId) {
        return ResponseEntity.ok(commentService.getCommentsForCase(caseId));
    }

    /**
     * Adds a new comment to a specific case.
     *
     * @param caseId the ID of the case to which the comment is to be added
     * @param createCommentDTO the DTO containing the details of the comment to be added
     * @return the created CommentDTO object
     */
    @PostMapping("/case/{caseId}")
    public ResponseEntity<CommentDTO> addCommentToCase(@PathVariable UUID caseId, @RequestBody CreateCommentDTO createCommentDTO) throws UserNotFoundException {
        return ResponseEntity.ok(commentService.addCommentToCase(caseId, createCommentDTO));
    }
}
