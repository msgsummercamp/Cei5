package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.airassist.backend.model.Comment;
import com.airassist.backend.model.UserDetails;

@Entity
@Data
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be less than 254 characters")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;

    @Column(nullable = false)
    @Size(max = 50, message = "First name must be less than 50 characters")
    private String firstName;

    @Column(nullable = false)
    @Size(max = 50, message = "Last name must be less than 50 characters")
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Roles role;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_details_id", referencedColumnName = "id")
    private UserDetails userDetails;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Comment> comments;

    //later import
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Case> cases;

    private boolean isFirstLogin = false;


}
