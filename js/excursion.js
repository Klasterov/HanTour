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

const bookingState = {
  title: '',
  prices: {
    adult: 1400,
    senior: 1400,
    child: 1400,
    childFree: 0
  }
};

const BOOKING_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

const BOOKING_TIMES = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);

const bookingCalendarState = {
  selectedDate: null,
  viewYear: 0,
  viewMonth: 0,
  minDate: null
};

  window.openYandex = function() {
    window.open('https://yandex.ru/maps', '_blank');
  };

  window.doSubmit = function() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
  };

  function parsePriceValue(value, fallback = 0) {
    if (!value) return fallback;
    if (/бесплат/i.test(value)) return 0;

    const amount = Number(String(value).replace(/[^\d]/g, ''));
    return Number.isFinite(amount) && amount > 0 ? amount : fallback;
  }

  function formatPriceValue(value) {
    return `${Number(value || 0).toLocaleString('ru-RU')} ₽`;
  }

  function normalizeDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getTodayValue() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function getTodayDate() {
    return normalizeDate(new Date());
  }

  function formatBookingDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.${date.getFullYear()}`;
  }

  function isSameDate(firstDate, secondDate) {
    return Boolean(firstDate) && Boolean(secondDate)
      && firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  }

  function getDefaultBookingPrices() {
    const defaultAdultPrice = parsePriceValue(
      document.querySelector('.price-block .p-row .pv')?.textContent,
      1400
    );

    return {
      adult: defaultAdultPrice,
      senior: defaultAdultPrice,
      child: defaultAdultPrice,
      childFree: 0
    };
  }

  function extractPricesFromPriceBlock(priceBlock) {
    const fallback = getDefaultBookingPrices();
    if (!priceBlock) return fallback;

    const prices = {
      adult: 0,
      senior: 0,
      child: 0,
      childFree: 0
    };

    priceBlock.querySelectorAll('.p-row').forEach((row) => {
      const label = row.querySelector('.pn')?.textContent.toLowerCase() || '';
      const value = row.querySelector('.pv')?.textContent.trim() || '';

      if (label.includes('взрос')) prices.adult = parsePriceValue(value, fallback.adult);
      if (label.includes('пенсион')) prices.senior = parsePriceValue(value, fallback.senior || fallback.adult);
      if (label.includes('7') && label.includes('14')) prices.child = parsePriceValue(value, fallback.child || fallback.adult);
      if (label.includes('до 7')) prices.childFree = parsePriceValue(value, 0);
    });

    return {
      adult: prices.adult || fallback.adult,
      senior: prices.senior || prices.adult || fallback.senior || fallback.adult,
      child: prices.child || prices.adult || fallback.child || fallback.adult,
      childFree: prices.childFree
    };
  }

  function resolveBookingContext(triggerButton) {
    const pageTitle = document.querySelector('h1')?.textContent.trim() || 'Экскурсия';
    const pagePriceBlock = document.querySelector('.sidebar .price-block, .sidebar-mobile .price-block, .price-block');
    const pagePrices = extractPricesFromPriceBlock(pagePriceBlock);
    const excursionCard = triggerButton?.closest('.excursion-card');

    if (excursionCard) {
      const cardTitle = excursionCard.querySelector('h3')?.textContent.trim() || pageTitle;
      const cardAdultPrice = parsePriceValue(
        excursionCard.querySelector('.new-price')?.textContent,
        pagePrices.adult
      );

      return {
        title: cardTitle,
        prices: {
          adult: cardAdultPrice,
          senior: cardAdultPrice,
          child: cardAdultPrice,
          childFree: 0
        }
      };
    }

    const localPriceBlock = triggerButton?.closest('.sidebar, .sidebar-mobile')?.querySelector('.price-block');

    return {
      title: pageTitle,
      prices: extractPricesFromPriceBlock(localPriceBlock || pagePriceBlock)
    };
  }

  function setBookingContext(context) {
    bookingState.title = context.title;
    bookingState.prices = context.prices;

    const excursionName = document.getElementById('bookingExcursionName');
    if (excursionName) {
      excursionName.textContent = context.title;
    }
  }

  function updateBookingSummary() {
    const adultInput = document.getElementById('bookingAdults');
    const seniorInput = document.getElementById('bookingSeniors');
    const childInput = document.getElementById('bookingChildren');
    const childFreeInput = document.getElementById('bookingChildrenFree');
    const totalEl = document.getElementById('bookingTotalPrice');
    const submitBtn = document.getElementById('bookingSubmit');
    const policyCheck = document.getElementById('bookingPolicy');

    if (!adultInput || !seniorInput || !childInput || !childFreeInput || !totalEl || !submitBtn || !policyCheck) return;

    const counts = {
      adult: Number(adultInput.value) || 0,
      senior: Number(seniorInput.value) || 0,
      child: Number(childInput.value) || 0,
      childFree: Number(childFreeInput.value) || 0
    };

    const guestsTotal = counts.adult + counts.senior + counts.child + counts.childFree;
    const totalPrice =
      counts.adult * bookingState.prices.adult +
      counts.senior * bookingState.prices.senior +
      counts.child * bookingState.prices.child +
      counts.childFree * bookingState.prices.childFree;

    totalEl.textContent = formatPriceValue(totalPrice);
    submitBtn.disabled = guestsTotal === 0 || !policyCheck.checked;
    submitBtn.setAttribute('aria-disabled', String(submitBtn.disabled));

    document.querySelectorAll('[data-counter]').forEach((counter) => {
      const input = counter.querySelector('input');
      const decreaseBtn = counter.querySelector('[data-counter-action="decrease"]');
      if (!input || !decreaseBtn) return;
      decreaseBtn.disabled = (Number(input.value) || 0) === 0;
    });
  }

  function setBookingFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    const fieldWrap = field ? field.closest('.booking-field') : null;

    if (fieldWrap) fieldWrap.classList.add('has-error');
    if (field) field.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  function clearBookingFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    const fieldWrap = field ? field.closest('.booking-field') : null;

    if (fieldWrap) fieldWrap.classList.remove('has-error');
    if (field) field.removeAttribute('aria-invalid');
    if (error) error.hidden = true;
  }

  function validateBookingName(value) {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');
    if (!normalizedValue) return 'Введите корректные данные';
    if (normalizedValue.length < 2 || normalizedValue.length > 40) return 'Введите корректные данные';
    if (!/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(normalizedValue)) return 'Введите корректные данные';
    return '';
  }

  function validateBookingPhone(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return 'Введите корректные данные';
    if (digits[0] !== '7') return 'Введите корректные данные';
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) return 'Введите корректные данные';
    return '';
  }

  function validateBookingForm() {
    const nameInput = document.getElementById('bookingName');
    const phoneInput = document.getElementById('bookingPhone');
    if (!nameInput || !phoneInput) return true;

    let isValid = true;
    const nameError = validateBookingName(nameInput.value);
    const phoneError = validateBookingPhone(phoneInput.value);

    if (nameError) {
      setBookingFieldError('bookingName', 'bookingNameError', nameError);
      isValid = false;
    } else {
      clearBookingFieldError('bookingName', 'bookingNameError');
    }

    if (phoneError) {
      setBookingFieldError('bookingPhone', 'bookingPhoneError', phoneError);
      isValid = false;
    } else {
      clearBookingFieldError('bookingPhone', 'bookingPhoneError');
    }

    return isValid;
  }

  function clearBookingValidationErrors() {
    clearBookingFieldError('bookingName', 'bookingNameError');
    clearBookingFieldError('bookingPhone', 'bookingPhoneError');
  }

  function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');
    const timeInput = document.getElementById('bookingTime');
    const adultInput = document.getElementById('bookingAdults');
    const seniorInput = document.getElementById('bookingSeniors');
    const childInput = document.getElementById('bookingChildren');
    const childFreeInput = document.getElementById('bookingChildrenFree');

    if (form) form.reset();
    clearBookingValidationErrors();

    if (dateInput) {
      setBookingDate(getTodayDate());
    }

    if (timeInput) setBookingTime('12:00');
    if (adultInput) adultInput.value = '1';
    if (seniorInput) seniorInput.value = '0';
    if (childInput) childInput.value = '0';
    if (childFreeInput) childFreeInput.value = '0';

    updateBookingSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingModal);
    document.addEventListener('DOMContentLoaded', initBookingDatePicker);
    document.addEventListener('DOMContentLoaded', initBookingTimePicker);
    document.addEventListener('DOMContentLoaded', initBookingCounters);
  } else {
    initBookingModal();
    initBookingDatePicker();
    initBookingTimePicker();
    initBookingCounters();
  }

  function initBookingModal() {
    const bookBtns = document.querySelectorAll('.book-btn');
    const overlay = document.getElementById('overlay');
    const mClose = document.getElementById('mClose');
    const defaultTitle = document.querySelector('h1')?.textContent.trim() || 'Экскурсия';

    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');

    function openBookingModal(e) {
      e.preventDefault();
      e.stopPropagation();

      setBookingContext(resolveBookingContext(e.currentTarget));
      resetBookingForm();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeBookingModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    setBookingContext({
      title: defaultTitle,
      prices: getDefaultBookingPrices()
    });
    updateBookingSummary();

    bookBtns.forEach((btn) => {
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

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) {
        closeBookingModal();
      }
    });
  }

  function setBookingDate(date) {
    const bookingDateInput = document.getElementById('bookingDate');
    if (!bookingDateInput || !date) return;

    const normalizedDate = normalizeDate(date);
    bookingCalendarState.selectedDate = normalizedDate;
    bookingCalendarState.viewYear = normalizedDate.getFullYear();
    bookingCalendarState.viewMonth = normalizedDate.getMonth();

    bookingDateInput.value = formatBookingDate(normalizedDate);
    bookingDateInput.dataset.iso = normalizedDate.toISOString().slice(0, 10);
    bookingDateInput.setAttribute('aria-expanded', 'false');

    renderBookingCalendar();
  }

  function openBookingCalendar() {
    const popover = document.getElementById('bookingCalendarPopover');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingDateControl = document.getElementById('bookingDateControl');

    if (!popover || !bookingDateInput || !bookingDateControl) return;

    closeBookingTimeList();
    popover.hidden = false;
    bookingDateControl.classList.add('is-open');
    bookingDateInput.setAttribute('aria-expanded', 'true');
    renderBookingCalendar();
  }

  function closeBookingCalendar() {
    const popover = document.getElementById('bookingCalendarPopover');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingDateControl = document.getElementById('bookingDateControl');

    if (!popover || !bookingDateInput || !bookingDateControl) return;

    popover.hidden = true;
    bookingDateControl.classList.remove('is-open');
    bookingDateInput.setAttribute('aria-expanded', 'false');
  }

  function renderBookingCalendar() {
    const titleEl = document.getElementById('bookingCalendarTitle');
    const gridEl = document.getElementById('bookingCalendarGrid');
    const prevBtn = document.getElementById('bookingCalendarPrev');

    if (!titleEl || !gridEl || !prevBtn) return;

    const viewDate = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth, 1);
    const monthStartDay = (viewDate.getDay() + 6) % 7;
    const daysInMonth = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth, 0).getDate();
    const minMonthDate = new Date(
      bookingCalendarState.minDate.getFullYear(),
      bookingCalendarState.minDate.getMonth(),
      1
    );

    titleEl.textContent = `${BOOKING_MONTHS[bookingCalendarState.viewMonth]} ${bookingCalendarState.viewYear}`;
    prevBtn.disabled = viewDate <= minMonthDate;
    gridEl.innerHTML = '';

    for (let index = monthStartDay - 1; index >= 0; index -= 1) {
      const filler = document.createElement('button');
      filler.type = 'button';
      filler.className = 'booking-calendar-day is-muted';
      filler.textContent = String(prevMonthDays - index);
      filler.disabled = true;
      gridEl.appendChild(filler);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth, day);
      const normalizedCurrentDate = normalizeDate(currentDate);
      const dayButton = document.createElement('button');
      const isBeforeMinDate = normalizedCurrentDate < bookingCalendarState.minDate;

      dayButton.type = 'button';
      dayButton.className = 'booking-calendar-day';
      dayButton.textContent = String(day);

      if (isBeforeMinDate) {
        dayButton.classList.add('is-disabled');
        dayButton.disabled = true;
      } else {
        dayButton.addEventListener('click', () => {
          setBookingDate(normalizedCurrentDate);
          closeBookingCalendar();
        });
      }

      if (isSameDate(normalizedCurrentDate, bookingCalendarState.minDate)) {
        dayButton.classList.add('is-today');
      }

      if (isSameDate(normalizedCurrentDate, bookingCalendarState.selectedDate)) {
        dayButton.classList.add('is-selected');
      }

      gridEl.appendChild(dayButton);
    }

    const remainder = gridEl.children.length % 7;
    const trailingDays = remainder === 0 ? 0 : 7 - remainder;

    for (let day = 1; day <= trailingDays; day += 1) {
      const filler = document.createElement('button');
      filler.type = 'button';
      filler.className = 'booking-calendar-day is-muted';
      filler.textContent = String(day);
      filler.disabled = true;
      gridEl.appendChild(filler);
    }
  }

  function initBookingDatePicker() {
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingDateControl = document.getElementById('bookingDateControl');
    const popover = document.getElementById('bookingCalendarPopover');
    const prevBtn = document.getElementById('bookingCalendarPrev');
    const nextBtn = document.getElementById('bookingCalendarNext');

    if (!bookingDateInput || !bookingDateControl || !popover || !prevBtn || !nextBtn) return;

    bookingCalendarState.minDate = getTodayDate();
    setBookingDate(bookingCalendarState.minDate);
    closeBookingCalendar();

    bookingDateInput.addEventListener('click', () => {
      openBookingCalendar();
    });

    bookingDateInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBookingCalendar();
      }
    });

    prevBtn.addEventListener('click', () => {
      const nextViewDate = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth - 1, 1);
      const minMonthDate = new Date(
        bookingCalendarState.minDate.getFullYear(),
        bookingCalendarState.minDate.getMonth(),
        1
      );

      if (nextViewDate < minMonthDate) return;

      bookingCalendarState.viewYear = nextViewDate.getFullYear();
      bookingCalendarState.viewMonth = nextViewDate.getMonth();
      renderBookingCalendar();
    });

    nextBtn.addEventListener('click', () => {
      const nextViewDate = new Date(bookingCalendarState.viewYear, bookingCalendarState.viewMonth + 1, 1);
      bookingCalendarState.viewYear = nextViewDate.getFullYear();
      bookingCalendarState.viewMonth = nextViewDate.getMonth();
      renderBookingCalendar();
    });

    document.addEventListener('click', (event) => {
      if (!bookingDateControl.contains(event.target)) {
        closeBookingCalendar();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeBookingCalendar();
      }
    });
  }

  function setBookingTime(value) {
    const bookingTimeInput = document.getElementById('bookingTime');
    if (!bookingTimeInput) return;

    bookingTimeInput.value = value;
    bookingTimeInput.dataset.value = value;
    renderBookingTimeList();
  }

  function openBookingTimeList() {
    const popover = document.getElementById('bookingTimePopover');
    const bookingTimeInput = document.getElementById('bookingTime');
    const bookingTimeControl = document.getElementById('bookingTimeControl');

    if (!popover || !bookingTimeInput || !bookingTimeControl) return;

    closeBookingCalendar();
    popover.hidden = false;
    bookingTimeControl.classList.add('is-open');
    bookingTimeInput.setAttribute('aria-expanded', 'true');
    renderBookingTimeList();
  }

  function closeBookingTimeList() {
    const popover = document.getElementById('bookingTimePopover');
    const bookingTimeInput = document.getElementById('bookingTime');
    const bookingTimeControl = document.getElementById('bookingTimeControl');

    if (!popover || !bookingTimeInput || !bookingTimeControl) return;

    popover.hidden = true;
    bookingTimeControl.classList.remove('is-open');
    bookingTimeInput.setAttribute('aria-expanded', 'false');
  }

  function renderBookingTimeList() {
    const bookingTimeInput = document.getElementById('bookingTime');
    const bookingTimeList = document.getElementById('bookingTimeList');

    if (!bookingTimeInput || !bookingTimeList) return;

    const selectedTime = bookingTimeInput.value || '12:00';
    bookingTimeList.innerHTML = '';

    BOOKING_TIMES.forEach((timeValue) => {
      const option = document.createElement('button');
      const isSelected = selectedTime === timeValue;

      option.type = 'button';
      option.className = 'booking-time-option';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(isSelected));
      if (isSelected) option.classList.add('is-selected');

      const label = document.createElement('span');
      label.textContent = timeValue;
      option.appendChild(label);

      if (isSelected) {
        const check = document.createElement('span');
        check.className = 'booking-time-option-check';
        check.textContent = '✓';
        option.appendChild(check);
      }

      option.addEventListener('click', () => {
        setBookingTime(timeValue);
        closeBookingTimeList();
      });

      bookingTimeList.appendChild(option);
    });

    const selectedOption = bookingTimeList.querySelector('.booking-time-option.is-selected');
    if (selectedOption) {
      selectedOption.scrollIntoView({ block: 'nearest' });
    }
  }

  function initBookingTimePicker() {
    const bookingTimeInput = document.getElementById('bookingTime');
    const bookingTimeControl = document.getElementById('bookingTimeControl');

    if (!bookingTimeInput || !bookingTimeControl) return;

    setBookingTime(bookingTimeInput.value || '12:00');
    closeBookingTimeList();

    bookingTimeInput.addEventListener('click', () => {
      openBookingTimeList();
    });

    bookingTimeInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBookingTimeList();
      }
    });

    document.addEventListener('click', (event) => {
      if (!bookingTimeControl.contains(event.target)) {
        closeBookingTimeList();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeBookingTimeList();
      }
    });
  }

  function initBookingCounters() {
    const adultInput = document.getElementById('bookingAdults');
    const seniorInput = document.getElementById('bookingSeniors');
    const childInput = document.getElementById('bookingChildren');
    const childFreeInput = document.getElementById('bookingChildrenFree');
    const submitBtn = document.getElementById('bookingSubmit');
    const policyCheck = document.getElementById('bookingPolicy');
    const form = document.getElementById('bookingForm');
    const nameInput = document.getElementById('bookingName');
    const phoneInput = document.getElementById('bookingPhone');
    const dateInput = document.getElementById('bookingDate');
    const totalEl = { textContent: '' };
    const adultPriceEl = null;
    const childPriceEl = null;

    if (!adultInput || !seniorInput || !childInput || !childFreeInput || !submitBtn || !policyCheck || !form) return;

    if (dateInput) {
      dateInput.readOnly = true;
    }

    function getPriceByLabel() {
      return '';
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

    document.querySelectorAll('[data-counter]').forEach((counter) => {
      counter.addEventListener('click', () => {
        updateBookingSummary();
      });
    });

    if (policyCheck) {
      policyCheck.addEventListener('change', updateBookingSummary);
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        let digits = phoneInput.value.replace(/\D/g, '');

        if (!digits) {
          phoneInput.value = '';
          return;
        }

        if (digits[0] === '8') digits = `7${digits.slice(1)}`;
        if (digits[0] !== '7') digits = `7${digits}`;
        digits = digits.slice(0, 11);

        let formatted = '+7';
        if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
        if (digits.length >= 4) formatted += ')';
        if (digits.length > 4) formatted += ` ${digits.slice(4, 7)}`;
        if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
        if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;

        phoneInput.value = formatted;
        if (phoneInput.value.length >= 18 || !phoneInput.value) {
          validateBookingForm();
        } else {
          clearBookingFieldError('bookingPhone', 'bookingPhoneError');
        }
      });

      phoneInput.addEventListener('blur', validateBookingForm);
    }

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (!nameInput.value.trim()) {
          clearBookingFieldError('bookingName', 'bookingNameError');
          return;
        }

        const nameError = validateBookingName(nameInput.value);
        if (nameError) {
          setBookingFieldError('bookingName', 'bookingNameError', nameError);
        } else {
          clearBookingFieldError('bookingName', 'bookingNameError');
        }
      });

      nameInput.addEventListener('blur', validateBookingForm);
    }

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (submitBtn.disabled) return;
        if (!validateBookingForm()) return;

        window.doSubmit();
        resetBookingForm();
      });
    }

    updateBookingTotal();
    updateBookingSummary();
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
      overlay.setAttribute('aria-hidden', 'true');
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
  const tabs = Array.from(document.querySelectorAll('.exc-tab'));
  const sections = ['sec-route','sec-about','sec-info','sec-departure','sec-similar','sec-reviews','excTourReviews'];
  if (!tabs.length) return;

  function getScrollOffset() {
    const tabsOuter = document.querySelector('.exc-tabs-outer');
    return (tabsOuter?.offsetHeight || 58) + 10;
  }

  function scrollToSection(sectionId, behavior = 'smooth') {
    const section = document.getElementById(sectionId);
    if (!section) return false;

    const top = section.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top, behavior });

    if (window.location.hash !== `#${sectionId}`) {
      history.replaceState(null, '', `#${sectionId}`);
    }

    return true;
  }

  function syncActiveTab() {
    let current = sections[0];
    const threshold = window.scrollY + getScrollOffset() + 16;

    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section && threshold >= section.offsetTop) current = id;
    });

    const activeTarget = current === 'sec-reviews' ? 'excTourReviews' : current;
    tabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-target') === activeTarget));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-target');
      if (!id) return;
      scrollToSection(id);
      syncActiveTab();
    });
  });

  syncActiveTab();
  window.addEventListener('scroll', syncActiveTab, { passive: true });

  if (window.location.hash) {
    const hashTarget = decodeURIComponent(window.location.hash.slice(1));
    if (sections.includes(hashTarget)) {
      window.requestAnimationFrame(() => {
        scrollToSection(hashTarget, 'auto');
        syncActiveTab();
      });
    }
  }
})();

(function() {
  const routeItems = document.querySelectorAll('.route-item[data-route-link]');
  if (!routeItems.length) return;

  routeItems.forEach(item => {
    const openRouteLink = () => {
      const link = item.getAttribute('data-route-link');
      if (!link) return;
      window.location.href = link;
    };

    item.addEventListener('click', openRouteLink);
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openRouteLink();
    });
  });
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
