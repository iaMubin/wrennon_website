// ── Backend URL detection ──────────────────────────────────────────
const _RENDER_HOST = "wrennon-backend.onrender.com";
const _IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:";
const API_BASE = `${_IS_LOCAL ? "http" : "https"}://${_IS_LOCAL ? "localhost:8000" : _RENDER_HOST}/api`;
const WS_URL  = `${_IS_LOCAL ? "ws"   : "wss"}://${_IS_LOCAL ? "localhost:8000" : _RENDER_HOST}/ws/agent`;


let socket = null;
let activeSessionId = null;
let activeSection = "active"; // "attention" | "active" | "all"
const drafts = {};
window.conversations = []; // Global state for memory retention across tab switches

// --- Elements ---
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const connectionDot = document.getElementById("connection-dot");
const sectionTabs = document.querySelectorAll(".tab");
const conversationList = document.getElementById("conversation-list");
const attentionCount = document.getElementById("attention-count");
const activeCount = document.getElementById("active-count");
const emptyState = document.getElementById("empty-state");
const activeConversationEl = document.getElementById("active-conversation");
const conversationEmail = document.getElementById("conversation-email");
const conversationSession = document.getElementById("conversation-session");
const agentMessages = document.getElementById("agent-messages");
const agentInput = document.getElementById("agent-message-input");

// ── Theme Management ───────────────────────────────────────────────
function setupThemeDropdown() {
  const menuBtn = document.getElementById("theme-menu-btn");
  const dropdown = document.getElementById("theme-dropdown");
  const options = document.querySelectorAll(".theme-option");
  if (!menuBtn || !dropdown) return;

  const menuMainView = document.getElementById("menu-main-view");
  const menuAppearanceView = document.getElementById("menu-appearance-view");
  const btnShowAppearance = document.getElementById("btn-show-appearance");
  const btnBackAppearance = document.getElementById("btn-back-appearance");

  function applyTheme(themeValue) {
    localStorage.setItem("wrennon_theme", themeValue);
    if (themeValue === "system") {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark-matte" : "light-brownish");
    } else {
      document.documentElement.setAttribute("data-theme", themeValue);
    }
    
    options.forEach(opt => {
      if (opt.dataset.themeValue) {
        opt.classList.toggle("active", opt.dataset.themeValue === themeValue);
      }
    });
  }

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", !isExpanded);
    dropdown.classList.toggle("hidden");

    if (!dropdown.classList.contains("hidden") && menuMainView && menuAppearanceView) {
      menuMainView.classList.remove("hidden");
      menuAppearanceView.classList.add("hidden");
    }

    if (!isExpanded && options.length > 0) {
      options[0].focus();
    }
  });

  if (btnShowAppearance && menuMainView && menuAppearanceView) {
    btnShowAppearance.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menuMainView.classList.add("hidden");
      menuAppearanceView.classList.remove("hidden");
    });
  }

  if (btnBackAppearance && menuMainView && menuAppearanceView) {
    btnBackAppearance.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menuAppearanceView.classList.add("hidden");
      menuMainView.classList.remove("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== menuBtn) {
      dropdown.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus();
    }
  });

  options.forEach(opt => {
    opt.addEventListener("click", () => {
      if (!opt.dataset.themeValue) return; // Don't trigger theme change for submenu navigation buttons (Appearance/Back)
      applyTheme(opt.dataset.themeValue);
      dropdown.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  const currentTheme = localStorage.getItem("wrennon_theme") || "system";
  applyTheme(currentTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem("wrennon_theme") === "system") {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark-matte" : "light-brownish");
    }
  });
}
setupThemeDropdown();

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

let typingTimeout;
let isTyping = false;
agentInput.addEventListener("input", (e) => {
  if (!activeSessionId || !socket || socket.readyState !== WebSocket.OPEN) return;
  const isInternal = noteTypeSelect && noteTypeSelect.value === "internal";
  if (isInternal) return; // Don't broadcast typing for internal notes
  
  if (!isTyping) {
    socket.send(JSON.stringify({ type: "typing", session_id: activeSessionId }));
    isTyping = true;
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.send(JSON.stringify({ type: "stopped_typing", session_id: activeSessionId }));
    isTyping = false;
  }, 1500);
});

const agentSendBtn = document.getElementById("agent-send-btn");
const resolveBtn = document.getElementById("resolve-btn");

// --- Mobile: back button returns from an open conversation to the list ---
const mobileBackBtn = document.getElementById("mobile-back-btn");
if (mobileBackBtn) {
  mobileBackBtn.addEventListener("click", () => {
    document.getElementById("dashboard")?.classList.remove("mobile-show-conversation");
  });
}

// --- Password Toggle ---
const togglePwdBtn = document.getElementById("toggle-pwd");
if (togglePwdBtn) {
  const pwdInput = document.getElementById("password");
  const eyePaths = togglePwdBtn.querySelectorAll(".eye");
  const slashLine = togglePwdBtn.querySelector(".eye-slash");
  
  togglePwdBtn.addEventListener("click", () => {
    if (pwdInput.type === "password") {
      pwdInput.type = "text";
      eyePaths.forEach(p => p.classList.add("hidden"));
      slashLine.classList.remove("hidden");
    } else {
      pwdInput.type = "password";
      eyePaths.forEach(p => p.classList.remove("hidden"));
      slashLine.classList.add("hidden");
    }
  });
}

// --- Login ---
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  loginError.classList.add("hidden");

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const body = new URLSearchParams({ username, password });

  try {
    const response = await fetch(`${API_BASE}/agent/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body,
    });

    if (!response.ok) {
      loginError.classList.remove("hidden");
      return;
    }

    const data = await response.json();
    // Token is stored in localStorage to avoid cross-origin cookie blocking
    localStorage.setItem("agent_token", data.access_token);
    localStorage.setItem("agent_username", username); // Save username to identify self
    localStorage.setItem("agent_role", data.role); // Save role to show admin btn
    
    if (data.role === "manager") {
      document.getElementById("admin-dashboard-btn").classList.remove("hidden");
      document.getElementById("admin-dashboard-btn").addEventListener("click", () => {
        window.location.href = "/agent/admin_dashboard.html";
      });
    }

    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");

    connectSocket();
    await loadConversations();
  } catch (err) {
    loginError.classList.remove("hidden");
    console.error(err);
  }
});
}

// --- WebSocket ---
let reconnectAttempts = 0;
let reconnectTimeout = null;

function connectSocket() {
  if (typeof _IS_LOCAL !== 'undefined' && _IS_LOCAL) return; // Completely disable web sockets for autoplay demo
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  const token = localStorage.getItem("agent_token");
  
  if (!token || token === "null" || token === "undefined") {
    console.warn("No agent token found, aborting WebSocket connection.");
    return;
  }

  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    reconnectAttempts = 0;
    connectionDot.classList.remove("dot--offline");
    connectionDot.classList.add("dot--online");
    connectionDot.title = "Connected";
  };

  socket.onclose = (event) => {
    connectionDot.classList.remove("dot--online");
    connectionDot.classList.add("dot--offline");

    // The backend closes with code 4401 specifically for auth failures
    // (missing/expired/invalid/revoked token — see websocket_routes.py).
    // Retrying an auth failure with the same dead token forever (this used
    // to keep exponential-backoff-retrying indefinitely, hammering the
    // server every 30s with a token that will never become valid again)
    // helps no one — the fix is to stop and send the agent back to login.
    if (event.code === 4401) {
      connectionDot.title = "Session expired. Please log in again.";
      logout();
      return;
    }

    // Any other disconnect (network blip, server restart, etc.) — keep the
    // existing exponential backoff retry behavior.
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // max 30s
    connectionDot.title = `Disconnected. Reconnecting in ${delay/1000}s...`;

    reconnectTimeout = setTimeout(connectSocket, delay);
  };

  socket.onmessage = (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch (err) { return; }

    if (data.type === "handoff" || data.type === "reopen") {
      loadConversations();
      if (data.session_id === activeSessionId) {
        if (data.summary) {
          appendMessage("system", `📋 ${data.summary}`);
        }
        if (data.is_resolved) {
          resolveBtn.textContent = "Resolved";
          resolveBtn.disabled = true;
          resolveBtn.classList.remove("btn-primary");
        } else {
          resolveBtn.textContent = "Mark resolved";
          resolveBtn.disabled = false;
          resolveBtn.classList.add("btn-primary");
        }
      }
    } else if (data.type === "new_message") {
      // Deduplicate instant demo messages
      if (data.sender === "customer" && window.recentDemoMessages) {
        const idx = window.recentDemoMessages.indexOf(data.content);
        if (idx !== -1) {
          window.recentDemoMessages.splice(idx, 1);
          return; // Skip appending, it was already rendered instantly!
        }
      }

      if (data.session_id === activeSessionId) {
        hideCustomerTypingIndicator();
        appendMessage(data.sender, data.content, new Date().toISOString(), data.sender === "agent_internal", data.message_id);
        // Refresh order context whenever a new message arrives (human or bot/ai may trigger order fetching)
        fetchOrderContext(data.session_id);
        if (data.is_resolved) {
          resolveBtn.textContent = "Resolved";
          resolveBtn.disabled = true;
          resolveBtn.classList.remove("btn-primary");
        } else {
          resolveBtn.textContent = "Mark resolved";
          resolveBtn.disabled = false;
          resolveBtn.classList.add("btn-primary");
        }
      }
      loadConversations();
    } else if (data.type === "typing" || data.type === "stopped_typing") {
      // Customer -> agent typing indicator (mirrors the agent -> customer
      // one in widget.js). Only relevant if we're currently looking at
      // that customer's conversation.
      if (data.session_id === activeSessionId) {
        if (data.type === "typing") {
          showCustomerTypingIndicator();
        } else {
          hideCustomerTypingIndicator();
        }
      }
    } else {
      console.warn("Unrecognized WebSocket message:", data);
    }
  };
}

// --- Section Tabs ---
sectionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    sectionTabs.forEach((t) => t.classList.remove("tab--active"));
    tab.classList.add("tab--active");
    activeSection = tab.dataset.section;
    loadConversations();
  });
});

let staticChatsCache = null;
async function getStaticChats() {
  if (staticChatsCache) return staticChatsCache;
  if (window.DEMO_CHATS) {
    staticChatsCache = window.DEMO_CHATS;
    return staticChatsCache;
  }
  try {
    const res = await fetch('live-demo-assets/demo-chats.json');
    if (res.ok) {
      staticChatsCache = await res.json();
    } else {
      staticChatsCache = [];
    }
  } catch(e) {
    staticChatsCache = [];
  }
  return staticChatsCache;
}

// --- Loading conversation lists ---
function formatPreview(conv) {
  let msg = conv.last_message;
  if (!msg) return "No messages yet";

  // Handle internal notes specially
  if (conv.last_message_is_internal || msg.startsWith("*Internal Note:*")) {
    let noteText = msg.replace(/^\*Internal Note:\*\s*/, '');
    let cleanText = noteText.replace(/\n\n\(Transcript:.*?\)/g, '').replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '$1');
    return `<span style="color: var(--warning); font-weight: 600; font-size: 11px; text-transform: uppercase; margin-right: 4px;">Note:</span>${escapeHtml(cleanText)}`;
  }

  // Remove transcript
  let text = msg.replace(/\n\n\(Transcript:.*?\)/g, '');

  // Check for Audio/Video
  if (/\[(?:Audio|Video)\]\((https?:\/\/[^\)]+)\)/.test(text)) {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>Voice message`;
  }

  // Check for Image
  if (/!\[.*?\]\((https?:\/\/[^\)]+)\)/.test(text)) {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>Photo`;
  }

  // Strip bold
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  // Strip links
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '$1');

  return escapeHtml(text);
}

async function loadConversations() {
  const endpoints = {
    "my_cases": "/agent/conversations/my-cases",
    "attention": "/agent/conversations/needs-attention",
    "active": "/agent/conversations/active",
    "all": "/agent/conversations"
  };
  
  const endpoint = endpoints[activeSection] || endpoints["my_cases"];
  
  const urlParams = new URLSearchParams(window.location.search);
  const sector = urlParams.get('sector');
  
  // Fetch static from JSON first to ensure instant load
  const allStaticChats = await getStaticChats();
  
  if (!window.conversations || window.conversations.length === 0) {
      window.conversations = [...allStaticChats];
  } else {
      // Merge newly fetched static chats with any dynamically created live chats in memory
      const existingIds = new Set(window.conversations.map(c => c.session_id));
      for (const chat of allStaticChats) {
          if (!existingIds.has(chat.session_id)) {
              window.conversations.push(chat);
          }
      }
  }
  
  let currentViewConversations = window.conversations;
  if (sector) {
    currentViewConversations = window.conversations.filter(c => c.sector === sector || !c.sector); // preserve new handoffs that might not have a sector
  }

  const currentAgent = localStorage.getItem("agent_username");

  function filterBySection(convs, section) {
    if (section === "my_cases") return convs.filter(c => c.handled_by === currentAgent);
    if (section === "attention") return convs.filter(c => !c.resolved && c.handoff_active);
    if (section === "active") return convs.filter(c => !c.resolved);
    return convs; // "all"
  }

  function updateBadges(convs) {
    const myCasesCountEl = document.getElementById("my-cases-count");
    if (myCasesCountEl) {
      myCasesCountEl.textContent = filterBySection(convs, "my_cases").length;
    }
    attentionCount.textContent = filterBySection(convs, "attention").length;
    activeCount.textContent = filterBySection(convs, "active").length;
  }

  if (currentViewConversations && currentViewConversations.length > 0) {
    currentViewConversations.forEach(c => {
       if (!c.last_message && c.messages && c.messages.length > 0) {
          c.last_message = c.messages[c.messages.length - 1].content;
       }
    });
    updateBadges(currentViewConversations);
    renderConversationList(filterBySection(currentViewConversations, activeSection));
  }

  // Quietly fetch live from backend to capture any newly created chats during the session
  const queryStr = sector ? `?sector=${encodeURIComponent(sector)}` : '';
  authedFetch(endpoint + queryStr).then(liveConversations => {
    if (!liveConversations || liveConversations.length === 0) return;
    
    let merged = [...liveConversations];
    const mergedIds = new Set(merged.map(c => c.session_id));
    
    for (const c of currentViewConversations) {
      if (!mergedIds.has(c.session_id)) {
        merged.push(c);
        mergedIds.add(c.session_id);
      }
    }
    
    updateBadges(merged);
    renderConversationList(filterBySection(merged, activeSection));
  }).catch(() => null);
}

function renderConversationList(conversations) {
  conversationList.innerHTML = "";

  for (const conv of conversations) {
    const item = document.createElement("div");
    item.className = "conv-item";
    item.dataset.sessionId = conv.session_id;
    if (conv.handoff_active && !conv.resolved) item.classList.add("conv-item--urgent");
    if (conv.session_id === activeSessionId) item.classList.add("conv-item--selected");

    let badgeClass = "badge--ai";
    let stageText = "AI";

    if (conv.resolved) {
      badgeClass = "badge--resolved";
      stageText = conv.handled_by ? conv.handled_by : "AI";
    } else if (conv.handoff_active) {
      if (conv.handled_by) {
        badgeClass = "badge--agent";
        stageText = conv.handled_by;
      } else {
        badgeClass = "badge--human";
        stageText = "Needs Attention";
      }
    }

    const reopenBadge = conv.reopen_count > 0
      ? `<span class="conv-item__reopen-badge">↩ Reopened${conv.reopen_count > 1 ? ` ×${conv.reopen_count}` : ""}</span>`
      : "";

    let sentimentBadge = '';
    if (conv.sentiment) {
      const s = conv.sentiment.trim().toLowerCase();
      let color = 'var(--ink-soft)';
      if (s.includes('angry') || s.includes('upset') || s.includes('mad')) color = 'var(--accent-alert)';
      else if (s.includes('frustrated') || s.includes('annoyed') || s.includes('sad')) color = 'var(--warning)';
      else if (s.includes('happy') || s.includes('delighted') || s.includes('satisfied') || s.includes('glad')) color = 'var(--accent-success)';
      else if (s.includes('neutral') || s.includes('mixed')) color = 'var(--ink-soft)';
      sentimentBadge = `<span class="badge" style="border-color:${color}; color:${color}">${escapeHtml(conv.sentiment)}</span>`;
    }

    const mentionedBadge = conv.is_mentioned
      ? `<span class="badge badge--human">Mentioned</span>`
      : "";

    // SLA Warning: flag conversations that have been waiting on a human for 5+ minutes
    let slaBadge = "";
    if (conv.handoff_active && !conv.resolved) {
      const updatedTime = new Date(conv.updated_at).getTime();
      const now = new Date().getTime();
      const diffMins = (now - updatedTime) / 60000;
      if (diffMins >= 5) {
        let timeStr = diffMins >= 60 ? `${Math.floor(diffMins / 60)}hr` : `${Math.floor(diffMins)}min`;
        slaBadge = `<span class="badge badge--sla-warning">⏳ ${timeStr} waiting</span>`;
      }
    }

    let languageBadge = '';
    if (conv.language && conv.language.toLowerCase() !== 'en') {
      languageBadge = `<span class="badge">${escapeHtml(conv.language.toUpperCase())}</span>`;
    }

    const webSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const waSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    const igSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    
    const platforms = [webSvg, waSvg, igSvg];
    const hash = conv.short_id ? conv.short_id.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a & a}, 0) : 0;
    const platformIcon = platforms[Math.abs(hash) % platforms.length];

    item.innerHTML = `
      <div class="conv-item-header">
        <span class="conv-item-email" style="display:flex; align-items:center; gap:4px;">
            ${escapeHtml(conv.customer_name || conv.customer_email || "Unknown Customer")}
        </span>
        <span class="conv-item-time">${formatSidebarTime(conv.updated_at)}</span>
      </div>
      <div class="conv-item-preview">${formatPreview(conv)}</div>
      <div class="badge-row">
        <span class="badge ${badgeClass}">${stageText}</span>
        ${sentimentBadge}
        ${languageBadge}
        ${mentionedBadge}
        ${slaBadge}
        ${reopenBadge}
        <span class="badge badge--platform" title="Source">${platformIcon}</span>
      </div>
    `;

    item.addEventListener("click", () => openConversation(conv.session_id, conv.customer_name || conv.customer_email, conv.short_id, conv.resolved, conv.updated_at));
    conversationList.appendChild(item);
  }
}

// --- Opening and viewing a conversation ---
async function openConversation(sessionId, displayName, shortId, isResolved, updatedAt) {
  if (activeSessionId && activeSessionId !== sessionId) {
    drafts[activeSessionId] = agentInput.value;
  }
  hideCustomerTypingIndicator(); // clear any stale indicator from the previously-open conversation
  clearCustomerSidebar();
  hideOrderPopup(); // clear order details from previous chat
  
  activeSessionId = sessionId;
  emptyState.classList.add("hidden");
  activeConversationEl.classList.remove("hidden");
  document.getElementById("dashboard")?.classList.add("mobile-show-conversation");

  agentInput.value = drafts[sessionId] || "";

  conversationEmail.textContent = displayName || "Unknown Customer";
  conversationSession.textContent = shortId || sessionId;

  // Reset input type to public (reply) when switching conversations
  const noteTypeSelect = document.getElementById("note-type-select");
  if (noteTypeSelect && noteTypeSelect.value !== "public") {
    noteTypeSelect.value = "public";
    noteTypeSelect.dispatchEvent(new Event('change'));
  }

  const resolveTimeEl = document.getElementById("resolve-time");
  if (isResolved) {
    resolveBtn.textContent = "Resolved";
    resolveBtn.disabled = true;
    resolveBtn.classList.remove("btn-primary");
    if (updatedAt) {
      resolveTimeEl.textContent = `at ${formatSidebarTime(updatedAt)}`;
      resolveTimeEl.classList.remove("hidden");
    }
  } else {
    resolveBtn.textContent = "Mark resolved";
    resolveBtn.disabled = false;
    resolveBtn.classList.add("btn-primary");
    resolveTimeEl.classList.add("hidden");
  }

  agentMessages.innerHTML = "<div class='loading-spinner'></div>";
  let responseData = null;
  
  // Check live memory state first for instant rendering of mock chats
  const conv = window.conversations ? window.conversations.find(c => c.session_id === sessionId) : null;
  const staticChats = await getStaticChats();
  const staticChat = staticChats.find(c => c.session_id === sessionId);
  
  if (conv) {
    responseData = {
      pinned_message_id: null,
      messages: conv.messages || []
    };
  } else if (staticChat) {
    responseData = {
      pinned_message_id: null,
      messages: staticChat.messages || []
    };
  } else {
    // If not static, it's a live chat created during the demo
    responseData = await authedFetch(`/agent/conversations/${sessionId}/messages`).catch(() => null);
  }

  agentMessages.innerHTML = "";
  lastMsgSender = null;
  lastMsgTime = 0;
  hasUnreadIndicator = false;
  agentInput.focus();

  if (responseData) {
    const messages = responseData.messages || [];
    const pinnedId = responseData.pinned_message_id;
    let pinnedContent = null;
    
    let lastDateStr = null;
    for (const msg of messages) {
      if (msg.id === pinnedId) {
        pinnedContent = msg.content;
      }
      const dateObj = new Date(msg.created_at);
      const dateStr = dateObj.toLocaleDateString();
      if (dateStr !== lastDateStr) {
        const dateDiv = document.createElement("div");
        dateDiv.className = "date-separator";
        
        const todayStr = new Date().toLocaleDateString();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toLocaleDateString();
        
        if (dateStr === todayStr) dateDiv.textContent = "Today";
        else if (dateStr === yesterdayStr) dateDiv.textContent = "Yesterday";
        else dateDiv.textContent = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        
        agentMessages.appendChild(dateDiv);
        lastDateStr = dateStr;
      }
      appendMessage(msg.sender, msg.content, msg.created_at, msg.sender === "agent_internal", msg.id);
    }
    
    updatePinnedMessageUI(pinnedId, pinnedContent);
  }
  
  if (responseData && responseData.messages && responseData.messages.length > 0) {
      renderCustomerSidebar(sessionId);
      renderOrderPopup(sessionId);
  } else if (isResolved) {
      renderCustomerSidebar(sessionId);
      renderOrderPopup(sessionId);
  }
  fetchOrderContext(sessionId);
  loadConversations();
}

let lastMsgSender = null;
let lastMsgTime = 0;

let hasUnreadIndicator = false;

function injectUnreadIndicator() {
  if (hasUnreadIndicator) return;
  const div = document.createElement("div");
  div.className = "date-separator unread-indicator";
  div.style.color = "var(--accent-alert)";
  div.style.borderColor = "var(--line)";
  div.textContent = "New Messages";
  agentMessages.appendChild(div);
  hasUnreadIndicator = true;
}

function clearUnreadIndicator() {
  const indicators = agentMessages.querySelectorAll(".unread-indicator");
  indicators.forEach(el => el.remove());
  hasUnreadIndicator = false;
}

// --- Customer typing indicator (customer -> agent) ---
// Mirrors widget.js's showTypingIndicator/hideTypingIndicator, just shown
// as the customer's own bubble style instead of the agent/AI one.
function showCustomerTypingIndicator() {
  if (document.getElementById("customer-typing-wrapper")) return;
  const wrapper = document.createElement("div");
  wrapper.id = "customer-typing-wrapper";
  wrapper.className = "msg-content msg-content--human";
  wrapper.innerHTML = `
    <div class="msg msg--human typing-indicator">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
  agentMessages.appendChild(wrapper);
  scrollToBottom();
}

function hideCustomerTypingIndicator() {
  const wrapper = document.getElementById("customer-typing-wrapper");
  if (wrapper) {
    wrapper.remove();
  }
}


function scrollToBottom(force = false) {
  setTimeout(() => {
    agentMessages.scrollTop = agentMessages.scrollHeight;
  }, 50);
}

function updatePinnedMessageUI(msgId, content) {
  let pinnedContainer = document.getElementById("pinned-message-container");
  
  if (!msgId) {
    if (pinnedContainer) pinnedContainer.remove();
    return;
  }
  
  if (!pinnedContainer) {
    pinnedContainer = document.createElement("div");
    pinnedContainer.id = "pinned-message-container";
    pinnedContainer.className = "pinned-message";
    
    // Insert after chat-header
    const header = document.querySelector(".chat-header");
    header.parentNode.insertBefore(pinnedContainer, header.nextSibling);
  }
  
  let displayContent = content;
  if (displayContent.startsWith("*Internal Note:*")) {
    displayContent = displayContent.replace(/^\*Internal Note:\* /, "[Internal] ");
  }
  
  pinnedContainer.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
        <svg style="margin-right:8px; color:var(--primary); flex-shrink:0;" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 11V7a4 4 0 0 0-8 0v4L6 14v2h5v5l1 2 1-2v-5h5v-2l-2-3z"></path></svg>
        <span style="font-weight:500; font-size:13px; text-overflow:ellipsis; overflow:hidden;">${escapeHtml(displayContent)}</span>
      </div>
      <button class="unpin-btn" data-id="${msgId}" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;flex-shrink:0;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `;
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !activeConversationEl.classList.contains("hidden")) {
    clearUnreadIndicator();
  }
});

// Shows the AI's behind-the-scenes work (order lookup, reading a photo,
// etc.) as a short animated sequence of steps in the agent transcript -
// agent-side only, the customer just sees a normal typing indicator.
async function showAiTaskSteps(steps) {
  const container = document.getElementById("agent-messages");
  if (!container || !steps || steps.length === 0) return;

  const card = document.createElement("div");
  card.className = "ai-task-card";
  card.innerHTML = `
    <div class="ai-task-card__header">
      <span class="ai-task-card__spinner"></span>
      <span>AI is working on this...</span>
    </div>
    <div class="ai-task-card__steps"></div>
  `;
  container.appendChild(card);
  container.scrollTop = container.scrollHeight;

  const stepsEl = card.querySelector(".ai-task-card__steps");
  const rowEls = steps.map((label) => {
    const row = document.createElement("div");
    row.className = "ai-task-step ai-task-step--pending";
    row.innerHTML = `<span class="ai-task-step__icon"></span><span class="ai-task-step__label">${escapeHtml(label)}</span>`;
    stepsEl.appendChild(row);
    return row;
  });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (const row of rowEls) {
    row.classList.remove("ai-task-step--pending");
    row.classList.add("ai-task-step--active");
    container.scrollTop = container.scrollHeight;
    await sleep(550 + Math.random() * 250);
    row.classList.remove("ai-task-step--active");
    row.classList.add("ai-task-step--done");
  }

  await sleep(350);
  card.classList.add("ai-task-card--collapsed");
  card.innerHTML = `<div class="ai-task-card__summary"><span class="ai-task-card__check">&check;</span> Completed ${steps.length} step${steps.length > 1 ? "s" : ""}</div>`;
  container.scrollTop = container.scrollHeight;
}

function appendMessage(sender, content, isoString = new Date().toISOString(), isInternal = false, msgId = null) {
  if (document.hidden) {
    injectUnreadIndicator();
  }

  const timestamp = new Date(isoString).getTime();
  const isGrouped = (sender === lastMsgSender && (timestamp - lastMsgTime < 60000) && sender !== "system");
  
  if (!isGrouped) {
    lastMsgSender = sender;
  }
  lastMsgTime = timestamp;

  const contentWrapper = document.createElement("div");
  const actualSender = isInternal ? "agent" : (sender === "customer" ? "human" : sender);
  contentWrapper.className = `msg-content msg-content--${actualSender}${isGrouped ? ' msg-content--grouped' : ''}${isInternal ? ' msg-content--internal' : ''}`;
  contentWrapper.style.display = "flex";
  contentWrapper.style.flexDirection = "column";
  if (msgId) contentWrapper.dataset.msgId = msgId;

  const div = document.createElement("div");
  div.className = `msg msg--${actualSender}${isInternal ? ' msg--internal' : ''}`;
  div.setAttribute("role", "listitem");
  
  let nameHtml = "";
  if (actualSender === "agent" && !isGrouped) {
    const storedName = localStorage.getItem("agent_username") || "Agent";
    const displayName = storedName.toUpperCase();
    
    if (isInternal) {
      const badgeHtml = `<span style="background: var(--accent-alert); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; vertical-align: middle;">Agent</span>`;
      nameHtml = `<div class="msg-name" style="display: flex; align-items: center; margin-bottom: 6px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 600; color: var(--ink); opacity: 0.9; letter-spacing: 0.05em; text-transform: uppercase;"><span style="font-weight: 800; margin-right: 4px; color: var(--accent-alert);">Note:</span> ${displayName}${badgeHtml}</div>`;
    } else {
      const badgeHtml = `<span style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: var(--bg-base); padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; vertical-align: middle;">Agent</span>`;
      nameHtml = `<div class="msg-name" style="display: flex; align-items: center; margin-bottom: 6px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 600; color: var(--bg-base); opacity: 0.95; letter-spacing: 0.05em; text-transform: uppercase;">${displayName}${badgeHtml}</div>`;
    }
  }
  
  // Format message content
  let displayContent = content || "";

  // Feature: Hide internal image descriptions from agent UI
  displayContent = displayContent.replace(/\[INTERNAL_IMAGE_DESC\][\s\S]*?\[\/INTERNAL_IMAGE_DESC\]/g, '');

  // Feature: Extract audio transcriptions to display as collapsible blocks
  let transcriptHtml = '';
  displayContent = displayContent.replace(/\(Transcript:\s*([\s\S]*?)\)/g, (match, p1) => {
    transcriptHtml += `<details style="margin-top: 8px; font-size: 0.85em; opacity: 0.8; background: rgba(0,0,0,0.05); padding: 6px; border-radius: 6px; cursor: pointer;"><summary style="font-weight: 500; opacity: 0.8; padding: 2px;">View Transcript</summary><div style="margin-top: 6px; font-family: ui-monospace, monospace; white-space: pre-wrap; padding: 4px; border-top: 1px solid rgba(0,0,0,0.1);">${escapeHtml(p1.trim())}</div></details>`;
    return '';
  });

  if (isInternal) {
    displayContent = displayContent.replace(/^\*Internal Note:\* /, "");
    div.innerHTML = nameHtml + renderMarkdown(displayContent) + transcriptHtml;
  } else {
    div.innerHTML = nameHtml + renderMarkdown(displayContent) + transcriptHtml;
  }

  if (msgId) {
    let actionsHtml = `<div class="msg-actions" style="position:absolute; bottom:4px; ${actualSender === 'agent' ? 'left:-28px;' : 'right:-28px;'} display:flex; flex-direction:column; gap:4px;">`;
    actionsHtml += `<button class="pin-note-btn" data-id="${msgId}" data-content="${escapeHtml(displayContent)}" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;" title="Pin message"><svg style="transform: rotate(45deg);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 11V7a4 4 0 0 0-8 0v4L6 14v2h5v5l1 2 1-2v-5h5v-2l-2-3z"></path></svg></button>`;
    if (isInternal) {
      actionsHtml += `<button class="delete-note-btn" data-id="${msgId}" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;" title="Delete note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>`;
    }
    actionsHtml += `</div>`;
    div.innerHTML += actionsHtml;
  }
  contentWrapper.appendChild(div);

  if (sender !== "system") {
    const timeStr = formatTime(isoString);
    const ticks = (sender === "ai" || sender === "agent" || isInternal) ? `<span class="msg-ticks">✓✓</span>` : "";
    const metaDiv = document.createElement("div");
    metaDiv.className = `msg-meta msg-meta--${actualSender}`;
    metaDiv.innerHTML = `<span>${timeStr}</span>${ticks}`;
    contentWrapper.appendChild(metaDiv);
  }

  agentMessages.appendChild(contentWrapper);
  scrollToBottom(sender === 'agent');
}

document.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-note-btn");
  if (deleteBtn) {
    const msgId = deleteBtn.dataset.id;
    if (!msgId) return;
    if (!confirm("Are you sure you want to delete this internal note?")) return;
    
    const result = await authedFetch(`/agent/messages/${msgId}`, "DELETE");
    if (result) {
      const wrapper = document.querySelector(`[data-msg-id="${msgId}"]`);
      if (wrapper) wrapper.remove();
    }
  }
  
  const pinBtn = e.target.closest(".pin-note-btn");
  if (pinBtn) {
    const msgId = pinBtn.dataset.id;
    const content = pinBtn.dataset.content;
    if (!msgId || !activeSessionId) return;
    
    const result = await authedFetch(`/agent/conversations/${activeSessionId}/pin`, "POST", { message_id: parseInt(msgId, 10) });
    if (result) {
      updatePinnedMessageUI(msgId, content);
    }
  }

  const unpinBtn = e.target.closest(".unpin-btn");
  if (unpinBtn) {
    if (!activeSessionId) return;
    
    const result = await authedFetch(`/agent/conversations/${activeSessionId}/pin`, "POST", { message_id: null });
    if (result) {
      updatePinnedMessageUI(null, null);
    }
  }
});

// ── Slash Commands & Mentions Autocomplete ──
const MACROS = [
  { cmd: "/refund", desc: "Refund policy template", text: "Hi there! I can help you with your refund. According to our policy, we can process a full refund within 30 days of purchase. Would you like me to proceed with that?" },
  { cmd: "/greeting", desc: "Standard welcome message", text: "Hello! Thank you for reaching out to Wrennon Support. How can I assist you today?" },
  { cmd: "/delay", desc: "Apology for delay", text: "I sincerely apologize for the delay in my response. I'm looking into this for you right now." },
  { cmd: "/escalate", desc: "Escalate to manager", text: "I understand your frustration. I am escalating this issue to my manager immediately, and they will reach out to you within the hour." }
];

const AGENTS = [];

async function loadAgents() {
  const data = await authedFetch("/agent/list");
  if (data && Array.isArray(data)) {
    AGENTS.length = 0;
    for (const agent of data) {
      if (agent.role === "agent" || agent.role === "manager" || agent.role === "admin") {
        let title = agent.role.charAt(0).toUpperCase() + agent.role.slice(1);
        let display = agent.full_name || agent.username;
        AGENTS.push({ cmd: "@" + agent.username, desc: display + " (" + title + ")" });
      }
    }
  }
}
loadAgents();

let slashSelectedIndex = 0;
let currentPopupMode = null; // "macro" or "mention"

function renderSlashPopup(matches, mode) {
  const popup = document.getElementById("slash-command-popup");
  if (!popup) return;
  popup.innerHTML = "";
  currentPopupMode = mode;
  matches.forEach((m, idx) => {
    const div = document.createElement("div");
    div.className = `slash-item ${idx === slashSelectedIndex ? "selected" : ""}`;
    div.innerHTML = `
      <span class="slash-item__command">${m.cmd}</span>
      <span class="slash-item__desc">${m.desc}</span>
    `;
    div.addEventListener("click", () => {
      if (currentPopupMode === "mention") {
        const val = agentInput.value;
        const lastSpace = val.lastIndexOf(" ");
        if (lastSpace === -1) {
          agentInput.value = m.cmd + " ";
        } else {
          agentInput.value = val.substring(0, lastSpace + 1) + m.cmd + " ";
        }
      } else {
        agentInput.value = m.text;
      }
      popup.classList.remove("active");
      agentInput.focus();
    });
    popup.appendChild(div);
  });
}

function updateSlashSelection(items) {
  items.forEach((item, idx) => {
    if (idx === slashSelectedIndex) item.classList.add("selected");
    else item.classList.remove("selected");
  });
}

agentInput.addEventListener("input", (e) => {
  const val = agentInput.value;
  const popup = document.getElementById("slash-command-popup");
  if (!popup) return;

  // Look at the last word being typed
  const lastSpace = val.lastIndexOf(" ");
  const lastWord = lastSpace === -1 ? val : val.substring(lastSpace + 1);

  let matches = [];
  let mode = null;

  if (lastWord.startsWith("/")) {
    const query = lastWord.toLowerCase();
    matches = MACROS.filter(m => m.cmd.toLowerCase().startsWith(query));
    mode = "macro";
  } else if (lastWord.startsWith("@")) {
    const noteTypeSelectEl = document.getElementById("note-type-select");
    const isInternal = noteTypeSelectEl && noteTypeSelectEl.value === "internal";
    if (isInternal) {
      const query = lastWord.toLowerCase();
      matches = AGENTS.filter(m => m.cmd.toLowerCase().startsWith(query));
      mode = "mention";
    }
  }

  if (matches.length > 0) {
    slashSelectedIndex = 0;
    renderSlashPopup(matches, mode);
    popup.classList.add("active");
  } else {
    popup.classList.remove("active");
  }
});

// --- Sending a reply ---
agentSendBtn.addEventListener("click", sendAgentReply);
agentInput.addEventListener("keydown", (e) => {
  const popup = document.getElementById("slash-command-popup");
  if (popup && popup.classList.contains("active")) {
    const items = popup.querySelectorAll('.slash-item');
    if (e.key === "ArrowDown") {
      e.preventDefault();
      slashSelectedIndex = (slashSelectedIndex + 1) % items.length;
      updateSlashSelection(items);
      return;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      slashSelectedIndex = (slashSelectedIndex - 1 + items.length) % items.length;
      updateSlashSelection(items);
      return;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[slashSelectedIndex]) {
        items[slashSelectedIndex].click();
      }
      return;
    } else if (e.key === "Escape") {
      popup.classList.remove("active");
      return;
    }
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendAgentReply();
  }
});

async function handleAgentFileUpload(file, inputElement, uploadInputElement, autoSend = false, sendFunction = null) {
  if (!file) return;
  
  const originalPlaceholder = inputElement.placeholder;
  inputElement.placeholder = "Uploading...";
  inputElement.disabled = true;
  
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await fetch(`${API_BASE}/chat/upload/${activeSessionId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("agent_token")}` },
      body: formData
    });
    const data = await response.json();
    if (data.url) {
      let md = `[Document](${data.url})`;
      if (file.type.startsWith("image/")) md = `![Image](${data.url})`;
      else if (file.type.startsWith("audio/")) md = `[Audio](${data.url})`;
      else if (file.type.startsWith("video/")) md = `[Video](${data.url})`;
      
      inputElement.value = (inputElement.value + (inputElement.value ? " " : "") + md).trim();
      if (autoSend && sendFunction) {
        sendFunction();
      }
    }
  } catch (err) {
    console.error("Upload failed", err);
  } finally {
    inputElement.placeholder = originalPlaceholder;
    inputElement.disabled = false;
    inputElement.focus();
    if (uploadInputElement) uploadInputElement.value = "";
  }
}

const agentUploadBtn = document.getElementById("agent-upload-btn");
const agentFileUpload = document.getElementById("agent-file-upload");
if (agentUploadBtn && agentFileUpload) {
  agentUploadBtn.addEventListener("click", () => agentFileUpload.click());
  agentFileUpload.addEventListener("change", (e) => handleAgentFileUpload(e.target.files[0], agentInput, agentFileUpload, false, null));
}

const agentPhotoBtn = document.getElementById("agent-photo-btn");
const agentPhotoUpload = document.getElementById("agent-photo-upload");
if (agentPhotoBtn && agentPhotoUpload) {
  agentPhotoBtn.addEventListener("click", () => agentPhotoUpload.click());
  agentPhotoUpload.addEventListener("change", (e) => handleAgentFileUpload(e.target.files[0], agentInput, agentPhotoUpload, true, sendAgentReply));
}

const agentVoiceBtn = document.getElementById("agent-voice-btn");
const agentVoiceUpload = document.getElementById("agent-voice-upload");
// --- Agent Voice Recording Logic ---
let agentMediaRecorder;
let agentAudioChunks = [];
let agentIsRecording = false;

if (agentVoiceBtn) {
  agentVoiceBtn.addEventListener("click", async () => {
    if (!agentIsRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        agentMediaRecorder = new MediaRecorder(stream);
        agentAudioChunks = [];
        
        agentMediaRecorder.addEventListener("dataavailable", event => {
          agentAudioChunks.push(event.data);
        });
        
        agentMediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(agentAudioChunks, { type: 'audio/webm' });
          const file = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
          handleAgentFileUpload(file, agentInput, null, true, sendAgentReply);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        });
        
        agentMediaRecorder.start();
        agentIsRecording = true;
        agentVoiceBtn.style.color = "#EF4444";
        agentVoiceBtn.style.animation = "pulse-glow 1s infinite";
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone.");
      }
    } else {
      agentMediaRecorder.stop();
      agentIsRecording = false;
      agentVoiceBtn.style.color = "#9CA3AF";
      agentVoiceBtn.style.animation = "none";
    }
  });
}

  const noteTypeSelect = document.getElementById("note-type-select");
if (noteTypeSelect) {
  noteTypeSelect.addEventListener("change", () => {
    if (noteTypeSelect.value === "internal") {
      agentInput.style.backgroundColor = "color-mix(in srgb, var(--accent) 10%, transparent)";
      agentInput.style.borderColor = "var(--accent)";
      agentInput.placeholder = "Type internal note... (Use @ to tag, / for cmds)";
    } else {
      agentInput.style.backgroundColor = "var(--bg-base)";
      agentInput.style.borderColor = "var(--line)";
      agentInput.placeholder = "Type a reply";
    }
    agentInput.focus();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    if (noteTypeSelect) {
      noteTypeSelect.value = noteTypeSelect.value === "internal" ? "public" : "internal";
      noteTypeSelect.dispatchEvent(new Event("change"));
    }
  }
});

const agentCopilotBtn = document.getElementById("agent-copilot-btn");
if (agentCopilotBtn) {
  agentCopilotBtn.addEventListener("click", async () => {
    if (!activeSessionId) return;
    
    const originalText = agentCopilotBtn.innerHTML;
    agentCopilotBtn.innerHTML = "Generating...";
    agentCopilotBtn.disabled = true;
    agentInput.disabled = true;

    try {
      const req = {
          ticket_id: activeSessionId
      };
      const res = await fetch(`${API_BASE}/copilot/suggest`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req)
      });
      if (res.ok) {
        const data = await res.json();
        // Insert suggested draft into the input field
        agentInput.value = data.suggested_reply;
        
        // Render action buttons if any
        if (data.actions && data.actions.length > 0) {
            renderCopilotActions(data.actions);
        }
      }
    } catch (err) {
      console.error("Copilot failed", err);
    } finally {
      agentCopilotBtn.innerHTML = originalText;
      agentCopilotBtn.disabled = false;
      agentInput.disabled = false;
      agentInput.focus();
    }
  });
}

function renderCopilotActions(actions) {
    let actionContainer = document.getElementById('copilot-action-container');
    if (!actionContainer) {
        actionContainer = document.createElement('div');
        actionContainer.id = 'copilot-action-container';
        actionContainer.className = 'copilot-actions';
        actionContainer.style.display = 'flex';
        actionContainer.style.gap = '8px';
        actionContainer.style.marginTop = '8px';
        const inputRow = document.querySelector('.chat-input-row');
        inputRow.parentNode.insertBefore(actionContainer, inputRow.nextSibling);
    }
    
    actionContainer.innerHTML = '';
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-sm';
        btn.innerHTML = `⚡ ${escapeHtml(action.label)}`;
        btn.onclick = async () => {
            btn.innerHTML = 'Executing...';
            btn.disabled = true;
            try {
                // Mock execution
                await new Promise(r => setTimeout(r, 1000));
                
                // Append action result to chat as an internal note
                const note = `[Copilot Action Executed] ${action.label}`;
                socket.send(JSON.stringify({ 
                    type: "new_message", 
                    session_id: activeSessionId,
                    message: `*Internal Note:* ${note}`,
                    is_internal: true
                }));
                
                actionContainer.innerHTML = '';
            } catch (err) {
                console.error("Action failed", err);
            }
        };
        actionContainer.appendChild(btn);
    });
}

function sendAgentReply() {
  const text = agentInput.value.trim();
  if (!text || !activeSessionId || !socket || socket.readyState !== WebSocket.OPEN) return;

  const isInternal = noteTypeSelect && noteTypeSelect.value === "internal";
  
    socket.send(JSON.stringify({ session_id: activeSessionId, message: text, is_internal: isInternal }));
  
  agentInput.value = '';
  drafts[activeSessionId] = '';
  agentInput.style.height = 'auto';
}

// --- Order Context Popup ---
const sessionsAwaitingLiveOrder = new Set();

async function fetchOrderContext(sessionId) {
  if (sessionsAwaitingLiveOrder.has(sessionId)) {
    hideOrderPopup();
    clearCustomerSidebar();
    return;
  }
  
  const staticChats = await getStaticChats();
  const staticChat = staticChats.find(c => c.session_id === sessionId);
  
  if (staticChat) {
    if (staticChat.order) {
      showOrderPopup(staticChat.order);
      showCustomerSidebar(buildDemoCustomer(staticChat));
    } else {
      hideOrderPopup();
      clearCustomerSidebar();
    }
    return;
  }

  const result = await authedFetch(`/agent/conversations/${sessionId}/order-context`);
  if (result && result.order) {
    showOrderPopup(result.order);
    showCustomerSidebar(buildDemoCustomer({ ...result, session_id: sessionId }));
  } else {
    hideOrderPopup();
    clearCustomerSidebar();
  }
}

function showOrderPopup(order) {
  const popup = document.getElementById('order-popup');
  const body = document.getElementById('order-popup-body');
  if (!popup || !body) return;
  
  const statusSlug = (order.status || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const statusClass = `order-status-badge--${statusSlug}`;
  
  body.innerHTML = `
    <div class="order-popup__field">
      <span class="order-popup__label">Order ID</span>
      <span class="order-popup__value">#${escapeHtml(order.order_id)}</span>
    </div>
    <div class="order-popup__field">
      <span class="order-popup__label">Status</span>
      <span class="order-popup__value"><span class="order-status-badge ${statusClass}">${escapeHtml(order.status)}</span></span>
    </div>
    ${order.carrier ? `<div class="order-popup__field"><span class="order-popup__label">Carrier</span><span class="order-popup__value">${escapeHtml(order.carrier)}</span></div>` : ''}
    ${order.eta ? `<div class="order-popup__field"><span class="order-popup__label">ETA</span><span class="order-popup__value">${escapeHtml(order.eta)}</span></div>` : ''}
    ${order.tracking_url ? `<div class="order-popup__field" style="grid-column: span 2;"><span class="order-popup__label">Tracking</span><span class="order-popup__value"><a href="${escapeHtml(order.tracking_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(order.tracking_url)}</a></span></div>` : ''}
  `;
  popup.classList.remove('hidden');
  body.classList.remove('hidden');
  const toggleBtn = document.getElementById('order-popup-toggle');
  if (toggleBtn) toggleBtn.style.transform = '';
}

function hideOrderPopup() {
  const popup = document.getElementById('order-popup');
  if (popup) popup.classList.add('hidden');
}

// --- Customer Details Sidebar (ported from the real product UI) ---
// The real backend returns a `customer` object with { id, name, tags, email,
// phone, loyalty_tier, lifetime_value, recent_order }. The static demo data
// only has name/email/order, so we deterministically synthesize the rest —
// same customer always gets the same demo values across renders.
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildDemoCustomer(chat) {
  const seed = hashSeed(chat.session_id || chat.short_id || chat.customer_email || 'wrennon');
  const tiers = ['Gold', 'Silver', 'Bronze', 'VIP'];
  const tagPool = ['Frequent Buyer', 'New Customer', 'High LTV', 'Tech Gadgets', 'Apparel', 'Home & Garden', 'Beauty', 'Repeat Purchaser'];
  const tier = tiers[seed % tiers.length];
  const ltv = 150 + (seed % 4200);
  const phone = `555-${String(1000 + (seed % 9000)).slice(0, 4)}`;
  const tag1 = tagPool[seed % tagPool.length];
  const tag2 = tagPool[(seed + 3) % tagPool.length];
  const orderId = chat.order?.order_id ? `#${chat.order.order_id}` : '—';

  return {
    id: chat.short_id || chat.session_id || '',
    name: chat.customer_name || 'Unknown Customer',
    tags: tag1 === tag2 ? [tag1] : [tag1, tag2],
    email: chat.customer_email || '—',
    phone,
    loyalty_tier: tier,
    lifetime_value: `$${ltv.toFixed(2)}`,
    recent_order: orderId,
  };
}

let currentlyShowingCustomerId = null;

function showCustomerSidebar(customer) {
  currentlyShowingCustomerId = customer.id;
  const sidebar = document.getElementById("customer-sidebar");
  const content = document.getElementById("customer-sidebar-content");
  if (!sidebar || !content) return;

  const initials = (customer.name || '?').split(" ").map(n => n[0]).join("").toUpperCase();

  content.innerHTML = `
    <div class="customer-profile">
      <div class="customer-profile__avatar">${escapeHtml(initials)}</div>
      <div class="customer-profile__name">${escapeHtml(customer.name)}</div>
      <div class="customer-profile__id">${escapeHtml(customer.id)}</div>
      <div class="customer-tags">
        ${customer.tags.map(tag => `<span class="customer-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </div>

    <div class="customer-section">
      <div class="customer-section__title">Contact Info</div>
      <div class="customer-info-row">
        <span class="label">Email</span>
        <span class="value">${escapeHtml(customer.email)}</span>
      </div>
      <div class="customer-info-row">
        <span class="label">Phone</span>
        <span class="value">${escapeHtml(customer.phone)}</span>
      </div>
    </div>

    <div class="customer-section">
      <div class="customer-section__title">Account Summary</div>
      <div class="customer-info-row">
        <span class="label">Tier</span>
        <span class="value">${escapeHtml(customer.loyalty_tier)}</span>
      </div>
      <div class="customer-info-row">
        <span class="label">LTV</span>
        <span class="value">${escapeHtml(customer.lifetime_value)}</span>
      </div>
      <div class="customer-info-row">
        <span class="label">Last Order</span>
        <span class="value" style="color: var(--accent); cursor: pointer; text-decoration: underline;">${escapeHtml(customer.recent_order)}</span>
      </div>
    </div>
  `;
  sidebar.classList.remove("hidden");
}

function hideCustomerSidebar() {
  const sidebar = document.getElementById("customer-sidebar");
  if (sidebar) sidebar.classList.add("hidden");
}

function clearCustomerSidebar() {
  hideCustomerSidebar();
  currentlyShowingCustomerId = null;
}

// Header toggle + sidebar close button
(function setupCustomerSidebarToggles() {
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('#customer-sidebar-toggle');
    const closeBtn = e.target.closest('#customer-sidebar-close');
    const sidebar = document.getElementById('customer-sidebar');
    if (!sidebar) return;

    if (toggleBtn) {
      if (sidebar.classList.contains('hidden')) {
        if (currentlyShowingCustomerId) sidebar.classList.remove('hidden');
        // If no customer detected yet for this conversation, do nothing.
      } else {
        hideCustomerSidebar();
      }
    } else if (closeBtn) {
      hideCustomerSidebar();
    }
  });
})();

// Toggle button for order popup
document.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('#order-popup-toggle');
  if (toggleBtn) {
    const body = document.getElementById('order-popup-body');
    if (body) {
      body.classList.toggle('hidden');
      toggleBtn.style.transform = body.classList.contains('hidden') ? 'rotate(180deg)' : '';
    }
  }
});

// --- Resolving a conversation ---
resolveBtn.addEventListener("click", async () => {
  if (!activeSessionId) return;
  const result = await authedFetch(`/agent/conversations/${activeSessionId}/resolve`, "POST");
  if (result) {
    resolveBtn.textContent = "Resolved";
    resolveBtn.disabled = true;
    resolveBtn.classList.remove("btn-primary");
    const resolveTimeEl = document.getElementById("resolve-time");
    if (resolveTimeEl) {
      resolveTimeEl.textContent = `at ${formatSidebarTime(new Date().toISOString())}`;
      resolveTimeEl.classList.remove("hidden");
    }
    loadConversations();
  }
});

// --- Helpers ---
async function authedFetch(path, method = "GET", body = null) {
  try {
    const token = localStorage.getItem("agent_token");
    const options = {
      method,
      headers: {
        "Authorization": `Bearer ${token}`
      }
    };
    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE}${path}`, options);
    if (response.status === 401) {
      logout();
      return null;
    }
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  let listTag = "ul";

  const closeList = () => {
    if (inList) {
      html += `</${listTag}>`;
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const numbered = line.match(/^(\d+)[.)]\s+(.*)/);
    const bulleted = line.match(/^[-*]\s+(.*)/);

    if (numbered || bulleted) {
      const tag = numbered ? "ol" : "ul";
      if (!inList || listTag !== tag) {
        closeList();
        html += `<${tag}>`;
        inList = true;
        listTag = tag;
      }
      const content = numbered ? numbered[2] : bulleted[1];
      html += `<li>${inlineMarkdown(content)}</li>`;
    } else {
      closeList();
      html += `<p>${inlineMarkdown(line)}</p>`;
    }
  }
  closeList();
  return html;
}

function inlineMarkdown(text) {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\[Audio\]\((https?:\/\/[^\)]+)\)/g, (match, url) => {
    const playerId = 'vp_' + Math.random().toString(36).substr(2, 9);
    return `<div class="voice-player" id="${playerId}" data-src="${url}">` +
      `<button class="voice-player__btn" aria-label="Play voice message" onclick="toggleVoicePlayer('${playerId}')">` +
        `<svg class="voice-player__icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>` +
        `<svg class="voice-player__icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>` +
      `</button>` +
      `<div class="voice-player__waveform">` +
        Array.from({length: 20}, (_, i) => `<span class="voice-player__bar" style="animation-delay:${i * 0.05}s; height:${Math.floor(Math.random() * 60) + 20}%"></span>`).join('') +
      `</div>` +
      `<span class="voice-player__time">0:00</span>` +
      `<audio preload="metadata" src="${url}" onloadedmetadata="const d = this.duration; if(d && d !== Infinity) { this.parentElement.querySelector('.voice-player__time').textContent = Math.floor(d/60) + ':' + Math.floor(d%60).toString().padStart(2, '0'); }"></audio>` +
    `</div>`;
  });
  escaped = escaped.replace(/\[Video\]\((https?:\/\/[^\)]+)\)/g, '<video controls src="$1" style="max-width: 100%; display: block; margin: 8px 0; border-radius: 8px;"></video>');
  escaped = escaped.replace(/!\[.*?\]\(((?:https?:\/\/)?[^\)]+)\)/g, '<img src="$1" class="chat-lightbox-image" style="max-width: 220px; max-height: 220px; object-fit: contain; display: block; margin: 8px 0; border-radius: 8px; border: 1px solid var(--border); cursor: pointer;" onclick="openLightbox(this.src)" />');
  escaped = escaped.replace(/@([a-zA-Z0-9_]+)/g, '<span class="agent-mention" style="color: var(--accent); font-weight: 600; background: var(--accent-glow); padding: 0 4px; border-radius: 4px;">@$1</span>');
  escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">$1</a>');
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return escaped;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// --- Voice Player Logic ---
function toggleVoicePlayer(playerId) {
  const container = document.getElementById(playerId);
  if (!container) return;
  const audio = container.querySelector('audio');
  const playIcon = container.querySelector('.voice-player__icon-play');
  const pauseIcon = container.querySelector('.voice-player__icon-pause');
  const timeEl = container.querySelector('.voice-player__time');
  const bars = container.querySelectorAll('.voice-player__bar');

  if (!audio._initialized) {
    audio.addEventListener('timeupdate', () => {
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      timeEl.textContent = `${mins}:${secs}`;
      const pct = audio.duration ? (audio.currentTime / audio.duration) : 0;
      bars.forEach((bar, i) => {
        bar.style.opacity = (i / bars.length) <= pct ? '1' : '0.4';
      });
    });
    audio.addEventListener('ended', () => {
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      container.classList.remove('voice-player--playing');
      bars.forEach(bar => bar.style.opacity = '0.4');
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60).toString().padStart(2, '0');
      timeEl.textContent = `${mins}:${secs}`;
    });
    audio.addEventListener('loadedmetadata', () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60).toString().padStart(2, '0');
      timeEl.textContent = `${mins}:${secs}`;
    });
    audio._initialized = true;
  }

  // Pause all other players first
  document.querySelectorAll('.voice-player--playing').forEach(other => {
    if (other.id !== playerId) {
      const otherAudio = other.querySelector('audio');
      if (otherAudio) otherAudio.pause();
      other.classList.remove('voice-player--playing');
      other.querySelector('.voice-player__icon-play').style.display = '';
      other.querySelector('.voice-player__icon-pause').style.display = 'none';
    }
  });

  if (audio.paused) {
    audio.play().catch(err => {
      console.error("Audio playback error:", err);
      alert("Cannot play audio: " + err.message + "\nCheck if your browser supports playing this file.");
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      container.classList.remove('voice-player--playing');
    });
    playIcon.style.display = 'none';
    pauseIcon.style.display = '';
    container.classList.add('voice-player--playing');
  } else {
    audio.pause();
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    container.classList.remove('voice-player--playing');
  }
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
}

function formatSidebarTime(isoString) {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
  return `${dateStr}, ${timeStr}`;
}

function logout() {
  localStorage.removeItem("agent_token");
  localStorage.removeItem("agent_username");
  localStorage.removeItem("agent_role");
  
  const antiFlash = document.getElementById('anti-flash-style');
  if(antiFlash) antiFlash.remove();
  
  if (socket) socket.close();
}
// Auto-login logic removed for demo mode. Initialization is handled directly by demo-agent.html.
// --- Resizable Sidebar Logic ---
const resizer = document.getElementById("resizer");
const sidebar = document.getElementById("sidebar");
let isResizing = false;

if (resizer && sidebar) {
  resizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.body.style.cursor = "col-resize";
    e.preventDefault(); // Prevent text selection
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - sidebar.getBoundingClientRect().left;
    if (newWidth >= 450 && newWidth <= 1000) {
      sidebar.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
    }
  });
}

// --- Tab switching logic for theme dropdown ---
document.querySelectorAll('.theme-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent dropdown from closing
    const targetId = tab.getAttribute('data-target');
    const dropdown = tab.closest('.theme-dropdown-menu');
    
    // Remove active class from all tabs
    dropdown.querySelectorAll('.theme-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Hide all contents
    dropdown.querySelectorAll('.theme-tab-content').forEach(c => c.classList.add('hidden'));
    
    // Show target content
    const targetContent = dropdown.querySelector('#' + targetId);
    if(targetContent) targetContent.classList.remove('hidden');
  });
});

// Add instant demo message handling for zero-latency feeling
window.recentDemoMessages = window.recentDemoMessages || [];

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DEMO_CUSTOMER_MESSAGE') {
    const { sessionId, text } = event.data;
    const mockMsgId = 'demo-' + Date.now();
    
    window.recentDemoMessages.push(text);
    // Keep array small to prevent memory leaks
    if (window.recentDemoMessages.length > 50) window.recentDemoMessages.shift();

    if (activeSessionId === sessionId) {
      hideCustomerTypingIndicator();
      appendMessage("customer", text, new Date().toISOString(), false, mockMsgId);
      scrollToBottom(true);
    }
    
    // Bump conversation to top of the sidebar
    const convEl = document.querySelector(`.conv-item[data-session-id="${sessionId}"]`);
    if (convEl) {
      const list = document.getElementById("conversation-list");
      if (list) list.prepend(convEl);
      const preview = convEl.querySelector('.conv-item-preview');
      if (preview) preview.innerHTML = formatPreview({ last_message: text });
      const time = convEl.querySelector('.conv-item-time');
      if (time) time.textContent = "Just now";
      
      if (activeSessionId !== sessionId) {
          convEl.classList.add("unread");
      }
    } else {
      // If the chat didn't exist in the list yet, reload the list
      loadConversations();
    }
  }
  
  if (event.data && event.data.type === 'MOCK_SOCKET_EVENT') {
    const data = event.data.payload;
    if (!data) return;
    
    // Maintain state consistency across tab switches
    const conv = window.conversations ? window.conversations.find(c => c.session_id === data.session_id) : null;

    if (data.type === "handoff" || data.type === "reopen") {
      if (data.is_resolved) sessionsAwaitingLiveOrder.delete(data.session_id);
      if (conv) {
         conv.handoff_active = !data.is_resolved;
         conv.resolved = !!data.is_resolved;
         if (data.handled_by) conv.handled_by = data.handled_by;
         if (data.type === "reopen") conv.reopen_count = (conv.reopen_count || 0) + 1;
         conv.updated_at = new Date().toISOString();
         
         const convEl = document.querySelector(`.conv-item[data-session-id="${data.session_id}"]`);
         if (convEl) {
             if (conv.handoff_active && !conv.resolved) convEl.classList.add("conv-item--urgent");
             else convEl.classList.remove("conv-item--urgent");
             
             const badgeRow = convEl.querySelector('.badge-row');
             if (badgeRow) {
                 const firstBadge = badgeRow.querySelector('.badge');
                 if (firstBadge) {
                     if (conv.resolved) {
                         firstBadge.className = "badge badge--resolved";
                         firstBadge.textContent = conv.handled_by || "AI";
                     } else if (conv.handoff_active) {
                         if (conv.handled_by) {
                             firstBadge.className = "badge badge--agent";
                             firstBadge.textContent = conv.handled_by;
                         } else {
                             firstBadge.className = "badge badge--human";
                             firstBadge.textContent = "Needs Attention";
                         }
                     } else {
                         firstBadge.className = "badge badge--ai";
                         firstBadge.textContent = "AI";
                     }
                 }
             }
         }
      }

      if (data.session_id === activeSessionId) {
        if (data.summary) {
          appendMessage("system", `📋 ${data.summary}`);
          scrollToBottom(true);
        }
        const resolveBtn = document.getElementById("resolve-btn");
        if (data.is_resolved) {
          resolveBtn.textContent = "Resolved";
          resolveBtn.disabled = true;
          resolveBtn.classList.remove("btn-primary");
        } else {
          resolveBtn.textContent = "Mark resolved";
          resolveBtn.disabled = false;
          resolveBtn.classList.add("btn-primary");
        }
      }
    } else if (data.type === "update_crm") {
      renderCustomerSidebar(data.session_id);
      renderOrderPopup(data.session_id);
    } else if (data.type === "new_message") {
      let activeConv = conv;
      if (!activeConv && window.conversations) {
          activeConv = {
              session_id: data.session_id,
              messages: [],
              resolved: false,
              handoff_active: false,
              customer_name: data.name || "Customer"
          };
          window.conversations.unshift(activeConv);
      }
      
      if (activeConv) {
          activeConv.last_message = data.content;
          activeConv.updated_at = data.created_at || new Date().toISOString();
          if (!activeConv.messages) activeConv.messages = [];
          activeConv.messages.push({
            id: data.message_id,
            sender: data.sender,
            content: data.content,
            created_at: data.created_at || new Date().toISOString()
          });
      }

      if (data.session_id === activeSessionId) {
        hideCustomerTypingIndicator();
        appendMessage(data.sender, data.content, new Date().toISOString(), data.sender === "agent_internal", data.message_id);
        scrollToBottom(true);
      }
      
      const convEl = document.querySelector(`.conv-item[data-session-id="${data.session_id}"]`);
      if (convEl) {
        const list = document.getElementById("conversation-list");
        if (list) list.prepend(convEl);
        const preview = convEl.querySelector('.conv-item-preview');
        if (preview) preview.innerHTML = formatPreview({ last_message: data.content, last_message_is_internal: data.sender === "agent_internal" });
      }
    } else if (data.type === "typing") {
      if (data.session_id === activeSessionId && data.sender === "customer") showCustomerTypingIndicator();
    } else if (data.type === "stopped_typing") {
      if (data.session_id === activeSessionId && data.sender === "customer") hideCustomerTypingIndicator();
    } else if (data.type === "type_character") {
      if (data.session_id === activeSessionId && data.sender === "agent") {
        const inputEl = document.getElementById("agent-message-input");
        if (inputEl) inputEl.value = (inputEl.value || "") + data.char;
      }
    } else if (data.type === "clear_input") {
      if (data.session_id === activeSessionId && data.sender === "agent") {
        const inputEl = document.getElementById("agent-message-input");
        if (inputEl) inputEl.value = "";
      }
    } else if (data.type === "prepare_chat") {
      // This session id is about to be reused to drive a fresh, scripted
      // live simulation. Suppress that static chat's own order popup until
      // the script explicitly reveals an order, so a stale/unrelated order
      // can't flash up before the customer has even said anything.
      sessionsAwaitingLiveOrder.add(data.session_id);
      getStaticChats().then(chats => {
        const chat = chats.find(c => c.session_id === data.session_id);
        // Clear out the chat so the live replay can start from an empty slate
        if (chat) chat.messages = [];
      });
    } else if (data.type === "focus_chat") {
      getStaticChats().then(chats => {
        const convEl = document.querySelector(`.conv-item[data-session-id="${data.session_id}"]`);
        if (convEl) convEl.click();
      });
    } else if (data.type === "show_order_details") {
      if (data.session_id === activeSessionId) {
          if (data.order) {
            // Order details supplied directly by the script that's driving
            // this simulated conversation - guaranteed to match what the
            // customer/agent just said, so use it as-is.
            sessionsAwaitingLiveOrder.delete(data.session_id);
            showOrderPopup(data.order);
            // Also reveal the customer info in the sidebar
            getStaticChats().then(chats => {
              const chat = chats.find(c => c.session_id === data.session_id);
              if (chat) showCustomerSidebar(buildDemoCustomer(chat));
            });
          } else {
            fetchOrderContext(data.session_id);
          }
      }
    } else if (data.type === "ai_task") {
      if (data.session_id === activeSessionId && data.steps) {
        showAiTaskSteps(data.steps);
      }
    }
  }

  if (event.data && event.data.type === 'CYCLE_NEXT_CHAT') {
    const tryCycle = () => {
      const list = document.getElementById("conversation-list");
      if (list && list.children && list.children.length > 0) {
        const items = Array.from(list.children);
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const nextSessionId = randomItem.dataset.sessionId;
        if (nextSessionId) {
          const msgContainer = document.getElementById("agent-messages");
          if (msgContainer) msgContainer.innerHTML = "";
          if (window.parent) {
            window.parent.postMessage({ type: 'READY_FOR_AUTOPLAY', sessionId: nextSessionId }, '*');
          }
        }
      } else {
        setTimeout(tryCycle, 500);
      }
    };
    tryCycle();
  }
});

// Mobile Sidebar Toggle
document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      if (window.innerWidth <= 800) {
        sidebar.classList.toggle("sidebar-open");
      } else {
        sidebar.classList.toggle("sidebar-hidden");
      }
    });

    // Auto-close sidebar on mobile when a conversation is selected
    const originalOpenConv = openConversation;
    window.openConversation = async function(...args) {
      if (window.innerWidth <= 800) {
        sidebar.classList.remove("sidebar-open");
      }
      return originalOpenConv.apply(this, args);
    };
  }
});

// --- Lightbox Logic (agent transcript images) ---
let agentLightboxImages = [];
let agentCurrentLightboxIndex = 0;

window.openLightbox = function(src) {
  const imgs = Array.from(document.querySelectorAll('.chat-lightbox-image'));
  if (imgs.length === 0) return;

  agentLightboxImages = imgs.map(img => img.src);
  agentCurrentLightboxIndex = agentLightboxImages.indexOf(src);
  if (agentCurrentLightboxIndex === -1) agentCurrentLightboxIndex = 0;

  let lightbox = document.getElementById('chat-lightbox-overlay');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'chat-lightbox-overlay';
    lightbox.className = 'chat-lightbox-overlay';
    lightbox.innerHTML = `
      <div class="chat-lightbox-close" onclick="closeLightbox()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
      <div class="chat-lightbox-nav prev" onclick="lightboxPrev(event)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </div>
      <div class="chat-lightbox-img-wrapper">
        <img id="chat-lightbox-img" src="" />
      </div>
      <div class="chat-lightbox-nav next" onclick="lightboxNext(event)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `;

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('chat-lightbox-img-wrapper')) closeLightbox();
    });

    document.body.appendChild(lightbox);
    document.addEventListener('keydown', handleAgentLightboxKeydown);
  }

  updateAgentLightbox();
  lightbox.style.display = 'flex';
  setTimeout(() => lightbox.style.opacity = '1', 10);
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('chat-lightbox-overlay');
  if (lightbox) {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.style.display = 'none';
    }, 200);
  }
};

window.lightboxNext = function(e) {
  if (e) e.stopPropagation();
  if (agentCurrentLightboxIndex < agentLightboxImages.length - 1) {
    agentCurrentLightboxIndex++;
    updateAgentLightbox();
  }
};

window.lightboxPrev = function(e) {
  if (e) e.stopPropagation();
  if (agentCurrentLightboxIndex > 0) {
    agentCurrentLightboxIndex--;
    updateAgentLightbox();
  }
};

function updateAgentLightbox() {
  const imgEl = document.getElementById('chat-lightbox-img');
  if (!imgEl) return;
  imgEl.src = agentLightboxImages[agentCurrentLightboxIndex];

  const prevBtn = document.querySelector('.chat-lightbox-nav.prev');
  const nextBtn = document.querySelector('.chat-lightbox-nav.next');
  if (prevBtn) prevBtn.style.visibility = (agentCurrentLightboxIndex > 0) ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = (agentCurrentLightboxIndex < agentLightboxImages.length - 1) ? 'visible' : 'hidden';
}

function handleAgentLightboxKeydown(e) {
  const lightbox = document.getElementById('chat-lightbox-overlay');
  if (!lightbox || lightbox.style.display === 'none') return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNext();
  if (e.key === 'ArrowLeft') lightboxPrev();
}
