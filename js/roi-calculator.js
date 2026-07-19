document.addEventListener('DOMContentLoaded', () => {
  const ticketsInput = document.getElementById('monthly-tickets');
  const agentCountInput = document.getElementById('agent-count');
  const agentSalaryInput = document.getElementById('agent-salary');
  const helpdeskPlanInput = document.getElementById('helpdesk-plan');
  const automationRateInput = document.getElementById('automation-rate');
  const automationRateVal = document.getElementById('automation-rate-val');

  const annualSavingsEl = document.getElementById('annual-savings');
  const timeSavedEl = document.getElementById('time-saved');
  const roiValueEl = document.getElementById('roi-value');
  const paybackPeriodEl = document.getElementById('payback-period');
  const serviceCostImpactEl = document.getElementById('service-cost-impact');

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

  // Constants based on Zendesk methodology
  const TIME_PER_TICKET_HOURS = 0.25; // 15 mins
  const AHT_REDUCTION_PERCENT = 0.10; // 10% reduction on remaining tickets
  const COST_PER_AI_RESOLUTION = 0.90; // Standard AI cost estimate

  function formatCurrency(value) {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 100000) {
      return '$' + (value / 1000).toFixed(0) + 'k';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  function calculateROI() {
    const tickets = parseFloat(ticketsInput.value) || 0;
    const agents = parseFloat(agentCountInput.value) || 0;
    const salary = parseFloat(agentSalaryInput.value) || 0;
    const planCostPerAgent = parseFloat(helpdeskPlanInput.value) || 0;
    const autoRate = parseFloat(automationRateInput.value) || 0;

    automationRateVal.textContent = autoRate + '%';
    const automationFraction = autoRate / 100;
    
    // Zendesk Methodology calculations
    
    // 1. Service Cost (Base)
    const annualServiceCost = agents * (salary * 12);
    const annualPlanCost = agents * (planCostPerAgent * 12);
    const totalCostToServe = annualServiceCost + annualPlanCost;

    // 2. Volumes
    const annualTickets = tickets * 12;
    const automatedTickets = annualTickets * automationFraction;
    const remainingTickets = annualTickets - automatedTickets;

    // 3. Costs
    // Cost of Automated Resolutions over Allowance (estimated)
    const costOfAI = automatedTickets * COST_PER_AI_RESOLUTION;
    // Cost of Remaining Contacts = (Remaining Tickets / Annual Tickets) * Total Cost to Serve
    const costOfRemainingContacts = annualTickets > 0 ? (remainingTickets / annualTickets) * totalCostToServe : 0;

    // 4. Savings
    // ((Total Cost to Serve * Automation rate) + (Cost of Remaining Contacts * AHT Reduction)) - Cost of Automated Resolutions
    const rawSavings = (totalCostToServe * automationFraction) + (costOfRemainingContacts * AHT_REDUCTION_PERCENT);
    const netSavings = rawSavings - costOfAI;

    // 5. Annual Time Saved
    // (Automated tickets * handle time) + (Non-automated tickets * handle time * handle time reduction)
    const timeSavedAutomated = automatedTickets * TIME_PER_TICKET_HOURS;
    const timeSavedRemaining = remainingTickets * TIME_PER_TICKET_HOURS * AHT_REDUCTION_PERCENT;
    const totalTimeSaved = timeSavedAutomated + timeSavedRemaining;

    // 6. Return on Investment
    // Net savings / Cost of investment (Annual Zendesk subscription cost)
    let roi = 0;
    if (annualPlanCost > 0 && netSavings > 0) {
      roi = (netSavings / annualPlanCost) * 100;
    }

    // 7. Payback Period
    // (Annual Zendesk subscription cost / Annual savings) * 12 months
    let paybackMonths = 0;
    if (netSavings > 0) {
      paybackMonths = (annualPlanCost / netSavings) * 12;
    }

    // 8. Service Cost Impact
    // The net change in service cost after account.
    let serviceCostImpact = 0;
    if (totalCostToServe > 0) {
      serviceCostImpact = (netSavings / totalCostToServe) * -100; // negative because it's a reduction in cost
    }

    // Update DOM
    if (netSavings > 0) {
      annualSavingsEl.textContent = formatCurrency(netSavings);
      annualSavingsEl.style.color = 'var(--text)';
    } else {
      annualSavingsEl.textContent = '$0';
      annualSavingsEl.style.color = 'var(--text-dim)';
    }

    timeSavedEl.textContent = formatNumber(totalTimeSaved) + ' hrs';
    
    if (roi > 0) {
      roiValueEl.textContent = formatNumber(roi) + '%';
    } else {
      roiValueEl.textContent = '0%';
    }

    if (paybackMonths > 0 && paybackMonths < 12) {
      paybackPeriodEl.textContent = paybackMonths < 1 ? '< 1 month' : formatNumber(paybackMonths) + ' months';
    } else if (paybackMonths >= 12) {
      paybackPeriodEl.textContent = formatNumber(paybackMonths) + ' months';
    } else {
      paybackPeriodEl.textContent = '0 months';
    }

    if (serviceCostImpact < 0) {
      serviceCostImpactEl.textContent = formatNumber(serviceCostImpact) + '%';
      serviceCostImpactEl.style.color = 'var(--ok)';
    } else {
      serviceCostImpactEl.textContent = '0%';
      serviceCostImpactEl.style.color = 'var(--text)';
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