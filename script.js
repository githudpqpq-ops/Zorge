(() => {
  "use strict";
  const exterior = [1,2,3,4].map(n => `assets/exterior_${n}.jpg`);
  const yard = [1,2,3,4].map(n => `assets/yard_${n}.jpg`);
  const captions = {
    exterior: ["Современная архитектура","Входная группа","Архитектурные детали","Дом в городской среде"],
    yard: ["Приватный двор","Пространство для отдыха","Зелёные прогулочные зоны","Комфортная городская среда"]
  };
  let heroIndex = 0, galleryType = "exterior", galleryIndex = 0;
  const hero = document.getElementById("heroImage");
  const currentSlide = document.getElementById("currentSlide");
  const dots = [...document.querySelectorAll(".hero-dots button")];
  function showHero(index) {
    heroIndex = (index + exterior.length) % exterior.length;
    hero.classList.add("changing");
    const img = new Image();
    img.onload = () => {
      hero.style.backgroundImage = `url("${exterior[heroIndex]}")`;
      requestAnimationFrame(() => hero.classList.remove("changing"));
    };
    img.onerror = () => hero.classList.remove("changing");
    img.src = exterior[heroIndex];
    currentSlide.textContent = String(heroIndex + 1).padStart(2,"0");
    dots.forEach((dot,i) => dot.classList.toggle("active", i === heroIndex));
  }
  document.getElementById("prevSlide").addEventListener("click", () => showHero(heroIndex - 1));
  document.getElementById("nextSlide").addEventListener("click", () => showHero(heroIndex + 1));
  dots.forEach(dot => dot.addEventListener("click", () => showHero(Number(dot.dataset.slide))));
  // Keyboard support for the hero carousel.
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenus();
    if (e.key === "ArrowLeft" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) showHero(heroIndex - 1);
    if (e.key === "ArrowRight" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) showHero(heroIndex + 1);
  });

  const mainImg = document.getElementById("galleryMainImage");
  const thumbs = document.getElementById("galleryThumbs");
  const galleryCounter = document.getElementById("galleryCounter");
  const galleryTitle = document.getElementById("galleryTitle");
  const caption = document.getElementById("imageCaption");
  const tabs = [...document.querySelectorAll(".tab")];
  function imageSet() { return galleryType === "exterior" ? exterior : yard; }
  function renderGallery() {
    const images = imageSet();
    mainImg.style.opacity = "0.35";
    const loader = new Image();
    loader.onload = () => { mainImg.src = images[galleryIndex]; mainImg.style.opacity = "1"; };
    loader.src = images[galleryIndex];
    mainImg.alt = captions[galleryType][galleryIndex];
    caption.textContent = captions[galleryType][galleryIndex];
    galleryTitle.textContent = galleryType === "exterior" ? "Внешний вид" : "Двор и территория";
    galleryCounter.textContent = `${String(galleryIndex+1).padStart(2,"0")} / 04`;
    thumbs.innerHTML = "";
    images.forEach((src,i) => {
      const button = document.createElement("button");
      button.className = `thumb${i === galleryIndex ? " active" : ""}`;
      button.setAttribute("aria-label", `Показать фото ${i+1}`);
      if (i === galleryIndex) button.setAttribute("aria-current","true");
      const img = document.createElement("img"); img.src = src; img.alt = "";
      const span = document.createElement("span"); span.textContent = `0${i+1}`;
      button.append(img,span);
      button.addEventListener("click", () => { galleryIndex = i; renderGallery(); });
      thumbs.append(button);
    });
  }
  tabs.forEach(tab => tab.addEventListener("click", () => {
    galleryType = tab.dataset.gallery; galleryIndex = 0;
    tabs.forEach(t => { const active = t === tab; t.classList.toggle("active",active); t.setAttribute("aria-selected",String(active)); });
    renderGallery();
  }));
  document.getElementById("galleryPrev").addEventListener("click", () => { galleryIndex = (galleryIndex + 3) % 4; renderGallery(); });
  document.getElementById("galleryNext").addEventListener("click", () => { galleryIndex = (galleryIndex + 1) % 4; renderGallery(); });
  renderGallery();

  const menus = [...document.querySelectorAll(".hover-menu")];
  function closeMenus(except) {
    menus.forEach(menu => {
      if (menu !== except) { menu.classList.remove("open"); const b = menu.querySelector(":scope > button"); if (b) b.setAttribute("aria-expanded","false"); }
    });
  }
  menus.forEach(menu => {
    const button = menu.querySelector(":scope > button");
    button.addEventListener("click", e => {
      e.stopPropagation();
      const willOpen = !menu.classList.contains("open");
      closeMenus(menu);
      menu.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
    menu.querySelector(".panel-close")?.addEventListener("click", e => {
      e.stopPropagation(); menu.classList.remove("open"); button.setAttribute("aria-expanded","false"); button.focus();
    });
    // Keep the menu visible while the pointer is over the button or its panel.
    menu.addEventListener("mouseenter", () => button.setAttribute("aria-expanded","true"));
    menu.addEventListener("mouseleave", () => { if (!menu.classList.contains("open")) button.setAttribute("aria-expanded","false"); });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".hover-menu")) closeMenus(); });
  document.querySelectorAll(".floating-panel").forEach(panel => panel.addEventListener("click", e => e.stopPropagation()));

  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
  }
  function normalizePhone(input) {
    const digits = input.value.replace(/\D/g,"");
    if (digits.length < 10) { input.setCustomValidity("Введите корректный номер телефона."); }
    else input.setCustomValidity("");
  }
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener("input", () => normalizePhone(input));
    input.addEventListener("blur", () => normalizePhone(input));
  });
  document.querySelectorAll("form").forEach(form => form.addEventListener("submit", e => {
    e.preventDefault();
    const phone = form.querySelector('input[type="tel"]');
    if (phone) normalizePhone(phone);
    if (!form.reportValidity()) return;
    const message = form.dataset.success || "Спасибо! Данные заполнены.";
    if (form.classList.contains("contact-form")) {
      const status = form.querySelector(".form-status");
      if (status) status.textContent = message;
      form.reset();
    } else {
      form.reset();
      closeMenus();
      showToast(message);
    }
  }));

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded","false"); menuToggle.textContent = "☰";
  }));
})();