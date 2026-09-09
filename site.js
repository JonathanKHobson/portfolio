const dialog = document.querySelector('.image-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('img:not(.ui-icon)');
  const description = dialog.querySelector('.image-caption');
  const imageError = dialog.querySelector('.image-error');
  const original = dialog.querySelector('.dialog-original');
  const zoom = dialog.querySelector('.dialog-zoom');
  let returnFocus;
  let pointerStartedOutside = false;

  const outsideDialog = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  };

  document.querySelectorAll('a.expand-image').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      returnFocus = link;
      image.hidden = false;
      image.style.removeProperty('display');
      imageError.hidden = true;
      image.src = link.href;
      image.alt = link.dataset.alt || '';
      description.textContent = link.dataset.alt || '';
      original.href = link.href;
      dialog.classList.remove('zoomed');
      zoom.setAttribute('aria-pressed', 'false');
      zoom.textContent = 'Zoom in';
      pointerStartedOutside = false;
      dialog.showModal();
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
    });
  });

  image.addEventListener('error', () => {
    image.hidden = true;
    image.style.display = 'none';
    imageError.hidden = false;
  });
  image.addEventListener('load', () => {
    image.hidden = false;
    image.style.removeProperty('display');
    imageError.hidden = true;
  });

  zoom.addEventListener('click', () => {
    const zoomed = dialog.classList.toggle('zoomed');
    zoom.setAttribute('aria-pressed', String(zoomed));
    zoom.textContent = zoomed ? 'Fit image' : 'Zoom in';
    if (!zoomed) {
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
    }
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('pointerdown', event => {
    pointerStartedOutside = event.target === dialog && outsideDialog(event);
  });
  dialog.addEventListener('pointercancel', () => { pointerStartedOutside = false; });
  dialog.addEventListener('click', event => {
    if (pointerStartedOutside && event.target === dialog && outsideDialog(event)) dialog.close();
    pointerStartedOutside = false;
  });
  dialog.addEventListener('close', () => {
    pointerStartedOutside = false;
    if (returnFocus?.isConnected) returnFocus.focus();
  });
}

// Section links remain ordinary anchors; this only marks the chapter in view.
const chapterLinks = [...document.querySelectorAll('.case-nav a[href^="#"]')];
const chapters = chapterLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
if (chapters.length && 'IntersectionObserver' in window) {
  const markChapter = () => {
    const inView = chapters.some(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < window.innerHeight;
    });
    const current = inView
      ? chapters.filter(section => section.getBoundingClientRect().top <= window.innerHeight * 0.35).at(-1) || chapters[0]
      : null;
    chapterLinks.forEach(link => {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const chapterObserver = new IntersectionObserver(markChapter, {
    rootMargin: '-15% 0px -65% 0px', threshold: 0,
  });
  chapters.forEach(section => chapterObserver.observe(section));
  markChapter();
}

// Media requests are initiated only by an explicit play action.
document.querySelectorAll('.teaching-player[data-video-id]').forEach(player => {
  const button = player.querySelector('.video-load');
  const id = player.dataset.videoId;
  if (!button || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = player.dataset.videoTitle;
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame);
    frame.focus();
  });
});
