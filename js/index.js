/* eslint-disable no-param-reassign */
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

HTMLElement.prototype.getNestedText = function getNestedText() {
  return this.nextSibling.textContent;
};

function removeFromArray(arr, elem) {
  const index = arr.indexOf(elem);

  if (index !== -1) {
    arr.splice(index, 1);
  }
}
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
  const targetOptions = e.target.options;
  // Grab the text past 'Theme - ', i.e. (JS Puns or I &#9829; JS) to use for searching
  const selectedOption = targetOptions[targetOptions.selectedIndex].text.substr(8);

  shirtColorsSelect.removeChildNodes();
  shirtColorChoices.forEach((option) => {
    if (option.text.includes(selectedOption)) {
      shirtColorsSelect.appendChild(option);
    }

    shirtColorsDiv.style =
      shirtColorsSelect.innerHTML === '' ? 'display: none;' : 'display: block;';
  });
});
// END T-Shirt Info Fieldset

/* =================================================================================================
Activities Registration Fieldset
================================================================================================= */
const activitiesFieldset = document.querySelector('fieldset.activities');
const selectedActivities = [];
const selectedDates = [];

function getActivityDate(activityText) {
  const startIndex = activityText.indexOf(' — ') + 3;
  const endIndex = activityText.indexOf(',');

  // In this case, there is no date (looking at you Main Conference)
  if (endIndex === -1) return '';
  return activityText.substring(startIndex, endIndex);
}

function getActivityCost(activityText) {
  const startIndex = activityText.indexOf('$') + 1;
  return parseInt(activityText.substring(startIndex), 0);
}

function getSiblings(nodeArray, selectedArray) {
  return nodeArray.filter(node => !selectedArray.includes(node));
}

function addTotalToDOM(parent) {
  const total = document.createElement('p');
  total.innerHTML = 'Total: $<span>0</span>';
  return parent.appendChild(total);
}

const totalCost = addTotalToDOM(activitiesFieldset);
const totalCostDigit = totalCost.querySelector('span');

function updateTotal() {
  totalCostDigit.innerText = selectedActivities.reduce(
    (runningTotal, activity) => runningTotal + getActivityCost(activity.getNestedText()),
    0,
  );
}

activitiesFieldset.addEventListener('change', (e) => {
  const selectedActivity = e.target;
  const selectedActivityDate = getActivityDate(selectedActivity.getNestedText());

  if (selectedActivity.checked) {
    selectedActivities.push(selectedActivity);
    selectedDates.push(selectedActivityDate);
  } else if (selectedActivity.checked === false) {
    removeFromArray(selectedActivities, selectedActivity);
    removeFromArray(selectedDates, selectedActivityDate);
  }

  const otherActivityInputs = getSiblings(
    [...activitiesFieldset.querySelectorAll('input')],
    selectedActivities,
  );

  otherActivityInputs.forEach((activity) => {
    activity.disabled = selectedDates.includes(getActivityDate(activity.getNestedText()));
    if (activity.disabled) activity.checked = false;
  });

  updateTotal();
});
// END Activities Registration Fieldset

/* =================================================================================================
Payment Fieldset
================================================================================================= */
const paymentSelect = document.getElementById('payment');

const paymentState = {
  creditCard: {
    id: 'credit-card',
    elem: document.getElementById('credit-card'),
    selectorVal: 'credit card',
    active: true,
  },
  paypal: {
    id: 'paypal',
    elem: document.getElementById('paypal'),
    selectorVal: 'paypal',
    active: false,
  },
  bitcoin: {
    id: 'bitcoin',
    elem: document.getElementById('bitcoin'),
    selectorVal: 'bitcoin',
    active: false,
  },
};

function updatePaymentState(selectedPayment = 'credit card') {
  Object.entries(paymentState).forEach((paymentType) => {
    // Object.entries creates an array with key, value so paymentType[1] contains the object we want
    const paymentObj = paymentType[1];
    paymentObj.active = paymentObj.selectorVal === selectedPayment;
    paymentObj.elem.style = paymentObj.active ? 'display: block;' : 'display: none;';
  });
}

// Simultaneously set payment selection to creadit card and update state
updatePaymentState((paymentSelect.value = 'credit card'));

paymentSelect.addEventListener('change', (e) => {
  const paymentSelection = e.target.value;
  updatePaymentState(paymentSelection);
});
