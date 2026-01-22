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


/*
  Auto-detect dark backgrounds for navigation header
  --------------------------------------------------
  Monitors the background color behind the fixed header and dynamically
  changes header text to white when over dark sections.
*/
(function () {
  // Function to calculate brightness of an RGB color (0-255 scale)
  function getBrightness(r, g, b) {
    return (r + g + b) / 3;
  }

  // Function to extract RGB values from a color string
  function parseColor(colorString) {
    if (!colorString) return null;
    
    // Handle rgb() and rgba() formats
    const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    
    // Handle hex format (#RRGGBB)
    const hexMatch = colorString.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
      };
    }
    
    return null;
  }

  // Function to check if header is over a dark background
  function updateHeaderColor() {
    // Find the header element (it should be one of the first fixed/sticky elements)
    const header = document.querySelector('[data-framer-cursor="c1xkw4"]') || 
                   document.querySelector('.framer-1ks9ibs-container')?.nextElementSibling ||
                   document.querySelector('[data-framer-component-type="NavigationContainer"]');
    
    if (!header) return;

    // Get the vertical position where we want to check the background
    // (slightly below the top to avoid the header itself)
    const checkY = 50;
    const checkX = window.innerWidth / 2; // Middle of the screen

    // Temporarily hide the header to check what's behind it
    const originalPointerEvents = header.style.pointerEvents;
    header.style.pointerEvents = 'none';
    
    // Get the element at that position
    const elementBehind = document.elementFromPoint(checkX, checkY);
    
    // Restore header's pointer events
    header.style.pointerEvents = originalPointerEvents;

    if (!elementBehind) return;

    // Get the computed background color of the element behind the header
    let bgColor = null;
    let currentElement = elementBehind;
    
    // Walk up the DOM tree until we find a non-transparent background
    while (currentElement && currentElement !== document.body) {
      const computedStyle = window.getComputedStyle(currentElement);
      const backgroundColor = computedStyle.backgroundColor;
      
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        bgColor = parseColor(backgroundColor);
        break;
      }
      
      currentElement = currentElement.parentElement;
    }

    // If we still don't have a color, check the body background
    if (!bgColor) {
      const bodyStyle = window.getComputedStyle(document.body);
      bgColor = parseColor(bodyStyle.backgroundColor);
    }

    // Calculate brightness and toggle class
    if (bgColor) {
      const brightness = getBrightness(bgColor.r, bgColor.g, bgColor.b);
      const isDark = brightness < 128;
      
      if (isDark) {
        header.classList.add('header-on-dark');
      } else {
        header.classList.remove('header-on-dark');
      }
    }
  }

  // Debounce function to limit how often we check (for performance)
  let scrollTimeout;
  function debounceUpdateHeaderColor() {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(updateHeaderColor);
  }

  // Wait for the page to be fully loaded and Framer to hydrate
  function init() {
    updateHeaderColor();
    window.addEventListener('scroll', debounceUpdateHeaderColor);
    window.addEventListener('resize', debounceUpdateHeaderColor);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also re-check after a short delay to catch Framer's hydration
  setTimeout(updateHeaderColor, 500);
  setTimeout(updateHeaderColor, 1500);
})();
