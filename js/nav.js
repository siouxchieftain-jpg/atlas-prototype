/* ATLAS Prototype — Minimal navigation JavaScript
   Allowed: expand/collapse, tab switching, page navigation.
   Disallowed: form validation, data persistence, animations beyond simple transitions, computed state. */

// Expand/collapse for System 1 → System 2 layering
document.addEventListener('click', function(e) {
  var header = e.target.closest('.expandable-header');
  if (!header) return;

  var content = header.nextElementSibling;
  if (!content || !content.classList.contains('expandable-content')) return;

  var icon = header.querySelector('.toggle-icon');
  content.classList.toggle('visible');
  if (icon) icon.classList.toggle('open');
});

// Confidence slider display update (display only)
document.addEventListener('input', function(e) {
  if (!e.target.classList.contains('confidence-slider')) return;
  var display = e.target.parentElement.querySelector('.confidence-value');
  if (display) display.textContent = e.target.value + ' / 100';
});

// Language toggle (NO/EN)
function setLanguage(lang) {
  document.querySelectorAll('[data-en]').forEach(function(el) {
    if (!el.dataset.no) el.dataset.no = el.innerHTML;
    el.innerHTML = (lang === 'en') ? el.dataset.en : el.dataset.no;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(function(el) {
    if (!el.dataset.noPlaceholder) el.dataset.noPlaceholder = el.placeholder;
    el.placeholder = (lang === 'en') ? el.dataset.enPlaceholder : el.dataset.noPlaceholder;
  });
  document.querySelectorAll('[data-en-value]').forEach(function(el) {
    if (!el.dataset.noValue) el.dataset.noValue = el.value;
    el.value = (lang === 'en') ? el.dataset.enValue : el.dataset.noValue;
  });
  document.querySelectorAll('.lang-toggle button').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  try { sessionStorage.setItem('atlas-lang', lang); } catch(e) {}
}

document.addEventListener('click', function(e) {
  var btn = e.target.closest('.lang-toggle button');
  if (btn && btn.dataset.lang) setLanguage(btn.dataset.lang);
});

document.addEventListener('DOMContentLoaded', function() {
  try {
    var saved = sessionStorage.getItem('atlas-lang');
    if (saved === 'en') setLanguage('en');
  } catch(e) {}
});
