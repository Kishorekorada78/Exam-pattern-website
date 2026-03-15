package com.exam.dto;

import java.util.List;

public class DTOs {

    public static class RegistrationRequest {
        public String name;
        public String rollNumber;
        public String email;
    }

    public static class AnswerDto {
        public int questionNumber;
        public String answerText;
    }

    public static class SubmitExamRequest {
        public Long studentId;
        public List<AnswerDto> answers;
        public int tabSwitchCount;
    }
    
    public static class TabSwitchRequest {
        public Long studentId;
    }
}
