const API_URL = 'https://exam-pattern-website-production.up.railway.app/api';


// --- LOGIN PAGE LOGIC ---
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
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

        `1) arr = [-2,1,-3,4,-1,2,1,-5,4]

max_sum = arr[0]
current = arr[0]

FOR i = 1 TO length(arr)-1
    current = MAX(arr[i], current + arr[i])
    max_sum = MAX(max_sum, current)
END FOR

PRINT max_sum`,

        `2) FUNCTION f(n)
IF n == 0
    RETURN 0
RETURN n + f(n-1)
END

PRINT f(5)`,

        `3) arr = [3,1,3,4,2]

slow = arr[0]
fast = arr[0]

DO
    slow = arr[slow]
    fast = arr[arr[fast]]
WHILE slow != fast

PRINT slow`,

        `4) if (printf("Hello") && false) {

} else {
    printf("World");
}
What is the output?`,

        `5) arr = [7,3,5,3,4]

FOR i = 0 TO n-2
    min = i

    FOR j = i+1 TO n-1
        IF arr[j] < arr[min]
            min = j

    swap(arr[i], arr[min])

What is the array after first iteration?
Which sorting algorithm is this?`,


        `6) What structure does the OS use to detect deadlocks?`,

        `7) FUNCTION fa(n)

IF n <= 1
    RETURN n

RETURN fa(n-1) + fa(n-2)

PRINT fa(5)`,

        `8) FUNCTION f(n)

IF n == 0
    RETURN 0

RETURN n + f(n-1) + f(n-1)

PRINT f(3)`,

        `9) Array size = 16

Maximum number of comparisons needed in binary search?`,

        `10) int i = 1;

while(i < 10)
{
    printf("%d ", i);
    i = i * 2;
}` ,
        ` 11)Binary Search 
        You are given an array arr[] of non-negative integers. 
        You have to move all the zeros in the array to the right end 
        while maintaining the relative order of the non-zero elements.
        The operation must be performed in place, meaning you should 
        not use extra space for another array.

        Examples:

        Input: arr[] = [1, 2, 0, 4, 3, 0, 5, 0]
        Output: [1, 2, 4, 3, 5, 0, 0, 0]
        Explanation: There are three 0s that are moved to the end.
        Input: arr[] = [10, 20, 30]
        Output: [10, 20, 30]
        Explanation: No change in array as there are no 0s.`,

        ` 12) Move all zeros to the end of the array.
           Given a sorted array arr[] and an integer k, find the position(0-based indexing) 
           at which k is present in the array using binary search.
           If k doesn't exist in arr[] return -1. 

           Note: If multiple occurrences are there, please return the smallest index.

           Examples:

           Input: arr[] = [1, 2, 3, 4, 5], k = 4
           Output: 3
           Explanation: 4 appears at index 3.
           Input: arr[] = [11, 22, 33, 44, 55], k = 445
           Output: -1
           Explanation: 445 is not present.
           Input: arr[] = [1, 1, 1, 1, 2], k = 1
           Output: 0
           Explanation: 1 appears at index 0.`
    ];
    // Render questions
    const container = document.getElementById('questionsContainer');
    questions.forEach((q, index) => {

        const qNum = index + 1;

        const savedAnswer = localStorage.getItem(`answer_${qNum}`) || "";

        const div = document.createElement('div');
        div.className = 'question-card';

        div.innerHTML = `
        <div class="question-number">Question ${qNum}</div>
        <div class="question-text"><pre>${q}</pre></div>
        <textarea id="answer_${qNum}" placeholder="Type your answer here...">${savedAnswer}</textarea>
    `;

        container.appendChild(div);

    });

    // Auto-save answers every 10 seconds
    setInterval(() => {

        for (let i = 1; i <= questions.length; i++) {

            const textarea = document.getElementById(`answer_${i}`);

            if (textarea) {
                localStorage.setItem(`answer_${i}`, textarea.value);
            }

        }

        console.log("Answers auto-saved");

    }, 10000);

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
    const EXAM_DURATION_MS = 30 * 60 * 1000;
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
        for (let i = 1; i <= questions.length; i++) {
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
                localStorage.clear();
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
                let examSubmitted = false;
                if (!isAuto) alert("Error submitting exam. Please check with an admin.");
            }
        } catch (e) {
            examSubmitted = false;
            if (!isAuto) alert("Network error. Could not submit.");
        }
    };

    document.getElementById('finalSubmitBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to submit? You cannot undo this.")) {
            submitExam(false);
        }
    });

    document.getElementById('submitExamBtnTop').addEventListener('click', () => {
        if (confirm("Are you sure you want to submit? You cannot undo this.")) {
            submitExam(false);
        }
    });

}
