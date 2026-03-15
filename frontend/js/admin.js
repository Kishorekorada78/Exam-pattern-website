const API_URL = 'http://localhost:8080/api';

async function fetchStudents() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/admin/students`);
        const students = await response.json();
        
        tbody.innerHTML = '';
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students registered yet.</td></tr>';
            return;
        }

        students.forEach(s => {
            const tr = document.createElement('tr');
            
            const badgeClass = s.examSubmitted ? 'badge-success' : 'badge-danger';
            const statusText = s.examSubmitted ? 'Submitted' : 'In Progress';
            
            const switchBadge = s.tabSwitchCount > 2 ? 'badge-danger' : 
                                s.tabSwitchCount > 0 ? 'badge-danger' : 'badge-success'; // Mark any > 0 as danger or warning

            tr.innerHTML = `
                <td>${s.id}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.rollNumber}</td>
                <td>${s.email}</td>
                <td><span class="badge ${switchBadge}">${s.tabSwitchCount}</span></td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>
                    <button class="btn primary-btn sm" onclick="viewAnswers(${s.id}, '${s.name}')" ${!s.examSubmitted ? 'disabled' : ''}>
                        View Answers
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">Error connecting to backend (${e.message})</td></tr>`;
    }
}

async function viewAnswers(studentId, name) {
    const container = document.getElementById('answersContainer');
    container.innerHTML = '<p>Loading answers...</p>';
    
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('answersModal').style.display = 'block';
    
    try {
        const response = await fetch(`${API_URL}/admin/students/${studentId}/answers`);
        const answers = await response.json();
        
        container.innerHTML = `<h3 style="margin-bottom: 20px;">Candidate: ${name}</h3>`;
        
        if (answers.length === 0) {
            container.innerHTML += '<p>No answers submitted.</p>';
            return;
        }

        // Sort by question number
        answers.sort((a,b) => a.questionNumber - b.questionNumber);
        
        answers.forEach(ans => {
            container.innerHTML += `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong style="color: var(--primary-color);">Question ${ans.questionNumber}</strong>
                    <pre style="margin-top: 10px; white-space: pre-wrap; font-family: monospace; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px;">${ans.answerText || '<i>No answer provided</i>'}</pre>
                </div>
            `;
        });
        
    } catch (e) {
        container.innerHTML = `<p style="color: var(--danger-color)">Error loading answers.</p>`;
    }
}

function closeAnswersModal() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('answersModal').style.display = 'none';
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchStudents);
