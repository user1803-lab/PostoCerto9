const ratings = document.querySelectorAll(".rating");
const surveySection = document.querySelector(".survey-card");
const prizeSection = document.getElementById("prizeSection");
const reveal = document.getElementById("reveal");
const prizeName = document.getElementById("prizeName");
const toast = document.getElementById("toast");

const STORAGE_KEY = "postoCerto09Participacao";
const COOLDOWN_MS = 5 * 60 * 1000;

let selectedRating = null;
let cooldownInterval = null;

ratings.forEach(button => {
  button.addEventListener("click", () => {
    // Não permite iniciar uma nova participação durante o período de 5 minutos.
    if (isCooldownActive()) {
      restoreParticipation();
      return;
    }

    ratings.forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedRating = button.dataset.rating;

    prizeSection.classList.remove("hidden");

    setTimeout(() => {
      prizeSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  });
});

document.querySelectorAll(".balloon-choice").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedRating || isCooldownActive()) return;

    const prize = button.dataset.prize;
    const participacao = button.dataset.balloon;
    const startedAt = Date.now();
    const expiresAt = startedAt + COOLDOWN_MS;

    prizeName.textContent = `Você ganhou uma ${prize.toLowerCase()}!`;

    // O prêmio e o horário de início ficam salvos para que um refresh
    // não permita uma segunda participação antes dos 5 minutos.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      rating: selectedRating,
      prize,
      startedAt,
      expiresAt
    }));

    lockParticipation();
    reveal.classList.remove("hidden");
    startCountdown(expiresAt);

    setTimeout(() => {
      reveal.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  });
});

function isCooldownActive() {
  const saved = readParticipation();
  return saved && Number(saved.expiresAt) > Date.now();
}

function readParticipation() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function lockParticipation() {
  // Esconde a enquete e a escolha dos balões enquanto o cronômetro estiver ativo.
  surveySection.classList.add("hidden");
  prizeSection.classList.add("hidden");

  document.querySelectorAll(".balloon-choice").forEach(item => {
    item.disabled = true;
    item.style.pointerEvents = "none";
  });
}

function unlockParticipation() {
  localStorage.removeItem(STORAGE_KEY);

  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }

  selectedRating = null;
  ratings.forEach(item => item.classList.remove("selected"));

  document.querySelectorAll(".balloon-choice").forEach(item => {
    item.disabled = false;
    item.style.pointerEvents = "auto";
  });

  reveal.classList.add("hidden");
  prizeSection.classList.add("hidden");
  surveySection.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startCountdown(expiresAt) {
  if (cooldownInterval) clearInterval(cooldownInterval);

  const update = () => {
    const remaining = Number(expiresAt) - Date.now();

    if (remaining <= 0) {
      unlockParticipation();
      showToast("Você já pode participar novamente!");
      return;
    }

    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

  };

  update();
  cooldownInterval = setInterval(update, 250);
}

function restoreParticipation() {
  const data = readParticipation();

  if (!data || Number(data.expiresAt) <= Date.now()) {
    unlockParticipation();
    return;
  }

  selectedRating = data.rating || null;
  prizeName.textContent = `Você ganhou uma ${String(data.prize).toLowerCase()}!`;

  lockParticipation();
  reveal.classList.remove("hidden");
  startCountdown(Number(data.expiresAt));

  showToast("Esta participação ainda está ativa. Aguarde o cronômetro terminar.");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

async function enviarAvaliacao(avaliacao, premio, participacao) {
  const url = "https://script.google.com/macros/s/AKfycbyt11ogaF4YIcAlHOfImkegFk7Gs6DJIBDQwqvywFFJtvVt0tqqhDZbR2MNGerqLFYy9g/exec";

  const dados = {
    avaliacao: avaliacao,
    premio: premio,
    participacao: participacao
  };

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(dados)
    });

    console.log("Avaliação enviada para o Google Sheets.");
  } catch (erro) {
    console.error("Erro ao enviar avaliação:", erro);
  }
}

// Ao abrir ou atualizar a página, verifica se ainda existe uma participação
// dentro dos 5 minutos. Assim o cliente não consegue jogar novamente apenas
// recarregando o navegador.
const previous = readParticipation();

if (previous && Number(previous.expiresAt) > Date.now()) {
  restoreParticipation();
} else if (previous) {
  localStorage.removeItem(STORAGE_KEY);
}
