const THEME_STORAGE_KEY = 'cubri-theme';

function aplicarTema(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = isDark ? '#0f172a' : '#f5f7fb';

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    button.title = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
    const label = button.querySelector('.theme-toggle-label');
    if (label) label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  });

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('No se pudo guardar la preferencia del tema.', error);
    }
  }
}

function crearControlTema(className) {
  const button = document.createElement('button');
  button.className = `theme-toggle ${className}`;
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `
    <svg class="theme-toggle-icon theme-toggle-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
    </svg>
    <svg class="theme-toggle-icon theme-toggle-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
    </svg>
    <span class="theme-toggle-label">Modo oscuro</span>
  `;
  button.addEventListener('click', () => {
    aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
  return button;
}

export function initializeTheme() {
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.warn('No se pudo leer la preferencia del tema.', error);
  }

  document.querySelector('.site-nav')?.append(crearControlTema('theme-toggle-desktop'));

  const mobileHost = document.querySelector('.mobile-view-header, .result-card');
  if (mobileHost) mobileHost.append(crearControlTema('theme-toggle-mobile'));

  aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'dark' : savedTheme);
}
