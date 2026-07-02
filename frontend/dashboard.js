const API_BASE = "https://personal-diary-app-i13d.onrender.com/api/entries";

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

// ===== Auth guard: agar token nahi hai, login page pe bhej do =====
if (!token) {
  window.location.href = "index.html";
}

// ===== Welcome text set karo =====
document.getElementById("welcomeText").textContent = `Hi, ${username}`;

// ===== Elements =====
const entryForm = document.getElementById("entryForm");
const entryTitle = document.getElementById("entryTitle");
const entryContent = document.getElementById("entryContent");
const entryTitleError = document.getElementById("entryTitleError");
const entryContentError = document.getElementById("entryContentError");
const entrySubmitBtn = document.getElementById("entrySubmitBtn");
const entriesList = document.getElementById("entriesList");
const logoutBtn = document.getElementById("logoutBtn");

let editingEntryId = null; // null = create mode, warna edit mode

// ===== Logout =====
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// ===== Fetch aur render entries =====
async function loadEntries() {
  try {
    const response = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return;
    }

    const entries = await response.json();
    renderEntries(entries);
  } catch (error) {
    entriesList.innerHTML = `<p class="empty-entries">Could not load entries. Is the server running?</p>`;
  }
}

function renderEntries(entries) {
  if (entries.length === 0) {
    entriesList.innerHTML = `<p class="empty-entries">No entries yet — write your first one!</p>`;
    return;
  }

  // Newest first
  const sorted = [...entries].reverse();

  entriesList.innerHTML = sorted
    .map((entry) => {
      const date = new Date(entry.createdAt).toLocaleString();
      return `
        <div class="entry-card">
          <h3>${escapeHtml(entry.title)}</h3>
          <p class="entry-date">${date}</p>
          <p>${escapeHtml(entry.content)}</p>
          <div class="entry-actions">
            <button class="edit-entry-btn" data-id="${entry.id}">Edit</button>
            <button class="delete-entry-btn" data-id="${entry.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach event listeners after render
  document.querySelectorAll(".edit-entry-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.id, entries));
  });

  document.querySelectorAll(".delete-entry-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteEntry(btn.dataset.id));
  });
}

// Basic XSS-safe rendering
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Create / Update submit =====
entryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = entryTitle.value.trim();
  const content = entryContent.value.trim();

  entryTitleError.textContent = "";
  entryContentError.textContent = "";

  let hasError = false;

  if (!title) {
    entryTitleError.textContent = "Title is required";
    hasError = true;
  }

  if (!content) {
    entryContentError.textContent = "Content is required";
    hasError = true;
  }

  if (hasError) return;

  try {
    let response;

    if (editingEntryId) {
      // UPDATE
      response = await fetch(`${API_BASE}/${editingEntryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
    } else {
      // CREATE
      response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
    }

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Something went wrong");
      return;
    }

    // Reset form back to create mode
    entryForm.reset();
    editingEntryId = null;
    entrySubmitBtn.textContent = "Add Entry";

    loadEntries();
  } catch (error) {
    alert("Could not connect to server");
  }
});

// ===== Start editing an entry =====
function startEdit(id, entries) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;

  entryTitle.value = entry.title;
  entryContent.value = entry.content;
  editingEntryId = id;
  entrySubmitBtn.textContent = "Update Entry";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== Delete entry =====
async function deleteEntry(id) {
  const confirmed = confirm("Delete this entry? This cannot be undone.");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      alert("Could not delete entry");
      return;
    }

    loadEntries();
  } catch (error) {
    alert("Could not connect to server");
  }
}

// ===== Initial load =====
loadEntries();