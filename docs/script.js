let zIndex = 3;

function focusWindow(windowToFocus) {
  if (window.innerWidth > 768) {
    // Desktop behavior
    // Get current position from fixed positioning before making any changes
    const rect = windowToFocus.getBoundingClientRect();

    windowToFocus.style.display = "block";

    // Remove any transforms which could interfere with dragging
    if (windowToFocus.style.transform) {
      windowToFocus.style.transform = "none";
      windowToFocus.style.left = `${rect.left}px`;
      windowToFocus.style.top = `${rect.top}px`;
    }

    // Ensure windowToFocus is fixed positioned
    windowToFocus.style.position = "fixed";

    // Bring windowToFocus to front
    windowToFocus.style.zIndex = zIndex++;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const windows = document.querySelectorAll(".window");
  const icons = document.querySelectorAll(".desktop-icon");

  if (window.innerWidth <= 768) {
    // Show all windows on mobile
    windows.forEach((window) => {
      window.style.display = "block";
    });
  }

  // Update resize handler for desktop only
  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      windows.forEach((window) => {
        window.style.position = "static";
        window.style.display = "block";
      });
      return;
    }

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      windows.forEach((window) => {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const windowWidth = window.offsetWidth;
        const windowHeight = window.offsetHeight;

        window.style.left = `${(viewportWidth - windowWidth) / 2}px`;
        window.style.top = `${(viewportHeight - windowHeight) / 2}px`;
      });
    }, 250);
  });

  // Update icon click handler for smooth scrolling on mobile
  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const matchingWindow = document.getElementById(
        icon.getAttribute("href").substring(1),
      );

      if (window.innerWidth <= 768) {
        e.preventDefault();
        matchingWindow.scrollIntoView({ behavior: "smooth" });
      } else if (matchingWindow) {
        focusWindow(matchingWindow);
      }
    });
  });

  // Only attach window drag handlers on desktop
  if (window.innerWidth > 768) {
    windows.forEach((fakeWindow) => {
      const titleBar = fakeWindow.querySelector(".title-bar");
      let isDragging = false;

      // Variables to track mouse movement
      let lastMouseX = 0;
      let lastMouseY = 0;

      // Handle mousedown on the title bar
      titleBar.addEventListener("mousedown", (e) => {
        isDragging = true;

        // Record initial mouse position
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        focusWindow(fakeWindow);

        // Prevent text selection and default behaviors
        e.preventDefault();
      });

      // Handle mouse movement
      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // Calculate how far the mouse has moved since last position
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        // Update last known mouse position
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Get current window position
        const currentLeft =
          parseInt(fakeWindow.style.left) ||
          fakeWindow.getBoundingClientRect().left;
        const currentTop =
          parseInt(fakeWindow.style.top) ||
          fakeWindow.getBoundingClientRect().top;

        // Move window by the delta amount
        fakeWindow.style.left = `${currentLeft + deltaX}px`;
        fakeWindow.style.top = `${currentTop + deltaY}px`;
      });

      // Handle mouseup to stop dragging
      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      // Add event listeners for window control buttons
      const minimizeButton = titleBar.querySelector(
        'button[aria-label="Minimize"]',
      );
      const maximizeButton = titleBar.querySelector(
        'button[aria-label="Maximize"]',
      );
      const closeButton = titleBar.querySelector('button[aria-label="Close"]');

      // Store original dimensions for restore after minimize/maximize
      let originalDimensions = null;
      let isMaximized = false;
      let isMinimized = false;

      // Minimize button functionality
      minimizeButton.addEventListener("click", () => {
        if (isMinimized) {
          // If already minimized, restore
          isMinimized = false;
          fakeWindow.style.height = "";
          const windowBody = fakeWindow.querySelector(".window-body");
          if (windowBody) {
            windowBody.style.display = "";
          }
        } else {
          // Minimize the window
          isMinimized = true;
          isMaximized = false;
          const windowBody = fakeWindow.querySelector(".window-body");
          if (windowBody) {
            windowBody.style.display = "none";
          }
          fakeWindow.style.height = "auto";
        }
      });

      // Maximize button functionality
      maximizeButton.addEventListener("click", () => {
        if (isMaximized) {
          // Restore to original size
          isMaximized = false;
          if (originalDimensions) {
            fakeWindow.style.width = originalDimensions.width;
            fakeWindow.style.height = originalDimensions.height;
            fakeWindow.style.top = originalDimensions.top;
            fakeWindow.style.left = originalDimensions.left;
          }
          maximizeButton.ariaLabel = "Maximize";
        } else {
          // Save original dimensions
          originalDimensions = {
            width: fakeWindow.style.width,
            height: fakeWindow.style.height,
            top: fakeWindow.style.top,
            left: fakeWindow.style.left,
          };

          // Maximize the window
          isMaximized = true;
          isMinimized = false;
          maximizeButton.ariaLabel = "Restore";

          fakeWindow.style.width = "calc(100% - 7px)";
          fakeWindow.style.height = "100vph";
          fakeWindow.style.top = "0";
          fakeWindow.style.left = "0";
        }
      });

      // Close button functionality
      closeButton.addEventListener("click", () => {
        fakeWindow.style.display = "none";
      });
    });
  }
});
