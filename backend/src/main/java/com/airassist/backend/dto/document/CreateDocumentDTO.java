package com.airassist.backend.dto.document;

import com.airassist.backend.model.enums.DocumentTypes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDocumentDTO {
    private MultipartFile file;
    private String name;
    private DocumentTypes type;
}