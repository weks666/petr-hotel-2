// Explicit hidden state works even in browsers without the Popover API.
let current = null;
let opener = null;
let previousOverflow = '';

export function closePopup(panel = current, restoreFocus = true) {
  if (!panel || panel !== current) return;
  if (panel.open && typeof panel.close === 'function') panel.close();
  panel.removeAttribute('open');
  panel.hidden = true;
  document.querySelectorAll('[data-popup-target]').forEach(button => {
    if (button.dataset.popupTarget === panel.id) button.setAttribute('aria-expanded', 'false');
  });
  current = null;
  document.body.style.overflow = previousOverflow;
  if (restoreFocus) opener?.focus();
}

function openPopup(panel, button) {
  if (current === panel) { closePopup(); return; }
  closePopup(current, false);
  opener = button;
  previousOverflow = document.body.style.overflow;
  current = panel;
  panel.hidden = false;
  if (typeof panel.showModal === 'function') panel.showModal();
  else { panel.setAttribute('open', ''); panel.classList.add('popup-fallback'); }
  document.body.style.overflow = 'hidden';
  button.setAttribute('aria-expanded', 'true');
  const focusable = panel.querySelector('[autofocus], input:not([type="hidden"]), select, button, a[href]');
  (focusable || panel).focus();
}

document.querySelectorAll('[data-popup]').forEach(panel => {
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.tabIndex = -1;
  const heading = panel.querySelector('h2, .popover-title, label');
  if (heading) panel.setAttribute('aria-label', heading.textContent.trim());
  panel.addEventListener('cancel', event => { event.preventDefault(); closePopup(panel); });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const box = panel.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePopup(panel);
  });
});
document.querySelectorAll('[data-popup-target]').forEach(button => {
  button.setAttribute('aria-controls', button.dataset.popupTarget);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.dataset.popupTarget);
    if (!panel) return;
    if (button.dataset.popupAction === 'hide') closePopup(panel);
    else openPopup(panel, button);
  });
});
document.addEventListener('keydown', event => {
  if (!current) return;
  if (event.key === 'Escape') { event.preventDefault(); closePopup(); return; }
  if (event.key !== 'Tab') return;
  const items = [...current.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex="0"]')]
    .filter(el => !el.disabled && !el.hidden && el.getClientRects().length);
  const first = items[0], last = items[items.length - 1];
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === current)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
