package com.airassist.backend.service;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.mapper.CommentMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Comment;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.CommentRepository;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.service.impl.CommentServiceImpl;
import org.checkerframework.checker.units.qual.C;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.IllformedLocaleException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CaseRepository caseRepository;
    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Test
    void getCommentsForCase_WhenCaseDoesNotExist_ShouldThrowCaseNotFoundException() {
        UUID caseId = UUID.randomUUID();
        when(caseRepository.existsById(caseId)).thenReturn(false);
        assertThrows(CaseNotFoundException.class, () -> commentService.getCommentsForCase(caseId));
    }

    @Test
    void getCommentsForCase_WhenNoComments_ShouldReturnEmptyList() {
        UUID caseId = UUID.randomUUID();
        when(caseRepository.existsById(caseId)).thenReturn(true);
        when(commentRepository.findByCaseEntityIdOrderByTimestampAsc(caseId)).thenReturn(List.of());

        List<CommentDTO> result = commentService.getCommentsForCase(caseId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getCommentsForCase_WhenCaseExists_ShouldReturnCommentsList() {
        UUID caseId = UUID.randomUUID();
        Comment comment1 = new Comment();
        Comment comment2 = new Comment();
        CommentDTO commentDTO1 = new CommentDTO();
        CommentDTO commentDTO2 = new CommentDTO();

        when(caseRepository.existsById(caseId)).thenReturn(true);
        when(commentRepository.findByCaseEntityIdOrderByTimestampAsc(caseId)).thenReturn(List.of(comment1, comment2));
        when(commentMapper.commentToCommentDTO(comment1)).thenReturn(commentDTO1);
        when(commentMapper.commentToCommentDTO(comment2)).thenReturn(commentDTO2);

        List<CommentDTO> result = commentService.getCommentsForCase(caseId);
        assertEquals(2, result.size());
        assertEquals(commentDTO1, result.get(0));
        assertEquals(commentDTO2, result.get(1));
    }



}
