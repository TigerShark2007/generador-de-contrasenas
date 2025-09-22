const passwordField = document.getElementById("password");
const lengthField = document.getElementById("length");
const noteField = document.getElementById("note");
const historyList = document.getElementById("history");
const strengthFill = document.getElementById("strength-fill");

// Generar contraseña
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

// Fuerza de la contraseña
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

// Guardar historial con nota
function saveToHistory(password, note) {
  const li = document.createElement("li");
  const timestamp = new Date().toLocaleString();

  const noteBox = document.createElement("div");
  noteBox.className = "history-note";
  noteBox.textContent = note ? note : "Sin nota";

  const passBox = document.createElement("div");
  passBox.className = "history-pass";
  passBox.textContent = `${password} (${timestamp})`;

  // Botones extra
  const buttons = document.createElement("div");
  buttons.className = "history-buttons";

  // Copiar
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(password);
    showToast("✅ Copiada");
  };

  // Editar nota
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = () => {
    const newNote = prompt("Editar nota:", noteBox.textContent);
    if (newNote !== null) {
      noteBox.textContent = newNote || "Sin nota";
    }
  };

  // Favorito
  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐";
  favBtn.onclick = () => {
    li.classList.toggle("favorite");
    if (li.classList.contains("favorite")) {
      historyList.prepend(li);
    }
  };

  // Eliminar
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => li.remove();

  buttons.append(copyBtn, editBtn, favBtn, delBtn);

  li.append(noteBox, passBox, buttons);
  historyList.prepend(li);
}

// Copiar desde el botón principal
document.getElementById("copy").addEventListener("click", () => {
  if (!passwordField.value) return;
  navigator.clipboard.writeText(passwordField.value).then(() => {
    showToast("✅ Contraseña copiada");
  });
});

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 2500);
}

// Buscar en historial
document.getElementById("search").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  Array.from(historyList.children).forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(term) ? "flex" : "none";
  });
});

// Exportar historial
document.getElementById("export-history").addEventListener("click", () => {
  const data = Array.from(historyList.children).map(li => ({
    note: li.querySelector(".history-note").textContent,
    pass: li.querySelector(".history-pass").textContent
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historial.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Importar historial
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-history").click();
});
document.getElementById("import-history").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const items = JSON.parse(ev.target.result);
      items.forEach(i => saveToHistory(i.pass.split(" (")[0], i.note));
      showToast("📂 Historial importado");
    } catch {
      showToast("⚠️ Archivo inválido");
    }
  };
  reader.readAsText(file);
});

// Eventos básicos
document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("toggle-history").addEventListener("click", () => {
  document.getElementById("history-panel").classList.add("open");
});
document.getElementById("close-history").addEventListener("click", () => {
  document.getElementById("history-panel").classList.remove("open");
});
document.getElementById("clear-history").addEventListener("click", () => {
  historyList.innerHTML = "";
});
