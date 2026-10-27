// All screens share browser history; restoring an entry must not create another one.
window.QL_NAV = {
 restoring: false,
 go(search = '', replace = false) {
  const url = `${location.pathname}${search}${location.hash}`;
  if (this.restoring || url === `${location.pathname}${location.search}${location.hash}`) return;
  history[replace ? 'replaceState' : 'pushState']({ queueless: true }, '', url);
 }
};
window.addEventListener('popstate', () => {
 window.QL_NAV.restoring = true;
 try {
  document.dispatchEvent(new CustomEvent('ql-navigate'));
 } finally {
  window.QL_NAV.restoring = false;
 }
});
