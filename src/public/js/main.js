(function () {
  "use strict";

  // Mobile menu toggle
  var menuBtn = document.getElementById("mobileMenuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });
  }

  // Comparison popover: click toggle (works on touch) + hover open/close (desktop) + Escape + outside click
  document.querySelectorAll("[data-comparison-widget]").forEach(function (widget) {
    var trigger = widget.querySelector("#comparisonTrigger, [id^='comparisonTrigger']");
    var popover = widget.querySelector("[id^='comparisonPopover']");
    var closeBtn = widget.querySelector("[data-comparison-close]");
    if (!trigger || !popover) return;

    var hoverTimer = null;

    function open() {
      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      popover.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      if (popover.hidden) open();
      else close();
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        close();
      });
    }

    widget.addEventListener("mouseenter", function () {
      clearTimeout(hoverTimer);
      if (window.matchMedia("(hover: hover)").matches) open();
    });
    widget.addEventListener("mouseleave", function () {
      if (window.matchMedia("(hover: hover)").matches) {
        hoverTimer = setTimeout(close, 150);
      }
    });

    document.addEventListener("click", function (e) {
      if (!widget.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  });

  // Product gallery thumbnail swap
  document.querySelectorAll("[data-gallery-thumbs]").forEach(function (gallery) {
    var mainImg = document.getElementById("mainProductImage");
    if (!mainImg) return;
    gallery.querySelectorAll("button[data-src]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mainImg.src = btn.getAttribute("data-src");
        gallery.querySelectorAll("button[data-src]").forEach(function (b) {
          b.classList.remove("border-gold-500");
          b.classList.add("border-transparent");
        });
        btn.classList.remove("border-transparent");
        btn.classList.add("border-gold-500");
      });
    });
  });
})();
