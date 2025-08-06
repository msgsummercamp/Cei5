package com.airassist.backend.model;

import com.airassist.backend.model.enums.Roles;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"comments", "cases", "userDetails"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be less than 254 characters")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    private String password;

    @Column
    @Size(max = 50, message = "First name must be less than 50 characters")
    private String firstName;

    @Column
    @Size(max = 50, message = "Last name must be less than 50 characters")
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Roles role;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(referencedColumnName = "id")
    private UserDetails userDetails;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "assignedColleague")
    private List<Case> cases;

    @Column(columnDefinition ="boolean default true")
    private Boolean isFirstLogin ;
}
