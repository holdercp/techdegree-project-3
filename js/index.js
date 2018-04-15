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

HTMLElement.prototype.addErr = function addErr(msg) {
  // Add error classes
  this.previousElementSibling.classList.add('error-label');
  this.classList.add('error-input');
  // Create error msg
  const errDiv = document.createElement('div');
  errDiv.classList.add('error-msg');
  errDiv.innerText = msg;
  return this.insertAdjacentElement('afterend', errDiv);
};

HTMLElement.prototype.removeErr = function removeErr() {
  // Remove error classes
  this.previousElementSibling.classList.remove('error-label');
  this.classList.remove('error-input');
  // Remove error msg
  this.nextElementSibling.remove();
};

function removeFromArray(arr, elem) {
  const index = arr.indexOf(elem);

  if (index !== -1) {
    arr.splice(index, 1);
  }
}

// END Utility Functions

/* =================================================================================================
Form State
================================================================================================= */
const formState = {
  valid: false,
};
// document.addEventListener();
// END Form State

/* =================================================================================================
Basic Info Fieldset
================================================================================================= */
const infoState = {
  name: {
    elem: document.getElementById('name'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
  },
  email: {
    elem: document.getElementById('mail'),
    isValid() {
      const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regEx.test(String(this.elem.value).toLowerCase());
    },
    hasErr: false,
  },
  otherTitle: {
    elem: document.getElementById('other-title'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
    show: false,
  },
};

const nameInput = infoState.name.elem;
const emailInput = infoState.email.elem;
const titleSelect = document.getElementById('title');
const otherTitleInput = infoState.otherTitle.elem;

function updateTitleField(selectedOption) {
  const { otherTitle } = infoState;

  otherTitle.show = selectedOption === 'other';
  otherTitle.elem.style = otherTitle.show ? 'display: block' : 'display: none';

  if (otherTitle.show === false && otherTitle.hasErr) {
    otherTitle.elem.value = '';
    otherTitle.elem.removeErr();
    otherTitle.hasErr = false;
  }
}

// TODO: Figure out way to keep focus from triggering event on load
// nameInput.focus();
updateTitleField((titleSelect.value = 'full-stack js developer'));

titleSelect.addEventListener('change', (e) => {
  const selectedRole = e.target.value;
  updateTitleField(selectedRole);
});

nameInput.addEventListener('keyup', () => {
  const { name } = infoState;
  if (name.isValid() && name.hasErr) {
    nameInput.removeErr();
    name.hasErr = false;
  } else if (!name.isValid() && !name.hasErr) {
    nameInput.addErr('This field cannot be blank, or begin with a space.');
    name.hasErr = true;
  }
});

emailInput.addEventListener('keyup', () => {
  const { email } = infoState;
  if (email.isValid() && email.hasErr) {
    emailInput.removeErr();
    email.hasErr = false;
  } else if (!email.isValid() && !email.hasErr) {
    emailInput.addErr('Please provide a valid email address.');
    email.hasErr = true;
  }
});

otherTitleInput.addEventListener('keyup', () => {
  const { otherTitle } = infoState;
  if (otherTitle.isValid() && otherTitle.hasErr) {
    otherTitleInput.removeErr();
    otherTitle.hasErr = false;
  } else if (!otherTitle.isValid() && !otherTitle.hasErr) {
    otherTitleInput.addErr('This field cannot be blank, or begin with a space.');
    otherTitle.hasErr = true;
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
const activitiesState = {
  addErr() {
    const fieldsetRoot = document.querySelector('fieldset.activities');
    const legend = fieldsetRoot.querySelector('legend');
    // Add error classes
    legend.classList.add('error-label');
    // Create error msg
    const errDiv = document.createElement('div');
    errDiv.classList.add('error-msg');
    errDiv.innerText = 'Please select at least one activity.';
    legend.insertAdjacentElement('afterend', errDiv);
  },
  removeErr() {
    const fieldsetRoot = document.querySelector('fieldset.activities');
    const legend = fieldsetRoot.querySelector('legend');
    const errorDiv = legend.nextElementSibling;

    legend.classList.remove('error-label');
    errorDiv.remove();
  },
  hasErr: false,
};
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

  if (selectedActivities.length === 0 && !activitiesState.hasErr) {
    activitiesState.addErr();
    activitiesState.hasErr = true;
  } else if (selectedActivities.length > 0 && activitiesState.hasErr) {
    activitiesState.removeErr();
    activitiesState.hasErr = false;
  }

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
// END Payment Fieldset
