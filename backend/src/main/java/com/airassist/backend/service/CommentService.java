package com.airassist.backend.service;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.model.Comment;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    List<CommentDTO> getCommentsForCase(UUID caseId);
    CommentDTO addCommentToCase(UUID caseId, CreateCommentDTO createCommentDTO);
}
