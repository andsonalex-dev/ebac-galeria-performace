const images = Array.isArray(window.GALLERY_IMAGES) ? window.GALLERY_IMAGES : [];

const gallery = document.getElementById("gallery");
const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const viewerSourceAvif = document.getElementById("viewerSourceAvif");
const viewerSourceWebp = document.getElementById("viewerSourceWebp");
const counter = document.getElementById("counter");
const backButton = document.getElementById("backButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentIndex = 0;

function renderGallery() {
  if (!images.length) {
    gallery.innerHTML = '<p class="empty-state">Nenhuma imagem otimizada foi encontrada. Execute o build do projeto.</p>';
    return;
  }

  const cards = images.map((image, index) => {
    const loading = index === 0 ? "eager" : "lazy";
    const fetchPriority = index === 0 ? "high" : "auto";

    return `
      <article class="thumb" data-index="${index}">
        <picture>
          <source type="image/avif" srcset="${image.thumb.avif}">
          <source type="image/webp" srcset="${image.thumb.webp}">
          <img
            src="${image.thumb.fallback}"
            alt="${image.label}"
            loading="${loading}"
            fetchpriority="${fetchPriority}"
            decoding="async"
            width="${image.thumb.width}"
            height="${image.thumb.height}"
          >
        </picture>
        <p class="thumb-label">${image.label}</p>
      </article>
    `;
  });
  gallery.innerHTML = cards.join("");
}

function updateViewer(index) {
  currentIndex = index;
  const image = images[currentIndex];
  viewerSourceAvif.srcset = image.full.avif;
  viewerSourceWebp.srcset = image.full.webp;
  viewerImage.src = image.full.fallback;
  viewerImage.alt = image.label;
  viewerImage.width = image.full.width;
  viewerImage.height = image.full.height;
  counter.textContent = `${currentIndex + 1} / ${images.length}`;
}

function openViewer(index) {
  updateViewer(index);
  viewer.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewer.classList.remove("open");
  document.body.style.overflow = "";
}

function showPrev() {
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  updateViewer(prevIndex);
}

function showNext() {
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
  updateViewer(nextIndex);
}

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".thumb");
  if (!card) {
    return;
  }
  const index = Number(card.dataset.index);
  openViewer(index);
});

backButton.addEventListener("click", closeViewer);
prevButton.addEventListener("click", showPrev);
nextButton.addEventListener("click", showNext);

viewer.addEventListener("click", (event) => {
  if (event.target === viewer) {
    closeViewer();
  }
});

document.addEventListener("keydown", (event) => {
  if (!viewer.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeViewer();
  } else if (event.key === "ArrowLeft") {
    showPrev();
  } else if (event.key === "ArrowRight") {
    showNext();
  }
});

renderGallery();
