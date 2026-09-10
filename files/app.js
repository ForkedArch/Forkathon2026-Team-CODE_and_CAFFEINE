// CampusPulse Client Application
// Team: Code & Caffeine

let currentUser = null;
let allUsers = [];
let activeFeedType = "for_me";
let activeUrgency = "balanced";
let activeCategory = "all";
let searchQuery = "";
let countdownInterval = null;
let websocketReady = false;

const TOPIC_LABELS = {
  academics: "🎓 Academics",
  clubs: "🤖 Clubs & Hackathons",
  admin: "🏛️ Administration",
  hall: "🏢 Hall & Residential",
  community: "🤝 Community",
};

// Parse a user's preferred_topics (stored server-side as a JSON string) into an array
function getPreferredTopics(user) {
  if (!user) return [];
  try {
    return JSON.parse(user.preferred_topics || "[]");
  } catch {
    return [];
  }
}

// Web Audio API Chime for Critical Emergency Flash Notices
function playUrgentAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.25);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (err) {
    console.warn("Audio chime disabled or blocked by browser autoplay policy:", err);
  }
}

// Format relative time (e.g. "25 mins ago")
function formatRelativeTime(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

// Format deadline remaining time
function formatDeadlineCountdown(isoDate) {
  if (!isoDate) return null;
  const diffMs = new Date(isoDate).getTime() - Date.now();
  if (diffMs <= 0) return { text: "Expired", isUrgent: true };

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const hoursLeft = diffHour % 24;
  const minsLeft = diffMin % 60;

  let text = "";
  if (diffDay > 0) {
    text = `${diffDay}d ${hoursLeft}h left`;
  } else if (diffHour > 0) {
    text = `${diffHour}h ${minsLeft}m left`;
  } else {
    text = `${minsLeft}m left`;
  }

  return {
    text,
    isUrgent: diffHour < 24,
  };
}

// Toast notification display
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  const icon = type === "critical" ? "🚨" : type === "success" ? "✅" : "🔔";
  
  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${icon}</span>
    <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize Application
async function initApp() {
  setupTheme();
  setupEventListeners();
  setupAuthListeners();

  const session = await fetchSession();
  if (session) {
    currentUser = session;
    await enterApp();
  } else {
    await showAuthGate();
  }
}

// Runs once we have a logged-in user: reveal the app shell and boot the feed
async function enterApp() {
  document.getElementById("auth-gate")?.classList.remove("active");
  document.getElementById("app-shell").style.display = "";

  await loadUsers(); // demo persona directory, for the sidebar quick-switcher
  renderUserHeader();
  renderPersonaSidebar();
  await loadFeed();
  setupWebSocket();

  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    updateDeadlineBadges();
  }, 30000);
}

// GET /api/auth/me — returns the logged-in user, or null
async function fetchSession() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("Failed to check session:", err);
    return null;
  }
}

// Show the login/signup gate and populate the "quick demo login" list
async function showAuthGate() {
  document.getElementById("app-shell").style.display = "none";
  document.getElementById("auth-gate")?.classList.add("active");

  try {
    const res = await fetch("/api/users");
    const demoUsers = await res.json();
    const list = document.getElementById("auth-demo-list");
    if (list) {
      list.innerHTML = demoUsers.map(u => `
        <div class="auth-demo-option" onclick="demoLogin(${u.id})">
          <img src="${u.avatar}" alt="${u.name}">
          <div>
            <h4>${u.name}</h4>
            <p>${u.role === "faculty" ? "Faculty" : u.role === "cr" ? "Class Representative" : `${u.department} Batch ${u.batch}`}</p>
          </div>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load demo personas:", err);
  }
}

// Quick 1-click login as a seeded demo persona (no password)
window.demoLogin = async function(userId) {
  try {
    const res = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      await enterApp();
      showToast(`Welcome, ${currentUser.name.split(" ")[0]}!`, "success");
      maybeRequestNotificationPermission();
    } else {
      showAuthError(data.error || "Could not log in with this demo persona.");
    }
  } catch (err) {
    console.error("Demo login failed:", err);
  }
};

function showAuthError(message) {
  const el = document.getElementById("auth-error");
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function clearAuthError() {
  const el = document.getElementById("auth-error");
  if (el) el.style.display = "none";
}

// Wire up the auth gate: tab switching + login/signup form submits
function setupAuthListeners() {
  const tabBtns = document.querySelectorAll(".auth-tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      clearAuthError();
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));
      document.getElementById(`${btn.dataset.authTab}-form`)?.classList.add("active");
    });
  });

  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAuthError();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        await enterApp();
        showToast(`Welcome back, ${currentUser.name.split(" ")[0]}!`, "success");
        maybeRequestNotificationPermission();
      } else {
        showAuthError(data.error || "Login failed.");
      }
    } catch (err) {
      showAuthError("Could not reach the server. Please try again.");
    }
  });

  document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAuthError();

    const clubsRaw = document.getElementById("signup-clubs").value;
    const preferredTopics = Array.from(
      document.querySelectorAll("#signup-topics input[type=checkbox]:checked")
    ).map(cb => cb.value);

    const payload = {
      name: document.getElementById("signup-name").value.trim(),
      email: document.getElementById("signup-email").value.trim(),
      password: document.getElementById("signup-password").value,
      role: document.getElementById("signup-role").value,
      department: document.getElementById("signup-department").value,
      batch: document.getElementById("signup-batch").value,
      section: document.getElementById("signup-section").value,
      hall: document.getElementById("signup-hall").value.trim() || "N/A",
      clubs: clubsRaw.split(",").map(c => c.trim()).filter(Boolean),
      courses: [],
      preferred_topics: preferredTopics,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        await enterApp();
        showToast(`Account created! Welcome to CampusPulse, ${currentUser.name.split(" ")[0]}.`, "success");
        maybeRequestNotificationPermission();
      } else {
        showAuthError(data.error || "Sign up failed.");
      }
    } catch (err) {
      showAuthError("Could not reach the server. Please try again.");
    }
  });

  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    currentUser = null;
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById("login-form")?.reset();
    document.getElementById("signup-form")?.reset();
    await showAuthGate();
  });
}

// Setup Theme (Dark / Light)
function setupTheme() {
  const savedTheme = localStorage.getItem("campuspulse_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("campuspulse_theme", nextTheme);
  });
}

// Load the demo persona directory (for the sidebar quick-switcher).
// currentUser itself now comes from the server session, not this list.
async function loadUsers() {
  try {
    const res = await fetch("/api/users");
    allUsers = await res.json();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

// Render Top Header Persona Pill
function renderUserHeader() {
  if (!currentUser) return;
  const avatar = document.getElementById("header-avatar");
  const name = document.getElementById("header-name");
  const tag = document.getElementById("header-tag");

  if (avatar) avatar.src = currentUser.avatar;
  if (name) name.textContent = currentUser.name.split(" ")[0];
  if (tag) {
    if (currentUser.role === "faculty") {
      tag.textContent = "Faculty / Dept Head";
    } else if (currentUser.role === "cr") {
      tag.textContent = `CR ${currentUser.department} ${currentUser.batch}-${currentUser.section}`;
    } else {
      tag.textContent = `${currentUser.department} ${currentUser.batch}-${currentUser.section}`;
    }
  }
}

// Render Persona List in Sidebar
function renderPersonaSidebar() {
  const list = document.getElementById("persona-list");
  if (!list) return;

  list.innerHTML = allUsers.map(user => {
    const isActive = currentUser && currentUser.id === user.id;
    let subtitle = "";
    if (user.role === "faculty") {
      subtitle = "Professor & Course Teacher";
    } else if (user.role === "cr") {
      subtitle = `Class Rep (${user.department} '${user.batch})`;
    } else {
      subtitle = `${user.department} Batch ${user.batch} • ${user.hall}`;
    }

    return `
      <div class="persona-option ${isActive ? 'active' : ''}" onclick="switchPersona(${user.id})">
        <img class="persona-avatar" src="${user.avatar}" alt="${user.name}">
        <div class="persona-option-info">
          <h4>${user.name}</h4>
          <p>${subtitle}</p>
        </div>
      </div>
    `;
  }).join("");
}

// Switch Active Persona (demo accounts only — logs in server-side via session)
window.switchPersona = async function(userId) {
  if (currentUser && currentUser.id === userId) return;
  try {
    const res = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.error || "Could not switch persona.", "critical");
      return;
    }
    currentUser = data.user;

    renderUserHeader();
    renderPersonaSidebar();
    showToast(`Switched persona to ${currentUser.name}`, "info");

    // Adjust default target department in publish form for convenience
    const pubDept = document.getElementById("pub-target-dept");
    if (pubDept && currentUser.department !== "ALL") {
      pubDept.value = currentUser.department;
    }

    await loadFeed();
  } catch (err) {
    console.error("Failed to switch persona:", err);
    showToast("Failed to switch persona", "critical");
  }
};

// Load Feed & Update UI
async function loadFeed() {
  if (!currentUser) return;

  const feedContainer = document.getElementById("feed-stream");
  const bannerContainer = document.getElementById("emergency-banner-container");

  try {
    const params = new URLSearchParams({
      user_id: currentUser.id.toString(),
      feed_type: activeFeedType,
      urgency: activeUrgency,
      category: activeCategory,
      search: searchQuery,
    });

    const res = await fetch(`/api/announcements?${params}`);
    const data = await res.json();
    const notices = data.announcements || [];
    const metrics = data.metrics || {};

    // Update Noise Filter Badges
    const badge = document.getElementById("noise-reduced-badge");
    const countLabel = document.getElementById("feed-count-label");
    if (badge) {
      if (activeFeedType === "all") {
        badge.textContent = "Global Campus View (0% Filtered)";
        badge.style.background = "rgba(107, 114, 128, 0.2)";
        badge.style.color = "var(--text-secondary)";
      } else {
        badge.textContent = `${metrics.noiseReductionPercent}% Noise Blocked`;
        badge.style.background = "rgba(16, 185, 129, 0.15)";
        badge.style.color = "#10b981";
      }
    }
    if (countLabel) {
      countLabel.textContent = `Showing ${notices.length} relevant signals (${metrics.noiseFilteredOut} filtered)`;
    }

    // Check for Critical Alerts to show in the Emergency Banner
    renderEmergencyBanner(notices, bannerContainer);

    // Render Announcement Stream
    renderNoticeCards(notices, feedContainer);

    // Update Deadline Radar Sidebar
    renderDeadlineRadar(notices);

  } catch (err) {
    console.error("Failed to load feed:", err);
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>Failed to connect to CampusPulse server. Please retry.</p>
        </div>
      `;
    }
  }
}

// Render Emergency Flash Banner (e.g. classroom relocated)
function renderEmergencyBanner(notices, container) {
  if (!container) return;

  // Find most critical unacknowledged or recent critical notice
  const criticalNotice = notices.find(n => n.urgency === "critical");

  if (!criticalNotice) {
    container.innerHTML = "";
    return;
  }

  const isAck = criticalNotice.user_acknowledged > 0;

  container.innerHTML = `
    <div class="emergency-banner">
      <div class="emergency-content">
        <div class="emergency-icon">🚨</div>
        <div>
          <div class="emergency-title">CRITICAL CAMPUS ALERT • ATTENTION REQUIRED</div>
          <div class="emergency-desc">${criticalNotice.title}</div>
          ${criticalNotice.location_change ? `
            <div class="location-shift-badge">
              📍 Location Change: ${criticalNotice.location_change}
            </div>
          ` : ""}
        </div>
      </div>
      <div>
        <button 
          class="btn btn-sm ${isAck ? 'btn-ack acknowledged' : 'btn-critical'}"
          onclick="acknowledgeNotice(${criticalNotice.id})"
        >
          ${isAck ? `✓ Acknowledged (${criticalNotice.ack_count})` : "⚡ Got It / Acknowledge"}
        </button>
      </div>
    </div>
  `;
}

// Render Notice Cards Stream
function renderNoticeCards(notices, container) {
  if (!container) return;

  if (notices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No announcements match this filter</h3>
        <p style="margin-top: 0.35rem; font-size: 0.85rem;">
          Your feed is clean and noise-free! Adjust your urgency slider or switch categories to explore more.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(notice => {
    const isBookmarked = notice.user_bookmarked > 0;
    const isAck = notice.user_acknowledged > 0;
    const deadline = formatDeadlineCountdown(notice.deadline_at);

    // Urgency badge styling
    let urgencyBadge = "";
    if (notice.urgency === "critical") {
      urgencyBadge = `<span class="badge badge-critical">🚨 Critical Flash</span>`;
    } else if (notice.urgency === "high") {
      urgencyBadge = `<span class="badge badge-high">⚠️ High Priority</span>`;
    } else if (notice.urgency === "medium") {
      urgencyBadge = `<span class="badge badge-medium">ℹ️ Notice</span>`;
    } else {
      urgencyBadge = `<span class="badge badge-low">🌱 Community</span>`;
    }

    // Category label
    const categoryIcons = {
      academics: "🎓 Academics",
      clubs: "🤖 Club / Hackathon",
      admin: "🏛️ Administration",
      hall: "🏢 Hall & Hostel",
      community: "🤝 Community",
    };
    const catLabel = categoryIcons[notice.category] || notice.category;

    // Audience targeting badges
    let targetLabel = "";
    if (notice.target_dept !== "ALL" || notice.target_batch !== "ALL" || notice.target_section !== "ALL") {
      const parts = [];
      if (notice.target_dept !== "ALL") parts.push(notice.target_dept);
      if (notice.target_batch !== "ALL") parts.push(`'${notice.target_batch}`);
      if (notice.target_section !== "ALL") parts.push(`Sec ${notice.target_section}`);
      targetLabel = `<span class="badge badge-dept">🎯 For: ${parts.join(" ")}</span>`;
    } else if (notice.target_club !== "ALL") {
      targetLabel = `<span class="badge badge-dept">👥 Club: ${notice.target_club}</span>`;
    } else if (notice.target_hall !== "ALL") {
      targetLabel = `<span class="badge badge-dept">🏢 Hall: ${notice.target_hall}</span>`;
    } else {
      targetLabel = `<span class="badge badge-dept">🌐 Campus-Wide</span>`;
    }

    return `
      <article class="notice-card ${notice.urgency}-border" id="card-${notice.id}">
        
        <div class="card-header">
          <div class="card-badges">
            ${urgencyBadge}
            <span class="badge badge-dept">${catLabel}</span>
            ${targetLabel}
            ${notice.is_verified ? `<span class="badge badge-verified">✓ Verified Source</span>` : ""}
          </div>

          <div class="card-actions-top">
            <button class="icon-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(${notice.id})" title="Save Notice">
              ${isBookmarked ? "★" : "☆"}
            </button>
          </div>
        </div>

        <h2 class="card-title">${escapeHTML(notice.title)}</h2>

        ${notice.location_change ? `
          <div class="relocation-card-banner">
            <span>📍 Classroom Shift:</span>
            <strong>${escapeHTML(notice.location_change)}</strong>
          </div>
        ` : ""}

        <!-- AI TL;DR Box -->
        <div class="card-tldr-box">
          <span class="tldr-label">TL;DR:</span>
          <span>${escapeHTML(notice.summary_tldr)}</span>
        </div>

        <div class="card-content">
          ${escapeHTML(notice.content)}
        </div>

        <div class="card-footer">
          <div class="publisher-info">
            <div class="publisher-dot"></div>
            <div>
              <span class="publisher-name">${escapeHTML(notice.publisher_name)}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);"> • ${escapeHTML(notice.publisher_role)} • ${formatRelativeTime(notice.created_at)}</span>
            </div>
          </div>

          <div class="card-cta-group">
            ${deadline ? `
              <span class="deadline-pill" id="deadline-${notice.id}">
                ⏳ ${deadline.text}
              </span>
              <a href="/api/export-ics/${notice.id}" class="btn btn-secondary btn-sm" title="Add event to Google / Apple Calendar">
                📅 Add to Cal (.ics)
              </a>
            ` : ""}

            ${notice.action_label && notice.action_url ? `
              <a href="${notice.action_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                ${escapeHTML(notice.action_label)} ↗
              </a>
            ` : ""}

            ${notice.requires_acknowledgment ? `
              <button 
                class="btn btn-sm ${isAck ? 'btn-ack acknowledged' : 'btn-ack'}" 
                onclick="acknowledgeNotice(${notice.id})"
                title="Confirm you have seen this important update"
              >
                ${isAck ? `✓ Acknowledged (${notice.ack_count})` : `Acknowledge (${notice.ack_count})`}
              </button>
            ` : ""}
          </div>
        </div>

      </article>
    `;
  }).join("");
}

// Render Deadline Radar Sidebar
function renderDeadlineRadar(notices) {
  const container = document.getElementById("deadline-radar-list");
  const countBadge = document.getElementById("sidebar-deadline-count");
  if (!container) return;

  const withDeadlines = notices
    .filter(n => n.deadline_at)
    .sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime())
    .slice(0, 4);

  if (countBadge) {
    countBadge.textContent = `${withDeadlines.length} Approaching`;
  }

  if (withDeadlines.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">
        No active deadlines today! 🎉
      </div>
    `;
    return;
  }

  container.innerHTML = withDeadlines.map(n => {
    const dl = formatDeadlineCountdown(n.deadline_at);
    return `
      <div class="deadline-item">
        <div class="deadline-item-title">${escapeHTML(n.title)}</div>
        <div class="deadline-item-meta">
          <span style="color: ${dl.isUrgent ? 'var(--critical)' : 'var(--high)'}; font-weight: 700;">
            ⏳ ${dl.text}
          </span>
          <a href="/api/export-ics/${n.id}" style="color: var(--primary); text-decoration: none; font-weight: 600;">
            + Cal
          </a>
        </div>
      </div>
    `;
  }).join("");
}

// Update Deadline countdown strings
function updateDeadlineBadges() {
  const pills = document.querySelectorAll("[id^='deadline-']");
  pills.forEach(pill => {
    const id = pill.id.replace("deadline-", "");
    // Just refresh feed
  });
}

// Action: Acknowledge Notice
window.acknowledgeNotice = async function(noticeId) {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/announcements/${noticeId}/acknowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id }),
    });
    const result = await res.json();
    if (result.success) {
      showToast("Acknowledgment receipt recorded! CR & Faculty can see your confirmation.", "success");
      await loadFeed();
    }
  } catch (err) {
    console.error("Failed to acknowledge:", err);
  }
};

// Action: Toggle Bookmark
window.toggleBookmark = async function(noticeId) {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/announcements/${noticeId}/bookmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id }),
    });
    const result = await res.json();
    if (result.success) {
      showToast(result.bookmarked ? "Saved to your bookmarks" : "Removed from bookmarks", "info");
      await loadFeed();
    }
  } catch (err) {
    console.error("Failed to toggle bookmark:", err);
  }
};

// Action: Generate Morning Briefing
async function generateMorningBriefing() {
  if (!currentUser) return;
  const modal = document.getElementById("briefing-modal");
  const modalBody = document.getElementById("briefing-modal-body");
  const title = document.getElementById("briefing-modal-title");

  try {
    const res = await fetch(`/api/digest?user_id=${currentUser.id}`);
    const data = await res.json();

    if (title) title.textContent = `Morning Briefing • ${data.user.name}`;

    modalBody.innerHTML = `
      <div class="digest-lead">
        ${escapeHTML(data.executiveSummary)}
      </div>

      ${data.criticalAlerts.length > 0 ? `
        <div class="digest-box" style="border-left: 4px solid var(--critical);">
          <div class="digest-section-title" style="color: #f87171;">🚨 Urgent Attention (Today)</div>
          ${data.criticalAlerts.map(a => `
            <div style="margin-bottom: 0.5rem;">
              <strong>${escapeHTML(a.title)}</strong>
              ${a.location_change ? `<div style="font-size: 0.8rem; color: #fca5a5;">📍 Relocated: ${escapeHTML(a.location_change)}</div>` : ""}
              <div style="font-size: 0.825rem; color: var(--text-secondary);">${escapeHTML(a.summary_tldr)}</div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${data.upcomingDeadlines.length > 0 ? `
        <div class="digest-box" style="border-left: 4px solid var(--high);">
          <div class="digest-section-title" style="color: #fbbf24;">⏳ Deadlines in the Next 72 Hours</div>
          ${data.upcomingDeadlines.map(d => {
            const dl = formatDeadlineCountdown(d.deadline_at);
            return `
              <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${escapeHTML(d.title)}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(d.summary_tldr)}</div>
                </div>
                <span class="deadline-pill" style="white-space: nowrap;">${dl ? dl.text : ""}</span>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}

      <div class="digest-box">
        <div class="digest-section-title">🎓 Department & Campus Signals</div>
        ${data.departmentNotices.map(n => `
          <div style="margin-bottom: 0.4rem; font-size: 0.85rem;">
            • <strong>${escapeHTML(n.title)}</strong> — <span style="color: var(--text-secondary);">${escapeHTML(n.summary_tldr)}</span>
          </div>
        `).join("")}
      </div>
    `;

    modal.classList.add("active");
  } catch (err) {
    console.error("Failed to generate briefing:", err);
    showToast("Failed to compile morning briefing", "error");
  }
}

// WebSocket Connection & Real-Time Push Handling
function setupWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("⚡ CampusPulse WebSocket connected for instant signals.");
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "NEW_ANNOUNCEMENT") {
        const notice = msg.announcement;

        // Check if notice is critical
        if (notice.urgency === "critical") {
          playUrgentAlertChime();
          showToast(`🚨 CRITICAL ALERT: ${notice.title}`, "critical");
        } else {
          showToast(`📢 New Notice: ${notice.title}`, "info");
        }

        // If this notice matches one of the user's preferred topics, surface
        // a prominent pop-up (and a real OS notification, if permitted).
        if (matchesPreferredTopic(notice) && isRelevantToCurrentUser(notice)) {
          showPopupNotification(notice);
          sendBrowserNotification(notice);
        }

        // Reload feed to incorporate new broadcast
        loadFeed();
      } else if (msg.type === "ACKNOWLEDGMENT_UPDATE") {
        // Increment acknowledgment counter in real-time
        loadFeed();
      }
    } catch (err) {
      console.error("Error handling WebSocket message:", err);
    }
  };

  socket.onclose = () => {
    // Attempt auto-reconnect in 3 seconds
    setTimeout(setupWebSocket, 3000);
  };
}

// Does this announcement's category match one of the current user's preferred topics?
function matchesPreferredTopic(notice) {
  if (!currentUser) return false;
  const topics = getPreferredTopics(currentUser);
  return topics.includes(notice.category);
}

// Rough client-side mirror of the server's audience-targeting logic, so we
// don't pop up alerts for notices that don't even apply to this user.
function isRelevantToCurrentUser(notice) {
  if (!currentUser) return false;
  const deptMatch = notice.target_dept === "ALL" || notice.target_dept === currentUser.department;
  const batchMatch = notice.target_batch === "ALL" || notice.target_batch === currentUser.batch;
  const sectionMatch = notice.target_section === "ALL" || notice.target_section === currentUser.section;
  const hallMatch = notice.target_hall === "ALL" || notice.target_hall === currentUser.hall;
  const userClubs = (() => {
    try { return JSON.parse(currentUser.clubs || "[]"); } catch { return []; }
  })();
  const clubMatch = notice.target_club === "ALL" || userClubs.includes(notice.target_club);

  if (notice.target_club !== "ALL") return clubMatch;
  if (notice.target_hall !== "ALL") return hallMatch;
  return deptMatch && batchMatch && sectionMatch;
}

// Render the in-app pop-up card above everything else on screen
function showPopupNotification(notice) {
  const container = document.getElementById("popup-notification-container");
  if (!container) return;

  const card = document.createElement("div");
  card.className = `popup-notification ${notice.urgency === "critical" ? "critical" : ""}`;
  card.innerHTML = `
    <div class="popup-notification-header">
      <div>
        <div class="popup-notification-eyebrow">${TOPIC_LABELS[notice.category] || notice.category} • Matches your preferences</div>
        <div class="popup-notification-title">${escapeHTML(notice.title)}</div>
      </div>
      <button class="popup-close-btn" aria-label="Dismiss">&times;</button>
    </div>
    <div class="popup-notification-body">${escapeHTML(notice.summary_tldr || notice.content)}</div>
    <div class="popup-notification-actions">
      <button class="btn btn-primary btn-sm popup-view-btn">View Notice</button>
      <button class="btn btn-secondary btn-sm popup-dismiss-btn">Dismiss</button>
    </div>
  `;

  const dismiss = () => {
    card.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    card.style.opacity = "0";
    card.style.transform = "translateY(-12px)";
    setTimeout(() => card.remove(), 250);
  };

  card.querySelector(".popup-close-btn").addEventListener("click", dismiss);
  card.querySelector(".popup-dismiss-btn").addEventListener("click", dismiss);
  card.querySelector(".popup-view-btn").addEventListener("click", () => {
    dismiss();
    const target = document.getElementById(`card-${notice.id}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.style.transition = "box-shadow 0.3s ease";
      target.style.boxShadow = "0 0 0 3px var(--primary)";
      setTimeout(() => { target.style.boxShadow = ""; }, 1600);
    }
  });

  container.appendChild(card);

  // Auto-dismiss non-critical pop-ups after 10s; critical ones stay until acted on
  if (notice.urgency !== "critical") {
    setTimeout(dismiss, 10000);
  }
}

// Fire a real OS-level notification (works even if the tab isn't focused)
function sendBrowserNotification(notice) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification(notice.title, {
      body: notice.summary_tldr || notice.content,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>",
      tag: `campuspulse-${notice.id}`,
    });
    n.onclick = () => {
      window.focus();
      const target = document.getElementById(`card-${notice.id}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      n.close();
    };
  } catch (err) {
    console.warn("Browser notification failed:", err);
  }
}

// Ask for OS notification permission (only actually prompts once per browser)
function maybeRequestNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  Notification.requestPermission();
}

// Setup Event Listeners
function setupEventListeners() {
  // Feed Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFeedType = btn.dataset.feed || "for_me";
      loadFeed();
    });
  });

  // Urgency / Noise Filter Pills
  const urgencyPills = document.querySelectorAll(".urgency-pill");
  urgencyPills.forEach(pill => {
    pill.addEventListener("click", () => {
      urgencyPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeUrgency = pill.dataset.urgency || "balanced";
      loadFeed();
    });
  });

  // Category Tag Buttons
  const catTags = document.querySelectorAll(".category-tag");
  catTags.forEach(tag => {
    tag.addEventListener("click", () => {
      catTags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      activeCategory = tag.dataset.category || "all";
      loadFeed();
    });
  });

  // Search Input with Debounce
  const searchInput = document.getElementById("search-input");
  let searchTimeout = null;
  searchInput?.addEventListener("input", (e) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      loadFeed();
    }, 250);
  });

  // Morning Briefing Triggers
  document.getElementById("open-briefing-btn")?.addEventListener("click", generateMorningBriefing);
  document.getElementById("sidebar-briefing-btn")?.addEventListener("click", generateMorningBriefing);
  document.getElementById("close-briefing-modal")?.addEventListener("click", () => {
    document.getElementById("briefing-modal")?.classList.remove("active");
  });
  document.getElementById("dismiss-briefing-btn")?.addEventListener("click", () => {
    document.getElementById("briefing-modal")?.classList.remove("active");
    showToast("Morning briefing reviewed! Have a productive day.", "success");
  });

  // Publish Modal Triggers
  const publishModal = document.getElementById("publish-modal");
  document.getElementById("open-publish-modal-btn")?.addEventListener("click", () => {
    publishModal?.classList.add("active");
  });
  document.getElementById("close-publish-modal")?.addEventListener("click", () => {
    publishModal?.classList.remove("active");
  });
  document.getElementById("cancel-publish-btn")?.addEventListener("click", () => {
    publishModal?.classList.remove("active");
  });

  // Notification Preferences Modal
  const notifPrefsModal = document.getElementById("notif-prefs-modal");
  document.getElementById("open-notif-prefs-btn")?.addEventListener("click", () => {
    if (!currentUser) return;
    const selected = getPreferredTopics(currentUser);
    document.querySelectorAll("#prefs-topics input[type=checkbox]").forEach(cb => {
      cb.checked = selected.includes(cb.value);
    });

    const statusEl = document.getElementById("browser-notif-status");
    if (statusEl && "Notification" in window) {
      if (Notification.permission === "granted") {
        statusEl.textContent = "✅ Desktop pop-up notifications are enabled for this browser.";
      } else if (Notification.permission === "denied") {
        statusEl.textContent = "🔕 Desktop notifications are blocked in your browser settings. You'll still see in-app pop-ups.";
      } else {
        statusEl.innerHTML = `🔔 <a href="#" id="enable-browser-notif-link" style="color: var(--primary); font-weight:600;">Enable desktop notifications</a> for alerts even when this tab isn't focused.`;
        document.getElementById("enable-browser-notif-link")?.addEventListener("click", (e) => {
          e.preventDefault();
          Notification.requestPermission().then(() => {
            document.getElementById("open-notif-prefs-btn")?.click();
          });
        });
      }
    } else if (statusEl) {
      statusEl.textContent = "Your browser doesn't support desktop notifications — in-app pop-ups will still work.";
    }

    notifPrefsModal?.classList.add("active");
  });
  document.getElementById("close-notif-prefs-modal")?.addEventListener("click", () => {
    notifPrefsModal?.classList.remove("active");
  });
  document.getElementById("cancel-notif-prefs-btn")?.addEventListener("click", () => {
    notifPrefsModal?.classList.remove("active");
  });
  document.getElementById("save-notif-prefs-btn")?.addEventListener("click", async () => {
    if (!currentUser) return;
    const topics = Array.from(
      document.querySelectorAll("#prefs-topics input[type=checkbox]:checked")
    ).map(cb => cb.value);

    try {
      const res = await fetch(`/api/users/${currentUser.id}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_topics: topics }),
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        notifPrefsModal?.classList.remove("active");
        showToast("Notification preferences saved 🔔", "success");
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
      showToast("Failed to save preferences", "critical");
    }
  });

  // Close modals on backdrop click
  window.addEventListener("click", (e) => {
    if (e.target === publishModal) publishModal?.classList.remove("active");
    const briefingModal = document.getElementById("briefing-modal");
    if (e.target === briefingModal) briefingModal?.classList.remove("active");
    if (e.target === notifPrefsModal) notifPrefsModal?.classList.remove("active");
  });

  // Publish Form Submit
  const publishForm = document.getElementById("publish-form");
  publishForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const urgency = document.getElementById("pub-urgency").value;
    const title = document.getElementById("pub-title").value;
    const category = document.getElementById("pub-category").value;
    const location = document.getElementById("pub-location").value;
    const dept = document.getElementById("pub-target-dept").value;
    const batch = document.getElementById("pub-target-batch").value;
    const section = document.getElementById("pub-target-section").value;
    const club = document.getElementById("pub-target-club").value;
    const content = document.getElementById("pub-content").value;
    const tldr = document.getElementById("pub-tldr").value;
    const deadline = document.getElementById("pub-deadline").value;
    const actionLabel = document.getElementById("pub-action-label").value;
    const requiresAck = document.getElementById("pub-requires-ack").checked;

    const payload = {
      title,
      content,
      summary_tldr: tldr || content.slice(0, 120) + "...",
      category,
      urgency,
      target_dept: dept,
      target_batch: batch,
      target_section: section,
      target_club: club,
      location_change: location || null,
      deadline_at: deadline ? new Date(deadline).toISOString() : null,
      action_label: actionLabel || null,
      action_url: actionLabel ? "#" : null,
      publisher_id: currentUser ? currentUser.id : 3,
      publisher_name: currentUser ? currentUser.name : "Faculty Member",
      publisher_role: currentUser ? currentUser.role.toUpperCase() : "FACULTY",
      is_verified: currentUser?.role === "faculty" || currentUser?.role === "cr",
      requires_acknowledgment: requiresAck,
    };

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Announcement published & broadcasted live! 🚀", "success");
        publishModal?.classList.remove("active");
        publishForm.reset();
        await loadFeed();
      }
    } catch (err) {
      console.error("Failed to publish:", err);
      showToast("Error publishing announcement", "critical");
    }
  });
}

// Utility: HTML escape
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start
document.addEventListener("DOMContentLoaded", initApp);
