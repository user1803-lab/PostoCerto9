const ratings = document.querySelectorAll(".rating");
const prizeSection = document.getElementById("prizeSection");
const reveal = document.getElementById("reveal");
const prizeName = document.getElementById("prizeName");
const codeElement = document.getElementById("code");
const toast = document.getElementById("toast");

let selectedRating = null;

ratings.forEach(button => {
  button.addEventListener("click", () => {
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
    if (!selectedRating) return;

    const prize = button.dataset.prize;
    prizeName.textContent = `Você ganhou uma ${prize.toLowerCase()}!`;

    const code = generateCode();
    codeElement.textContent = `CÓDIGO: ${code}`;

    document.querySelectorAll(".balloon-choice").forEach(item => {
      item.disabled = true;
      item.style.pointerEvents = "none";
    });

    reveal.classList.remove("hidden");

    setTimeout(() => {
      reveal.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    // Salva somente neste aparelho/navegador.
    // Isto NÃO impede tentativas em outro aparelho ou após limpar os dados.
    localStorage.setItem("postoCerto09Participacao", JSON.stringify({
      rating: selectedRating,
      prize,
      code,
      date: new Date().toISOString()
    }));
  });
});

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PC09-${result}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Detecta participação anterior neste aparelho.
const previous = localStorage.getItem("postoCerto09Participacao");
if (previous) {
  try {
    const data = JSON.parse(previous);
    showToast(`Este aparelho já participou e recebeu o código ${data.code}.`);
  } catch {
    localStorage.removeItem("postoCerto09Participacao");
  }
}
