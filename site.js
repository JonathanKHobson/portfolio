const dialog = document.querySelector('.image-dialog');
let returnFocus;
document.querySelectorAll('.expand-image').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  dialog.querySelector('img').src = button.dataset.src;
  dialog.querySelector('img').alt = button.dataset.alt;
  dialog.querySelector('p').textContent = button.dataset.alt;
  dialog.querySelector('.dialog-original').href = button.dataset.src;
  dialog.classList.remove('zoomed');
  dialog.querySelector('.dialog-zoom').setAttribute('aria-pressed', 'false');
  dialog.querySelector('.dialog-zoom').textContent = 'Zoom in';
  dialog.showModal();
}));
dialog?.querySelector('.dialog-zoom').addEventListener('click', event => {
  const zoomed = dialog.classList.toggle('zoomed');
  event.currentTarget.setAttribute('aria-pressed', String(zoomed));
  event.currentTarget.textContent = zoomed ? 'Fit image' : 'Zoom in';
});
dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => returnFocus?.focus());
