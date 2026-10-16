(() => {
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeIcon = themeButton.querySelector('.theme-icon');
  const themeKey = 'kaiqi-portfolio-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const deck = document.getElementById('friends-photos');
  const albumButton = document.getElementById('album-toggle');
  const albumLabel = albumButton.querySelector('[data-en]');
  const cards = Array.from(deck.querySelectorAll('.photo-card'));
  const viewer = document.getElementById('photo-viewer');
  const viewerImage = document.getElementById('viewer-image');
  const counter = document.getElementById('photo-counter');
  let expanded = false;
  let photoIndex = 0;
  let explicitTheme = false;
  try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem(themeKey)); } catch (_) {}
  const chinese = () => document.documentElement.lang === 'zh-CN';
  function refreshLabels() {
    const zh = chinese();
    const dark = document.documentElement.dataset.theme === 'dark';
    const themeText = dark ? (zh ? '浅色' : 'Light') : (zh ? '深色' : 'Dark');
    themeLabel.textContent = themeText;
    themeIcon.textContent = dark ? '☀' : '☾';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', zh ? '切换到' + themeText + '模式' : 'Switch to ' + themeText.toLowerCase() + ' mode');
    themeButton.title = themeButton.getAttribute('aria-label');
    albumLabel.textContent = zh ? (expanded ? '收起相册' : '展开相册') : (expanded ? 'Stack photos' : 'Unfold photos');
    cards.forEach((card, i) => {
      card.setAttribute('aria-label', expanded ? (zh ? '放大查看照片 ' : 'View photo ') + (i + 1) : (zh ? '展开相册' : 'Unfold photos'));
      card.querySelector('img').alt = (zh ? '生活照片 ' : 'Personal photo ') + (i + 1);
    });
    viewer.setAttribute('aria-label', zh ? '照片查看器' : 'Photo viewer');
    if (viewer.open) viewerImage.alt = cards[photoIndex].querySelector('img').alt;
  }
  function applyTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    if (persist) {
      explicitTheme = true;
      try { localStorage.setItem(themeKey, document.documentElement.dataset.theme); } catch (_) {}
    }
    refreshLabels();
  }
  themeButton.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  media.addEventListener?.('change', event => { if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light', false); });
  document.addEventListener('portfolio-language-change', refreshLabels);
  function setExpanded(value) {
    expanded = value;
    deck.dataset.expanded = String(expanded);
    albumButton.setAttribute('aria-expanded', String(expanded));
    cards.forEach((card, i) => {
      card.tabIndex = expanded || i === 0 ? 0 : -1;
      if (expanded || i === 0) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    });
    if (!expanded && deck.contains(document.activeElement)) albumButton.focus();
    refreshLabels();
  }
  function showPhoto(index) {
    photoIndex = (index + cards.length) % cards.length;
    const image = cards[photoIndex].querySelector('img');
    viewerImage.src = image.getAttribute('src');
    viewerImage.alt = image.alt;
    counter.textContent = (photoIndex + 1) + ' / ' + cards.length;
    if (!viewer.open) {
      viewer.showModal();
      document.body.classList.add('viewer-open');
    }
  }
  albumButton.addEventListener('click', () => setExpanded(!expanded));
  cards.forEach((card, i) => card.addEventListener('click', () => expanded ? showPhoto(i) : setExpanded(true)));
  document.getElementById('photo-close').addEventListener('click', () => viewer.close());
  document.getElementById('photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  document.getElementById('photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  });
  applyTheme(document.documentElement.dataset.theme || (media.matches ? 'dark' : 'light'), false);
})();
