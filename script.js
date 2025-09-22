const passwordInput = document.getElementById("password");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");
const strengthBar = document.getElementById("strength-bar");
const noteInput = document.getElementById("note");
const historyBtn = document.getElementById("history");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const closeHistory = document.getElementById("close-history");
const clearHistory = document.getElementById("clear-history");

let editingNoteElement = null;

// Generar contraseña
function generatePassword() {
  const length = document.getElementById("length").value;
  const uppercase = document.getElementById("uppercase").checked ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "";
  const lowercase = document.getElementById("lowercase").checked ? "abcdefghijklmnopqrstuvwxyz" : "";
  const numbers = document.getElementById("numbers").checked ? "0123456789" : "";
  const symbols = document.getElementById("symbols").checked ? "!@#$%^&*()_+{}[]<>?,." : "";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";

  for (let i = 0; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  passwordInput.value = password;
  updateStrength(password);
  saveToHistory(password, noteInput.value || "Sin nota");
}

// Fuerza de contraseña
function updateStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  strengthBar.style.width = `${(strength / 5) * 100}%`;
  strengthBar.style.background = strength < 3 ? "#e74c3c" : strength < 5 ? "#f1c40f" : "#2ecc71";
}

// Guardar en historial
function saveToHistory(password, note) {
  const item = document.createElement("div");
  item.classList.add("history-item");

  const span = document.createElement("span");
  span.textContent = `${note} ➝ ${password}`;
  item.appendChild(span);

  const buttons = document.createElement("div");
  buttons.classList.add("history-buttons");

  // Botón editar
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = () => openEditModal(span);
  buttons.appendChild(editBtn);

  // Botón copiar
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋";
  copyBtn.onclick = () => navigator.clipboard.writeText(password);
  buttons.appendChild(copyBtn);

  // Botón eliminar
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = () => item.remove();
  buttons.appendChild(deleteBtn);

  item.appendChild(buttons);
  historyList.appendChild(item);
}

// Modal editar nota
function openEditModal(noteElement) {
  editingNoteElement = noteElement;
  document.getElementById("edit-input").value = noteElement.textContent;
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("edit-modal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.getElementById("edit-modal").style.display = "none";
  editingNoteElement = null;
}

document.getElementById("save-edit").addEventListener("click", () => {
  if (editingNoteElement) {
    editingNoteElement.textContent = document.getElementById("edit-input").value || "Sin nota";
  }
  closeEditModal();
});

document.getElementById("cancel-edit").addEventListener("click", closeEditModal);
document.getElementById("modal-overlay").addEventListener("click", closeEditModal);

// Eventos principales
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(passwordInput.value);
});

historyBtn.addEventListener("click", () => {
  historyPanel.classList.add("show");
});

closeHistory.addEventListener("click", () => {
  historyPanel.classList.remove("show");
});

clearHistory.addEventListener("click", () => {
  historyList.innerHTML = "";
});
