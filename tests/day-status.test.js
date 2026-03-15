const assert = require('node:assert/strict');

function getBaseDayType(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  const day = new Date(y, (m || 1) - 1, d || 1).getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

function getEffectiveDayMode(dateKey, manualStatus = 'normal') {
  return `${getBaseDayType(dateKey)}_${manualStatus}`;
}

function getDayModeBonus(effectiveMode, bonuses = { sickBonus: 10, weekendSickBonus: 20 }) {
  if (effectiveMode === 'weekend_sick') return bonuses.weekendSickBonus;
  if (effectiveMode.endsWith('_sick')) return bonuses.sickBonus;
  return 0;
}

assert.equal(getBaseDayType('2026-03-16'), 'weekday'); // Monday
assert.equal(getBaseDayType('2026-03-15'), 'weekend'); // Sunday
assert.equal(getEffectiveDayMode('2026-03-16', 'normal'), 'weekday_normal');
assert.equal(getEffectiveDayMode('2026-03-16', 'sick'), 'weekday_sick');
assert.equal(getEffectiveDayMode('2026-03-15', 'sick'), 'weekend_sick');
assert.equal(getDayModeBonus('weekday_sick'), 10);
assert.equal(getDayModeBonus('weekend_sick'), 20);

console.log('day-status tests passed');
