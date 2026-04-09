const callBtn = document.getElementById("callBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

callBtn.onclick = () => {
  modal.style.display = "flex";
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

document.querySelectorAll(".category[data-category]").forEach(item => {
  item.addEventListener("click", () => {
    const categoryName = item.dataset.category || item.textContent.trim();
    window.location.href = `catalog.html?category=${encodeURIComponent(categoryName)}`;
  });
});

const moreCategoriesBtn = document.getElementById("moreCategoriesBtn");

if (moreCategoriesBtn) {
  moreCategoriesBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const topicsModal = document.getElementById("topicsModal");
    if (topicsModal) {
      topicsModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  });
}

const categoriesModal = document.getElementById("categoriesModal");
const closeCategories = document.getElementById("closeCategories");
if (closeCategories) {
  closeCategories.addEventListener("click", () => {
    if (categoriesModal) categoriesModal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === categoriesModal) {
      categoriesModal.style.display = "none";
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const heroImage = document.querySelector('.hero-image');

  if (heroImage.complete) {
    heroImage.classList.add('loaded');
  } else {
    heroImage.addEventListener('load', () => {
      heroImage.classList.add('loaded');
    });
  }
});

function resolveExcursionLink(rawLink) {
  if (!rawLink) return "excursion.html";
  if (rawLink.includes(".html")) return rawLink;
  const match = rawLink.match(/\/excursion\/(\d+)/);
  if (match) return `excursion.html?id=${match[1]}`;
  return "excursion.html";
}

document.querySelectorAll(".excursion-card").forEach(card => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
   if (e.target.classList.contains("book-btn")) return;
    window.location.href = resolveExcursionLink(card.dataset.link);
  });
});

document.querySelectorAll(".book-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = btn.closest(".excursion-card");
    if (!card) return;
    e.stopPropagation();
    window.location.href = resolveExcursionLink(card?.dataset.link);
  });
});

const showMoreBtn = document.getElementById("showMore");
if (showMoreBtn) {
  showMoreBtn.addEventListener("click", () => {
    window.location.href = "catalog.html";
  });
}


const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const daysRu = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

let currentDate = new Date();
let selectedDate = new Date(currentDate);

const monthEl = document.getElementById("currentMonth");
const calendarDates = document.getElementById("calendarDates");
const monthPicker = document.getElementById("monthPicker");
const selectedDateText = document.getElementById("selectedDateText");
const scheduleList = document.getElementById("scheduleList");

function renderCalendar() {
  monthEl.textContent = months[currentDate.getMonth()] + " " + currentDate.getFullYear();
  calendarDates.innerHTML = "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  let start = firstDay.getDay();
  if (start === 0) start = 7;

  for (let i = 1; i < start; i++) {
    calendarDates.innerHTML += "<span></span>";
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const span = document.createElement("span");
    span.textContent = d;

    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);

    // Highlight today with outline circle
    if (dateToCheck.toDateString() === today.toDateString()) {
      span.classList.add("today");
    }

    // Highlight the selected/clicked date with filled active style
    if (dateToCheck.toDateString() === selectedDate.toDateString()) {
      span.classList.add("active");
    }

    if (dateToCheck < today) {
      span.classList.add("muted");
      span.style.cursor = "not-allowed";
    } else {
      span.onclick = () => {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
        currentDate = new Date(selectedDate);
        renderCalendar();
        renderSchedule();
      };
    }

    calendarDates.appendChild(span);
  }
}

const DEFAULT_EXCURSIONS = [
  { id: 1, title: "Экскурсия в Йошкар-Олу на автобусе из Казани", type: "Автобусная", duration: "10 часов", price: 2900, time: "09:00" },
  { id: 2, title: "Экскурсия в Болгар из Казани", type: "Автобусная", duration: "11 часов", price: 3000, time: "10:00" },
  { id: 3, title: "Автобусная экскурсия в Елабугу", type: "Автобусная", duration: "11 часов", price: 3300, time: "11:00" },
  { id: 4, title: "Обзорная экскурсия по Казани с посещением Кремля", type: "Автобусная", duration: "4 часа", price: 1100, time: "12:00" },
  { id: 5, title: "Экскурсия «Ночная Казань с колесом обозрения»", type: "Автобусная", duration: "2,5 часа", price: 1400, time: "13:00" },
  { id: 6, title: "Экскурсия в Свияжск и Храм всех религий", type: "Автобусная", duration: "6 часов", price: 2400, time: "14:00" },
];

async function fetchSchedule(date) {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`/api/schedule?date=${iso}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.schedule)) throw new Error("Invalid response");
    return data.schedule;
  } finally {
    clearTimeout(timeout);
  }
}

const ARROW_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.4297 5.93005L19.4997 12.0001L13.4297 18.0701" stroke="#17AA00" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 12H19.33" stroke="#17AA00" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function buildScheduleItems(items) {
  scheduleList.innerHTML = "";
  items.forEach((exc, i) => {
    const hour = exc.time || `${(9 + i).toString().padStart(2, "0")}:00`;
    const item = document.createElement("div");
    item.className = "schedule-item";
    item.style.cursor = "pointer";
    item.onclick = () => window.location.href = `excursion.html?id=${exc.id}`;
    item.innerHTML = `
      <div class="time">${hour}</div>
      <div class="schedule-item-info">
        <div class="schedule-title">${exc.title}</div>
        <div class="schedule-meta">${exc.type}, ${exc.duration}</div>
      </div>
      <div class="price">от ${exc.price} ₽ <span class="schedule-arrow">${ARROW_SVG}</span></div>
    `;
    scheduleList.appendChild(item);
  });
}

function renderSchedule() {
  const day   = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year  = currentDate.getFullYear();

  selectedDateText.textContent = `${day}.${month}.${year}, ${daysRu[currentDate.getDay()]}`;

  buildScheduleItems(DEFAULT_EXCURSIONS);

  fetchSchedule(currentDate)
    .then(fromApi => { if (fromApi.length > 0) buildScheduleItems(fromApi); })
    .catch(err => console.warn("Бекенд недоступен, используются дефолтные данные расписания:", err));
}

monthEl.onclick = ()=>{
  monthPicker.classList.toggle("hidden");
  monthPicker.innerHTML="";
  months.forEach((m,i)=>{
    const div = document.createElement("div");
    div.textContent=m;
    div.onclick=()=>{
      currentDate.setMonth(i);
      monthPicker.classList.add("hidden");
      renderCalendar();
      renderSchedule();
    }
    monthPicker.appendChild(div);
  });
};

document.getElementById("prevMonth").onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()-1);
  renderCalendar();
  renderSchedule();
};
document.getElementById("nextMonth").onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()+1);
  renderCalendar();
  renderSchedule();
};

document.getElementById("prevDay").onclick=()=>{
  currentDate.setDate(currentDate.getDate()-1);
  selectedDate = new Date(currentDate);
  renderCalendar();
  renderSchedule();
};
document.getElementById("nextDay").onclick=()=>{
  currentDate.setDate(currentDate.getDate()+1);
  selectedDate = new Date(currentDate);
  renderCalendar();
  renderSchedule();
};

document.getElementById("fullSchedule").onclick=()=>{
  window.location.href="schedule.html";
};

renderCalendar();
renderSchedule();

function openYandex() {
    window.open('https://yandex.ru/maps', '_blank');
}

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById('slider');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const progressBar = document.getElementById('progress');
    const progressTrack = document.querySelector('.progress-track');

    if (!slider || !prevBtn || !nextBtn || !progressBar || !progressTrack) return;

    const cards = document.querySelectorAll('.review-card');
    const cardsPerView = 3;
    let currentIndex = 0;
    let isDragging = false;

    function updateSlider() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 16;
        const offset = -currentIndex * (cardWidth + gap);
        slider.style.transform = `translateX(${offset}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - cardsPerView;
        updateProgressBar();
    }

    function updateProgressBar() {
        const maxScroll = Math.max(cards.length - cardsPerView, 1);
        const percentage = currentIndex / maxScroll;
        const trackWidth = progressTrack.offsetWidth;
        const barWidth = Math.max(trackWidth * (cardsPerView / cards.length), 40);
        progressBar.style.width = barWidth + 'px';
        progressBar.style.left = (trackWidth - barWidth) * percentage + 'px';
    }

    function navigate(direction) {
        if (direction === 'prev' && currentIndex > 0) {
            currentIndex--;
            updateSlider();
        } else if (direction === 'next' && currentIndex < cards.length - cardsPerView) {
            currentIndex++;
            updateSlider();
        }
    }

    prevBtn.addEventListener('click', () => navigate('prev'));
    nextBtn.addEventListener('click', () => navigate('next'));

    progressTrack.addEventListener('mousedown', () => { isDragging = true; });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = progressTrack.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const maxScroll = Math.max(cards.length - cardsPerView, 1);
            const barWidth = progressBar.offsetWidth;
            const maxX = rect.width - barWidth;
            currentIndex = Math.round((x / maxX) * maxScroll);
            currentIndex = Math.max(0, Math.min(currentIndex, cards.length - cardsPerView));
            updateSlider();
        }
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
        if (!isSwiping) {
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (dx > dy && dx > 5) isSwiping = true;
        }
        if (isSwiping) e.preventDefault();
    }, { passive: false });

    slider.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) navigate(diff > 0 ? 'next' : 'prev');
        isSwiping = false;
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigate('prev');
        if (e.key === 'ArrowRight') navigate('next');
    });

    updateSlider();
    window.addEventListener('resize', updateProgressBar);
});


document.addEventListener("DOMContentLoaded", async () => {

  const image = document.getElementById("galleryImage");
  const prevBtn = document.getElementById("prevPhoto");
  const nextBtn = document.getElementById("nextPhoto");
  const currentIndexEl = document.getElementById("currentIndex");
  const totalPhotosEl = document.getElementById("totalPhotos");
  const aboutGallery = document.querySelector(".about-gallery .gallery");

  if (!image || !prevBtn || !nextBtn || !currentIndexEl || !totalPhotosEl) return;

  const DEFAULT_PHOTOS = [
    {
      src: "img/galery/photo@1x.png",
      srcset: "img/galery/photo@1x.png 1x, img/galery/photo@2x.png 2x",
      alt: "Фото галереи 1"
    },
    {
      src: "img/banner@1x.jpeg",
      srcset: "img/banner@1x.jpeg 1x, img/banner@2x.jpeg 2x",
      alt: "Фото галереи 2"
    },
    {
      src: "img/excursion/1.png",
      srcset: "img/excursion/1.png 1x, img/excursion/1@2x.png 2x",
      alt: "Фото галереи 3"
    }
  ];

  let photos = DEFAULT_PHOTOS;
  let index = 0;
  let autoplayTimer = null;
  let fadeTimer = null;
  const AUTOPLAY_DELAY = 2200;
  const FADE_DURATION = 180;

  function renderGallery() {
    image.src = photos[index].src;
    image.srcset = photos[index].srcset;
    currentIndexEl.textContent = (index + 1).toString().padStart(2, "0");
    totalPhotosEl.textContent = photos.length.toString().padStart(2, "0");
  }

  function updateGallery() {
    if (fadeTimer) clearTimeout(fadeTimer);
    image.classList.add("fade");
    fadeTimer = setTimeout(() => {
      renderGallery();
      image.classList.remove("fade");
      fadeTimer = null;
    }, FADE_DURATION);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      index = (index + 1) % photos.length;
      updateGallery();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  nextBtn.onclick = () => {
    index = (index + 1) % photos.length;
    updateGallery();
    startAutoplay();
  };

  prevBtn.onclick = () => {
    index = (index - 1 + photos.length) % photos.length;
    updateGallery();
    startAutoplay();
  };

  if (aboutGallery) {
    aboutGallery.addEventListener("mouseenter", stopAutoplay);
    aboutGallery.addEventListener("mouseleave", startAutoplay);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Сразу показываем дефолтные фото
  renderGallery();
  startAutoplay();

  // Фоново грузим с сервера и обновляем если пришли данные
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("/api/gallery", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.photos) && data.photos.length > 0) {
        photos = data.photos;
        index = 0;
        renderGallery();
      }
    }
  } catch (err) {
    console.warn("Бекенд недоступен, используются дефолтные фото галереи:", err);
  }

});


const content = document.getElementById('aboutContent');
  const toggle = document.getElementById('aboutToggle');
  const toggleText = document.getElementById('aboutToggleText');
  const arrow = toggle?.querySelector('.arrow');
  let savedScrollY = null;

  if (content && toggle && toggleText) {
    toggle.addEventListener('click', () => {
      const isCollapsed = content.classList.contains('collapsed');
      if (isCollapsed) {
        savedScrollY = window.scrollY;
      }

      content.classList.toggle('collapsed');

      if (content.classList.contains('collapsed')) {
        toggleText.textContent = 'Читать полностью';
        if (arrow) arrow.style.transform = 'rotate(0deg)';

        if (savedScrollY !== null) {
          const targetY = savedScrollY;
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo({
                top: targetY,
                behavior: reduceMotion ? 'auto' : 'smooth'
              });
              savedScrollY = null;
            });
          });
        }
      } else {
        toggleText.textContent = 'Скрыть';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
  return;
  const cardsContainer = document.querySelector(".cards");
  const rightArrow = document.querySelector(".arrow.right");

  let index = 0;
  const cardWidth = 270;
  const visibleCards = 3; 
  const totalCards = cardsContainer.children.length;

  function updateSlider() {
    const offset = -index * cardWidth;
    cardsContainer.style.transform = `translateX(${offset}px)`;
  }

  rightArrow.addEventListener("click", () => {
    index++;
    if (index > totalCards - visibleCards) {
      index = 0;
    }
    updateSlider();
  });

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.1)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
    });
  });

  const showAll = document.querySelector(".show-all");
  showAll.addEventListener("mouseenter", () => {
    showAll.style.transform = "scale(1.2)";
  });
  showAll.addEventListener("mouseleave", () => {
    showAll.style.transform = "scale(1)";
  });
});

document.addEventListener("DOMContentLoaded", () => {

  if (document.querySelector(".gallery-swiper")) {
    new Swiper(".gallery-swiper", {
      slidesPerView: "auto",
      spaceBetween: 12,
      grabCursor: true,
      freeMode: true,
      watchOverflow: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      navigation: {
        nextEl: ".gallery-nav-next",
        prevEl: ".gallery-nav-prev",
      },
      simulateTouch: window.innerWidth < 900,
      on: {
        resize(swiper) {
          swiper.params.simulateTouch = window.innerWidth < 900;
          swiper.update();
        }
      }
    });
  }

});


document.querySelectorAll(".faq-question").forEach(question => {
  question.addEventListener("click", () => {
    const item = question.parentElement;
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach(el => {
      el.classList.remove("active");
      const ans = el.querySelector(".faq-answer");
      if (ans) ans.style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add("active");
      const ans = item.querySelector(".faq-answer");
      if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {


  const callBtn = document.getElementById("callBtn");
  const callModal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");

  if (callBtn && callModal) {
    callBtn.onclick = () => callModal.style.display = "flex";
    closeModal.onclick = () => callModal.style.display = "none";

    window.addEventListener("click", (e) => {
      if (e.target === callModal) callModal.style.display = "none";
    });
  }


  document.querySelectorAll(".category").forEach(item => {
    item.addEventListener("click", () => {
      const categoryName = item.textContent.trim();
      window.location.href = `/catalog?category=${encodeURIComponent(categoryName)}`;
    });
  });


  const topicsModal = document.getElementById("topicsModal");
  const closeTopics = document.getElementById("closeTopics");
  const modalTitle = topicsModal ? topicsModal.querySelector("h3") : null;
  const modalBody = topicsModal ? topicsModal.querySelector(".modal-body") : null;

  function openTopicsModal(items, title) {
    if (!topicsModal || !modalBody) return;
    if (modalTitle) modalTitle.textContent = title || "Все темы";
    modalBody.innerHTML = "";
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "topic-item";
      div.textContent = item.textContent.trim();
      const cat = item.dataset.category || item.textContent.trim();
      div.style.cursor = "pointer";
      div.addEventListener("click", () => {
        window.location.href = "catalog.html?category=" + encodeURIComponent(cat);
      });
      modalBody.appendChild(div);
    });
    topicsModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  document.querySelectorAll(".more-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = btn.closest(".topics-group");
      const title = group ? group.querySelector("h3").textContent : "Все темы";
      const items = group ? [...group.querySelectorAll(".topic-item:not(.more-btn)")] : [];
      openTopicsModal(items, title);
    });
    btn.addEventListener("touchend", () => {
      setTimeout(() => btn.blur(), 300);
    }, { passive: true });
  });

  if (closeTopics) {
    closeTopics.addEventListener("click", () => {
      topicsModal.style.display = "none";
      document.body.style.overflow = "";
    });
  }

  if (topicsModal) {
    topicsModal.addEventListener("click", (e) => {
      if (e.target === topicsModal) {
        topicsModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  const socialButtons = document.querySelectorAll(".social-btn");
  const hiddenInput = document.getElementById("selectedSocial");
  const socialTestLinks = {
    Telegram: "https://t.me/share/url?url=https%3A%2F%2Fexample.com&text=%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%B7%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D1%81%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0",
    WhatsApp: "https://wa.me/?text=%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%B7%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D1%81%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0"
  };

  if (socialButtons.length && hiddenInput) {
    socialButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        socialButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        hiddenInput.value = btn.dataset.social;

        const link = socialTestLinks[btn.dataset.social];
        if (link) {
          window.open(link, "_blank");
        }
      });
    });
  }

  const callRequestForm = document.getElementById("callRequestForm");

  if (callRequestForm) {
    callRequestForm.noValidate = true;

    const nameInput = callRequestForm.querySelector('input[name="name"]');
    const phoneInput = callRequestForm.querySelector('input[name="phone"]');
    const policyCheck = callRequestForm.querySelector('.policy-check');

    const ensureErrorNode = (field, key) => {
      let node = callRequestForm.querySelector(`.form-error[data-for="call-${key}"]`);
      if (node) return node;

      node = document.createElement("div");
      node.className = "form-error";
      node.dataset.for = `call-${key}`;

      if (key === "policy") {
        field.closest(".policy").insertAdjacentElement("afterend", node);
      } else {
        field.insertAdjacentElement("afterend", node);
      }

      return node;
    };

    const setError = (field, key, message) => {
      const node = ensureErrorNode(field, key);
      node.textContent = message;
      node.classList.add("visible");
      if (key === "policy") {
        field.closest(".policy").classList.add("policy--invalid");
      } else {
        field.classList.add("input--invalid");
      }
    };

    const clearError = (field, key) => {
      const node = callRequestForm.querySelector(`.form-error[data-for="call-${key}"]`);
      if (node) {
        node.textContent = "";
        node.classList.remove("visible");
      }
      if (key === "policy") {
        field.closest(".policy").classList.remove("policy--invalid");
      } else {
        field.classList.remove("input--invalid");
      }
    };

    const validateName = () => {
      const value = nameInput.value.trim();
      if (!value) return "Это поле обязательно для заполнения";
      if (value.length < 2) return "Введите не менее 2 символов";
      return "";
    };

    const validatePhone = () => {
      const digits = phoneInput.value.replace(/\D/g, "");
      if (!digits) return "Это поле обязательно для заполнения";
      if (digits.length < 10) return "Введите корректный номер телефона";
      return "";
    };

    const validatePolicy = () => {
      if (!policyCheck.checked) return "Подтвердите согласие с политикой";
      return "";
    };

    callRequestForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameError = validateName();
      const phoneError = validatePhone();
      const policyError = validatePolicy();

      if (nameError) setError(nameInput, "name", nameError); else clearError(nameInput, "name");
      if (phoneError) setError(phoneInput, "phone", phoneError); else clearError(phoneInput, "phone");
      if (policyError) setError(policyCheck, "policy", policyError); else clearError(policyCheck, "policy");

      if (nameError || phoneError || policyError) return;

      const data = new FormData(callRequestForm);
      console.log("Заявка на звонок:", {
        name: data.get("name"),
        phone: data.get("phone")
      });

      alert("Спасибо! Мы скоро вам перезвоним.");
      callRequestForm.reset();
      clearError(nameInput, "name");
      clearError(phoneInput, "phone");
      clearError(policyCheck, "policy");
      const callModalNode = document.getElementById("modal");
      if (callModalNode) callModalNode.style.display = "none";
    });

    nameInput.addEventListener("input", () => {
      if (!validateName()) clearError(nameInput, "name");
    });

    phoneInput.addEventListener("input", () => {
      if (!validatePhone()) clearError(phoneInput, "phone");
    });

    policyCheck.addEventListener("change", () => {
      if (!validatePolicy()) clearError(policyCheck, "policy");
    });
  }
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.noValidate = true;

    const nameInput = contactForm.querySelector('input[name="name"]');
    const phoneInput = contactForm.querySelector('input[name="phone"]');
    const questionInput = contactForm.querySelector('textarea[name="question"]');
    const policyCheck = contactForm.querySelector(".policy-check");

    const errorSelectors = [
      [nameInput, "name"],
      [phoneInput, "phone"],
      [questionInput, "question"],
      [policyCheck, "policy"],
    ];

    const ensureErrorNode = (field, key) => {
      let node = contactForm.querySelector(`.form-error[data-for="${key}"]`);
      if (node) return node;

      node = document.createElement("div");
      node.className = "form-error";
      node.dataset.for = key;

      if (key === "policy") {
        const policyWrap = field.closest(".policy");
        policyWrap.insertAdjacentElement("afterend", node);
      } else {
        field.insertAdjacentElement("afterend", node);
      }

      return node;
    };

    const setError = (field, key, message) => {
      const node = ensureErrorNode(field, key);
      node.textContent = message;
      node.classList.add("visible");

      if (key === "policy") {
        field.closest(".policy").classList.add("policy--invalid");
      } else {
        field.classList.add("input--invalid");
      }
    };

    const clearError = (field, key) => {
      const node = contactForm.querySelector(`.form-error[data-for="${key}"]`);
      if (node) {
        node.textContent = "";
        node.classList.remove("visible");
      }

      if (key === "policy") {
        field.closest(".policy").classList.remove("policy--invalid");
      } else {
        field.classList.remove("input--invalid");
      }
    };

    const validateName = () => {
      const value = nameInput.value.trim();
      if (!value) return "Это поле обязательно для заполнения";
      if (value.length < 2) return "Введите не менее 2 символов";
      return "";
    };

    const validatePhone = () => {
      const digits = phoneInput.value.replace(/\D/g, "");
      if (!digits) return "Это поле обязательно для заполнения";
      if (digits.length < 10) return "Введите корректный номер телефона";
      return "";
    };

    const validateQuestion = () => {
      const value = questionInput.value.trim();
      if (!value) return "Это поле обязательно для заполнения";
      if (value.length < 10) return "Введите не менее 10 символов";
      return "";
    };

    const validatePolicy = () => {
      if (!policyCheck.checked) return "Подтвердите согласие с политикой";
      return "";
    };

    const runValidation = () => {
      let valid = true;

      const nameError = validateName();
      if (nameError) {
        setError(nameInput, "name", nameError);
        valid = false;
      } else {
        clearError(nameInput, "name");
      }

      const phoneError = validatePhone();
      if (phoneError) {
        setError(phoneInput, "phone", phoneError);
        valid = false;
      } else {
        clearError(phoneInput, "phone");
      }

      const questionError = validateQuestion();
      if (questionError) {
        setError(questionInput, "question", questionError);
        valid = false;
      } else {
        clearError(questionInput, "question");
      }

      const policyError = validatePolicy();
      if (policyError) {
        setError(policyCheck, "policy", policyError);
        valid = false;
      } else {
        clearError(policyCheck, "policy");
      }

      return valid;
    };

    nameInput.addEventListener("input", () => {
      if (!validateName()) clearError(nameInput, "name");
    });
    phoneInput.addEventListener("input", () => {
      if (!validatePhone()) clearError(phoneInput, "phone");
    });
    questionInput.addEventListener("input", () => {
      if (!validateQuestion()) clearError(questionInput, "question");
    });
    policyCheck.addEventListener("change", () => {
      if (!validatePolicy()) clearError(policyCheck, "policy");
    });

    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();

      if (!runValidation()) return;

      const formData = new FormData(this);
      console.log("Имя:", formData.get("name"));
      console.log("Телефон:", formData.get("phone"));
      console.log("Вопрос:", formData.get("question"));
      console.log("Соцсеть:", formData.get("social"));

      alert("Заявка отправлена! Способ связи: " + formData.get("social"));

      this.reset();
      errorSelectors.forEach(([field, key]) => clearError(field, key));
      socialButtons.forEach((b) => b.classList.remove("active"));
      const defaultSocial = contactForm.querySelector('.social-btn[data-social="Telegram"]');
      if (defaultSocial) defaultSocial.classList.add("active");
      if (hiddenInput) hiddenInput.value = "Telegram";
    });
  }

});

document.addEventListener("DOMContentLoaded", () => {

  const footerCallBtn = document.getElementById("footerCallBtn");
  const callModal = document.getElementById("modal");

  footerCallBtn.addEventListener("click", () => {
    callModal.style.display = "flex";
  });

  const scrollTopBtn = document.getElementById("scrollTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      scrollTopBtn.style.display = "flex";
    } else {
      scrollTopBtn.style.display = "none";
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

});

(function() {

  const mobPhoneBtn = document.getElementById('mobPhoneBtn');
  const mobPhoneModal = document.getElementById('mobPhoneModal');
  const mobPhoneModalClose = document.getElementById('mobPhoneModalClose');

  if (mobPhoneBtn && mobPhoneModal) {
    mobPhoneBtn.addEventListener('click', () => {
      mobPhoneModal.classList.add('open');
    });

    mobPhoneModalClose.addEventListener('click', () => {
      mobPhoneModal.classList.remove('open');
    });

    mobPhoneModal.addEventListener('click', (e) => {
      if (e.target === mobPhoneModal) mobPhoneModal.classList.remove('open');
    });
  }

  const mobBurger = document.getElementById('mobBurger');
  const mobMenuDrawer = document.getElementById('mobMenuDrawer');
  const mobMenuOverlay = document.getElementById('mobMenuOverlay');
  const mobMenuClose = document.getElementById('mobMenuClose');
  const mobMenuCallBtn = document.getElementById('mobMenuCallBtn');

  function openDrawer() {
    mobMenuDrawer.classList.add('open');
    mobMenuOverlay.classList.add('open');
    mobBurger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobMenuDrawer.classList.remove('open');
    mobMenuOverlay.classList.remove('open');
    mobBurger.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobBurger) {
    mobBurger.addEventListener('click', () => {
      if (mobMenuDrawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (mobMenuClose) mobMenuClose.addEventListener('click', closeDrawer);
  if (mobMenuOverlay) mobMenuOverlay.addEventListener('click', closeDrawer);

  if (mobMenuCallBtn) {
    mobMenuCallBtn.addEventListener('click', () => {
      closeDrawer();
      const callModal = document.getElementById('modal');
      if (callModal) callModal.style.display = 'flex';
    });
  }

})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.layout .gallery') && document.getElementById('sec-route')) {
    return;
  }

  const maxChars = window.innerWidth <= 768 ? 150 : 190;

  document.querySelectorAll('.review-card p').forEach((p) => {
    const fullText = p.textContent.replace(/\s+/g, ' ').trim();
    if (fullText.length <= maxChars) {
      p.textContent = fullText;
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'read-more-btn';
    let isExpanded = false;

    const renderCollapsed = () => {
      let shortText = fullText.slice(0, maxChars);
      shortText = shortText.replace(/\s+\S*$/, '').trimEnd();
      p.textContent = `${shortText}... `;
      btn.textContent = 'Читать еще';
      p.append(btn);
      isExpanded = false;
    };

    const renderExpanded = () => {
      p.textContent = `${fullText} `;
      btn.textContent = 'Скрыть';
      p.append(btn);
      isExpanded = true;
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isExpanded) {
        renderCollapsed();
      } else {
        renderExpanded();
      }
    });

    renderCollapsed();
  });
});
