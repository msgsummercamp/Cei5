package com.airassist.backend.controller;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.service.CommentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommentControllerTest {
    @Mock
    private CommentService commentService;

    @InjectMocks
    private CommentController commentController;

    @Test
    void getCommentsForCase_WhenCaseDoesNotExist_ShouldThrowCaseNotFoundException() {
        UUID caseId = UUID.randomUUID();
        when(commentService.getCommentsForCase(caseId)).thenThrow(new CaseNotFoundException());
        assertThrows(CaseNotFoundException.class, () -> commentController.getCommentsForCase(caseId));
    }

    @Test
    void getCommentsForCase_WhenCaseExistsButHasNoComments_ShouldReturnEmptyList() {
        UUID caseId = UUID.randomUUID();
        when(commentService.getCommentsForCase(caseId)).thenReturn(List.of());
        var comments = commentController.getCommentsForCase(caseId);
        assertTrue(comments.getBody().isEmpty());
    }

    @Test
    void getCommentsForCase_WhenCaseExistsAndCommentExist_ShouldReturnListOfComments() {
        UUID caseId = UUID.randomUUID();
        List<CommentDTO> commentsDto = List.of(new CommentDTO());
        when(commentService.getCommentsForCase(caseId)).thenReturn(commentsDto);

        var response = commentController.getCommentsForCase(caseId);
        assertEquals(commentsDto, response.getBody());
    }

    @Test
    void addCommentToCase_WhenCaseDoesNotExist_ShouldThrowCaseNotFoundException() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        CreateCommentDTO commentDTO = new CreateCommentDTO();
        when(commentService.addCommentToCase(caseId, commentDTO)).thenThrow(new CaseNotFoundException());
        assertThrows(CaseNotFoundException.class, () -> commentController.addCommentToCase(caseId, new CreateCommentDTO()));
    }

    @Test
    void addCommentToCase_WhenUserDoesNotExist_ShouldThrowUserNotFoundException() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        CreateCommentDTO createCommentDTO = new CreateCommentDTO();
        createCommentDTO.setUserId(UUID.randomUUID());
        createCommentDTO.setText("Test comment");

        when(commentService.addCommentToCase(caseId, createCommentDTO))
                .thenThrow(UserNotFoundException.class);

        assertThrows(UserNotFoundException.class,
                () -> commentController.addCommentToCase(caseId, createCommentDTO));
    }

    @Test
    void addCommentToCase_WhenCommentIsEmpty_ShouldThrowIllegalArgumentException() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        CreateCommentDTO createCommentDTO = new CreateCommentDTO();
        createCommentDTO.setText("");
        createCommentDTO.setUserId(UUID.randomUUID());

        when(commentService.addCommentToCase(caseId, createCommentDTO))
                .thenThrow(IllegalArgumentException.class);

        assertThrows(IllegalArgumentException.class,
                () -> commentController.addCommentToCase(caseId, createCommentDTO));
    }

    @Test
    void addCommentToCase_WhenValidInput_ShouldReturnCommentDTO() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        CreateCommentDTO createCommentDTO = new CreateCommentDTO();
        createCommentDTO.setText("A valid comment");
        createCommentDTO.setUserId(UUID.randomUUID());

        CommentDTO expectedCommentDTO = new CommentDTO();
        when(commentService.addCommentToCase(caseId, createCommentDTO)).thenReturn(expectedCommentDTO);

        var response = commentController.addCommentToCase(caseId, createCommentDTO);

        assertEquals(expectedCommentDTO, response.getBody());
    }
}
