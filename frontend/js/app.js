const API_URL = 'http://localhost:8080/api';

// --- LOGIN PAGE LOGIC ---
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const rollNumber = document.getElementById('rollNumber').value;
            const email = document.getElementById('email').value;
            const errorDiv = document.getElementById('loginError');

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rollNumber, email })
                });

                const data = await response.json();
                
                if (response.ok) {
                    sessionStorage.setItem('studentId', data.studentId);
                    sessionStorage.setItem('studentName', name);
                    sessionStorage.setItem('studentRoll', rollNumber);
                    sessionStorage.setItem('examStart', Date.now());
                    window.location.href = 'exam.html';
                } else {
                    errorDiv.textContent = data.error || 'Registration failed';
                }
            } catch (err) {
                errorDiv.textContent = 'Server is offline. Please make sure the backend is running.';
            }
        });
    }
}

// --- EXAM PAGE LOGIC ---
if (window.location.pathname.endsWith('exam.html')) {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
        window.location.href = 'index.html';
    }

    document.getElementById('display-name').textContent = sessionStorage.getItem('studentName');
    document.getElementById('display-roll').textContent = sessionStorage.getItem('studentRoll');

    // Questions Data
    const questions = [
        "1. Write a function to reverse a string.",
        "2. Explain recursion with an example calculating factorial.",
        "3. Write pseudocode to find the largest element in an array.",
        "4. How do you check if a number is prime?",
        "5. Write an algorithm to perform a binary search.",
        "6. Given a linked list, how do you find the middle element?",
        "7. Implement a stack using an array.",
        "8. Write pseudocode for bubble sort.",
        "9. Find the Fibonacci series up to n terms.",
        "10. Check if a given string is a palindrome."
    ];

    // Render questions
    const container = document.getElementById('questionsContainer');
    questions.forEach((q, index) => {
        const qNum = index + 1;
        const div = document.createElement('div');
        div.className = 'question-card';
        div.innerHTML = `
            <div class="question-number">Question ${qNum}</div>
            <div class="question-text">${q}</div>
            <textarea id="answer_${qNum}" placeholder="Type your answer here..." onpaste="return false;" ondrop="return false;"></textarea>
        `;
        container.appendChild(div);
    });

    // Anti-cheat mechanisms
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = ''; // Shows generic browser warning
    });

    // Tab switching detection
    let tabSwitches = 0;
    const MAX_SWITCHES = 2;
    const warnBanner = document.getElementById('warningBanner');
    const vioCount = document.getElementById('violationCount');
    const modal = document.getElementById('tabSwitchModal');
    const overlay = document.getElementById('overlay');
    const modalVioCount = document.getElementById('modalViolationCount');

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabSwitches++;
            
            // Notify backend independently
            fetch(`${API_URL}/tab-switch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: parseInt(studentId) })
            }).catch(e => console.error("Could not record tab switch", e));

            if (tabSwitches > MAX_SWITCHES) {
                alert("Maximum tab switches exceeded. Auto-submitting exam.");
                submitExam(true);
            } else {
                warnBanner.style.display = 'block';
                vioCount.textContent = tabSwitches;
                modalVioCount.textContent = tabSwitches;
                modal.style.display = 'block';
                overlay.style.display = 'block';
            }
        }
    });

    document.getElementById('dismissWarningBtn')?.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Timer Logic (60 mins)
    const EXAM_DURATION_MS = 60 * 60 * 1000;
    let startTime = parseInt(sessionStorage.getItem('examStart'));
    const timerDisplay = document.getElementById('timer');

    const timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = EXAM_DURATION_MS - elapsed;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Auto-submitting exam.");
            submitExam(true);
            return;
        }

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (remaining < 300000) { // last 5 mins
            timerDisplay.classList.add('danger');
        }
    }, 1000);

    // Submit Logic
    const submitExam = async (isAuto = false) => {
        const answers = [];
        for (let i = 1; i <= 10; i++) {
            const text = document.getElementById(`answer_${i}`).value;
            answers.push({ questionNumber: i, answerText: text });
        }

        const payload = {
            studentId: parseInt(studentId),
            tabSwitchCount: tabSwitches,
            answers: answers
        };

        try {
            const resp = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                sessionStorage.clear();
                document.body.innerHTML = `
                    <div class="center-content align-start" style="height: 100vh;">
                        <div class="glass-container" style="text-align: center;">
                            <h1>Exam Submitted Successfully ✅</h1>
                            <p style="margin-top:20px;">Thank you for your participation.</p>
                            <p style="margin-top:10px;">You can now close this tab.</p>
                        </div>
                    </div>`;
            } else {
                // Ignore errors if auto submitting
                if(!isAuto) alert("Error submitting exam. Please check with an admin.");
            }
        } catch (e) {
            if(!isAuto) alert("Network error. Could not submit.");
        }
    };

    document.getElementById('finalSubmitBtn').addEventListener('click', () => {
        if(confirm("Are you sure you want to submit? You cannot undo this.")) {
            submitExam(false);
        }
    });
    
    document.getElementById('submitExamBtnTop').addEventListener('click', () => {
        if(confirm("Are you sure you want to submit? You cannot undo this.")) {
            submitExam(false);
        }
    });

}
