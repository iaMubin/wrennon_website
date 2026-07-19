const AGENT_NAMES = ["Alex", "Harry"];

// Each sector gets its own pair of scripts so the auto-playing demo actually
// matches the industry tab the visitor has selected, instead of always
// showing the same generic e-commerce shipping conversation. The e-commerce
// "resolved" script also sends a real product photo so photos aren't buried
// only in the agent's static conversation history — they show up in the very
// first thing anyone sees on the page.

const SECTOR_SCRIPTS = {
  "e-commerce": {
    resolved: [
      { actor: 'customer', action: 'type_live', text: "Hi! Do you have this watch in blue?" },
      { actor: 'customer', action: 'send_photo', text: "![Image](images/chat-demo-watch.jpg)" },
      { actor: 'ai', action: 'ai_task', steps: ["Analyzing photo", "Cross-referencing product catalog", "Checking color availability"] },
      { actor: 'ai', action: 'type', duration: 1200 },
      { actor: 'ai', action: 'send', text: "Hi! This model currently comes in Rose Gold and Silver only. A navy strap is launching next month if you'd like me to notify you." },
      { actor: 'customer', action: 'type_live', text: "Yes please, notify me when it's live!" },
      { actor: 'ai', action: 'type', duration: 800 },
      { actor: 'ai', action: 'send', text: "You're all set - I'll email you the moment the navy strap drops." },
      { actor: 'system', action: 'resolve' }
    ],
    handoff: [
      { actor: 'customer', action: 'type_live', text: "My order hasn't arrived yet and I'm really frustrated!" },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "I'm sorry to hear that! Can you please provide your order number?" },
      { actor: 'customer', action: 'type_live', text: "It's ORD-98765W" },
      { actor: 'ai', action: 'ai_task', steps: ["Searching order database", "Retrieving order #ORD-98765W", "Checking shipment status"] },
      { actor: 'system', action: 'show_order', order: {
          order_id: "ORD-98765W",
          status: "Delayed",
          carrier: "FedEx",
          eta: "Priority replacement — arrives tomorrow",
          tracking_url: "https://www.fedex.com/track"
        }
      },
      { actor: 'ai', action: 'type', duration: 2000 },
      { actor: 'ai', action: 'send', text: "Thank you. I see the order is delayed. Let me connect you with a human agent to help process a priority replacement." },
      { actor: 'system', action: 'handoff', summary: "Customer is frustrated about delayed order ORD-98765W. Needs priority replacement." },
      { actor: 'agent', action: 'type_live', internal: true, text: "Checking inventory... yes we have one left. I'll upgrade them to overnight shipping." },
      { actor: 'agent', action: 'type_live', text: "Hi there, I've checked your order and upgraded your shipping. A replacement will arrive tomorrow!" },
      { actor: 'customer', action: 'type_live', text: "Thank you so much! That's a relief." },
      { actor: 'system', action: 'resolve' }
    ]
  },

  "subscription-business": {
    resolved: [
      { actor: 'customer', action: 'type_live', text: "Hi! How do I upgrade my plan?" },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "Hello! You can upgrade anytime from Account > Billing. Want me to send you the direct link?" },
      { actor: 'customer', action: 'type_live', text: "Yes please" },
      { actor: 'ai', action: 'type', duration: 800 },
      { actor: 'ai', action: 'send', text: "Sent! It'll take you straight to checkout - the upgrade is instant, no downtime." },
      { actor: 'system', action: 'resolve' }
    ],
    handoff: [
      { actor: 'customer', action: 'type_live', text: "I was charged twice this month and I need this fixed now." },
      { actor: 'ai', action: 'ai_task', steps: ["Searching billing history", "Comparing charge records", "Flagging duplicate charge"] },
      { actor: 'ai', action: 'type', duration: 1200 },
      { actor: 'ai', action: 'send', text: "I'm sorry about that! I can see two charges on your account - let me connect you with a human agent to review and refund if needed." },
      { actor: 'system', action: 'handoff', summary: "Customer was billed twice this month and is requesting a refund review." },
      { actor: 'agent', action: 'type_live', internal: true, text: "Checking billing logs... one charge was a duplicate from a webhook retry. Refunding now." },
      { actor: 'agent', action: 'type_live', text: "Hi, I found the issue - one of the charges was a duplicate on our end. I've refunded it, you'll see it in 3-5 business days." },
      { actor: 'customer', action: 'type_live', text: "Thank you, appreciate the quick fix." },
      { actor: 'system', action: 'resolve' }
    ]
  },

  "service-business": {
    resolved: [
      { actor: 'customer', action: 'type_live', text: "Hi! I need to book a plumber for a leaking sink." },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "Hi! I can help with that. I have an opening tomorrow at 10 AM or Thursday at 2 PM - which works better?" },
      { actor: 'customer', action: 'type_live', text: "Tomorrow at 10 works great" },
      { actor: 'ai', action: 'type', duration: 800 },
      { actor: 'ai', action: 'send', text: "Booked! You'll get a text with your technician's name about an hour before arrival." },
      { actor: 'system', action: 'resolve' }
    ],
    handoff: [
      { actor: 'customer', action: 'type_live', text: "Water is actively leaking from my ceiling, I need someone now!" },
      { actor: 'ai', action: 'ai_task', steps: ["Checking technician availability", "Locating nearest emergency crew"] },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "That sounds urgent - let me get you connected to our emergency dispatch team right away." },
      { actor: 'system', action: 'handoff', summary: "Active ceiling leak reported - needs emergency dispatch." },
      { actor: 'agent', action: 'type_live', internal: true, text: "This is an active-leak emergency, dispatching the nearest available crew now." },
      { actor: 'agent', action: 'type_live', text: "Hi, I've dispatched our emergency crew - ETA 35 minutes. Please shut off your main water valve if it's safe to reach." },
      { actor: 'customer', action: 'type_live', text: "Okay, doing that now, thank you!" },
      { actor: 'system', action: 'resolve' }
    ]
  },

  "hospitality-business": {
    resolved: [
      { actor: 'customer', action: 'type_live', text: "Hi! What time is check-in?" },
      { actor: 'ai', action: 'type', duration: 900 },
      { actor: 'ai', action: 'send', text: "Hello! Standard check-in is 3 PM, but I can flag your room for early check-in if you're arriving sooner. What time will you get in?" },
      { actor: 'customer', action: 'type_live', text: "Around 11 AM" },
      { actor: 'ai', action: 'type', duration: 800 },
      { actor: 'ai', action: 'send', text: "Noted - I've prioritized your room for that time. If it's not quite ready, we'll hold your bags and text you the moment it is." },
      { actor: 'system', action: 'resolve' }
    ],
    handoff: [
      { actor: 'customer', action: 'type_live', text: "The AC in my room isn't working and it's really hot in here." },
      { actor: 'ai', action: 'ai_task', steps: ["Checking maintenance queue", "Dispatching engineering team"] },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "I'm so sorry about that! Let me get maintenance connected right away." },
      { actor: 'system', action: 'handoff', summary: "AC malfunction in guest room, needs immediate maintenance." },
      { actor: 'agent', action: 'type_live', internal: true, text: "Dispatching engineering now, and prepping a room move in case it's not a quick fix." },
      { actor: 'agent', action: 'type_live', text: "Hi, maintenance is on the way now - should be resolved in 20 minutes. I've also credited $20 to your folio for the trouble." },
      { actor: 'customer', action: 'type_live', text: "Thank you, that's very kind." },
      { actor: 'system', action: 'resolve' }
    ]
  },

  "travel-business": {
    resolved: [
      { actor: 'customer', action: 'type_live', text: "Hi! What's the baggage allowance on my ticket?" },
      { actor: 'ai', action: 'type', duration: 1000 },
      { actor: 'ai', action: 'send', text: "Hello! You're allowed one carry-on and one checked bag up to 50lbs on your fare." },
      { actor: 'customer', action: 'type_live', text: "What if my bag is a bit over?" },
      { actor: 'ai', action: 'type', duration: 900 },
      { actor: 'ai', action: 'send', text: "Overweight bags up to 70lbs incur a $100 fee at check-in - best to trim it down if you can to avoid that." },
      { actor: 'system', action: 'resolve' }
    ],
    handoff: [
      { actor: 'customer', action: 'type_live', text: "My flight just got cancelled and I need to be there tomorrow, please help!" },
      { actor: 'ai', action: 'ai_task', steps: ["Checking partner airline availability", "Comparing rebooking options"] },
      { actor: 'ai', action: 'type', duration: 1200 },
      { actor: 'ai', action: 'send', text: "I'm so sorry about that! Let me connect you with an agent right now to get you rebooked as fast as possible." },
      { actor: 'system', action: 'handoff', summary: "Flight cancelled, customer needs urgent rebooking for tomorrow." },
      { actor: 'agent', action: 'type_live', internal: true, text: "Checking partner airlines... found a seat tonight that still gets them there in time." },
      { actor: 'agent', action: 'type_live', text: "Hi, I've rebooked you on a partner airline departing tonight at 9 PM - you'll still make it in time. Confirmation is in your inbox." },
      { actor: 'customer', action: 'type_live', text: "Thank you so much, huge relief." },
      { actor: 'system', action: 'resolve' }
    ]
  }
};

let isAutoplaying = false;

// --- Real conversation replay ---
// Rather than looping one fixed hardcoded script forever (which is what
// caused the same conversation to repeat every cycle), we replay one of the
// actual 20 static conversations for the current sector - picked so it's
// never the same one twice in a row. This automatically gives real variety,
// and since it's literally the same data the agent's case list uses, photos
// and order details are guaranteed to stay in sync.
let demoChatsCache = null;
let lastPlayedSessionId = {};

async function getDemoChats() {
  if (demoChatsCache) return demoChatsCache;
  if (window.DEMO_CHATS) {
    demoChatsCache = window.DEMO_CHATS;
    return demoChatsCache;
  }
  try {
    const res = await fetch("live-demo-assets/demo_chats.json");
    demoChatsCache = await res.json();
  } catch (e) {
    demoChatsCache = [];
  }
  return demoChatsCache;
}

function pickReplayChat(chats, sector) {
  const pool = chats.filter(c => c.sector === sector);
  if (pool.length === 0) return null;
  const prevId = lastPlayedSessionId[sector];
  const choices = pool.length > 1 ? pool.filter(c => c.session_id !== prevId) : pool;
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  lastPlayedSessionId[sector] = chosen.session_id;
  return chosen;
}

function buildReplayScript(chat) {
  const steps = [];
  let precededByMedia = null; // null | "photo" | "audio"
  let orderTaskShown = false;
  let handoffShown = false;

  for (const msg of chat.messages) {
    const trimmed = (msg.content || "").trim();
    const isPhoto = /^!\[Image\]\(/.test(trimmed);
    const isAudio = /^\[Audio\]\(/.test(trimmed);
    const mentionsOrder = chat.order && msg.content && msg.content.includes(chat.order.order_id);

    if (msg.sender === "human") {
      if (isPhoto || isAudio) {
        // Attach-and-send instantly rather than "typing" out a raw markdown
        // URL character by character - applies equally to photos and voice
        // notes, both of which are single-block attachments in real usage.
        steps.push({ actor: "customer", action: "send_photo", text: msg.content });
        precededByMedia = isAudio ? "audio" : "photo";
      } else {
        steps.push({ actor: "customer", action: "type_live", text: msg.content });
        precededByMedia = null;
      }
    } else if (msg.sender === "ai") {
      if (mentionsOrder && !orderTaskShown) {
        steps.push({ actor: "ai", action: "ai_task", steps: [
          "Searching order database",
          `Retrieving order #${chat.order.order_id}`,
          "Preparing response"
        ]});
        orderTaskShown = true;
      } else if (precededByMedia === "audio") {
        steps.push({ actor: "ai", action: "ai_task", steps: [
          "Transcribing voice message",
          "Analyzing customer intent",
          "Preparing response"
        ]});
      } else if (precededByMedia === "photo") {
        steps.push({ actor: "ai", action: "ai_task", steps: [
          "Analyzing photo",
          "Cross-referencing product catalog",
          "Preparing response"
        ]});
      }
      precededByMedia = null;

      const typingMs = Math.min(2200, Math.max(700, msg.content.length * 25));
      steps.push({ actor: "ai", action: "type", duration: typingMs });
      steps.push({ actor: "ai", action: "send", text: msg.content });
    } else if (msg.sender === "agent" || msg.sender === "agent_internal") {
      // A real human took over this conversation. Surface the handoff to
      // the agent dashboard once, right before the first human-authored
      // message, then replay the human's messages (public + internal)
      // exactly like the hardcoded hero handoff scripts do.
      if (!handoffShown) {
        steps.push({
          actor: "system",
          action: "handoff",
          summary: chat.handoff_summary || `Conversation escalated to ${chat.handled_by || "a human agent"}.`,
          handled_by: chat.handled_by || null
        });
        handoffShown = true;
      }
      steps.push({
        actor: "agent",
        action: "type_live",
        internal: msg.sender === "agent_internal",
        text: msg.content
      });
      precededByMedia = null;
    }
    // Reveal the order popup right after the message that first states it,
    // so it never appears before the customer/agent has actually said it.
    if (mentionsOrder) {
      const alreadyShown = steps.some(s => s.action === "show_order");
      if (!alreadyShown) {
        steps.push({ actor: "system", action: "show_order", order: chat.order });
      }
    }
  }
  // Use the conversation's own recorded resolution (a real human's name if
  // it was handed off, otherwise AI) rather than the autoplay engine's
  // independently-randomized hero-script outcome, so the sidebar badge
  // always matches what actually happened in the replayed transcript.
  steps.push({ actor: "system", action: "resolve", handled_by: chat.handled_by || "AI" });
  return steps;
}


window.startAutoplayCycle = async function(agentFrameWindow, customerFrameWindow, sessionId, sector) {
    if (isAutoplaying) return;
    isAutoplaying = true;

    const sendEvent = (frame, data) => {
        if (!frame) return;
        frame.postMessage({ type: 'MOCK_SOCKET_EVENT', payload: data }, '*');
    };

    const sendToBoth = (data) => {
        sendEvent(agentFrameWindow, data);
        sendEvent(customerFrameWindow, data);
    };

    // Ensure customer widget is wiped from any previous cycle before starting a new one
    sendEvent(customerFrameWindow, { type: 'clear_chat' });

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    await sleep(500); // Settle UI

    // Pick the script pair for the currently selected sector (default to
    // e-commerce if an unknown/missing sector sneaks through)
    const scripts = SECTOR_SCRIPTS[sector] || SECTOR_SCRIPTS["e-commerce"];
    const effectiveSector = SECTOR_SCRIPTS[sector] ? sector : "e-commerce";

    // Pick a script (20% chance of handoff). For the far more common
    // "resolved" case, replay a real (non-repeating) conversation from that
    // sector's case history instead of one fixed hardcoded script, so the
    // demo doesn't show the same conversation on every cycle.
    const isHandoff = Math.random() < 0.2;
    const agentName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];

    let MOVIE_SCRIPT;
    let activeSessionId = sessionId;

    if (!isHandoff) {
      const chats = await getDemoChats();
      const replayChat = pickReplayChat(chats, effectiveSector);
      if (replayChat) {
        activeSessionId = replayChat.session_id;
        MOVIE_SCRIPT = buildReplayScript(replayChat);
      } else {
        MOVIE_SCRIPT = scripts.resolved; // fallback if the JSON couldn't be loaded
      }
    } else {
      MOVIE_SCRIPT = scripts.handoff;
    }

    // Clear static messages and focus the new chat before cycle begins
    sendEvent(agentFrameWindow, { type: 'prepare_chat', session_id: activeSessionId });
    await sleep(200);
    sendEvent(agentFrameWindow, { type: 'focus_chat', session_id: activeSessionId });

    for (const step of MOVIE_SCRIPT) {
        if (!isAutoplaying) break;

        const msgId = "msg-" + Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toISOString();

        if (step.action === 'type_live') {
            // Wait slightly before starting to type to simulate reading
            await sleep(1500 + Math.random() * 1000);

            // Live keystroke typing for human/customer
            sendToBoth({ type: 'typing', sender: step.actor, session_id: activeSessionId });

            let currentText = "";
            for (const char of step.text) {
                if (!isAutoplaying) break;
                currentText += char;
                sendToBoth({ type: 'type_character', sender: step.actor, session_id: activeSessionId, char: char });
                // Simulate variable typing speed (50-100ms per key)
                await sleep(50 + Math.random() * 50);
            }

            await sleep(400); // Pause before sending
            sendToBoth({ type: 'clear_input', sender: step.actor, session_id: activeSessionId });
            sendToBoth({ type: 'stopped_typing', sender: step.actor, session_id: activeSessionId });

            const payload = {
                type: 'new_message',
                sender: step.internal ? 'agent_internal' : step.actor,
                content: step.text,
                message_id: msgId,
                session_id: activeSessionId,
                created_at: timestamp,
                name: step.actor === 'agent' ? agentName : undefined
            };

            if (step.internal) {
                sendEvent(agentFrameWindow, payload);
            } else {
                sendToBoth(payload);
            }

            await sleep(1000);

        } else if (step.action === 'type') {
            // Simple typing indicator for AI
            sendToBoth({ type: 'typing', sender: step.actor, session_id: activeSessionId });
            await sleep(step.duration);
            sendToBoth({ type: 'stopped_typing', sender: step.actor, session_id: activeSessionId });
        } else if (step.action === 'send') {
            sendToBoth({
                type: 'new_message',
                sender: step.actor,
                content: step.text,
                message_id: msgId,
                session_id: activeSessionId,
                created_at: timestamp
            });
            await sleep(1000);
        } else if (step.action === 'send_photo') {
            // Simulate attaching/uploading a photo, then send it as a single
            // message rather than "typing" the markdown character by character.
            sendToBoth({ type: 'typing', sender: step.actor, session_id: activeSessionId });
            await sleep(900 + Math.random() * 500);
            sendToBoth({ type: 'stopped_typing', sender: step.actor, session_id: activeSessionId });
            sendToBoth({
                type: 'new_message',
                sender: step.actor,
                content: step.text,
                message_id: msgId,
                session_id: activeSessionId,
                created_at: timestamp
            });
            await sleep(1200);
        } else if (step.action === 'ai_task') {
            // Agent-only: show the AI's behind-the-scenes work (order
            // lookup, reading a photo, etc.) as a short step sequence,
            // mirroring how Zendesk/Intercom surface AI reasoning to agents.
            // The customer side just keeps seeing a normal typing indicator.
            sendEvent(agentFrameWindow, {
                type: 'ai_task',
                session_id: activeSessionId,
                steps: step.steps
            });
            await sleep(step.steps.length * 800 + 500);
        } else if (step.action === 'handoff') {
            sendEvent(agentFrameWindow, {
                type: 'handoff',
                session_id: activeSessionId,
                summary: step.summary,
                handled_by: step.handled_by || agentName
            });
            await sleep(1000);
        } else if (step.action === 'resolve') {
            sendEvent(agentFrameWindow, {
                type: 'handoff',
                session_id: activeSessionId,
                is_resolved: true,
                handled_by: step.handled_by || (isHandoff ? agentName : "AI")
            });
            await sleep(1000);
        } else if (step.action === 'show_order') {
            sendEvent(agentFrameWindow, {
                type: 'show_order_details',
                session_id: activeSessionId,
                order: step.order
            });
            await sleep(500);
        }
    }

    await sleep(2000);
    sendEvent(customerFrameWindow, {
        type: 'new_message',
        sender: 'system',
        content: 'This chat has been resolved.',
        message_id: 'sys-end',
        session_id: activeSessionId,
        created_at: new Date().toISOString()
    });

    await sleep(4000);
    isAutoplaying = false;

    if (agentFrameWindow) {
        agentFrameWindow.postMessage({ type: 'CYCLE_NEXT_CHAT' }, '*');
    }

    // Completely clear the customer widget for the next simulation
    if (customerFrameWindow) {
        sendEvent(customerFrameWindow, { type: 'clear_chat' });
    }
};
