/* ============================================
   WRENNON — Shared JS
   ============================================ */

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const menuBackdrop = document.querySelector('.mobile-menu-backdrop');
  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('open');
      if (menuBackdrop) menuBackdrop.classList.remove('open');
    };
    toggle.addEventListener('click', () => {
      const willOpen = !menu.classList.contains('open');
      menu.classList.toggle('open', willOpen);
      if (menuBackdrop) menuBackdrop.classList.toggle('open', willOpen);
    });
    if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  // Product video — if /videos/product-demo.mp4 hasn't been added yet,
  // swap to the animated fallback instead of showing a broken video box.
  const productVideo = document.getElementById('productVideo');
  const videoFallback = document.getElementById('videoFallback');
  if (productVideo && videoFallback) {
    productVideo.addEventListener('error', () => {
      productVideo.style.display = 'none';
      videoFallback.hidden = false;
    }, true);
    // also catch the case where the <source> 404s without firing on the video element
    const src = productVideo.querySelector('source');
    if (src) {
      src.addEventListener('error', () => {
        productVideo.style.display = 'none';
        videoFallback.hidden = false;
      });
    }
  }

  // Hero ambient network animation — soft drifting nodes/connections,
  // suggesting "your store's data, connected". Runs only if canvas exists.
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) initHeroCanvas(heroCanvas);

  // Mega menu — click/hover to open, closes on outside click or Escape
  const megaItems = document.querySelectorAll('.nav-item.has-mega');
  if (megaItems.length) {
    const closeAllMega = () => {
      megaItems.forEach((item) => {
        item.classList.remove('mega-open');
        const trigger = item.querySelector('.nav-mega-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    };
    megaItems.forEach((item) => {
      const trigger = item.querySelector('.nav-mega-trigger');
      if (!trigger) return;
      let hoverTimer;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.classList.contains('mega-open');
        closeAllMega();
        if (!isOpen) {
          item.classList.add('mega-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        closeAllMega();
        item.classList.add('mega-open');
        trigger.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => {
          item.classList.remove('mega-open');
          trigger.setAttribute('aria-expanded', 'false');
        }, 150);
      });
    });
    document.addEventListener('click', closeAllMega);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMega(); });
  }

  // Floating nav pill — gains a blurred, more opaque background once the
  // page has scrolled past a small threshold.
  const navEl = document.querySelector('nav');
  if (navEl) {
    const updateNavScroll = () => {
      navEl.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    updateNavScroll();
    window.addEventListener('scroll', updateNavScroll, { passive: true });
  }

  // Terminal typing animation (only runs if a terminal exists on the page)
  const body = document.getElementById('terminalBody');
  if (body) runTerminal(body);

  // Hero chat mockup — animated live-conversation loop (only runs if present)
  const heroChatBody = document.getElementById('heroChatBody');
  if (heroChatBody) runHeroChat(heroChatBody, document.getElementById('heroChatTyped'));

  // Scroll-reveal: fade/slide elements in as they enter the viewport
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealEls.forEach((el) => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  // Cursor-follow glow — a soft spotlight that eases toward the pointer
  const glow = document.querySelector('.cursor-glow');
  const heroDecor = document.querySelector('.hero-illustration') || document.querySelector('.hero-bg-decor');
  const wantsMotion = window.matchMedia('(hover:hover)').matches &&
                       !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (glow && wantsMotion) {
    let targetX = 50, targetY = 0, curX = 50, curY = 0;
    // Parallax tilt state for the hero mockup graphic (max ~7deg rotation)
    let decorX = 0, decorY = 0, decorTX = 0, decorTY = 0;
    let tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
      if (heroDecor) {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        decorTX = ((e.clientX - cx) / cx) * -14;
        decorTY = ((e.clientY - cy) / cy) * -10;
        // Clamp tilt to a max of ~7 degrees on each axis
        tiltTY = Math.max(-7, Math.min(7, ((e.clientX - cx) / cx) * 7));
        tiltTX = Math.max(-7, Math.min(7, ((e.clientY - cy) / cy) * -7));
      }
    });
    function tick() {
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      document.documentElement.style.setProperty('--mx', curX + '%');
      document.documentElement.style.setProperty('--my', curY + '%');
      if (heroDecor) {
        decorX += (decorTX - decorX) * 0.05;
        decorY += (decorTY - decorY) * 0.05;
        tiltX += (tiltTX - tiltX) * 0.06;
        tiltY += (tiltTY - tiltY) * 0.06;
        heroDecor.style.transform =
          `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${decorX}px, ${decorY}px)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Rotating headline word — cycles through a wider set of words spanning
  // ecommerce, hospitality, and subscription businesses, with a couple of
  // wry/human ones mixed in. Rolls vertically like an odometer: the outgoing
  // word slides down out of view, the incoming word slides down into place
  // from above — both moving the same direction for a smooth, continuous feel.
  const rotatingWord = document.getElementById('rotatingWord');
  const rwInner = rotatingWord ? rotatingWord.querySelector('.rw-inner') : null;
  const line2 = document.querySelector('.line2');

  // Keeps "knows your ___" on a single line no matter how long the word is.
  // Only the word itself (#rotatingWord) is ever scaled down — "knows your"
  // always stays at full size, matching the rest of the headline.
  function fitRotatingLine() {
    if (!line2 || !rotatingWord) return;
    rotatingWord.style.fontSize = '';
    const title = line2.closest('.page-title');
    if (!title) return;
    const maxWidth = title.clientWidth;
    const totalWidth = line2.scrollWidth;
    if (totalWidth > maxWidth) {
      const wordWidth = rotatingWord.scrollWidth;
      const prefixWidth = totalWidth - wordWidth;
      const availableForWord = maxWidth - prefixWidth;
      if (availableForWord > 0 && wordWidth > 0) {
        const base = parseFloat(getComputedStyle(rotatingWord).fontSize);
        const scale = Math.max(0.42, (availableForWord / wordWidth) * 0.96);
        rotatingWord.style.fontSize = (base * scale) + 'px';
      }
    }
  }
  fitRotatingLine();
  window.addEventListener('resize', fitRotatingLine);

  if (rotatingWord && rwInner && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const words = [
      'store', 'catalog', 'orders', 'checkout', 'inventory',
      'regulars', 'bookings', 'members', 'renewals',
      'small print', 'quirks', 'receipts',
    ];
    let idx = 0;
    const ROLL_MS = 800; // must match .rw-inner transition-duration in CSS
    const HOLD_MS = 1000; // how long the word sits still once settled

    // Self-scheduling chain (never a fixed setInterval) — each step only
    // starts once the previous one has fully finished, so cycles can never
    // overlap or cause a word to be skipped.
    function scheduleNext() {
      setTimeout(rotate, HOLD_MS);
    }

    function rotate() {
      rwInner.classList.add('roll-out');
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        rwInner.classList.remove('roll-out');
        rwInner.classList.add('roll-in-start');
        rwInner.textContent = words[idx];
        fitRotatingLine();
        void rwInner.offsetWidth; // force reflow so the jump-to-top is committed
        rwInner.classList.remove('roll-in-start');
        setTimeout(scheduleNext, ROLL_MS);
      }, ROLL_MS);
    }

    setTimeout(rotate, HOLD_MS);

    // No hover-pause here — the whole hero header is a large area, and
    // pausing whenever the mouse merely rests inside it made the rotation
    // freeze unpredictably. It now rolls continuously, like the chat demo.
  }

  // Contact form handling — submits to Formspree without a page reload
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const note = document.getElementById('formNote');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.style.display = 'none';
          const success = document.getElementById('formSuccess');
          if (success) success.classList.add('show');
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
        if (note) {
          note.textContent = "Something went wrong — please email hello@wrennon.com directly.";
          note.style.color = '#8B3A1E';
        }
      }
    });
  }
});

const terminalScenarios = [
  [
    { text: 'wrennon init --store "Vantage Apparel" --platform shopify', cls: 't-line', prompt: true },
    { text: '> syncing product catalog... 1,842 SKUs', cls: 't-accent' },
    { text: '> connecting order + fulfillment data', cls: 't-line' },
    { text: '> training agent on sizing guide + return policy', cls: 't-accent' },
    { text: '✓ agent live — Shopify, WhatsApp, web chat', cls: 't-ok' },
  ],
  [
    { text: 'wrennon init --store "Northgate Electronics" --platform woocommerce', cls: 't-line', prompt: true },
    { text: '> syncing product catalog... 640 SKUs', cls: 't-accent' },
    { text: '> connecting order + warranty data', cls: 't-line' },
    { text: '> training agent on spec sheets + compatibility rules', cls: 't-accent' },
    { text: '✓ agent live — WooCommerce, web chat', cls: 't-ok' },
  ],
  [
    { text: 'wrennon init --store "Coastal Home Goods" --platform magento', cls: 't-line', prompt: true },
    { text: '> syncing product catalog... 2,310 SKUs', cls: 't-accent' },
    { text: '> connecting cart + checkout events', cls: 't-line' },
    { text: '> training agent on brand tone + upsell rules', cls: 't-accent' },
    { text: '✓ agent live — Magento, WhatsApp commerce', cls: 't-ok' },
  ],
];

// Small geometric penguin glyph — stands in for the shell prompt instead of a
// plain "$", reads as "this is a Linux shell" while matching the site's
// low-poly mark language.
function typeLine(line, container) {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    div.className = line.cls;
    let typedSpan = div;
    if (line.prompt) {
      div.classList.add('t-prompt-line');
      div.innerHTML = '<span class="t-host">wrennon@agent:~$</span><span class="t-typed"></span>';
      typedSpan = div.querySelector('.t-typed');
    }
    container.appendChild(div);
    const text = line.text;
    let i = 0;
    const interval = setInterval(() => {
      typedSpan.textContent = ' ' + text.slice(0, i + 1);
      i++;
      if (i === text.length) {
        clearInterval(interval);
        resolve(div);
      }
    }, 18);
  });
}

async function playScenario(container, lines) {
  for (const line of lines) {
    await new Promise((r) => setTimeout(r, 150));
    await typeLine(line, container);
  }
}

async function runTerminal(container) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    terminalScenarios[0].forEach((l) => {
      const div = document.createElement('div');
      div.className = l.cls;
      if (l.prompt) {
        div.classList.add('t-prompt-line');
        div.innerHTML = '<span class="t-host">wrennon@agent:~$</span><span class="t-typed"> ' + l.text + '</span>';
      } else {
        div.textContent = l.text;
      }
      container.appendChild(div);
    });
    return;
  }
  let i = 0;
  while (true) {
    container.innerHTML = '';
    await playScenario(container, terminalScenarios[i % terminalScenarios.length]);
    await new Promise((r) => setTimeout(r, 2200));
    // Type an explicit "clear" command, let it sit for a beat, then wipe the
    // screen the way a real terminal does — no jarring cut or fade.
    await new Promise((r) => setTimeout(r, 250));
    const clearDiv = await typeLine({ text: 'clear', cls: 't-line', prompt: true }, container);
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    clearDiv.appendChild(cursorSpan);
    await new Promise((r) => setTimeout(r, 550));
    i++;
  }
}

// ---------- HERO CHAT MOCKUP (animated live-conversation loop) ----------
const heroChatScenarios = [
  // Photo question — smartwatch
  [
    { who: 'user', type: 'photo', src: 'images/chat-photo-watch.jpg', text: 'Is this available in white?' },
    { who: 'agent', text: 'Yes — that\'s the Pulse Smartwatch, White is in stock. <strong>$96</strong>. Want me to add it to your cart?' },
    { who: 'user', text: 'Does it track sleep?' },
    { who: 'agent', text: 'Yes — sleep tracking, heart rate, and a 5-day battery life.' },
    { who: 'user', text: 'Great, add it to my cart.' },
    { who: 'agent', text: 'Added ✓ <span class="mono-chip">#5533</span> — ready whenever you want to check out.' },
    { who: 'user', text: 'Can I pay on delivery?' },
    { who: 'agent', text: 'Yes — cash on delivery is available at checkout.' },
    { who: 'user', text: 'Perfect, thank you!' },
    { who: 'agent', text: 'You\'re welcome 🙂' },
  ],  // Photo question — sneaker
  [
    { who: 'user', type: 'photo', src: 'images/chat-photo-shoe.jpg', text: 'Do you have these in stock?' },
    { who: 'agent', text: 'Yes — that\'s our Aria Runner, in stock in Black and Grey. Which size do you need?' },
    { who: 'user', text: 'Size 9, please.' },
    { who: 'agent', text: 'Size 9 available ✓ — <strong>$96</strong>. Want me to add it to your cart?' },
    { who: 'user', text: 'Yes, and does it come with extra laces?' },
    { who: 'agent', text: 'It does — one spare set included in the box.' },
    { who: 'user', text: 'Perfect, add it.' },
    { who: 'agent', text: 'Added ✓ <span class="mono-chip">#5210</span> — ready for checkout whenever you are.' },
    { who: 'user', text: 'Thanks!' },
    { who: 'agent', text: 'Anytime 🙂' },
  ],
  // Order status / product question
  [
    { who: 'user', text: 'Is the Aria Jacket in stock, size M?' },
    { who: 'agent', text: 'Yes — 12 left in Black, size M. Free shipping over $75. Want me to add it to your cart?' },
    { who: 'user', text: 'Yes please. Does it run true to size?' },
    { who: 'agent', text: 'Runs slightly small — most shoppers size up. Added ✓ in <strong>M</strong>, but I can switch it to <strong>L</strong> if you\'d prefer.' },
    { who: 'user', type: 'voice', duration: '0:11' },
    { who: 'agent', text: 'Order <span class="mono-chip">#1842</span> shipped yesterday, arriving <strong>Thu</strong>. Want the tracking link?' },
    { who: 'user', text: 'Yes, send it over.' },
    { who: 'user', text: 'And ping me if it gets delayed.' },
    { who: 'agent', text: 'Sent ✓ to your email — last scan was the Dhaka hub at <strong>6:40am</strong>. I\'ll flag it if anything changes.' },
    { who: 'user', text: 'Perfect, thanks!' },
    { who: 'agent', text: 'Anytime 🙂 — anything else before you go?' },
  ],
  // Reservation / booking (beyond-ecommerce use case)
  [
    { who: 'user', text: 'Can I book a room for this weekend?' },
    { who: 'user', text: 'Preferably something with a sea view.' },
    { who: 'agent', text: 'Sure — Seaview Inn has a Deluxe King open Fri–Sun, <strong>$142</strong>/night, ocean-facing. Want me to hold it?' },
    { who: 'user', text: 'Yes, hold it. Any late checkout option?' },
    { who: 'agent', text: 'Added ✓ — late checkout till 1pm is free for that room type.' },
    { who: 'user', type: 'voice', duration: '0:08' },
    { who: 'agent', text: 'Added — breakfast for two is <strong>$18</strong>/night, included in your total now.' },
    { who: 'user', text: "What's the cancellation policy?" },
    { who: 'agent', text: 'Free cancellation up to 48 hours before check-in, after that it\'s one night\'s charge.' },
    { who: 'user', text: 'Perfect, confirm the booking.' },
    { who: 'agent', text: 'Booked ✓ Confirmation <span class="mono-chip">#H-4471</span> sent to your email — see you Friday!' },
  ],
  // Return / exchange flow
  [
    { who: 'user', text: 'I want to return the shoes I ordered last week.' },
    { who: 'user', text: "They don't fit right." },
    { who: 'agent', text: 'Sure — Order <span class="mono-chip">#2210</span>, Trail Runner size 9? What\'s the reason?' },
    { who: 'user', text: 'Wrong size, I need a 9.5.' },
    { who: 'agent', text: 'I can do a free exchange instead of a return — new pair ships in 2 days. Want that?' },
    { who: 'user', text: 'Yes, exchange please.' },
    { who: 'agent', text: 'Exchange started ✓ — return label sent to your email.' },
    { who: 'user', text: 'Do I need to pay for return shipping?' },
    { who: 'agent', text: 'No — exchanges ship both ways free. Refund-only returns have a <strong>$4.99</strong> label fee.' },
    { who: 'user', text: 'Got it, thanks for the help.' },
    { who: 'agent', text: 'Happy to help — confirmation email is on its way now.' },
  ],
  // Policy query
  [
    { who: 'user', text: "What's your return policy?" },
    { who: 'agent', text: '30 days from delivery, unworn with tags — free returns on orders over $75.' },
    { who: 'user', text: "And if it's a final sale item?" },
    { who: 'agent', text: 'Final sale items aren\'t returnable, but they\'re always flagged clearly before checkout.' },
    { who: 'user', text: 'Does the warranty cover the Ridge Backpack?' },
    { who: 'agent', text: 'Yes — 2-year warranty against manufacturing defects, not general wear and tear.' },
    { who: 'user', text: 'How do I file a warranty claim?' },
    { who: 'user', text: "It's for a backpack I bought in March." },
    { who: 'agent', text: 'Reply here with your order number and a photo — we usually approve within 24 hours.' },
    { who: 'user', text: 'Good to know, thanks.' },
    { who: 'agent', text: 'Anytime — happy to help whenever you need it.' },
  ],
  // Photo question + discount coupon order flow
  [
    { who: 'user', text: 'Do you have the Pulse Smartwatch in white?' },
    { who: 'agent', text: 'Yes — <strong>$96</strong>, in stock in White. Want me to add it to your cart?' },
    { who: 'user', text: 'Yes. Can I use code WELCOME10?' },
    { who: 'agent', text: 'Added to your cart ✓ Total: <strong>$96.00</strong>.' },
    { who: 'user', text: "Wait, I don't think the discount applied?" },
    { who: 'agent', text: 'You\'re right, my mistake — fixed ✓ <span class="mono-chip">WELCOME10</span> applied, 10% off. New total: <strong>$86.40</strong>.' },
    { who: 'user', text: 'Perfect, place the order please.' },
    { who: 'agent', text: 'Order placed ✓ <span class="mono-chip">#4471</span> — confirmation and receipt sent to your email.' },
    { who: 'user', text: 'Thank you!' },
    { who: 'agent', text: 'You\'re welcome — enjoy 🙂' },
  ],
];

function typeIntoInput(el, text){
  return new Promise((resolve) => {
    el.classList.add('is-typing');
    el.innerHTML = '<span class="type-cursor"></span>';
    let i = 0;
    const interval = setInterval(() => {
      i++;
      el.innerHTML = text.slice(0, i) + '<span class="type-cursor"></span>';
      if (i === text.length) {
        clearInterval(interval);
        setTimeout(resolve, 260);
      }
    }, 26);
  });
}

function recordIntoInput(el, duration){
  return new Promise((resolve) => {
    el.classList.add('is-recording');
    el.innerHTML = '<span class="rec-dot"></span><span>Recording voice message… ' + duration + '</span>';
    setTimeout(resolve, 900);
  });
}

function attachPhotoIntoInput(el){
  return new Promise((resolve) => {
    el.classList.add('is-recording');
    el.innerHTML = '<span class="rec-dot"></span><span>Attaching photo…</span>';
    setTimeout(resolve, 750);
  });
}

function resetInput(el){
  el.classList.remove('is-typing', 'is-recording');
  el.textContent = 'Type a message…';
}

const VOICE_WAVE = [5,9,13,7,15,10,6,12,8,14,7,10,5];

function addHeroBubble(container, turn, who){
  const div = document.createElement('div');
  div.className = 'bubble bubble-enter ' + (who === 'user' ? 'bubble-user' : 'bubble-agent');
  if (turn.type === 'voice') {
    div.classList.add('bubble-voice');
    const bars = VOICE_WAVE.map((h) => `<span style="height:${h}px"></span>`).join('');
    div.innerHTML = `<span class="voice-play">▶</span><span class="voice-wave">${bars}</span><span class="voice-duration">${turn.duration}</span>`;
  } else if (turn.type === 'photo') {
    div.classList.add('bubble-photo');
    const cap = turn.text ? `<div class="bubble-photo-caption">${turn.text}</div>` : '';
    div.innerHTML = `<img src="${turn.src}" alt="Photo shared in chat" loading="lazy">${cap}`;
  } else {
    div.innerHTML = turn.text;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

async function playHeroScenario(container, inputEl, turns){
  for (let idx = 0; idx < turns.length; idx++) {
    const turn = turns[idx];
    const nextIsUser = turns[idx + 1] && turns[idx + 1].who === 'user';
    if (turn.who === 'user') {
      if (turn.type === 'voice') {
        await recordIntoInput(inputEl, turn.duration);
      } else if (turn.type === 'photo') {
        await attachPhotoIntoInput(inputEl);
      } else {
        await typeIntoInput(inputEl, turn.text);
      }
      await new Promise((r) => setTimeout(r, 200));
      addHeroBubble(container, turn, 'user');
      resetInput(inputEl);
      await new Promise((r) => setTimeout(r, nextIsUser ? 220 : 450));
    } else {
      const typing = document.createElement('div');
      typing.className = 'bubble-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(typing);
      container.scrollTop = container.scrollHeight;
      await new Promise((r) => setTimeout(r, 900));
      typing.remove();
      addHeroBubble(container, turn, 'agent');
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

async function runHeroChat(container, inputEl){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroChatScenarios[0].forEach((turn) => {
      const div = document.createElement('div');
      div.className = 'bubble ' + (turn.who === 'user' ? 'bubble-user' : 'bubble-agent');
      if (turn.type === 'voice') {
        div.classList.add('bubble-voice');
        const bars = VOICE_WAVE.map((h) => `<span style="height:${h}px"></span>`).join('');
        div.innerHTML = `<span class="voice-play">▶</span><span class="voice-wave">${bars}</span><span class="voice-duration">${turn.duration}</span>`;
      } else if (turn.type === 'photo') {
        div.classList.add('bubble-photo');
        const cap = turn.text ? `<div class="bubble-photo-caption">${turn.text}</div>` : '';
        div.innerHTML = `<img src="${turn.src}" alt="Photo shared in chat" loading="lazy">${cap}`;
      } else {
        div.innerHTML = turn.text;
      }
      container.appendChild(div);
    });
    return;
  }
  let i = 0;
  while (true) {
    container.classList.remove('fade-out');
    container.innerHTML = '';
    resetInput(inputEl);
    await playHeroScenario(container, inputEl, heroChatScenarios[i % heroChatScenarios.length]);
    await new Promise((r) => setTimeout(r, 2200));
    container.classList.add('fade-out');
    await new Promise((r) => setTimeout(r, 300));
    i++;
  }
}

// ---------- LIVE CHAT WIDGET (scripted demo) ----------
(function(){
  const launcher = document.getElementById('chatWidgetLauncher');
  const panel = document.getElementById('chatWidgetPanel');
  const closeBtn = document.getElementById('chatWidgetClose');
  const body = document.getElementById('chatWidgetBody');
  const input = document.getElementById('chatWidgetInput');
  const sendBtn = document.getElementById('chatWidgetSend');
  if (!launcher || !panel) return;

  let opened = false;
  function toggle(open){
    opened = open;
    panel.classList.toggle('open', open);
    if (open) setTimeout(() => input.focus(), 150);
  }
  launcher.addEventListener('click', () => toggle(!opened));
  closeBtn.addEventListener('click', () => toggle(false));

  function addBubble(text, who){
    const div = document.createElement('div');
    div.className = 'bubble ' + (who === 'user' ? 'bubble-user' : 'bubble-agent');
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  const replies = [
    { keys: ['price', 'pricing', 'cost', 'koto', 'dam'],
      text: "Setup runs <strong>$800–$4,000</strong> depending on complexity, plus a <strong>$150–$1,000/month</strong> retainer. Want a rough quote for your store?" },
    { keys: ['setup', 'time', 'launch', 'onboard', 'koto din'],
      text: "Most Shopify stores are live in <strong>1–2 weeks</strong> — we connect your catalog and order data first, then tune tone and policies." },
    { keys: ['integrat', 'shopify', 'whatsapp', 'woocommerce', 'platform'],
      text: "We support <strong>Shopify, WooCommerce, Magento, WhatsApp,</strong> and custom storefronts — same engine underneath, adapted to each channel." },
    { keys: ['human', 'agent', 'escalat', 'handoff'],
      text: "Anytime the agent isn't confident, it hands off to a human with full context — no repeating yourself." },
    { keys: ['hi', 'hello', 'hey', 'assalam'],
      text: "Hey there 👋 — happy to answer questions about setup, pricing, or how Wrennon fits your store." }
  ];
  function reply(msg){
    const m = msg.toLowerCase();
    const hit = replies.find(r => r.keys.some(k => m.includes(k)));
    return hit ? hit.text : "Good question — on a real deployment I'd answer that from your actual catalog and policies. For now, <a href=\"contact.html\" style=\"color:var(--accent);text-decoration:underline;\">book a call</a> and we'll walk through it.";
  }

  function send(){
    const val = input.value.trim();
    if (!val) return;
    addBubble(val.replace(/</g,'&lt;'), 'user');
    input.value = '';
    setTimeout(() => addBubble(reply(val), 'agent'), 550);
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
})();

// ---------- PRICING TOGGLE ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('pricing-toggle');
  if (toggle) {
    const monthlyLabel = document.getElementById('label-monthly');
    const yearlyLabel = document.getElementById('label-yearly');
    const amounts = document.querySelectorAll('.price-amount');
    const periods = document.querySelectorAll('.billing-period');

    function updatePricing() {
      const isYearly = toggle.checked;
      if (isYearly) {
        yearlyLabel.classList.add('active');
        monthlyLabel.classList.remove('active');
      } else {
        monthlyLabel.classList.add('active');
        yearlyLabel.classList.remove('active');
      }

      amounts.forEach(el => {
        const m = el.getAttribute('data-monthly');
        const y = el.getAttribute('data-yearly');
        if (m && y) {
          el.innerHTML = `$${isYearly ? y : m}<span class="price-period">/mo</span><span class="price-cursor">&#9616;</span>`;
        }
      });
      periods.forEach(el => {
        el.textContent = isYearly ? 'Billed annually' : 'Billed monthly';
      });
    }

    toggle.addEventListener('change', updatePricing);
    updatePricing(); // initialize on load
  }
});

// ---------- HERO AMBIENT NETWORK ANIMATION ----------
// Soft drifting nodes with connecting lines, in brand colors — an original
// canvas animation (no external assets) suggesting "your store's data, linked".
function initHeroCanvas(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes, raf;
  const NODE_COLORS = ['rgba(156,74,31,', 'rgba(198,140,83,', 'rgba(59,36,21,'];
  const LINK_DIST = 150;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    const count = Math.max(14, Math.min(30, Math.floor((w * h) / 42000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1.4 + Math.random() * 1.8,
      c: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(156,74,31,${(1 - dist / LINK_DIST) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = n.c + '0.5)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  if (reduceMotion) {
    step(); cancelAnimationFrame(raf); // draw a single static frame, no loop
  } else {
    step();
  }
  window.addEventListener('resize', () => {
    resize(); makeNodes();
  });
}
