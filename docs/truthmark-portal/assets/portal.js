async function loadSearch() {
  const input = document.getElementById('portal-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  const response = await fetch('assets/search.json');
  const records = await response.json();
  function render(query) {
    const q = query.trim().toLowerCase();
    results.replaceChildren();
    if (!q) return;
    for (const record of records.filter((item) => item.searchText.includes(q)).slice(0, 12)) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = record.url;
      link.textContent = record.title;
      const meta = document.createElement('p');
      meta.className = 'muted';
      meta.textContent = record.path || record.section;
      li.appendChild(link);
      li.appendChild(meta);
      results.appendChild(li);
    }
  }
  input.addEventListener('input', (event) => render(event.target.value));
}
loadSearch().catch((error) => console.warn('Portal search unavailable', error));
