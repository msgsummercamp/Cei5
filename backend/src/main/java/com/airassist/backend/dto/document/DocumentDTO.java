package com.airassist.backend.dto.document;

import com.airassist.backend.model.enums.DocumentTypes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentDTO {
    private UUID id;
    private String name;
    private DocumentTypes type;
    private String contentBase64;
}
