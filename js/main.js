/*
  Local clone shim JS
  ------------------
  The cloned pages are Framer app shells that load Framer's own JS bundles to
  reproduce all microinteractions exactly.

  This file is intentionally minimal and used for:
  - Static-host routing helpers (404 -> index)
  - Small progressive enhancements that don't fight Framer hydration
*/

(function () {
  // Static-host SPA routing helper:
  // Some static hosts (notably GitHub Pages) return `404.html` for deep links.
  // Our `404.html` stores the intended path in sessionStorage, then redirects to `/`.
  // When `/` loads, we restore the path so Framer's router can render the correct page.
  try {
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      history.replaceState(null, "", redirectPath);
    }
  } catch {
    // Intentionally ignore storage errors (privacy mode / blocked storage).
  }
})();

