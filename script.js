
const slider = document.getElementById("cardSlider");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const dotsContainer = document.getElementById("dotsContainer");
const progressBar = document.getElementById("progressBar");
const toggleAutoBtn = document.getElementById("toggleAuto");

let index = 0;
let autoSlide;
let progressInterval;
let isPlaying = true;
let slideDuration = 3000;

function getVisibleCards() {
  if (window.innerWidth >= 992) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function createDots() {
  dotsContainer.innerHTML = "";
  const total = slider.children.length - getVisibleCards();
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.classList.add("mx-1");
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.display = "inline-block";
    dot.style.borderRadius = "50%";
    dot.style.background = i === 0 ? "black" : "#ccc";
    dot.style.cursor = "pointer";

    dot.addEventListener("click", () => {
      index = i;
      updateSlider();
      updateDots();
      resetProgress();
    });

    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  const dots = dotsContainer.children;
  for (let i = 0; i < dots.length; i++) {
    dots[i].style.background = i === index ? "black" : "#ccc";
  }
}

function updateSlider() {
  const cardWidth = slider.children[0].offsetWidth;
  slider.style.transform = `translateX(-${index * cardWidth}px)`;
  updateDots();
}

function nextSlide() {
  const maxIndex = slider.children.length - getVisibleCards();

  if (index < maxIndex) {
    index++;
  } else {
    index = 0;
  }

  updateSlider();
  resetProgress();
}

function prevSlide() {
  if (index > 0) {
    index--;
  } else {
    index = slider.children.length - getVisibleCards();
  }

  updateSlider();
  resetProgress();
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

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

    if (width >= 100) {
      clearInterval(progressInterval);
    }
  }, 50);
}

function resetProgress() {
  clearInterval(progressInterval);
  startProgress();
}

toggleAutoBtn.addEventListener("click", () => {
  if (isPlaying) {
    stopAutoSlide();
    toggleAutoBtn.textContent = "Play";
  } else {
    startAutoSlide();
    toggleAutoBtn.textContent = "Pause";
  }
  isPlaying = !isPlaying;
});

// Pause عند hover
slider.addEventListener("mouseenter", stopAutoSlide);
slider.addEventListener("mouseleave", () => {
  if (isPlaying) startAutoSlide();
});

// Touch support
let startX = 0;

slider.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) nextSlide();
  if (endX - startX > 50) prevSlide();
});

window.addEventListener("resize", () => {
  index = 0;
  updateSlider();
  createDots();
});

createDots();
startAutoSlide();

