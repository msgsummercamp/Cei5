package com.airassist.backend.utils;

import com.airassist.backend.model.User;
import com.airassist.backend.model.UserDetails;

public class UserUtils {

    /**
     * Updates the fields of the target user with the values from the source user.
     * Does not update the email field to prevent email changes.
     * Does not update the role field to prevent role changes.
     * It also updates the UserDetails associated with the user.
     *
     * @param source the source user containing updated fields
     * @param target the target user to be updated
     */
    public static void updateUserFields(User source, User target) {
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setPassword(source.getPassword());
        target.setUserDetails(source.getUserDetails());
        updateUserDetails(source.getUserDetails(), target.getUserDetails());
    }

    /**
     * Updates the fields of the target UserDetails with the values from the source UserDetails.
     *
     * @param source the source UserDetails containing updated fields
     * @param target the target UserDetails to be updated
     */
    private static void updateUserDetails(UserDetails source, UserDetails target) {
        target.setAddress(source.getAddress());
        target.setPostalCode(source.getPostalCode());
        target.setPhoneNumber(source.getPhoneNumber());
        target.setBirthDate(source.getBirthDate());
    }

    /**
     * Patches the target user with the values from the source user.
     * This method allows partial updates to a user.
     * It updates only the fields that are not null in the source user.
     *
     * @param source the source user containing new values
     * @param target the target user to be patched
     */
    public static void patchUserFields(User source, User target) {
        if (source.getFirstName() != null) target.setFirstName(source.getFirstName());
        if (source.getLastName() != null) target.setLastName(source.getLastName());
        if (source.getPassword() != null) target.setPassword(source.getPassword());
        if (source.getUserDetails() != null) {
            patchUserDetails(source.getUserDetails(), target.getUserDetails());
        }
    }

    private static void patchUserDetails(UserDetails source, UserDetails target) {
        if (source.getAddress() != null) target.setAddress(source.getAddress());
        if (source.getPostalCode() != null) target.setPostalCode(source.getPostalCode());
        if (source.getPhoneNumber() != null) target.setPhoneNumber(source.getPhoneNumber());
        if (source.getBirthDate() != null) target.setBirthDate(source.getBirthDate());
    }
}
