/* ============================================================
   VALANS – main.js
   Funciones: Accordion | Checkbox | Form validation | Carousel | Scroll reveal
   ============================================================ */

/* ============================================================
   ACCORDION
   Abre/cierra los paneles de información.
   Llama a esta función desde el atributo onclick del botón.
   ============================================================ */
function toggleAccordion(btn) {
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  // Cerrar todos primero
  document.querySelectorAll('.accordion-trigger').forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    b.nextElementSibling.classList.remove('open');
  });

  // Si estaba cerrado, abrir el pulsado
  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    btn.nextElementSibling.classList.add('open');
  }
}


/* ============================================================
   CHECKBOX PERSONALIZADO
   Alterna la clase "checked" en el cuadro visual.
   ============================================================ */
function toggleCheckbox(label) {
  const box = label.querySelector('.checkbox-box');
  box.classList.toggle('checked');
}


/* ============================================================
   FORMULARIO – VALIDACIÓN Y ENVÍO
   ============================================================ */
function handleSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById('emailInput');
  const emailHint  = document.getElementById('emailHint');
  const email      = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validar email
  if (!emailRegex.test(email)) {
    emailHint.classList.add('visible');
    emailInput.parentElement.style.borderColor = 'var(--error)';
    return;
  }

  // Email válido: limpiar errores
  emailHint.classList.remove('visible');
  emailInput.parentElement.style.borderColor = '';

  // Feedback visual de envío correcto
  const btn = e.target;
  btn.textContent = '✓ Message sent!';
  btn.style.background = '#4a7c59';

  setTimeout(() => {
    btn.textContent   = 'Submit';
    btn.style.background = '';
  }, 3000);
}


/* ============================================================
   CAROUSEL
   - Autoplay cada 3,5 s (se pausa al hacer hover)
   - Arrastrar la barra de progreso con el ratón
   - Swipe táctil en el track
   - Responsive: recalcula anchos al redimensionar
   ============================================================ */
(function initCarousel() {
  const track    = document.getElementById('carouselTrack');
  const thumb    = document.getElementById('carouselThumb');
  const progress = document.getElementById('carouselProgress');

  // Si los elementos no existen, salir
  if (!track || !thumb || !progress) return;

  const slides = track.querySelectorAll('.carousel-slide');
  let current    = 0;
  let isDragging = false;
  let startX     = 0;
  let scrollStart = 0;

  /* --- Helpers --- */

  function getSlideWidth() {
    if (slides.length === 0) return 0;
    return slides[0].offsetWidth + 16; // 16px = gap
  }

  function getVisibleCount() {
    const wrapWidth = track.parentElement.offsetWidth;
    return Math.max(1, Math.floor(wrapWidth / getSlideWidth()));
  }

  function maxIndex() {
    return Math.max(0, slides.length - getVisibleCount());
  }

  function updateSlideWidths() {
    const wrapWidth = track.parentElement.offsetWidth;
    const visible   = getVisibleCount();
    const slideW    = Math.floor((wrapWidth - (visible - 1) * 16) / visible);
    slides.forEach(s => { s.style.width = slideW + 'px'; });
  }

  function updateThumb() {
    const total = maxIndex();
    if (total === 0) {
      thumb.style.width = '100%';
      thumb.style.left  = '0';
      return;
    }
    const ratio   = getVisibleCount() / slides.length;
    const thumbW  = Math.max(40, progress.offsetWidth * ratio);
    const maxLeft = progress.offsetWidth - thumbW;
    const left    = (current / total) * maxLeft;

    thumb.style.width = thumbW + 'px';
    thumb.style.left  = left + 'px';
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    updateThumb();
  }

  /* --- Drag on progress bar --- */

  progress.addEventListener('mousedown', e => {
    isDragging  = true;
    startX      = e.clientX;
    scrollStart = current;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx     = e.clientX - startX;
    const thumbW = parseFloat(thumb.style.width) || 60;
    const ratio  = dx / (progress.offsetWidth - thumbW);
    goTo(Math.round(scrollStart + ratio * maxIndex()));
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  /* --- Touch swipe on carousel track --- */

  let touchStartX = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  });

  /* --- Autoplay --- */

  let autoPlay = setInterval(() => {
    goTo(current < maxIndex() ? current + 1 : 0);
  }, 3500);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
      goTo(current < maxIndex() ? current + 1 : 0);
    }, 3500);
  });

  /* --- Init & resize --- */

  updateSlideWidths();
  goTo(0);

  window.addEventListener('resize', () => {
    updateSlideWidths();
    goTo(current);
  });
})();


/* ============================================================
   SCROLL REVEAL
   Observa los elementos con clase .reveal y les añade
   .visible cuando entran en el viewport.
   ============================================================ */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();
