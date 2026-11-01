export function scrollToPublicSection(sectionId, behavior = "auto") {
  if (sectionId === "beranda") {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const section = document.getElementById(sectionId);
  if (!section) return false;

  // The first content block can start above its heading (e.g. the About card).
  const content = section.querySelector(":scope > .ds-container") || section;
  const navbarHeight = document.querySelector(".public-navbar .navbar-container")?.getBoundingClientRect().height || 80;
  const top = window.scrollY + content.getBoundingClientRect().top - navbarHeight - 24;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}
