package com.airassist.backend.dto.document;

import com.airassist.backend.model.enums.DocumentTypes;
import lombok.Data;
import java.util.UUID;

@Data
public class DocumentDTO {
    private UUID id;
    private String name;
    private DocumentTypes type;
    private String contentBase64;
}
