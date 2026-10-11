const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const menuToggle = document.getElementById('menu-toggle');
const navigation = document.getElementById('primary-navigation');
const navLinks = [...document.querySelectorAll('.nav-link')];
const contactForm = document.getElementById('contact-form');

function setTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
  themeToggle.firstElementChild.textContent = isDark ? '☼' : '◐';
}

let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('teamcode-theme') || 'light';
} catch {
  savedTheme = 'light';
}
setTheme(savedTheme === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  try {
    localStorage.setItem('teamcode-theme', nextTheme);
  } catch {
    // The theme still works for this page when storage is unavailable.
  }
});

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks.forEach((link) => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavigation();
});

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visibleSection) return;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${visibleSection.target.id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4] });

  sections.forEach((section) => sectionObserver.observe(section));
}

const typedText = document.getElementById('typed-text');
const phrases = ['with care', 'with curiosity', 'together'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typedText && !reduceMotion) {
  let phraseIndex = 0;
  let characterIndex = phrases[0].length;
  let deleting = true;

  function typeNextCharacter() {
    const phrase = phrases[phraseIndex];
    characterIndex += deleting ? -1 : 1;
    typedText.textContent = phrase.slice(0, characterIndex);

    if (deleting && characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(typeNextCharacter, 300);
      return;
    }

    if (!deleting && characterIndex === phrases[phraseIndex].length) {
      deleting = true;
      window.setTimeout(typeNextCharacter, 1550);
      return;
    }

    window.setTimeout(typeNextCharacter, deleting ? 45 : 78);
  }

  window.setTimeout(typeNextCharacter, 2100);
}

const currentYear = document.getElementById('current-year');
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

if (contactForm) {
  const fieldNames = ['name', 'email', 'subject', 'message'];
  const formMessage = document.getElementById('form-message');

  function showFieldError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
  }

  fieldNames.forEach((fieldName) => {
    const field = contactForm.elements.namedItem(fieldName);
    field.addEventListener('input', () => {
      if (field.value.trim() && field.checkValidity()) showFieldError(field, '');
      formMessage.textContent = '';
      formMessage.classList.remove('is-error');
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let firstInvalidField = null;

    fieldNames.forEach((fieldName) => {
      const field = contactForm.elements.namedItem(fieldName);
      const value = field.value.trim();
      let error = '';

      if (!value) error = 'Please complete this field.';
      else if (!field.checkValidity()) error = 'Enter a valid email address.';

      showFieldError(field, error);
      if (error && !firstInvalidField) firstInvalidField = field;
    });

    if (firstInvalidField) {
      formMessage.textContent = 'Check the highlighted fields and try again.';
      formMessage.classList.add('is-error');
      firstInvalidField.focus();
      return;
    }

    formMessage.textContent = 'Thanks. Your message passed validation; this demo does not send email.';
    formMessage.classList.remove('is-error');
    contactForm.reset();
    fieldNames.forEach((fieldName) => showFieldError(contactForm.elements.namedItem(fieldName), ''));
  });
}
