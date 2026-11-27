// Share the same trailing delay and IME handling across every search field.
window.bindSearchInput = (search, filter) => {
  let timer;
  let composing = false;
  const cancel = () => clearTimeout(timer);
  const schedule = () => {
    cancel();
    timer = setTimeout(filter, 500);
  };
  search.addEventListener('compositionstart', () => {
    composing = true;
    cancel();
  });
  search.addEventListener('compositionend', () => {
    composing = false;
    schedule();
  });
  search.addEventListener('input', event => {
    cancel();
    if (!composing && !event.isComposing) schedule();
  });
  return cancel;
};
