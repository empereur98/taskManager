package com.dhi.taskmanager.mapper;

import com.dhi.taskmanager.dto.UserResponse;
import com.dhi.taskmanager.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }
}
