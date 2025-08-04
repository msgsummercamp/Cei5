package com.airassist.backend.validator;

import com.airassist.backend.model.User;

public class UserValidator
{
    /**
     * Validates if the user is valid for the update operation.
     * A user is considered valid for update if:
     * * 1. The email is not null.
     * * 2. If user details are present, the phone number is not null.
     *
     * @param user the user to validate
     * @return true if the user is valid for update, false otherwise
     */
    public static boolean userIsValidForUpdate(User user){

        if(user.getEmail() == null) {
            return false;
        }

        if(user.getUserDetails() != null && user.getUserDetails().getPhoneNumber() == null) {
            return false;
        }
        return true;
    }


}
