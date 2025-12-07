// ===== VARIABLES =====
let students = [];
const STORAGE_KEY = "gcw_students_data";

// ===== DOM ELEMENTS =====
const studentForm = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const filterSem = document.getElementById('filterSem');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const statusMessage = document.getElementById('statusMessage');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    updateClock();
    setInterval(updateClock, 1000);
    setupEventListeners();
    showStatus('Welcome to Student Dashboard!', 'info');
});

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    currentDate.textContent = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ===== DATA MANAGEMENT =====
function loadStudents() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            students = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        students = [];
    }
    renderTable();
}

function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        console.error('Error saving students:', error);
        showStatus('Error saving data!', 'error');
    }
}

// ===== TABLE RENDERING =====
function renderTable(data = students) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    data.forEach((student, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="table-cell">
                <strong>#${student.rollNo}</strong>
            </td>
            <td class="table-cell">
                ${student.name}
            </td>
            <td>
                <span class="badge">${student.semester || 'N/A'}</span>
            </td>
            <td class="table-cell">
                <div class="contact-details">
                    ${student.email ? `<div><i class="fas fa-envelope"></i> ${student.email}</div>` : ''}
                    ${student.phone ? `<div><i class="fas fa-phone"></i> ${student.phone}</div>` : ''}
                    ${!student.email && !student.phone ? '<div>No contact info</div>' : ''}
                </div>
            </td>
            <td class="action-cell">
                <div class="action-buttons">
                    <button class="btn btn-small btn-outline" onclick="editStudent(${index})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteStudent(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ===== FORM HANDLING =====
studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentData = {
        name: document.getElementById('name').value.trim(),
        rollNo: document.getElementById('rollNo').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        semester: document.getElementById('semester').value,
        timestamp: new Date().toISOString()
    };
    
    if (!validateStudent(studentData)) return;
    
    const editIndex = document.getElementById('editIndex').value;
    
    if (editIndex === "-1") {
        if (students.some(s => s.rollNo === studentData.rollNo)) {
            showStatus('Roll number already exists!', 'error');
            return;
        }
        students.push(studentData);
        showStatus('Student added successfully!', 'success');
    } else {
        students[editIndex] = studentData;
        showStatus('Student updated successfully!', 'success');
        resetForm();
    }
    
    saveStudents();
    renderTable();
    if (editIndex === "-1") this.reset();
});

function validateStudent(student) {
    if (!student.name) {
        showStatus('Full Name is required!', 'error');
        document.getElementById('name').focus();
        return false;
    }
    
    if (!student.rollNo) {
        showStatus('Roll Number is required!', 'error');
        document.getElementById('rollNo').focus();
        return false;
    }
    
    if (!student.semester) {
        showStatus('Please select a semester!', 'error');
        document.getElementById('semester').focus();
        return false;
    }
    
    return true;
}

// ===== STUDENT OPERATIONS =====
window.editStudent = function(index) {
    const student = students[index];
    
    document.getElementById('name').value = student.name;
    document.getElementById('rollNo').value = student.rollNo;
    document.getElementById('email').value = student.email || '';
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('semester').value = student.semester;
    document.getElementById('editIndex').value = index;
    
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
    submitBtn.className = 'btn btn-primary';
    
    showStatus(`Editing: ${student.name}`, 'info');
};

window.deleteStudent = function(index) {
    const studentName = students[index].name;
    
    if (confirm(`Delete student "${studentName}"?`)) {
        students.splice(index, 1);
        saveStudents();
        renderTable();
        showStatus(`Deleted: ${studentName}`, 'success');
    }
};

window.clearForm = function() {
    if (confirm('Clear all form fields?')) {
        studentForm.reset();
        document.getElementById('editIndex').value = "-1";
        submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
        submitBtn.className = 'btn btn-primary';
        showStatus('Form cleared!', 'info');
    }
};

function resetForm() {
    studentForm.reset();
    document.getElementById('editIndex').value = "-1";
    submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
    submitBtn.className = 'btn btn-primary';
}

// ===== SEARCH AND FILTER =====
function handleSearch() {
    const query = searchInput.value.toLowerCase();
    const semester = filterSem.value;
    
    const filtered = students.filter(student => {
        const matchesSearch = 
            student.name.toLowerCase().includes(query) || 
            student.rollNo.toLowerCase().includes(query);
        const matchesSemester = !semester || student.semester === semester;
        return matchesSearch && matchesSemester;
    });
    
    renderTable(filtered);
    
    if (query || semester) {
        showStatus(`Found ${filtered.length} result(s)`, 'info');
    }
}

// ===== EXTERNAL DATA =====
document.getElementById('fetchApiBtn').addEventListener('click', function() {
    const btn = this;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    showStatus('Loading sample data...', 'info');
    
    setTimeout(() => {
        const sampleStudents = [
            {
                name: 'Aamina Rashid',
                rollNo: '2023001',
                email: 'aamina@college.edu',
                phone: '9876543210',
                semester: '4th Sem'
            },
            {
                name: 'Sarah Khan',
                rollNo: '2023002',
                email: 'sarah@college.edu',
                phone: '9876543211',
                semester: '3rd Sem'
            },
            {
                name: 'Zainab Ahmed',
                rollNo: '2023003',
                email: 'zainab@college.edu',
                phone: '9876543212',
                semester: '5th Sem'
            }
        ];
        
        sampleStudents.forEach(s => s.timestamp = new Date().toISOString());
        students = [...students, ...sampleStudents];
        saveStudents();
        renderTable();
        
        showStatus(`Added ${sampleStudents.length} sample students!`, 'success');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
});

// ===== EXPORT DATA =====
document.getElementById('exportBtn').addEventListener('click', function() {
    if (students.length === 0) {
        showStatus('No data to export!', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(students, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `student_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus(`Exported ${students.length} students`, 'success');
});

// ===== CLEAR ALL RECORDS =====
document.getElementById('clearRecordsBtn').addEventListener('click', function() {
    if (students.length === 0) {
        showStatus('No records to clear!', 'info');
        return;
    }
    
    if (confirm(`Clear ALL ${students.length} student records?`)) {
        students = [];
        localStorage.removeItem(STORAGE_KEY);
        renderTable();
        showStatus('All records cleared!', 'success');
    }
});

// ===== STATUS MESSAGES =====
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    if (type === 'success') {
        statusMessage.classList.add('status-success');
    } else if (type === 'error') {
        statusMessage.classList.add('status-error');
    } else {
        statusMessage.classList.add('status-info');
    }
    
    setTimeout(() => {
        if (statusMessage.textContent === message) {
            statusMessage.className = 'status-message';
            statusMessage.textContent = '';
        }
    }, 4000);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    filterSem.addEventListener('change', handleSearch);
    
    window.addEventListener('resize', function() {
        updateClock();
        renderTable(); // Re-render for responsive adjustments
    });
}