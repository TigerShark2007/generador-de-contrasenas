// === ELEMENTOS GENERALES ===
const passwordField = document.getElementById("password");
const lengthField = document.getElementById("length");
const noteField = document.getElementById("note");
const historyList = document.getElementById("history");
const strengthFill = document.getElementById("strength-fill");

// === GENERADOR ===
function generatePassword() {
  const length = lengthField.value;
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  let chars = "";
  if (document.getElementById("uppercase").checked) chars += upper;
  if (document.getElementById("lowercase").checked) chars += lower;
  if (document.getElementById("numbers").checked) chars += numbers;
  if (document.getElementById("symbols").checked) chars += symbols;

  if (!chars) {
    passwordField.value = "Selecciona al menos 1 opción";
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  passwordField.value = password;
  updateStrength(password);
  saveToHistory(password, noteField.value);
  noteField.value = "";
}

function updateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const width = (score / 4) * 100;
  strengthFill.style.width = width + "%";

  if (score <= 1) strengthFill.style.background = "red";
  else if (score === 2) strengthFill.style.background = "orange";
  else if (score === 3) strengthFill.style.background = "yellow";
  else strengthFill.style.background = "limegreen";
}

// === HISTORIAL ===
function saveToHistory(password, note) {
  const li = document.createElement("li");
  const timestamp = new Date().toLocaleString();

  const noteBox = document.createElement("div");
  noteBox.className = "history-note";
  noteBox.textContent = note || "Sin nota";

  const passBox = document.createElement("div");
  passBox.className = "history-pass";
  passBox.textContent = `${password} (${timestamp})`;

  const buttons = document.createElement("div");
  buttons.className = "history-buttons";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(password);
    showToast("✅ Copiada");
  };

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = () => {
    const newNote = prompt("Editar nota:", noteBox.textContent);
    if (newNote !== null) noteBox.textContent = newNote || "Sin nota";
  };

  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐";
  favBtn.onclick = () => {
    li.classList.toggle("favorite");
    if (li.classList.contains("favorite")) historyList.prepend(li);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => li.remove();

  buttons.append(copyBtn, editBtn, favBtn, delBtn);
  li.append(noteBox, passBox, buttons);
  historyList.prepend(li);
}

// === TOAST ===
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => toast.className = toast.className.replace("show", ""), 2500);
}

// === EXPORTAR / IMPORTAR ===
document.getElementById("export-history").addEventListener("click", () => {
  const items = Array.from(historyList.children).map(li => {
    const note = li.querySelector(".history-note")?.textContent || "";
    const text = li.querySelector(".history-pass")?.textContent || "";
    const match = text.match(/^(.*)\s\((.*)\)$/);
    const pass = match ? match[1] : text;
    const timestamp = match ? match[2] : "";
    return { note, pass, timestamp };
  });

  const json = JSON.stringify(items, null, 2);
  const txt = items.map(i => `${i.note} - ${i.pass} (${i.timestamp})`).join("\n");

  const zip = new JSZip();
  zip.file("historial.json", json);
  zip.file("historial.txt", txt);

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "contraseñas.zip";
    a.click();
    showToast("✅ Exportado contraseñas.zip");
  });
});

// === PANEL HISTORIAL ===
document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("copy").addEventListener("click", () => {
  if (!passwordField.value) return;
  navigator.clipboard.writeText(passwordField.value);
  showToast("✅ Copiada");
});
document.getElementById("toggle-history").addEventListener("click", () =>
  document.getElementById("history-panel").classList.add("open"));
document.getElementById("close-history").addEventListener("click", () =>
  document.getElementById("history-panel").classList.remove("open"));
document.getElementById("clear-history").addEventListener("click", () =>
  historyList.innerHTML = "");

// === VERIFICADOR ===
const verifyInput = document.getElementById("verify-input");
const verifyBtn = document.getElementById("verify-btn");
const verifyStrengthFill = document.getElementById("verify-strength-fill");
const improveBtn = document.getElementById("improve-btn");
const improvedPassword = document.getElementById("improved-password");

function verifyStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const width = (score / 5) * 100;
  verifyStrengthFill.style.width = width + "%";

  if (score <= 2) verifyStrengthFill.style.background = "red";
  else if (score === 3) verifyStrengthFill.style.background = "orange";
  else if (score === 4) verifyStrengthFill.style.background = "yellow";
  else verifyStrengthFill.style.background = "limegreen";
}

verifyBtn.addEventListener("click", () => {
  const password = verifyInput.value.trim();
  if (!password) {
    showToast("⚠️ Escribe una contraseña");
    return;
  }
  verifyStrength(password);
  showToast("🔍 Contraseña verificada");
});

improveBtn.addEventListener("click", () => {
  const oldPassword = verifyInput.value.trim();
  if (!oldPassword) {
    showToast("⚠️ Primero escribe una contraseña");
    return;
  }

  const all = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let newPass = "";
  for (let i = 0; i < Math.max(12, oldPassword.length + 2); i++) {
    newPass += all.charAt(Math.floor(Math.random() * all.length));
  }

  improvedPassword.value = newPass;
  verifyStrength(newPass);
  saveToHistory(newPass, "Rehecha desde verificador");
  showToast("♻️ Contraseña mejorada");
});
