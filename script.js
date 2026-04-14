const images = [
  "AdobeStock_120501967_Preview.jpeg",
  "AdobeStock_257851798_Preview.jpeg",
  "AdobeStock_315349043_Preview.jpeg",
  "AdobeStock_471079403_Preview.jpeg",
  "AdobeStock_84221257_Preview.jpeg",
  "adam-kool-ndN00KmbJ1c-unsplash.jpg",
  "blake-verdoorn-cssvEZacHvQ-unsplash.jpg",
  "casey-horner-4rDCa5hBlCs-unsplash.jpg",
  "enrico-bet-IicyiaPYGGI-unsplash.jpg",
  "goutham-krishna-h5wvMCdOV3w-unsplash.jpg",
  "matthew-smith-Rfflri94rs8-unsplash.jpg",
  "robert-lukeman-_RBcxo9AU-U-unsplash.jpg",
  "shifaaz-shamoon-sLAk1guBG90-unsplash.jpg",
  "urban-vintage-78A265wPiO4-unsplash.jpg",
  "v2osk-1Z2niiBPg5A-unsplash.jpg"
];

const gallery = document.getElementById("gallery");
const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const counter = document.getElementById("counter");
const backButton = document.getElementById("backButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentIndex = 0;

function formatName(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ");
}

function renderGallery() {
  const cards = images.map((fileName, index) => {
    return `
      <article class="thumb" data-index="${index}">
        <img src="images/${fileName}" alt="${formatName(fileName)}">
        <p class="thumb-label">${formatName(fileName)}</p>
      </article>
    `;
  });
  gallery.innerHTML = cards.join("");
}

function updateViewer(index) {
  currentIndex = index;
  viewerImage.src = `images/${images[currentIndex]}`;
  viewerImage.alt = formatName(images[currentIndex]);
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
