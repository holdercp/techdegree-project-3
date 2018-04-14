/* =================================================================================================
Utility functions
================================================================================================= */

// Calling 'removeChild' is much faster than innerHTML = '';
// https://jsperf.com/innerhtml-vs-removechild/37
HTMLElement.prototype.removeChildNodes = function removeChildNodes() {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }
};
// END Utility Functions

/* =================================================================================================
Basic Info Fieldset
================================================================================================= */
const titleSelect = document.getElementById('title');
const titleOtherInput = document.getElementById('other-title');

document.getElementById('name').focus();
titleOtherInput.style = 'display: none;';

titleSelect.addEventListener('change', (e) => {
  const selectedOption = e.target.value;
  if (selectedOption === 'other') {
    titleOtherInput.style = 'display: block;';
  } else {
    titleOtherInput.style = 'display: none;';
  }
});
// END Basic Info Fieldset

/* =================================================================================================
T-Shirt Info Fieldset
================================================================================================= */
const shirtColorsDiv = document.getElementById('colors-js-puns');
const shirtDesignSelect = document.getElementById('design');
const shirtColorsSelect = document.getElementById('color');
const shirtColorChoices = shirtColorsSelect.querySelectorAll('option');

shirtColorsDiv.style = 'display: none;';
shirtColorsSelect.removeChildNodes();

shirtDesignSelect.addEventListener('change', (e) => {
  const selectedOption = e.target.value;
  shirtColorsSelect.removeChildNodes();
  shirtColorChoices.forEach((option) => {
    if (option.getAttribute('data-shirt-type') === selectedOption) {
      shirtColorsSelect.appendChild(option);
    }

    shirtColorsDiv.style =
      shirtColorsSelect.innerHTML === '' ? 'display: none;' : 'display: block;';
  });
});
// END T-Shirt Info Fieldset
