const assert = require('node:assert/strict');

function getBaseDayType(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  const day = new Date(y, (m || 1) - 1, d || 1).getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

function getEffectiveDayMode(dateKey, manualStatus = { holiday: false, sick: false }) {
  const flags = {
    holiday: !!manualStatus.holiday,
    sick: !!manualStatus.sick,
  };
  const base = getBaseDayType(dateKey);
  if (flags.holiday && flags.sick) return `${base}_holiday_sick`;
  if (flags.holiday) return `${base}_holiday`;
  if (flags.sick) return `${base}_sick`;
  return `${base}_normal`;
}

function getDayModeBonus(effectiveMode, bonuses = { sickBonus: 10, weekendSickBonus: 20 }) {
  if (effectiveMode.includes('weekend') && effectiveMode.includes('_sick')) return bonuses.weekendSickBonus;
  if (effectiveMode.includes('_sick')) return bonuses.sickBonus;
  return 0;
}

assert.equal(getBaseDayType('2026-03-16'), 'weekday'); // Monday
assert.equal(getBaseDayType('2026-03-15'), 'weekend'); // Sunday
assert.equal(getEffectiveDayMode('2026-03-16', { holiday: false, sick: false }), 'weekday_normal');
assert.equal(getEffectiveDayMode('2026-03-16', { holiday: true, sick: false }), 'weekday_holiday');
assert.equal(getEffectiveDayMode('2026-03-16', { holiday: false, sick: true }), 'weekday_sick');
assert.equal(getEffectiveDayMode('2026-03-15', { holiday: true, sick: true }), 'weekend_holiday_sick');
assert.equal(getDayModeBonus('weekday_sick'), 10);
assert.equal(getDayModeBonus('weekend_sick'), 20);
assert.equal(getDayModeBonus('weekend_holiday_sick'), 20);

console.log('day-status tests passed');
