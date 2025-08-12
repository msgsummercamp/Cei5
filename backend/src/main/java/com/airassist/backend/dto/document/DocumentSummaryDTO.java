package com.airassist.backend.dto.document;

import com.airassist.backend.model.enums.DocumentTypes;
import java.util.UUID;

public interface DocumentSummaryDTO {
    UUID getId();
    String getName();
    DocumentTypes getType();
}
