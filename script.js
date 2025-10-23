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

// Exportar historial en un ZIP con JSON y TXT
document.getElementById("export-history").addEventListener("click", () => {
  const items = Array.from(historyList.children).map(li => {
    const noteEl = li.querySelector(".history-note");
    const passEl = li.querySelector(".history-pass");
    const note = noteEl ? noteEl.textContent : "";
    const passWithTs = passEl ? passEl.textContent : "";
    const match = passWithTs.match(/^(.*)\s\((.*)\)$/);
    const pass = match ? match[1] : passWithTs;
    const timestamp = match ? match[2] : "";
    return { note, pass, timestamp };
  });

  // Contenido JSON
  const jsonContent = JSON.stringify(items, null, 2);

  // Contenido TXT legible
  const txtLines = items.map(it => `${it.note || "Sin nota"} - ${it.pass}${it.timestamp ? " (" + it.timestamp + ")" : ""}`);
  const txtContent = txtLines.join("\n");

  // Crear ZIP
  const zip = new JSZip();
  zip.file("historial.json", jsonContent);
  zip.file("historial.txt", txtContent);

  // Generar y descargar ZIP
  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "contraseñas.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✅ Exportado contraseñas.zip");
  });
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

// === VERIFICADOR DE CONTRASEÑAS ===
const verifyInput = document.getElementById("verify-input");
const verifyBtn = document.getElementById("verify-btn");
const verifyStrengthFill = document.getElementById("verify-strength-fill");
const improveBtn = document.getElementById("improve-btn");
const improvedPassword = document.getElementById("improved-password");

// Función para calcular la fuerza de una contraseña
function calculateStrength(password) {
  let score = 0;

  // Longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Diversidad de caracteres
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 6);
}

// Actualiza la barra visual de fuerza
function updateVerifyStrengthBar(password) {
  const score = calculateStrength(password);
  const width = (score / 6) * 100;
  verifyStrengthFill.style.width = width + "%";

  let color = "red";
  if (score <= 2) color = "red";
  else if (score === 3) color = "orange";
  else if (score === 4) color = "yellow";
  else if (score === 5) color = "limegreen";
  else color = "green";

  verifyStrengthFill.style.backgroundColor = color;
  return score;
}

// Botón de verificar
verifyBtn.addEventListener("click", () => {
  const password = verifyInput.value.trim();
  if (!password) {
    showToast("⚠️ Escribe una contraseña para verificar");
    return;
  }

  const score = updateVerifyStrengthBar(password);
  let msg = "";

  if (score <= 2) msg = "❌ Débil — muy fácil de adivinar";
  else if (score === 3) msg = "⚠️ Media — podría mejorarse";
  else if (score === 4) msg = "✅ Buena — nivel aceptable";
  else msg = "💪 Fuerte — contraseña segura";

  showToast(msg);
});

// Botón de rehacer contraseña
improveBtn.addEventListener("click", () => {
  const oldPassword = verifyInput.value.trim();
  if (!oldPassword) {
    showToast("⚠️ Primero verifica una contraseña");
    return;
  }

  // Generar nueva contraseña fuerte
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";
  const allChars = upper + lower + numbers + symbols;

  let newPassword = "";
  const newLength = Math.max(12, oldPassword.length + 2);

  for (let i = 0; i < newLength; i++) {
    newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  improvedPassword.value = newPassword;
  updateVerifyStrengthBar(newPassword);
  showToast("🔁 Contraseña mejorada generada");

  // Guardar en historial automáticamente
  saveToHistory(newPassword, "Rehecha desde verificador");
});

