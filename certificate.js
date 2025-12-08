let allUserQuizzes = [];
let selectedQuizData = null;

function initCertificatePage() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    document.getElementById('noQuizzesMessage').style.display = 'block';
    document.getElementById('noQuizzesMessage').innerHTML = `
      <p>🔐 Please login first to generate a certificate.</p>
      <a href="index.html" class="btn-start-quiz">Back to Home</a>
    `;
    // Center the navigation bar
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.add('centered');
    return;
  }
  
  const allScores = JSON.parse(localStorage.getItem("scores")) || {};
  allUserQuizzes = allScores[currentUser.email] || [];
  
  if (allUserQuizzes.length === 0) {
    document.getElementById('noQuizzesMessage').style.display = 'block';
    // Center the navigation bar
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.add('centered');
    return;
  }
  
  const quizSelect = document.getElementById('quizSelect');
  allUserQuizzes.forEach((quiz, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${quiz.topic || quiz.branch} - ${quiz.percentage}% (${quiz.timestamp ? new Date(quiz.timestamp).toLocaleDateString() : 'N/A'})`;
    quizSelect.appendChild(option);
  });
  
  document.getElementById('quizSelectionForm').style.display = 'block';
  document.getElementById('certFullName').value = currentUser.name || currentUser.email;
}

function loadQuizData() {
  const quizIndex = document.getElementById('quizSelect').value;
  if (quizIndex === '') {
    selectedQuizData = null;
    document.getElementById('certificate').style.display = 'none';
    document.getElementById('certActions').style.display = 'none';
    return;
  }
  
  selectedQuizData = allUserQuizzes[quizIndex];
  const percentage = selectedQuizData.percentage || 0;
  let grade = 'C';
  
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  
  document.getElementById('certBranch').value = selectedQuizData.branch || 'General';
  document.getElementById('certTopic').value = selectedQuizData.topic || 'Unknown Course';
  document.getElementById('certScore').value = `${selectedQuizData.score}/${selectedQuizData.totalQuestions || 'N/A'}`;
  document.getElementById('certPercentage').value = `${selectedQuizData.percentage}%`;
  
  const dateObj = new Date(selectedQuizData.timestamp);
  document.getElementById('certDate').value = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const gradeDisplay = document.getElementById('gradeDisplay');
  gradeDisplay.textContent = grade;
  document.getElementById('certGrade').value = grade;
}

function generateCertificate() {
  if (!selectedQuizData) {
    alert('Please select a quiz first');
    return;
  }
  
  const name = document.getElementById('certFullName').value.trim();
  const topic = document.getElementById('certTopic').value.trim();
  const score = document.getElementById('certScore').value.trim();
  const grade = document.getElementById('certGrade').value;
  const dateStr = document.getElementById('certDate').value;
  
  if (!name || !topic) {
    alert('Error: Missing required information');
    return;
  }
  
  document.getElementById('displayName').textContent = name;
  document.getElementById('displayCourse').textContent = topic;
  document.getElementById('displayScore').textContent = score;
  document.getElementById('displayGrade').textContent = grade;
  document.getElementById('displayDate').textContent = dateStr;
  
  document.getElementById('certificate').style.display = 'block';
  document.getElementById('certActions').style.display = 'flex';
  document.getElementById('certificate').scrollIntoView({ behavior: 'smooth' });
}

function downloadCertificate() {
  const name = document.getElementById('certFullName').value.trim();
  if (!name || !selectedQuizData) {
    alert('Please generate a certificate first');
    return;
  }
  
  const element = document.getElementById('certificate');
  const opt = {
    margin: 10,
    filename: `Certificate_${name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
  };
  
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    alert('PDF generation requires external library. Please print instead or contact support.');
  }
}

function printCertificate() {
  const name = document.getElementById('certFullName').value.trim();
  if (!name || !selectedQuizData) {
    alert('Please generate a certificate first');
    return;
  }
  
  const printWindow = window.open('', '', 'height=600,width=800');
  const certElement = document.getElementById('certificate');
  const certStyle = window.getComputedStyle(certElement).cssText.replace(/"/g, "'");
  
  printWindow.document.write(
    '<!DOCTYPE html><html><head><title>Print Certificate</title><style>body { margin: 0; padding: 20px; font-family: \'Georgia\', serif; }.certificate { ' + certStyle + ' }</style></head><body onload="window.print()">' + certElement.innerHTML + '</body></html>'
  );
  printWindow.document.close();
}

document.addEventListener('DOMContentLoaded', initCertificatePage);

// Highlight active navigation link
document.addEventListener("DOMContentLoaded", function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
