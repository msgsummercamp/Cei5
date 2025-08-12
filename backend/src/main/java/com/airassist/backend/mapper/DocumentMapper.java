package com.airassist.backend.mapper;

import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.model.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Base64;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    DocumentMapper INSTANCE = Mappers.getMapper(DocumentMapper.class);

    @Mapping(target = "contentBase64", source = "content", qualifiedByName = "bytesToBase64")
    DocumentDTO documentToDocumentDTO(Document document);

    @Mapping(target = "content", source = "contentBase64", qualifiedByName = "base64ToBytes")
    Document documentDTOToDocument(DocumentDTO documentDTO);

    @Named("bytesToBase64")
    default String bytesToBase64(byte[] bytes) {
        return bytes != null ? Base64.getEncoder().encodeToString(bytes) : null;
    }

    @Named("base64ToBytes")
    default byte[] base64ToBytes(String base64) {
        return base64 != null ? Base64.getDecoder().decode(base64) : null;
    }
}