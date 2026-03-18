const DEFAULT_TAGS = [
    "Речные прогулки Казани",
    "Экскурсии по ночной Казани",
    "Групповые экскурсии",
    "Автобусные экскурсии по Казани",
    "Индивидуальные экскурсии",
    "Дворец земледельцев",
    "Пешеходная экскурсия по Казани",
    "Театр «Экият»",
    "Школьные экскурсии",
    "Экскурсия в Раифа",
    "Кул шариф",
    "Спасская башня",
    "Казанский Кремль",
    "Старо-Татарская слобода",
    "Речная прогулка ночью",
    "Экскурсия в Свияжск"
];

let allTags = DEFAULT_TAGS;

  window.openYandex = function() {
    window.open('https://yandex.ru/maps', '_blank');
  };

  window.doSubmit = function() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingModal);
    document.addEventListener('DOMContentLoaded', initBookingCounters);
  } else {
    initBookingModal();
    initBookingCounters();
  }

  function initBookingModal() {
    const bookBtns = document.querySelectorAll('[data-book-btn]');
    const overlay = document.getElementById('overlay');
    const mClose = document.getElementById('mClose');

    console.log('Booking modal init - bookBtns:', bookBtns.length);
    console.log('Overlay:', overlay);

    function openBookingModal(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Opening modal');
      if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeBookingModal() {
      console.log('Closing modal');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    bookBtns.forEach((btn, i) => {
      console.log('Adding listener to button', i);
      btn.addEventListener('click', openBookingModal);
    });

    if (mClose) {
      mClose.addEventListener('click', closeBookingModal);
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeBookingModal();
        }
      });
    }
  }

  function initBookingCounters() {
    const adultInput = document.getElementById('bookingAdults');
    const childInput = document.getElementById('bookingChildren');
    const totalEl = document.getElementById('bookingGuestsTotal');
    const submitBtn = document.getElementById('bookingSubmit');
    const adultPriceEl = document.getElementById('bookingAdultPrice');
    const childPriceEl = document.getElementById('bookingChildPrice');

    if (!adultInput || !childInput || !totalEl || !submitBtn) return;

    function getPriceByLabel(labelPart) {
      const rows = Array.from(document.querySelectorAll('.price-block .p-row'));
      const row = rows.find((item) => {
        const nameEl = item.querySelector('.pn');
        return nameEl && nameEl.textContent.toLowerCase().includes(labelPart);
      });

      return row ? row.querySelector('.pv')?.textContent.trim() : '';
    }

    if (adultPriceEl) {
      const adultPrice = getPriceByLabel('взросл');
      if (adultPrice) adultPriceEl.textContent = adultPrice + ' за билет';
    }

    if (childPriceEl) {
      const childPrice = getPriceByLabel('дети');
      if (childPrice) childPriceEl.textContent = childPrice + ' за билет';
    }

    function updateBookingTotal() {
      const adults = Number(adultInput.value) || 0;
      const children = Number(childInput.value) || 0;
      const total = adults + children;

      totalEl.textContent = String(total);
      submitBtn.disabled = total === 0;
      submitBtn.setAttribute('aria-disabled', String(total === 0));
    }

    document.querySelectorAll('[data-counter]').forEach((counter) => {
      const input = counter.querySelector('input');
      if (!input) return;

      counter.addEventListener('click', (event) => {
        const button = event.target.closest('[data-counter-action]');
        if (!button) return;

        const action = button.getAttribute('data-counter-action');
        const currentValue = Number(input.value) || 0;
        const nextValue = action === 'increase'
          ? currentValue + 1
          : Math.max(0, currentValue - 1);

        input.value = String(nextValue);
        updateBookingTotal();
      });
    });

    updateBookingTotal();
  }

  (function resetBodyOverflowOnLoad() {
    const hasOpenModal = document.querySelector('.overlay.open, #photoModal.open, #allCategoriesModal.open');
    if (!hasOpenModal) document.body.style.overflow = '';
  })();

  (function initMobileNavigation() {
    const mobPhoneBtn = document.getElementById('mobPhoneBtn');
    const mobPhoneModal = document.getElementById('mobPhoneModal');
    const mobPhoneModalClose = document.getElementById('mobPhoneModalClose');

    const mobBurger = document.getElementById('mobBurger');
    const mobMenuDrawer = document.getElementById('mobMenuDrawer');
    const mobMenuOverlay = document.getElementById('mobMenuOverlay');
    const mobMenuClose = document.getElementById('mobMenuClose');
    const mobMenuCallBtn = document.getElementById('mobMenuCallBtn');

    if (!mobBurger || !mobMenuDrawer || !mobMenuOverlay || !mobMenuClose) return;

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

    function openPhoneModal() {
      if (!mobPhoneModal) return;
      mobPhoneModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePhoneModal() {
      if (!mobPhoneModal) return;
      mobPhoneModal.classList.remove('open');
      if (!mobMenuDrawer.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }

    mobBurger.addEventListener('click', () => {
      if (mobMenuDrawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
    mobMenuClose.addEventListener('click', closeDrawer);
    mobMenuOverlay.addEventListener('click', closeDrawer);

    mobMenuDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    if (mobPhoneBtn) mobPhoneBtn.addEventListener('click', openPhoneModal);
    if (mobPhoneModalClose) mobPhoneModalClose.addEventListener('click', closePhoneModal);
    if (mobPhoneModal) {
      mobPhoneModal.addEventListener('click', (e) => {
        if (e.target === mobPhoneModal) closePhoneModal();
      });
    }
    if (mobMenuCallBtn) {
      mobMenuCallBtn.addEventListener('click', () => {
        closeDrawer();
        openPhoneModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeDrawer();
      closePhoneModal();
    });
  })();

  const VISIBLE_COUNT = 11;
  let expanded = false;

  (async () => { try {

  const wrapper = document.getElementById('tagsWrapper');
  const tagsModal = document.getElementById('tagsModal');
  const tagsModalClose = document.getElementById('tagsModalClose');
  const tagsModalContent = document.getElementById('tagsModalContent');

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function renderTagsModal() {
    tagsModalContent.innerHTML = '';
    allTags.forEach(text => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = text;
      tag.addEventListener('click', () => tag.classList.toggle('active'));
      tagsModalContent.appendChild(tag);
    });
  }

  function render() {
    wrapper.innerHTML = '';

    if (isMobile() && allTags.length > VISIBLE_COUNT) {
      const more = document.createElement('span');
      more.className = 'tag tag-more';
      more.textContent = 'Ещё...';
      more.addEventListener('click', (e) => {
        e.stopPropagation();
        renderTagsModal();
        tagsModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
      wrapper.appendChild(more);
    }

    allTags.forEach((text, i) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      if (i >= VISIBLE_COUNT && !expanded) tag.classList.add('hidden');
      if (i >= VISIBLE_COUNT && expanded) tag.classList.add('visible');
      tag.textContent = text;
      tag.addEventListener('click', () => tag.classList.toggle('active'));
      wrapper.appendChild(tag);
    });

    if (!isMobile() && allTags.length > VISIBLE_COUNT) {
      const more = document.createElement('span');
      more.className = 'tag tag-more';
      more.textContent = expanded ? 'Скрыть' : 'Ещё...';
      more.addEventListener('click', (e) => {
        e.stopPropagation();
        expanded = !expanded;
        render();
      });
      wrapper.appendChild(more);
    }
  }

  // Сразу рендерим дефолтные теги
  render();

  // Фоново грузим категории с сервера и обновляем если пришли данные
  const catController = new AbortController();
  const catTimeout = setTimeout(() => catController.abort(), 4000);
  fetch("/api/categories", { signal: catController.signal })
    .then(res => { clearTimeout(catTimeout); return res.ok ? res.json() : null; })
    .then(data => {
      if (data && Array.isArray(data.categories) && data.categories.length > 0) {
        allTags = data.categories;
        render();
      }
    })
    .catch(err => console.warn("Бекенд недоступен, используются дефолтные категории:", err));

  if (tagsModalClose) {
    tagsModalClose.addEventListener('click', () => {
      tagsModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (tagsModal) {
    tagsModal.addEventListener('click', (e) => {
      if (e.target === tagsModal) {
        tagsModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  wrapper.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      wrapper.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  wrapper.addEventListener('click', (e) => {
    const tag = e.target.closest('.tag');
    if (!tag || tag.classList.contains('tag-more')) return;
    const category = (tag.textContent || '').trim();
    if (!category) return;
    window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
  });

  if (tagsModalContent) {
    tagsModalContent.addEventListener('click', (e) => {
      const tag = e.target.closest('.tag');
      if (!tag) return;
      const category = (tag.textContent || '').trim();
      if (!category) return;
      window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
    });
  }

  const originalMore = wrapper.querySelector('.tag-more');
  if (originalMore) {
    const cleanMore = originalMore.cloneNode(true);
    originalMore.replaceWith(cleanMore);
    cleanMore.textContent = 'Еще...';
    cleanMore.addEventListener('click', () => {
      const modal = document.getElementById('allCategoriesModal');
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  const catsModal = document.getElementById('allCategoriesModal');
  const catsClose = document.getElementById('allCategoriesClose');
  if (catsModal && catsClose) {
    // Handle clicks on category items
    catsModal.querySelectorAll('.cats-modal-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = (btn.dataset.category || btn.textContent || '').trim();
        window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
      });
    });
    const closeCatsModal = () => {
      catsModal.classList.remove('open');
      catsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    catsClose.addEventListener('click', closeCatsModal);
    catsModal.addEventListener('click', (e) => {
      if (e.target === catsModal) closeCatsModal();
    });
  }

  let PHOTOS = [
    {
      src:    "../img/excursion/1.png",
      srcset: "../img/excursion/1.png 1x, ../img/excursion/1@2x.png 2x",
      alt:    "Экскурсия — фото 1"
    },
    {
      src:    "../img/excursion/2.png",
      srcset: "../img/excursion/2.png 1x, ../img/excursion/2@2x.png 2x",
      alt:    "Экскурсия — фото 2"
    },
    {
      src:    "../img/excursion/3.png",
      srcset: "../img/excursion/3.png 1x, ../img/excursion/3@2x.png 2x",
      alt:    "Экскурсия — фото 3"
    },
    {
      src:    "../img/excursion/4.png",
      srcset: "../img/excursion/4.png 1x, ../img/excursion/4@2x.png 2x",
      alt:    "Экскурсия — фото 4"
    },
  ];

  try {
    const params = new URLSearchParams(window.location.search);
    const excursionId = params.get("id");
    if (excursionId) {
      const res = await fetch(`/api/excursion/${excursionId}/photos`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          PHOTOS = data.photos;
        }
      }
    }
  } catch (err) {
    console.warn("Бекенд недоступен, используются дефолтные фото экскурсии:", err);
  }

  const VISIBLE = 4;
  let cur = 0, offset = 0;

  const mainImg   = document.getElementById('mainImg');
  const thumbsRow = document.getElementById('thumbsRow');
  const photoModal = document.getElementById('photoModal');
  const photoModalImg = document.getElementById('photoModalImg');
  const photoModalClose = document.getElementById('photoModalClose');

  mainImg.style.transition = 'opacity 0.18s';

  function openPhotoModal(src, alt) {
    if (!photoModal || !photoModalImg) return;
    photoModalImg.src = src;
    photoModalImg.alt = alt || 'Фото экскурсии';
    photoModal.classList.add('open');
    photoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePhotoModal() {
    if (!photoModal) return;
    photoModal.classList.remove('open');
    photoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderThumbs() {
    thumbsRow.innerHTML = '';
    const slice = PHOTOS.slice(offset, offset + VISIBLE);
    slice.forEach((_p, i) => {
      const ri = offset + i;
      const d = document.createElement('div');
      d.className = 'th' + (ri === cur ? ' on' : '');
      const img = document.createElement('img');
      img.src    = PHOTOS[ri].src;
      img.srcset = PHOTOS[ri].srcset;
      img.alt    = PHOTOS[ri].alt;
      img.loading   = 'lazy';
      img.decoding  = 'async';
      d.appendChild(img);
      d.addEventListener('click', () => goTo(ri));
      thumbsRow.appendChild(d);
    });
    if (PHOTOS.length > VISIBLE) {
      const btn = document.createElement('button');
      btn.className = 'th-arrow';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8"
        stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
      btn.addEventListener('click', () => {
        offset = (offset + 1) % PHOTOS.length;
        renderThumbs();
      });
      thumbsRow.appendChild(btn);
    }
  }

  function goTo(index) {
    cur = (index + PHOTOS.length) % PHOTOS.length;
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src    = PHOTOS[cur].src;
      mainImg.srcset = PHOTOS[cur].srcset;
      mainImg.alt    = PHOTOS[cur].alt;
      mainImg.style.opacity = '1';
    }, 180);
    if (cur < offset || cur >= offset + VISIBLE) {
      offset = Math.max(0, Math.min(cur, PHOTOS.length - VISIBLE));
    }
    renderThumbs();
  }

  const nextBtn     = document.getElementById('nextBtn');
  const mainNextBtn = document.getElementById('mainNextBtn');
  const mainPrevBtn = document.getElementById('mainPrevBtn');

  if (nextBtn)     nextBtn.addEventListener('click',     () => goTo(cur + 1));
  if (mainNextBtn) mainNextBtn.addEventListener('click', () => goTo(cur + 1));
  if (mainPrevBtn) mainPrevBtn.addEventListener('click', () => goTo(cur - 1));
  mainImg.addEventListener('click', () => openPhotoModal(mainImg.currentSrc || mainImg.src, mainImg.alt));
  if (photoModalClose) photoModalClose.addEventListener('click', closePhotoModal);
  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) closePhotoModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(cur - 1);
    if (e.key === 'ArrowRight') goTo(cur + 1);
  
    if (e.key === 'Escape') {
      closeModal();
      closePhotoModal();
    }
  });

  renderThumbs();

  const overlay = document.getElementById('overlay');

  document.querySelectorAll('[data-book-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('.btn-green[href*="wa.me"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const waUrl = btn.getAttribute('href');
      if (waUrl) window.open(waUrl, '_blank', 'noopener');
    });
  });

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('mClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  function doSubmit() {
    alert('Заявка принята! Мы свяжемся с вами в ближайшее время.');
    closeModal();
  }
  } catch (_e) { console.error('Gallery init error:', _e); } })();

  window.doSubmit = function() {
    alert('Заявка принята! Мы свяжемся с вами в ближайшее время.');
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

(function() {
  const slider = document.getElementById('slider');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const progressBar = document.getElementById('progress');
  const progressTrack = document.querySelector('.progress-track');

  if (!slider || !prevBtn || !nextBtn || !progressBar || !progressTrack) return;
  if (slider.dataset.inited === '1') return;
  slider.dataset.inited = '1';

  const cards = Array.from(slider.querySelectorAll('.review-card'));
  if (!cards.length) return;
  const reviewControllers = [];

  const maxChars = window.innerWidth <= 768 ? 150 : 190;
  cards.forEach((card) => {
    const p = card.querySelector('p');
    if (!p) return;

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

    const controller = {
      card,
      collapse: renderCollapsed,
      expand: renderExpanded,
      isExpanded: () => isExpanded,
    };
    reviewControllers.push(controller);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isExpanded) {
        renderCollapsed();
        card.classList.remove('review-expanded');
        updateSlider();
        return;
      }

      reviewControllers.forEach((item) => {
        if (item === controller) return;
        if (item.isExpanded()) {
          item.collapse();
          item.card.classList.remove('review-expanded');
        }
      });

      renderExpanded();
      card.classList.add('review-expanded');
      updateSlider();
    });

    renderCollapsed();
  });

  const cardsPerView = 3;
  let currentIndex = 0;
  let isDragging = false;

  function updateProgressBar() {
    const maxScroll = Math.max(cards.length - cardsPerView, 1);
    const percentage = currentIndex / maxScroll;
    const trackWidth = progressTrack.offsetWidth;
    const barWidth = Math.max(trackWidth * (cardsPerView / cards.length), 40);

    progressBar.style.width = `${barWidth}px`;
    progressBar.style.left = `${(trackWidth - barWidth) * percentage}px`;
  }

  function updateSlider() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 16;
    const offset = -currentIndex * (cardWidth + gap);
    slider.style.transform = `translateX(${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= cards.length - cardsPerView;
    updateProgressBar();
  }

  function navigate(direction) {
    if (direction === 'prev' && currentIndex > 0) {
      currentIndex -= 1;
      updateSlider();
    } else if (direction === 'next' && currentIndex < cards.length - cardsPerView) {
      currentIndex += 1;
      updateSlider();
    }
  }

  prevBtn.addEventListener('click', () => navigate('prev'));
  nextBtn.addEventListener('click', () => navigate('next'));

  progressTrack.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = progressTrack.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const maxScroll = Math.max(cards.length - cardsPerView, 1);
    const barWidth = progressBar.offsetWidth;
    const maxX = Math.max(rect.width - barWidth, 1);
    currentIndex = Math.round((x / maxX) * maxScroll);
    currentIndex = Math.max(0, Math.min(currentIndex, cards.length - cardsPerView));
    updateSlider();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

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

  updateSlider();
  window.addEventListener('resize', updateSlider);
})();

(function() {
  const tabs = document.querySelectorAll('.exc-tab');
  const sections = ['sec-route','sec-about','sec-info','sec-departure','sec-similar','sec-reviews','excTourReviews'];

  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-target');
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 58, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', function() {
    let cur = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 80) cur = id;
    });
    const activeTarget = cur === 'sec-reviews' ? 'excTourReviews' : cur;
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-target') === activeTarget));
  }, { passive: true });
})();

(function() {
  const topicItems = document.querySelectorAll('.topic-item[data-category]');
  topicItems.forEach((item) => {
    item.addEventListener('click', () => {
      const category = (item.getAttribute('data-category') || item.textContent || '').trim();
      if (!category) return;
      window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
    });
  });

  document.querySelectorAll('.topic-item.more-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('allCategoriesModal');
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
})();

(function() {
  const infoBlock = document.querySelector('.exc-main-right .info-block');
  const tabsOuter = document.querySelector('.exc-tabs-outer');
  const rightCol = document.querySelector('.exc-main-right');
  if (!infoBlock || !tabsOuter || !rightCol) return;

  const marker = document.createElement('div');
  marker.style.display = 'none';
  rightCol.appendChild(marker);

  function placeByViewport() {
    if (window.innerWidth <= 900) {
      if (!infoBlock.classList.contains('mobile-under-reviews')) {
        tabsOuter.insertAdjacentElement('beforebegin', infoBlock);
        infoBlock.classList.add('mobile-under-reviews');
      }
    } else if (infoBlock.classList.contains('mobile-under-reviews')) {
      marker.insertAdjacentElement('beforebegin', infoBlock);
      infoBlock.classList.remove('mobile-under-reviews');
    }
  }

  placeByViewport();
  window.addEventListener('resize', placeByViewport);
})();

(function() {
  const toggle = document.getElementById('aboutToggle');
  const content = document.getElementById('aboutContent');
  const label  = document.getElementById('aboutToggleText');
  if (!toggle || !content || !label) return;
  toggle.addEventListener('click', function() {
    const open = content.classList.toggle('open');
    content.classList.toggle('collapsed', !open);
    label.textContent = open ? 'Скрыть' : 'Читать полностью';
    toggle.classList.toggle('open', open);
  });
})();

(function() {
  const track = document.getElementById('simTrack');
  const prev  = document.getElementById('simPrev');
  const next  = document.getElementById('simNext');
  const prevMob = document.querySelector('.sim-prev-mob');
  const nextMob = document.querySelector('.sim-next-mob');
  const mobileProgress = document.getElementById('simMobileProgress');
  const prevButtons = [prev, prevMob].filter(Boolean);
  const nextButtons = [next, nextMob].filter(Boolean);
  if (!track || !prev || !next) return;
  const viewport = track.parentElement;
  if (!viewport) return;
  let pos = 0;
  const mobileMq = window.matchMedia('(max-width: 640px)');
  function getStep() {
    const first = track.querySelector('.excursion-card, .sim-card');
    if (!first) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  }
  function updateMobileButtons() {
    if (!mobileMq.matches) return;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const atStart = viewport.scrollLeft <= 2;
    const atEnd = viewport.scrollLeft >= max - 2;
    prevButtons.forEach((btn) => { btn.disabled = atStart; });
    nextButtons.forEach((btn) => { btn.disabled = atEnd; });

    if (mobileProgress) {
      const ratio = max > 0 ? viewport.scrollLeft / max : 0;
      const trackEl = mobileProgress.parentElement;
      const width = 32;
      mobileProgress.style.width = `${width}px`;
      if (trackEl) {
        const left = ratio * Math.max(trackEl.clientWidth - width, 0);
        mobileProgress.style.left = `${left}px`;
      }
    }
  }
  function move(dir) {
    const step = getStep();
    if (mobileMq.matches) {
      viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
      return;
    }
    const max = track.scrollWidth - viewport.offsetWidth;
    pos = Math.max(0, Math.min(pos + dir * step, max));
    track.style.transform = 'translateX(-' + pos + 'px)';
  }
  prevButtons.forEach((btn) => btn.addEventListener('click', () => move(-1)));
  nextButtons.forEach((btn) => btn.addEventListener('click', () => move(1)));
  viewport.addEventListener('scroll', updateMobileButtons, { passive: true });
  window.addEventListener('resize', () => {
    if (mobileMq.matches) {
      track.style.transform = '';
      updateMobileButtons();
      return;
    }
    const max = Math.max(0, track.scrollWidth - viewport.offsetWidth);
    pos = Math.min(pos, max);
    track.style.transform = 'translateX(-' + pos + 'px)';
  });
  if (mobileMq.matches) {
    track.style.transform = '';
    updateMobileButtons();
  }
})();

(function() {
  const slider = document.getElementById('slider');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const progressBar = document.getElementById('progress');
  const progressTrack = document.querySelector('.progress-track');
  if (!slider || !prevBtn || !nextBtn || !progressBar || !progressTrack) return;

  const cards = Array.from(slider.querySelectorAll('.review-card'));
  if (!cards.length) return;

  let currentIndex = 0;
  let isDragging = false;

  function getGap() {
    const style = window.getComputedStyle(slider);
    return parseFloat(style.columnGap || style.gap || '16') || 16;
  }

  function getCardsPerView() {
    const first = cards[0];
    if (!first) return 1;
    const cardWidth = first.getBoundingClientRect().width;
    const containerWidth = slider.parentElement ? slider.parentElement.clientWidth : 0;
    if (!cardWidth || !containerWidth) return 1;
    return Math.max(1, Math.floor((containerWidth + getGap()) / (cardWidth + getGap())));
  }

  function getMaxIndex() {
    return Math.max(cards.length - getCardsPerView(), 0);
  }

  function updateProgressBar() {
    const maxScroll = Math.max(getMaxIndex(), 1);
    const percentage = currentIndex / maxScroll;
    const trackWidth = progressTrack.offsetWidth || 0;
    const barWidth = Math.max(trackWidth * (getCardsPerView() / cards.length), 40);

    progressBar.style.width = barWidth + 'px';
    progressBar.style.left = (trackWidth - barWidth) * percentage + 'px';
  }

  function updateSlider() {
    const first = cards[0];
    if (!first) return;
    const cardWidth = first.getBoundingClientRect().width;
    const offset = -currentIndex * (cardWidth + getGap());
    slider.style.transform = `translateX(${offset}px)`;

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= getMaxIndex();
    updateProgressBar();
  }

  function navigate(direction) {
    if (direction === 'prev' && currentIndex > 0) {
      currentIndex -= 1;
      updateSlider();
    } else if (direction === 'next' && currentIndex < getMaxIndex()) {
      currentIndex += 1;
      updateSlider();
    }
  }

  prevBtn.addEventListener('click', () => navigate('prev'));
  nextBtn.addEventListener('click', () => navigate('next'));

  progressTrack.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = progressTrack.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const maxScroll = Math.max(getMaxIndex(), 1);
    const barWidth = progressBar.offsetWidth;
    const maxX = Math.max(rect.width - barWidth, 1);
    currentIndex = Math.round((x / maxX) * maxScroll);
    currentIndex = Math.max(0, Math.min(currentIndex, getMaxIndex()));
    updateSlider();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('resize', () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    updateSlider();
  });

  updateSlider();
})();

(function() {
  const root = document.getElementById('excTourReviews');
  if (!root) return;

  const listEl = document.getElementById('tourReviewsList');
  const paginationEl = document.getElementById('tourReviewsPagination');
  const form = document.getElementById('tourReviewForm');
  const nameInput = document.getElementById('tourReviewName');
  const textInput = document.getElementById('tourReviewText');
  const agreeInput = document.getElementById('tourReviewAgree');
  const ratingInput = document.getElementById('tourReviewRating');
  const ratingRoot = document.getElementById('tourReviewStars');
  const thanksModal = document.getElementById('tourThanksModal');
  const thanksClose = document.getElementById('tourThanksClose');
  if (!listEl || !paginationEl || !form || !nameInput || !textInput || !agreeInput || !ratingInput || !ratingRoot || !thanksModal || !thanksClose) return;

  const BASE_REVIEWS = [
    { author: 'Zeee Zee', date: '01 декабря', text: 'Очень советую эту компанию, сотрудники очень вежливые и с юмором.' },
    { author: 'Эдуард Насибулин', date: '24 октября', text: 'Экскурсия на высшем уровне гид отлично все рассказывает,без запинок По цене нариканий нету, цена сладкая Лично я с семьей ездили на экскурсию ,,огни ночной Казани,,которая проводится на автобусе, автобусы новые, удобные, чистые,никаких пятен на сиденьях Вообщем, всем советую обращаться в эту организацию!)' },
    { author: 'Лейсан Гайсина', date: '16 октября', text: 'Была на экскурсии «Огни ночной Казани» все просто прекрасно, такой красивый город, все очень интересно и познавательно рассказали!' },
    { author: 'Вера Гильфанова', date: '05 октября', text: 'Были на экскурсии очень сильно понравилось советую Ночная экскурсия шикарные виды, вообще' },
    { author: 'Иван Петров', date: '28 сентября', text: 'Организация четкая, автобус комфортный, рекомендую.' },
    { author: 'Мария Смирнова', date: '11 сентября', text: 'Маршрут отличный, увидели все ключевые точки.' },
    { author: 'Александр Иванов', date: '30 августа', text: 'Гид профессионал, отвечал на все вопросы.' }
  ];

  const PAGE_SIZE = 4;
  const FIXED_PAGE_COUNT = 6;
  let reviews = [...BASE_REVIEWS];
  let currentPage = 1;

  function stars(value) {
    const score = Math.max(1, Math.min(5, Number(value) || 5));
    return `${'&#9733;'.repeat(score)}<span class="tour-reviews-rating-empty">${'&#9734;'.repeat(5 - score)}</span>`;
  }

  function renderList() {
    const safePage = Math.max(1, Math.min(currentPage, FIXED_PAGE_COUNT));
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = reviews.slice(start, end);
    listEl.innerHTML = pageItems.map(r => `
      <article class="tour-reviews-item">
        <div class="tour-reviews-meta">
          <strong class="tour-reviews-author">${r.author}</strong>
          <span class="tour-reviews-date">${r.date}</span>
          <span class="tour-reviews-rating">${stars(r.rating)}</span>
        </div>
        <p class="tour-reviews-text">${r.text}</p>
      </article>
    `).join('');
  }

  function renderPagination() {
    currentPage = Math.max(1, Math.min(currentPage, FIXED_PAGE_COUNT));
    paginationEl.innerHTML = '';
    for (let i = 1; i <= FIXED_PAGE_COUNT; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tour-page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = String(i);
      btn.addEventListener('click', () => {
        currentPage = i;
        renderList();
        renderPagination();
      });
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'tour-page-btn tour-page-nav';
    nextBtn.textContent = '›';
    nextBtn.setAttribute('aria-label', 'Следующая страница');
    if (currentPage >= FIXED_PAGE_COUNT) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.45';
      nextBtn.style.cursor = 'default';
    }
    nextBtn.addEventListener('click', () => {
      if (currentPage >= FIXED_PAGE_COUNT) return;
      currentPage += 1;
      renderList();
      renderPagination();
    });
    paginationEl.appendChild(nextBtn);
  }

  function openThanks() {
    thanksModal.classList.add('open');
    thanksModal.setAttribute('aria-hidden', 'false');
  }

  function closeThanks() {
    thanksModal.classList.remove('open');
    thanksModal.setAttribute('aria-hidden', 'true');
  }

  const ratingButtons = Array.from(ratingRoot.querySelectorAll('.tour-star'));
  let currentRating = 0;

  function paintRating(hoverValue) {
    const value = hoverValue || currentRating;
    ratingButtons.forEach((btn) => {
      const starValue = Number(btn.dataset.value || 0);
      btn.classList.toggle('is-active', starValue <= value);
    });
  }

  ratingButtons.forEach((btn) => {
    const val = Number(btn.dataset.value || 0);
    btn.addEventListener('mouseenter', () => paintRating(val));
    btn.addEventListener('click', () => {
      currentRating = val;
      ratingInput.value = String(val);
      ratingRoot.classList.remove('is-invalid');
      paintRating();
    });
  });

  ratingRoot.addEventListener('mouseleave', () => paintRating());

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!agreeInput.checked) return;

    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    if (!name || !text) return;
    if (currentRating < 1) {
      ratingRoot.classList.add('is-invalid');
      return;
    }

    const d = new Date();
    const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
    reviews.unshift({ author: name, date, text, rating: currentRating });
    currentPage = 1;

    try {
      localStorage.setItem('excursionReviews', JSON.stringify(reviews));
    } catch (_e) {}

    renderList();
    renderPagination();
    form.reset();
    currentRating = 0;
    ratingInput.value = '0';
    paintRating();
    openThanks();
  });

  thanksClose.addEventListener('click', closeThanks);
  thanksModal.addEventListener('click', function(e) {
    if (e.target === thanksModal) closeThanks();
  });

  try {
    const saved = JSON.parse(localStorage.getItem('excursionReviews') || 'null');
    if (Array.isArray(saved) && saved.length) reviews = saved;
  } catch (_e) {}

  renderList();
  renderPagination();
})();
