/**
 * Controlador de la Presentación Interactiva
 * Manejo de eventos, navegación por diapositivas, atajos de teclado y temas.
 */
document.addEventListener('DOMContentLoaded', () => {
  let currentSlide = 1;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;

  const lblSlideCurrent = document.getElementById('lblSlideCurrent');
  const lblSlideTotal = document.getElementById('lblSlideTotal');
  const dotsContainer = document.getElementById('dotsContainer');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSpeakerNotes = document.getElementById('btnSpeakerNotes');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const speakerDrawer = document.getElementById('speakerDrawer');
  const drawerContent = document.getElementById('drawerContent');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeLabel = document.getElementById('themeLabel');

  if (lblSlideTotal) lblSlideTotal.textContent = totalSlides;

  // Generar puntos de navegación (dots)
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `dot-step ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('title', `Ir a diapositiva ${idx + 1}`);
      dot.addEventListener('click', () => setSlide(idx + 1));
      dotsContainer.appendChild(dot);
    });
  }

  // Función para cambiar de diapositiva
  function setSlide(n) {
    if (n < 1 || n > totalSlides) return;
    currentSlide = n;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx + 1 === currentSlide);
    });

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot-step');
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx + 1 === currentSlide);
      });
    }

    if (lblSlideCurrent) lblSlideCurrent.textContent = currentSlide;
    if (btnPrev) btnPrev.disabled = currentSlide === 1;
    if (btnNext) btnNext.disabled = currentSlide === totalSlides;

    if (drawerContent && window.speakerNotes) {
      drawerContent.innerHTML = window.speakerNotes[currentSlide] || 'Sin notas para esta diapositiva.';
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', () => setSlide(currentSlide - 1));
  if (btnNext) btnNext.addEventListener('click', () => setSlide(currentSlide + 1));

  // Alternar panel de notas del orador
  function toggleNotes() {
    if (!speakerDrawer) return;
    speakerDrawer.classList.toggle('open');
    if (btnSpeakerNotes) btnSpeakerNotes.classList.toggle('active');
  }

  if (btnSpeakerNotes) btnSpeakerNotes.addEventListener('click', toggleNotes);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', toggleNotes);

  // Pantalla Completa
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen();
      }
    });
  }

  // Alternar Tema Claro (Gamma) / Oscuro
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const isLight = document.body.getAttribute('data-theme') === 'light';
      document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
      if (themeLabel) themeLabel.textContent = isLight ? 'Claro' : 'Oscuro';
    });
  }

  // Atajos de Teclado
  document.addEventListener('keydown', (e) => {
    // Si el usuario está en un input/textarea, ignorar atajos
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      setSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSlide(currentSlide - 1);
    } else if (e.key.toLowerCase() === 'n') {
      toggleNotes();
    } else if (e.key.toLowerCase() === 'f') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen();
      }
    }
  });

  // Inicializar en la diapositiva 1
  setSlide(1);
});
