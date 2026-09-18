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

  // Bộ chọn cấu hình máy trên trang chi tiết sản phẩm (dung lượng -> màu -> máy cụ thể -> giá)
  document.querySelectorAll("[data-variant-selector]").forEach(function (root) {
    var dataEl = root.querySelector("[data-variants-json]");
    if (!dataEl) return;
    var variants = JSON.parse(dataEl.textContent);
    if (!variants.length) return;

    var storageWrap = root.querySelector("[data-storage-options]");
    var colorWrap = root.querySelector("[data-color-options]");
    var unitWrap = root.querySelector("[data-unit-options]");
    var priceEl = root.querySelector("[data-selected-price]");
    var stockBadge = root.querySelector("[data-stock-badge]");
    var stockCountEl = root.querySelector("[data-stock-count]");
    var specStorage = root.querySelector("[data-spec-storage]");
    var specColor = root.querySelector("[data-spec-color]");
    var specBattery = root.querySelector("[data-spec-battery]");
    var specCondition = root.querySelector("[data-spec-condition]");

    var state = { storage: null, color: null, variantId: null };

    function fmtPrice(n) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(n);
    }

    function uniq(arr) {
      return arr.filter(function (v, i) {
        return arr.indexOf(v) === i;
      });
    }

    function storagesAvailable() {
      return uniq(variants.map(function (v) { return v.storageGb; })).sort(function (a, b) { return a - b; });
    }
    function colorsFor(storage) {
      return uniq(
        variants.filter(function (v) { return v.storageGb === storage; }).map(function (v) { return v.color; })
      );
    }
    function unitsFor(storage, color) {
      return variants.filter(function (v) { return v.storageGb === storage && v.color === color; });
    }
    function firstAvailable(units) {
      return units.filter(function (u) { return u.stockStatus === "in_stock"; })[0] || units[0] || null;
    }

    function renderStorages() {
      storageWrap.innerHTML = "";
      storagesAvailable().forEach(function (gb) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = gb + "GB";
        btn.className = "variant-chip" + (state.storage === gb ? " variant-chip-active" : "");
        btn.addEventListener("click", function () { selectStorage(gb); });
        storageWrap.appendChild(btn);
      });
    }

    function renderColors() {
      colorWrap.innerHTML = "";
      colorsFor(state.storage).forEach(function (color) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = color;
        btn.className = "variant-chip" + (state.color === color ? " variant-chip-active" : "");
        btn.addEventListener("click", function () { selectColor(color); });
        colorWrap.appendChild(btn);
      });
    }

    function renderUnits() {
      unitWrap.innerHTML = "";
      unitsFor(state.storage, state.color).forEach(function (v) {
        var sold = v.stockStatus === "sold";
        var btn = document.createElement("button");
        btn.type = "button";
        if (sold) btn.disabled = true;
        btn.className =
          "unit-chip" +
          (state.variantId === v.id ? " unit-chip-active" : "") +
          (sold ? " unit-chip-sold" : "");
        btn.innerHTML =
          "<span>Pin " + v.batteryHealth + "% · " + v.cosmeticCondition + "</span>" +
          "<span>" + fmtPrice(v.price) + (sold ? " · Đã bán" : "") + "</span>";
        btn.addEventListener("click", function () {
          if (!sold) selectVariant(v.id);
        });
        unitWrap.appendChild(btn);
      });
    }

    function selectStorage(gb) {
      state.storage = gb;
      state.color = colorsFor(gb)[0];
      var v = firstAvailable(unitsFor(state.storage, state.color));
      state.variantId = v ? v.id : null;
      renderStorages();
      renderColors();
      renderUnits();
      updateDisplay();
    }

    function selectColor(color) {
      state.color = color;
      var v = firstAvailable(unitsFor(state.storage, state.color));
      state.variantId = v ? v.id : null;
      renderColors();
      renderUnits();
      updateDisplay();
    }

    function selectVariant(id) {
      state.variantId = id;
      renderUnits();
      updateDisplay();
    }

    function updateDisplay() {
      var v = variants.filter(function (x) { return x.id === state.variantId; })[0];
      if (!v) return;
      priceEl.textContent = fmtPrice(v.price);
      if (specStorage) specStorage.textContent = v.storageGb + "GB";
      if (specColor) specColor.textContent = v.color;
      if (specBattery) specBattery.textContent = v.batteryHealth + "%";
      if (specCondition) specCondition.textContent = v.cosmeticCondition;
      if (stockBadge) {
        var sold = v.stockStatus === "sold";
        stockBadge.textContent = sold ? "Đã bán" : "Còn hàng";
        stockBadge.classList.toggle("bg-charcoal-900/10", sold);
        stockBadge.classList.toggle("text-charcoal-600", sold);
        stockBadge.classList.toggle("bg-gold-500/15", !sold);
        stockBadge.classList.toggle("text-gold-700", !sold);
      }
    }

    if (stockCountEl) {
      var inStockTotal = variants.filter(function (v) { return v.stockStatus === "in_stock"; }).length;
      stockCountEl.textContent = inStockTotal + " máy đang có sẵn cho dòng này";
    }

    var storages = storagesAvailable();
    var initStorage =
      storages.filter(function (gb) {
        return variants.some(function (v) { return v.storageGb === gb && v.stockStatus === "in_stock"; });
      })[0] || storages[0];
    selectStorage(initStorage);
  });
})();
