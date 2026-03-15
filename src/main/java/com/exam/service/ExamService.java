package com.exam.service;

import com.exam.dto.DTOs.AnswerDto;
import com.exam.dto.DTOs.RegistrationRequest;
import com.exam.dto.DTOs.SubmitExamRequest;
import com.exam.entity.Answer;
import com.exam.entity.Student;
import com.exam.repository.AnswerRepository;
import com.exam.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExamService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Transactional
    public Student registerStudent(RegistrationRequest request) {
        Optional<Student> existingByRoll = studentRepository.findByRollNumber(request.rollNumber);
        if (existingByRoll.isPresent()) {
            throw new RuntimeException("Student with this roll number already exists.");
        }
        
        Optional<Student> existingByEmail = studentRepository.findByEmail(request.email);
        if (existingByEmail.isPresent()) {
            throw new RuntimeException("Student with this email already exists.");
        }

        Student student = new Student();
        student.setName(request.name);
        student.setRollNumber(request.rollNumber);
        student.setEmail(request.email);
        student.setStartTime(LocalDateTime.now());
        
        return studentRepository.save(student);
    }

    @Transactional
    public void recordTabSwitch(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!student.isExamSubmitted()) {
            student.setTabSwitchCount(student.getTabSwitchCount() + 1);
            studentRepository.save(student);
        }
    }

    @Transactional
    public void submitExam(SubmitExamRequest request) {
        Student student = studentRepository.findById(request.studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.isExamSubmitted()) {
            throw new RuntimeException("Exam already submitted.");
        }

        student.setExamSubmitted(true);
        student.setEndTime(LocalDateTime.now());
        student.setTabSwitchCount(request.tabSwitchCount);
        studentRepository.save(student);

        if (request.answers != null) {
            for (AnswerDto answerDto : request.answers) {
                Answer answer = new Answer();
                answer.setStudentId(student.getId());
                answer.setQuestionNumber(answerDto.questionNumber);
                answer.setAnswerText(answerDto.answerText);
                answerRepository.save(answer);
            }
        }
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public List<Answer> getAnswersForStudent(Long studentId) {
        return answerRepository.findByStudentId(studentId);
    }
}
