(() => {
  const root = document.getElementById('main-content');
  if (!root) return;
  const elements = [root, ...root.querySelectorAll('*')].filter(element =>
    !element.closest('script,style,svg,.card-detail,.catalog-relic-card')
  );
  const original = elements.map(element => ({
    element,
    value: element.style.getPropertyValue('font-size'),
    priority: element.style.getPropertyPriority('font-size')
  }));
  function scaleText() {
    for (const {element, value, priority} of original) {
      if (value) element.style.setProperty('font-size', value, priority);
      else element.style.removeProperty('font-size');
    }
    // Read every original size before applying changes to inherited font sizes.
    const sizes = elements.map(element => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => {
      element.style.setProperty('font-size', sizes[index] * 1.25 + 'px', 'important');
    });
  }
  scaleText();
  let pending;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(scaleText);
  });
})();
