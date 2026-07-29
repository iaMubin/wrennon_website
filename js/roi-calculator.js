document.addEventListener('DOMContentLoaded', () => {
  const ticketsInput = document.getElementById('monthly-tickets');
  const agentCountInput = document.getElementById('agent-count');
  const regionSelect = document.getElementById('region-select');
  const agentSalaryInput = document.getElementById('agent-salary');
  const helpdeskPlanInput = document.getElementById('helpdesk-plan');
  const automationRateInput = document.getElementById('automation-rate');
  const automationRateVal = document.getElementById('automation-rate-val');

  const annualSavingsEl = document.getElementById('annual-savings');
  const timeSavedEl = document.getElementById('time-saved');
  const roiValueEl = document.getElementById('roi-value');
  const paybackPeriodEl = document.getElementById('payback-period');
  const serviceCostImpactEl = document.getElementById('service-cost-impact');
  const teamRetainedEl = document.getElementById('team-retained');
  const teamReducedEl = document.getElementById('team-reduced');
  const automationWarningEl = document.getElementById('automationWarning');
  const inputSanityWarningEl = document.getElementById('inputSanityWarning');
  const planRecommendationEl = document.getElementById('planRecommendation');

  // Modal logic
  const modal = document.getElementById('methodologyModal');
  const openBtn = document.getElementById('openMethodology');
  const closeBtn = document.getElementById('closeMethodology');

  openBtn.addEventListener('click', () => {
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
  });
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  });

  // ---- Verified constants ----
  // Average handle time: 6 min/ticket, per Zendesk's published CX benchmarks.
  const TIME_PER_TICKET_HOURS = 0.1;
  // Standard full-time-equivalent work year: 2,080 hours (40 hrs/week x 52 weeks),
  // the conventional FTE basis used by the U.S. OPM and general HR practice.
  const FTE_ANNUAL_HOURS = 2080;
  // Conservative, non-cited assumption: copilot-assisted agents resolve remaining tickets 10% faster.
  const AHT_REDUCTION_PERCENT = 0.10;
  // Cost per AI-resolved chat BEYOND your plan's included allowance: matches Wrennon's own
  // $0.75 overage rate, within Gartner's 2025-reported range of $0.50-$1.05 per AI-handled ticket.
  const COST_PER_AI_OVERAGE = 0.75;
  // The AI Agent works alongside your team, not instead of it. Automation is capped at 85%,
  // matching the top-performer ceiling industry-leading vendors report (Intercom Fin's AI Agent
  // KPI framework, 2026: "top performers reach 80-84%, particularly in ecommerce and subscription
  // businesses with well-structured knowledge bases" - Wrennon is trained directly on your catalog).
  const MAX_AUTOMATION_FRACTION = 0.85;
  // At least 20% of agents stay on for escalations, edge cases, and oversight - a reasonable
  // operational buffer, not a cited statistic. The absolute floor of 1 agent reflects standard
  // business-continuity practice (avoid a single point of failure), not a specific published number.
  const MIN_RETAINED_FRACTION = 0.20;
  const MIN_RETAINED_AGENTS = 1;
  // Sanity-check range for derived cost-per-ticket, per published human-support-cost benchmarks
  // ($6/conversation average per Fin.ai; $25-35/ticket for B2B SaaS per SaaS Capital's 2024
  // B2B Support Spending Report). Inputs implying a cost far outside this range usually mean a
  // mismatched ticket-volume/agent-count combination worth double-checking.
  const SANITY_COST_PER_TICKET_LOW = 2;
  const SANITY_COST_PER_TICKET_HIGH = 60;

  // Regional fully-loaded monthly cost-per-agent defaults (see methodology modal for full sourcing):
  const REGION_DEFAULTS = { us: 4450, uk: 4250, eu: 5420 };

  // Wrennon plan ladder, cheapest first, used for the recommended-plan feature.
  const PLAN_LADDER = [
    { value: '299', chats: 500, label: 'Starter' },
    { value: '499', chats: 1000, label: 'Growth' },
    { value: '999', chats: 2200, label: 'Scale' },
    { value: '1999', chats: 5000, label: 'Advance' },
  ];

  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      agentSalaryInput.value = REGION_DEFAULTS[regionSelect.value];
      calculateROI();
    });
  }

  if (helpdeskPlanInput) {
    helpdeskPlanInput.addEventListener('change', calculateROI);
  }

  function formatCurrency(value) {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      return sign + '$' + (abs / 1000000).toFixed(1) + 'M';
    } else if (abs >= 100000) {
      return sign + '$' + (abs / 1000).toFixed(0) + 'k';
    }
    return sign + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(abs);
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals || 0, minimumFractionDigits: 0 }).format(value);
  }

  // Formats agent counts as whole numbers, but avoids a misleading "0" for small positive
  // values by showing "< 1" instead of rounding away real (if partial) impact.
  function formatAgents(value) {
    if (value <= 0) return '0';
    if (value < 1) return '< 1';
    return formatNumber(value, 0);
  }

  function calculateROI() {
    const tickets = parseFloat(ticketsInput.value) || 0;
    const agents = parseFloat(agentCountInput.value) || 0;
    const salary = parseFloat(agentSalaryInput.value) || 0;
    const planCostMonthly = parseFloat(helpdeskPlanInput.value) || 0;
    const planSelectedOption = helpdeskPlanInput.options[helpdeskPlanInput.selectedIndex];
    const planIncludedChats = planSelectedOption ? (parseFloat(planSelectedOption.getAttribute('data-chats')) || 0) : 0;
    const requestedAutoRate = parseFloat(automationRateInput.value) || 0;

    // Slider allows up to 100% so the realism ceiling is visible, but calculations
    // are always capped at the real-world figure.
    const isOverRealisticCap = requestedAutoRate > MAX_AUTOMATION_FRACTION * 100;
    const autoRate = Math.min(requestedAutoRate, MAX_AUTOMATION_FRACTION * 100);
    automationRateVal.textContent = requestedAutoRate + '%';
    const automationFraction = autoRate / 100;

    if (automationWarningEl) {
      automationWarningEl.style.display = isOverRealisticCap ? 'flex' : 'none';
    }

    // 1. Baseline annual labor cost (your current cost to serve, humans only)
    const annualLaborCost = agents * (salary * 12);
    // Wrennon is priced flat per plan, not per agent
    const annualPlanCost = planCostMonthly * 12;

    // 2. Ticket volumes and workload
    const annualTickets = tickets * 12;
    const automatedTickets = annualTickets * automationFraction;
    const remainingTickets = annualTickets - automatedTickets;
    const costPerTicket = annualTickets > 0 ? annualLaborCost / annualTickets : 0;

    if (inputSanityWarningEl) {
      if (costPerTicket > 0 && (costPerTicket < SANITY_COST_PER_TICKET_LOW || costPerTicket > SANITY_COST_PER_TICKET_HIGH)) {
        inputSanityWarningEl.style.display = 'flex';
        inputSanityWarningEl.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path></svg>' +
          '<span><strong>Check your numbers.</strong> Your inputs imply a cost of ' + formatCurrency(costPerTicket) + ' per ticket at your current baseline &mdash; typical published benchmarks run $6&ndash;$35 per ticket. Your ticket volume and agent count may not be proportional yet.</span>';
      } else {
        inputSanityWarningEl.style.display = 'none';
      }
    }

    // 3. Dollar savings, following the published methodology industry leaders use (e.g. Intercom
    // Fin's official ROI formula: Savings = Automated conversations x Human cost per conversation,
    // minus Automated conversations x AI cost per resolution). Credit is based on actual automated
    // ticket volume, not an assumed headcount reduction - so it scales smoothly and correctly to
    // zero when there's no ticket volume to automate.
    const annualLaborSavings = automatedTickets * costPerTicket;

    // 3b. Headcount context is shown for transparency but does not gate the dollar math above -
    // it translates automated volume into an intuitive "worth of capacity" figure, capped by a
    // realistic floor on how many agents you'd actually keep for escalations and oversight.
    const retainedAgents = agents > 0 ? Math.min(agents, Math.max(Math.ceil(agents * MIN_RETAINED_FRACTION), MIN_RETAINED_AGENTS)) : 0;
    const maxReducibleAgents = Math.max(agents - retainedAgents, 0);
    const workloadHoursAutomated = automatedTickets * TIME_PER_TICKET_HOURS;
    const fteEquivalentFreed = workloadHoursAutomated / FTE_ANNUAL_HOURS;
    const agentsReduced = Math.min(fteEquivalentFreed, maxReducibleAgents);

    // 4. AI cost: only chats BEYOND your plan's included monthly allowance cost extra.
    const includedChatsAnnual = planIncludedChats * 12;
    const overageChats = Math.max(0, automatedTickets - includedChatsAnnual);
    const costOfAIOverage = overageChats * COST_PER_AI_OVERAGE;

    // 5. Remaining human-handled tickets get resolved faster with AI/copilot assistance.
    // Only applies once there's actual automation in place (0% automation = no AI-assisted gain).
    const efficiencyGainOnRemaining = automationFraction > 0
      ? remainingTickets * costPerTicket * AHT_REDUCTION_PERCENT
      : 0;

    // 6. Gross and net savings
    const grossSavings = annualLaborSavings + efficiencyGainOnRemaining - costOfAIOverage;
    const netSavings = grossSavings - annualPlanCost;

    // 7. Annual time saved
    const timeSavedAutomated = automatedTickets * TIME_PER_TICKET_HOURS;
    const timeSavedRemaining = automationFraction > 0 ? remainingTickets * TIME_PER_TICKET_HOURS * AHT_REDUCTION_PERCENT : 0;
    const totalTimeSaved = timeSavedAutomated + timeSavedRemaining;

    // 8. Return on investment: net savings / annual Wrennon plan cost
    let roi = 0;
    if (annualPlanCost > 0 && netSavings > 0) {
      roi = (netSavings / annualPlanCost) * 100;
    }

    // 9. Payback period: months of gross benefit needed to cover the annual plan cost
    let paybackMonths = 0;
    if (grossSavings > 0) {
      paybackMonths = (annualPlanCost / grossSavings) * 12;
    }

    // 10. Service cost impact: net savings as a share of your current annual labor cost
    let serviceCostImpact = 0;
    if (annualLaborCost > 0) {
      serviceCostImpact = (netSavings / annualLaborCost) * -100; // negative because it's a reduction in cost
    }

    // Update DOM — show the real figure (including negative) rather than silently clamping to $0,
    // so unrealistic input combinations are visible instead of looking broken.
    annualSavingsEl.textContent = formatCurrency(netSavings);
    annualSavingsEl.style.color = netSavings > 0 ? 'var(--text)' : 'var(--text-dim)';

    timeSavedEl.textContent = formatNumber(totalTimeSaved) + ' hrs';
    roiValueEl.textContent = (roi > 0 ? formatNumber(roi) : '0') + '%';

    if (paybackMonths > 0 && paybackMonths < 1) {
      paybackPeriodEl.textContent = '< 1 month';
    } else if (paybackMonths >= 1) {
      paybackPeriodEl.textContent = formatNumber(paybackMonths) + ' months';
    } else {
      paybackPeriodEl.textContent = 'N/A';
    }

    serviceCostImpactEl.textContent = formatNumber(serviceCostImpact) + '%';
    serviceCostImpactEl.style.color = serviceCostImpact < 0 ? 'var(--ok)' : 'var(--text)';

    if (teamRetainedEl) teamRetainedEl.textContent = formatAgents(retainedAgents);
    if (teamReducedEl) teamReducedEl.textContent = formatAgents(agentsReduced);

    // 11. Recommended plan: cheapest tier whose allowance covers your automated monthly volume.
    updatePlanRecommendation(automatedTickets / 12, planCostMonthly);
  }

  function updatePlanRecommendation(monthlyAutomatedTickets, currentPlanCost) {
    if (!planRecommendationEl) return;

    let recommended = null;
    for (let i = 0; i < PLAN_LADDER.length; i++) {
      if (monthlyAutomatedTickets <= PLAN_LADDER[i].chats) {
        recommended = PLAN_LADDER[i];
        break;
      }
    }

    if (!recommended) {
      // Exceeds even the top listed plan's allowance
      planRecommendationEl.style.display = 'flex';
      planRecommendationEl.innerHTML =
        '<span>Your automated volume exceeds Advance\'s allowance &mdash; <strong>Enterprise</strong> pricing is likely the better fit.</span>' +
        '<button type="button" onclick="window.location.href=\'implementation-fee.html\'">See Enterprise &rarr;</button>';
      return;
    }

    if (String(currentPlanCost) === recommended.value) {
      planRecommendationEl.style.display = 'none';
      return;
    }

    planRecommendationEl.style.display = 'flex';
    planRecommendationEl.innerHTML =
      '<span>Based on your automated volume, <strong>' + recommended.label + '</strong> is the best-fit plan.</span>' +
      '<button type="button" data-recommend-value="' + recommended.value + '">Use ' + recommended.label + '</button>';

    const btn = planRecommendationEl.querySelector('button[data-recommend-value]');
    if (btn) {
      btn.addEventListener('click', () => {
        helpdeskPlanInput.value = btn.getAttribute('data-recommend-value');
        calculateROI();
      });
    }
  }

  // Event Listeners
  [ticketsInput, agentCountInput, agentSalaryInput, helpdeskPlanInput, automationRateInput].forEach(input => {
    input.addEventListener('input', calculateROI);
  });

  // Initial calculation
  calculateROI();

  // Disclaimer Modal Logic
  const disclaimerModal = document.getElementById('disclaimerModal');
  const openDisclaimerBtn = document.getElementById('openDisclaimer');
  const closeDisclaimerBtn = document.getElementById('closeDisclaimer');

  openDisclaimerBtn.addEventListener('click', () => {
    disclaimerModal.classList.add('open');
    document.body.classList.add('no-scroll');
  });
  closeDisclaimerBtn.addEventListener('click', () => {
    disclaimerModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  });
  disclaimerModal.addEventListener('click', (e) => {
    if (e.target === disclaimerModal) {
      disclaimerModal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  });
});
