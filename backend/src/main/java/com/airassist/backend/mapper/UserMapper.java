package com.airassist.backend.mapper;

import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.dto.user.UserDetailsDTO;
import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    /**
     * Converts a User entity to a UserDTO.
     *
     * @param user the User entity to convert
     * @return the converted UserDTO
     */
    UserDTO userToUserDTO(User user);

    /**
     * Converts a UserDTO to a User entity.
     *
     * @param userDTO the UserDTO to convert
     * @return the converted User entity
     */
    User userDTOToUser(UserDTO userDTO);

    /**
     * Converts a UserDetailsDTO to a UserDetails entity.
     *
     * @param userDetailsDTO the UserDetailsDTO to convert
     * @return the converted UserDetails entity
     */
    UserDetails userDetailsDTOToUserDetails(UserDetailsDTO userDetailsDTO);

    /**
     * Converts a UserDetails entity to a UserDetailsDTO.
     *
     * @param userDetails the UserDetails entity to convert
     * @return the converted UserDetailsDTO
     */
    UserDetailsDTO userDetailsToUserDetailsDTO(UserDetails userDetails);

}
