// Tier definitions with display names
const GEAR_TIERS = [
  'Common',
  'Fine',
  'Rare',
  'Epic',
  'Epic+1',
  'Epic+2',
  'Legendary',
  'Legendary+1',
  'Legendary+2',
  'Legendary+3'
];

// S Gear tiers (S Gear only exists from Epic and up)
const S_GEAR_TIERS = [
  'Epic',
  'Epic+1',
  'Epic+2',
  'Legendary',
  'Legendary+1',
  'Legendary+2',
  'Legendary+3',
  'Mythic',
  'Mythic+1',
  'Mythic+2',
  'Mythic+3',
  'Mythic+4',
  'Chaotic'
];

// All tiers for sorting (includes regular gear tiers needed to craft S Gear)
const ALL_TIERS = [
  'Common',
  'Fine',
  'Rare',
  'Epic',
  'Epic+1',
  'Epic+2',
  'Legendary',
  'Legendary+1',
  'Legendary+2',
  'Legendary+3',
  'Mythic',
  'Mythic+1',
  'Mythic+2',
  'Mythic+3',
  'Mythic+4',
  'Chaotic'
];

const RUNE_TIERS = [
  'Common',
  'Fine',
  'Rare',
  'Epic',
  'Epic+1',
  'Epic+2',
  'Legendary',
  'Legendary+1',
  'Legendary+2',
  'Legendary+3',
  'Mythic'
];

// Gear recipes: what you need to craft each tier
const GEAR_RECIPES = {
  'Fine': [{ tier: 'Common', count: 3 }],
  'Rare': [{ tier: 'Fine', count: 3 }],
  'Epic': [{ tier: 'Rare', count: 3 }],
  'Epic+1': [{ tier: 'Epic', count: 2 }],
  'Epic+2': [{ tier: 'Epic+1', count: 1 }, { tier: 'Epic', count: 2 }],
  'Legendary': [{ tier: 'Epic+2', count: 2 }],
  'Legendary+1': [{ tier: 'Legendary', count: 2 }],
  'Legendary+2': [{ tier: 'Legendary+1', count: 1 }, { tier: 'Legendary', count: 1 }],
  'Legendary+3': [{ tier: 'Legendary+2', count: 1 }, { tier: 'Legendary', count: 2 }],
  'Mythic': [{ tier: 'Legendary+3', count: 2 }],
  'Mythic+1': [{ tier: 'Mythic', count: 1 }, { tier: 'Legendary+3', count: 1 }],
  'Mythic+2': [{ tier: 'Mythic+1', count: 1 }, { tier: 'Legendary+3', count: 1 }],
  'Mythic+3': [{ tier: 'Mythic+2', count: 1 }, { tier: 'Legendary+3', count: 1 }],
  'Mythic+4': [{ tier: 'Mythic+3', count: 1 }, { tier: 'Legendary+3', count: 1 }],
  'Chaotic': [{ tier: 'Mythic+4', count: 1 }, { tier: 'Legendary+3', count: 1 }]
};

// Rune recipes: simpler progression (always 2 of previous tier for upgrades)
const RUNE_RECIPES = {
  'Fine': [{ tier: 'Common', count: 3 }],
  'Rare': [{ tier: 'Fine', count: 3 }],
  'Epic': [{ tier: 'Rare', count: 3 }],
  'Epic+1': [{ tier: 'Epic', count: 2 }],
  'Epic+2': [{ tier: 'Epic+1', count: 2 }],
  'Legendary': [{ tier: 'Epic+2', count: 2 }],
  'Legendary+1': [{ tier: 'Legendary', count: 2 }],
  'Legendary+2': [{ tier: 'Legendary+1', count: 2 }],
  'Legendary+3': [{ tier: 'Legendary+2', count: 2 }],
  'Mythic': [{ tier: 'Legendary+3', count: 2 }]
};

/**
 * Calculate total materials needed at every tier level
 * @param {string} targetTier - The tier to calculate for
 * @param {string} baseTier - The base material tier
 * @param {string} calculatorType - 'gear' or 'rune'
 * @returns {object} - Breakdown of materials needed at each tier level
 */
function calculateRequirements(targetTier, baseTier = 'Common', calculatorType = 'gear') {
  const breakdown = {};
  const recipes = calculatorType === 'rune' ? RUNE_RECIPES : GEAR_RECIPES;

  function recurse(tier, multiplier = 1) {
    // Track count at this tier level
    breakdown[tier] = (breakdown[tier] || 0) + multiplier;

    // Stop recursing at the base tier
    if (tier === baseTier) {
      return;
    }

    const recipe = recipes[tier];
    if (!recipe) {
      return;
    }

    for (const ingredient of recipe) {
      recurse(ingredient.tier, ingredient.count * multiplier);
    }
  }

  recurse(targetTier);
  return breakdown;
}

/**
 * Get the ordered tier list based on calculator type and gear type
 */
function getTierList(calculatorType, gearType) {
  if (calculatorType === 'rune') {
    return RUNE_TIERS;
  }
  return gearType === 's' ? S_GEAR_TIERS : GEAR_TIERS;
}

/**
 * Get base tier - always Common (the lowest craftable material)
 */
function getBaseTier() {
  return 'Common';
}

/**
 * Get the starting tier for the dropdown (lowest selectable target)
 */
function getStartTier(calculatorType, gearType) {
  if (calculatorType === 'gear' && gearType === 's') {
    return 'Epic'; // S Gear starts at Epic
  }
  return 'Common';
}

/**
 * Populate the tier dropdown based on current selections
 */
function populateDropdown(calculatorType, gearType) {
  const dropdown = document.getElementById('tier-select');
  const tiers = getTierList(calculatorType, gearType);
  const startTier = getStartTier(calculatorType, gearType);

  dropdown.innerHTML = '';

  // Add options for tiers above the start tier
  const startIndex = tiers.indexOf(startTier) + 1;
  for (let i = startIndex; i < tiers.length; i++) {
    const option = document.createElement('option');
    option.value = tiers[i];
    option.textContent = tiers[i];
    dropdown.appendChild(option);
  }
}

/**
 * Render the results breakdown
 */
function renderResults(targetTier, calculatorType, gearType) {
  const resultsContainer = document.getElementById('results');
  const baseTier = getBaseTier();
  const breakdown = calculateRequirements(targetTier, baseTier, calculatorType);

  // Use ALL_TIERS for sorting since S Gear breakdown includes regular gear tiers
  const sortedTiers = Object.keys(breakdown)
    .filter(tier => tier !== targetTier) // Exclude target tier (shown in header)
    .sort((a, b) => ALL_TIERS.indexOf(b) - ALL_TIERS.indexOf(a));

  let html = `
    <div class="result-header">
      <h3>To craft 1× ${targetTier}</h3>
    </div>
    <div class="result-breakdown">
  `;

  for (const tier of sortedTiers) {
    const count = breakdown[tier];
    const isBase = tier === baseTier;
    html += `
      <div class="result-row ${isBase ? 'base-tier' : ''}">
        <span class="tier-name">${tier}</span>
        <span class="tier-count">×${count}</span>
      </div>
    `;
  }

  html += '</div>';
  resultsContainer.innerHTML = html;
}

/**
 * Initialize the calculator
 */
function init() {
  const gearTab = document.getElementById('tab-gear');
  const runeTab = document.getElementById('tab-rune');
  const gearTypeSelector = document.getElementById('gear-type-selector');
  const regularRadio = document.getElementById('gear-regular');
  const sGearRadio = document.getElementById('gear-s');
  const tierSelect = document.getElementById('tier-select');

  let currentCalculator = 'gear';
  let currentGearType = 'regular';

  function update() {
    populateDropdown(currentCalculator, currentGearType);
    if (tierSelect.options.length > 0) {
      renderResults(tierSelect.value, currentCalculator, currentGearType);
    }
  }

  // Tab switching
  gearTab.addEventListener('click', () => {
    gearTab.classList.add('active');
    runeTab.classList.remove('active');
    gearTypeSelector.classList.remove('hidden');
    currentCalculator = 'gear';
    update();
  });

  runeTab.addEventListener('click', () => {
    runeTab.classList.add('active');
    gearTab.classList.remove('active');
    gearTypeSelector.classList.add('hidden');
    currentCalculator = 'rune';
    update();
  });

  // Gear type switching
  regularRadio.addEventListener('change', () => {
    if (regularRadio.checked) {
      currentGearType = 'regular';
      update();
    }
  });

  sGearRadio.addEventListener('change', () => {
    if (sGearRadio.checked) {
      currentGearType = 's';
      update();
    }
  });

  // Tier selection
  tierSelect.addEventListener('change', () => {
    renderResults(tierSelect.value, currentCalculator, currentGearType);
  });

  // Initial render
  update();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
