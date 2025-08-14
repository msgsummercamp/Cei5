package com.airassist.backend.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private UUID id;
    private UUID userId;
    private String text;
    private Timestamp timestamp;
    private String username;
}
