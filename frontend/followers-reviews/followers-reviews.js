(function init() {
  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  if (!username) {
    return showError("Missing ?username= in the URL.");
  }

  document.getElementById("username").textContent = username;

  fetchReviewsByUsername(username)
    .then(renderReviews)
    .catch(err => showError(err.message || "Failed to load reviews."));
})();

async function fetchReviewsByUsername(username) {
  // Backend route we’ll add below:
  const res = await fetch(`/reviews/user/${encodeURIComponent(username)}`, {
    headers: { "Accept": "application/json" },
    credentials: "include" // keep if you use cookie sessions; else remove
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Server ${res.status}: ${txt || res.statusText}`);
  }
  const data = await res.json();
  // Expecting an array: [{ restaurant_name, rating, review_text, timestamp }, ...]
  return Array.isArray(data) ? data : (data.reviews || []);
}

function renderReviews(reviews) {
  hideLoading();
  const list = document.getElementById("reviews");
  list.innerHTML = "";

  if (!reviews.length) {
    document.getElementById("empty").style.display = "";
    return;
  }

  for (const r of reviews) {
    list.appendChild(renderReviewCard(r));
  }
}

function renderReviewCard(r) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(r.restaurant_name ?? "Restaurant")}</h3>
      ${Number.isFinite(r.rating) ? `<p class="muted">Rating: ${r.rating}/5</p>` : ""}
      <p>${escapeHtml(r.review_text ?? "")}</p>
      <div class="muted" style="margin-top:.5rem;">Posted: ${formatDate(r.timestamp)}</div>
    </div>
  `;
  return div;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleString();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function showError(msg) {
  hideLoading();
  const el = document.getElementById("error");
  el.textContent = msg;
  el.style.display = "";
}

function hideLoading() {
  const el = document.getElementById("loading");
  if (el) el.style.display = "none";
}
