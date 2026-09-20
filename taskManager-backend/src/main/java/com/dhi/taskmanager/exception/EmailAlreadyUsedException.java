package com.dhi.taskmanager.exception;

public class EmailAlreadyUsedException extends BusinessException {
    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}

