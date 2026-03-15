package com.exam.controller;

import com.exam.dto.DTOs.RegistrationRequest;
import com.exam.dto.DTOs.SubmitExamRequest;
import com.exam.dto.DTOs.TabSwitchRequest;
import com.exam.entity.Answer;
import com.exam.entity.Student;
import com.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to call APIs directly
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        try {
            Student student = examService.registerStudent(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("studentId", student.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/tab-switch")
    public ResponseEntity<?> recordTabSwitch(@RequestBody TabSwitchRequest request) {
        try {
            examService.recordTabSwitch(request.studentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitExam(@RequestBody SubmitExamRequest request) {
        try {
            examService.submitExam(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Exam submitted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(examService.getAllStudents());
    }
    
    @GetMapping("/admin/students/{studentId}/answers")
    public ResponseEntity<List<Answer>> getStudentAnswers(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getAnswersForStudent(studentId));
    }
}
