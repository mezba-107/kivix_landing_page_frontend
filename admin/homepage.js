/* ===================================================
   KI-VIX ADMIN — Homepage hero slideshow images
   Stored in HERO_SLIDES (data.js, backed by the API). When
   at least one image exists, the homepage hero shows these
   instead of the default illustrated placeholder slides.
   Images upload straight to Cloudinary via uploadImage().
=================================================== */
(async function () {
  const admin = await requireAdminAuth();
  if (!admin) return;
  initAdminShell(admin);

  const grid = document.querySelector("[data-hero-grid]");
  const input = document.querySelector("[data-hero-input]");

  function render() {
    if (!HERO_SLIDES.length) {
      grid.innerHTML = `<div class="admin-empty" style="padding:30px 10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>
        No custom hero images yet — the homepage is showing its default illustration.
      </div>`;
      return;
    }
    grid.innerHTML = HERO_SLIDES.map(
      (s) => `
      <div class="admin-gallery-thumb" style="width:150px;height:150px">
        <img src="${s.image}" alt="Hero slide" />
        ${admin.role !== "Mod" ? `<button type="button" class="admin-gallery-remove" data-remove-hero="${s.id}" aria-label="Remove image">&times;</button>` : ""}
      </div>`,
    ).join("");
  }

  input.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    input.value = "";
    if (!files.length) return;
    for (const file of files) {
      try {
        const url = await uploadImage(file, "hero-slides");
        await addHeroSlide({ image: url });
      } catch (err) {
        showToast(err.message || "Couldn't upload one of those images");
      }
    }
    render();
    showToast("Hero image added");
  });

  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-remove-hero]");
    if (!btn) return;
    try {
      await deleteHeroSlide(btn.dataset.removeHero);
    } catch (err) {
      showToast(err.message || "Couldn't remove that image");
      return;
    }
    render();
  });

  try {
    await loadHeroSlides();
  } catch (e) {
    showToast("Couldn't load hero images");
  }
  render();
})();
