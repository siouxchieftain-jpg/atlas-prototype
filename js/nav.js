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
