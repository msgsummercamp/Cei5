package com.airassist.backend.mapper;

import com.airassist.backend.dto.comment.CommentDTO;
import com.airassist.backend.dto.comment.CreateCommentDTO;
import com.airassist.backend.model.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    CommentMapper INSTANCE = Mappers.getMapper(CommentMapper.class);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", expression = "java(comment.getUser().getFirstName() + \" \" + comment.getUser().getLastName())")
    CommentDTO commentToCommentDTO(Comment comment);

    @Mapping(target = "user.id", source = "userId")
    Comment commentDTOToComment(CommentDTO commentDTO);

    @Mapping(target = "user.id", source = "userId")
    Comment createCommentDtoToComment(CreateCommentDTO createCommentDTO);
}