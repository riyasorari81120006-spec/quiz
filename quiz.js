// =========================
// QUIZ.JS (FINAL VERSION)
// =========================

// Logged-in user
const currentUser = JSON.parse(localStorage.getItem("user")) || null;

// Global quiz variables
let questions = [];
let currentIndex = 0;
let score = 0;

// HTML elements
const questionBox = document.getElementById("questionBox");
const optionsBox = document.getElementById("optionsBox");
const nextBtn = document.getElementById("nextBtn");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");

// ======================
// LOAD QUESTIONS
// ======================
async function loadQuestions() {
    try {
        const res = await fetch("../data/questions.json");  // update path if needed
        questions = await res.json();

        if (!questions.length) throw new Error("No questions");

        showQuestion();
    } catch (err) {
        alert("Failed to load questions. Check questions.json path.");
    }
}

// ======================
// DISPLAY QUESTION
// ======================
function showQuestion() {
    const q = questions[currentIndex];

    questionBox.textContent = `Q${currentIndex + 1}. ${q.question}`;
    optionsBox.innerHTML = "";

    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(i);
        optionsBox.appendChild(btn);
    });
}

// ======================
// SELECT ANSWER
// ======================
function selectAnswer(selected) {
    const correct = questions[currentIndex].answer;

    if (selected === correct) score++;

    nextBtn.style.display = "block";
}

// ======================
// NEXT QUESTION HANDLER
// ======================
nextBtn.addEventListener("click", () => {
    currentIndex++;

    if (currentIndex < questions.length) {
        nextBtn.style.display = "none";
        showQuestion();
    } else {
        finishQuiz();
    }
});

// ======================
// FINISH QUIZ
// ======================
function finishQuiz() {
    document.getElementById("quizContainer").style.display = "none";
    resultBox.style.display = "block";

    scoreText.textContent = `Your Score: ${score}/${questions.length}`;

    saveScoreToBackend();
}

// ======================
// SAVE SCORE TO BACKEND
// ======================
async function saveScoreToBackend() {
    const scoreObj = {
        email: currentUser?.email || "guest",
        name: currentUser?.name || "Guest",
        branch: currentUser?.branch || "N/A",
        topic: "General Quiz",
        score: score,
        totalQuestions: questions.length
    };

    try {
        const res = await fetch("http://localhost:3000/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scoreObj)
        });

        if (!res.ok) throw new Error("Backend error");

        console.log("Score saved to backend ✔");
    } catch (error) {
        console.warn("Backend unavailable → saving locally");

        // Local fallback
        const localData = JSON.parse(localStorage.getItem("scores")) || {};
        localData[scoreObj.email] = localData[scoreObj.email] || [];
        localData[scoreObj.email].push(scoreObj);

        localStorage.setItem("scores", JSON.stringify(localData));
    }
}

// ======================
// START QUIZ
// ======================
document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});
