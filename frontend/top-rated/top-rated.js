(function init() {
  const refreshBtn = document.getElementById('refreshBtn');
  const minReviewsEl = document.getElementById('minReviews');
  const limitEl = document.getElementById('limit');

  refreshBtn.addEventListener('click', () => loadData());
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
    container.innerHTML = '';
    if (!rows.length) { showEmpty(true); return; }

    for (const r of rows) {
      container.appendChild(renderCard(r));
    }
  }

  function renderCard(r) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(r.restaurant_name || 'Unnamed')}</h3>
        <p class="muted">Average rating: <strong>${Number(r.avg_rating).toFixed(2)}</strong> (${r.reviews_count} reviews)</p>
        ${r.restaurant_id ? `<p class="muted">ID: ${escapeHtml(r.restaurant_id)}</p>` : ''}
      </div>
    `;
    div.tabIndex = 0;
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
