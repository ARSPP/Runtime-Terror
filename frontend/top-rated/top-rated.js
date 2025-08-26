(function init() {
  const refreshBtn = document.getElementById('refreshBtn');
  const minReviewsEl = document.getElementById('minReviews');
  const limitEl = document.getElementById('limit');

  refreshBtn?.addEventListener('click', () => loadData());
  loadData();

  async function loadData() {
    showLoading(true);
    showError('');
    showEmpty(false);
    const minReviews = Math.max(1, parseInt(minReviewsEl.value || '5', 10));
    const limit = Math.max(1, parseInt(limitEl.value || '20', 10));
    const url = `/api/restaurants/top-rated?minReviews=${encodeURIComponent(minReviews)}&limit=${encodeURIComponent(limit)}`;

    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      renderResults(Array.isArray(data) ? data : (data.rows || []));
    } catch (e) {
      console.error(e);
      showError('Failed to load top rated restaurants.');
    } finally {
      showLoading(false);
    }
  }

  function renderResults(rows) {
  const container = document.getElementById('results');
  if (!container) return console.error('#results not found');

  container.innerHTML = '';

  if (!Array.isArray(rows) || rows.length === 0) {
    showEmpty(true);
    return;
  }

  showEmpty(false);

  rows.forEach((r, i) => {
    const card = renderCard(r);
    if (card && card.nodeType === 1) { 
      container.appendChild(card);
    } else {
      console.warn('Skipped non-node at index', i, r);
    }
  });
}

function renderCard(r) {
  const div = document.createElement('div');
  div.className = 'card';
  const name = escapeHtml(r?.restaurant_name ?? 'Unnamed');
  const avg = Number(r?.avg_rating ?? 0);
  const count = Number(r?.reviews_count ?? 0);
  const id = r?.restaurant_id ? escapeHtml(String(r.restaurant_id)) : '';

  div.innerHTML = `
    <div class="card-body">
      <h3 class="card-title">${name}</h3>
      <p class="muted">Average rating: <strong>${avg.toFixed(2)}</strong> (${count} reviews)</p>
      ${id ? `<p class="muted">ID: ${id}</p>` : ``}
    </div>
  `;
  return div;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");
}


  function showLoading(on) { document.getElementById('loading').style.display = on ? '' : 'none'; }
  function showError(msg) {
    const el = document.getElementById('error');
    el.textContent = msg || '';
    el.style.display = msg ? '' : 'none';
  }
  function showEmpty(on) { document.getElementById('empty').style.display = on ? '' : 'none'; }
})();
