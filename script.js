const slider = document.getElementById("cardSlider");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const dotsContainer = document.getElementById("dotsContainer");
const progressBar = document.getElementById("progressBar");
const toggleAutoBtn = document.getElementById("toggleAuto");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const priceRange = document.getElementById("priceRange");
let allFoods = [];
let index = 0;
let autoSlide;
let progressInterval;
let isPlaying = true;
const slideDuration = 3000;

/* ===== Responsive cards ===== */
function getVisibleCards() {
  if (window.innerWidth >= 992) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

/* ===== Dots ===== */
function createDots() {
  dotsContainer.innerHTML = "";
  const total = slider.children.length - getVisibleCards();

  for (let i = 0; i <= total; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    if (i === index) dot.classList.add("active");

    dot.onclick = () => {
      index = i;
      updateSlider();
      resetProgress();
    };

    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  [...dotsContainer.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

/* ===== Slider ===== */
function updateSlider() {
  if (!slider.children.length) return;

  const card = slider.children[0];
  const style = getComputedStyle(card);
  const width = card.offsetWidth + parseInt(style.marginRight);

  slider.style.transform = `translateX(-${index * width}px)`;
  updateDots();
}

/* ===== Navigation ===== */
function nextSlide() {
  const maxIndex = slider.children.length - getVisibleCards();
  index = index < maxIndex ? index + 1 : 0;
  updateSlider();
  resetProgress();
}

function prevSlide() {
  const maxIndex = slider.children.length - getVisibleCards();
  index = index > 0 ? index - 1 : maxIndex;
  updateSlider();
  resetProgress();
}

nextBtn.onclick = nextSlide;
prevBtn.onclick = prevSlide;

/* ===== Auto Play ===== */
function startAutoSlide() {
  autoSlide = setInterval(nextSlide, slideDuration);
  startProgress();
}

function stopAutoSlide() {
  clearInterval(autoSlide);
  clearInterval(progressInterval);
}

function startProgress() {
  let width = 0;
  progressBar.style.width = "0%";

  progressInterval = setInterval(() => {
    width += 100 / (slideDuration / 50);
    progressBar.style.width = width + "%";
    if (width >= 100) clearInterval(progressInterval);
  }, 50);
}

function resetProgress() {
  clearInterval(progressInterval);
  if (isPlaying) startProgress();
}

/* ===== Play / Pause ===== */
toggleAutoBtn.onclick = () => {
  isPlaying ? stopAutoSlide() : startAutoSlide();
  toggleAutoBtn.textContent = isPlaying ? "Play" : "Pause";
  isPlaying = !isPlaying;
};

/* ===== Dark Mode ===== */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  themeToggle.textContent = dark ? "☀️" : "🌙";
};

/* ===== Resize Fix ===== */
window.addEventListener("resize", () => {
  index = 0;
  createDots();
  updateSlider();
  resetProgress();
});

/* ===== Load JSON & Init ===== */
fetch("foods.json")
  .then((res) => res.json())
  .then((data) => {
    allFoods = data; // ✅ السطر المهم
    renderCards(allFoods);
    addHoverPause();
    index = 0;
    createDots();
    updateSlider();
    startAutoSlide();
  });
``;

function renderCards(items) {
  slider.innerHTML = "";

  if (items.length === 0) {
    slider.innerHTML = `
      <div class="w-100 text-center py-5">
        <h4>No items found 😢</h4>
      </div>
    `;
    return;
  }

  items.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card-item";
    card.style.setProperty("--i", i);

    card.innerHTML = `
      <div class="card">
        <img src="${item.image}" alt="${item.name}">
        <div class="card-body">
          <h5>${item.name}</h5>
          <p>${item.price}</p>
        </div>
      </div>
    `;

    slider.appendChild(card);

    // ✅ Delay to trigger animation
    requestAnimationFrame(() => {
      card.classList.add("show");
    });
  });
}

function addHoverPause() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      stopAutoSlide();
    });

    card.addEventListener("mouseleave", () => {
      if (isPlaying) startAutoSlide();
    });
  });
}
function applyFilters() {
  const keyword = searchInput.value.toLowerCase();
  const rangeValue = priceRange.value;

  let minPrice = 0;
  let maxPrice = Infinity;

  if (rangeValue) {
    const parts = rangeValue.split("-");
    minPrice = Number(parts[0]);
    maxPrice = Number(parts[1]);
  }

  const filtered = allFoods.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(keyword);

    const itemPrice = getLowestPrice(item.price);

    const priceMatch = itemPrice >= minPrice && itemPrice <= maxPrice;

    return nameMatch && priceMatch;
  });

  index = 0;
  stopAutoSlide();

  renderCards(filtered);
  addHoverPause();
  createDots();
  updateSlider();

  if (filtered.length > getVisibleCards()) {
    startAutoSlide();
  }
}
function getLowestPrice(priceText) {
  const numbers = priceText.match(/\d+/g);
  if (!numbers) return Infinity;
  return Math.min(...numbers.map(Number));
}
searchInput.addEventListener("input", applyFilters);
priceRange.addEventListener("change", applyFilters);
