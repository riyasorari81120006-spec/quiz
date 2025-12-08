// scores.js

const currentUser = JSON.parse(localStorage.getItem("user")) || null;
const scoresTableBody = document.getElementById("scoresTableBody");

// ---------- GLOBAL TOAST ----------
function showToast(message, duration = 2500) {
  let toast = document.getElementById('global-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'global-toast hidden';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('hidden');

  void toast.offsetWidth;   // restart animation

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, duration);
}

// ---------- RENDER HELPERS ----------
function renderNoUser() {
  scoresTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="no-scores-msg">
        Not logged in — showing all saved scores.
      </td>
    </tr>`;
}

function renderNoScores() {
  scoresTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="no-scores-msg">
        No scores found. Take some quizzes to get started!
      </td>
    </tr>`;
}

// ---------- LOAD SCORES (Backend → Local) ----------
async function loadScores() {
  try {
    const res = await fetch('http://localhost:3000/api/scores');
    if (!res.ok) throw new Error('API error');

    const allScores = await res.json();
    let filteredScores = allScores || [];

    if (currentUser?.email) {
      filteredScores = filteredScores.filter(s => s.email === currentUser.email);
    }

    renderScores(filteredScores);
    return;

  } catch (err) {
    console.warn("Backend unavailable → using localStorage");

    const localData = JSON.parse(localStorage.getItem("scores")) || {};
    let userScores = [];

    if (currentUser?.email) {
      userScores = localData[currentUser.email] || [];
    } else {
      Object.values(localData).forEach(arr => userScores.push(...arr));
      renderNoUser();
    }

    renderScores(userScores);
  }
}

// ---------- RENDER SCORES ----------
function renderScores(userScores) {

  if (!userScores || userScores.length === 0) {
    return renderNoScores();
  }

  scoresTableBody.innerHTML = ""; // clear

  userScores.forEach((entry, index) => {
    const totalQuestions = entry.totalQuestions || 1;
    const percentage = Math.round((entry.score / totalQuestions) * 100);

    let dateStr = "N/A", timeStr = "N/A";

    if (entry.timestamp) {
      const d = new Date(entry.timestamp);
      dateStr = d.toLocaleDateString("en-IN");
      timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } else if (entry.date) {
      dateStr = entry.date;
    }

    const scoreId = entry.id || "";
    const kept = entry.kept ? true : false;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${currentUser?.name || currentUser?.email || "Guest"}</td>
      <td>${entry.branch || "N/A"}</td>
      <td>${entry.topic || entry.chapter || "General Quiz"}</td>
      <td>${entry.score}/${totalQuestions}</td>
      <td><strong>${percentage}%</strong></td>
      <td>${dateStr}</td>
      <td>${timeStr}</td>
      <td class="actions-cell">
        <button class="icon-btn keep ${kept ? 'kept' : ''}" data-id="${scoreId}" title="Keep">🔖</button>
        <button class="icon-btn delete" data-id="${scoreId}" title="Delete">🗑️</button>
      </td>
    `;

    scoresTableBody.appendChild(row);
  });

  attachActionEvents();
}

// ---------- KEEP / DELETE HANDLERS ----------
function attachActionEvents() {
  // ---- KEEP BUTTON ----
  document.querySelectorAll('.icon-btn.keep').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return showToast("Cannot keep: missing ID");

      try {
        const res = await fetch(`http://localhost:3000/api/scores/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kept: true })
        });

        if (!res.ok) throw new Error("Failed");

        btn.classList.add("kept");
        showToast("This quiz is saved!");

      } catch (err) {
        showToast("Failed to save quiz (backend unavailable)");
      }
    });
  });

  // ---- DELETE BUTTON ----
  document.querySelectorAll('.icon-btn.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;

      if (!id) {
        btn.closest("tr")?.remove();
        return;
      }

      if (!confirm("Delete this score?")) return;

      try {
        const res = await fetch(`http://localhost:3000/api/scores/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error("Failed");

        btn.closest("tr")?.remove();

      } catch (err) {
        alert("Failed to delete score (backend unavailable)");
      }
    });
  });
}

// ---------- NAV ACTIVE LINK ----------
document.addEventListener("DOMContentLoaded", () => {
  loadScores();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentPage);
  });
});
