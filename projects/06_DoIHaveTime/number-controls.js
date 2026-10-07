// Native number inputs retain keyboard support; buttons add generous click targets.
document.querySelectorAll('input[type="number"]').forEach(input => {
  const wrapper = document.createElement('div');
  wrapper.className = 'number-control';
  input.before(wrapper);
  wrapper.append(input);
  const controls = document.createElement('div');
  controls.className = 'number-control-buttons';
  wrapper.append(controls);
  [1, -1].forEach(direction => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = direction > 0 ? 'number-increase' : 'number-decrease';
    const label = document.createElement('span');
    label.className = 'number-control-label';
    button.append(label);
    const updateLabel = () => {
      const language = document.documentElement.lang;
      label.textContent = language === 'ar' ? (direction > 0 ? 'زيادة' : 'تقليل')
        : language === 'he' ? (direction > 0 ? 'להגדיל' : 'להקטין')
          : direction > 0 ? 'Increase' : 'Decrease';
    };
    updateLabel();
    new MutationObserver(updateLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    button.addEventListener('click', () => {
      if (input.disabled || input.readOnly) return;
      if (direction > 0) input.stepUp(); else input.stepDown();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    controls.append(button);
  });
});
