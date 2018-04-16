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

HTMLElement.prototype.addErr = function addErr(msg, label, textInput = true) {
  // Add error classes
  label.classList.add('error-label');
  if (textInput) this.classList.add('error-input');
  // Create error msg
  const errDiv = document.createElement('div');
  errDiv.classList.add('error-msg');
  errDiv.setAttribute('data-field', this.id);
  errDiv.innerText = msg;
  return label.insertAdjacentElement('afterend', errDiv);
};

HTMLElement.prototype.removeErr = function removeErr(label) {
  // Remove error classes
  label.classList.remove('error-label');
  document.querySelector(`div[data-field=${this.id}`).remove();
  if (this.classList.contains('error-input')) this.classList.remove('error-input');
};

function removeFromArray(arr, elem) {
  const index = arr.indexOf(elem);

  if (index !== -1) {
    arr.splice(index, 1);
  }
}
// END Utility Functions

/* =================================================================================================
Form
================================================================================================= */
function validateField(fieldObj) {
  if (fieldObj.isValid() && fieldObj.hasErr) {
    fieldObj.elem.removeErr(fieldObj.labelElem);
    fieldObj.hasErr = false;
  } else if (!fieldObj.isValid() && !fieldObj.hasErr) {
    fieldObj.elem.addErr(fieldObj.errMsg, fieldObj.labelElem);
    fieldObj.hasErr = true;
  }
}
// END Form

/* =================================================================================================
Basic Info Fieldset
================================================================================================= */
// Create field objects
const infoFields = {
  name: {
    elem: document.getElementById('name'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
    errMsg: 'This field cannot be blank, or begin with a space.',
    labelElem: document.querySelector('label[for="name"]'),
  },
  mail: {
    elem: document.getElementById('mail'),
    isValid() {
      const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regEx.test(String(this.elem.value).toLowerCase());
    },
    hasErr: false,
    errMsg: 'Please provide a valid email address.',
    labelElem: document.querySelector('label[for="mail"]'),
  },
  otherTitle: {
    elem: document.getElementById('otherTitle'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
    errMsg: 'This field cannot be blank, or begin with a space.',
    labelElem: document.querySelector('label[for="title"]'),
    show: false,
  },
};

// Get parent
const basicInfoFieldset = document.querySelector('fieldset.basic');
const titleSelect = document.getElementById('title');

function updateTitleField(selectedOption) {
  const { otherTitle } = infoFields;

  otherTitle.show = selectedOption === 'other';
  otherTitle.elem.style = otherTitle.show ? 'display: block' : 'display: none';

  if (otherTitle.show === false && otherTitle.hasErr) {
    otherTitle.elem.value = '';
    otherTitle.elem.removeErr(otherTitle.labelElem);
    otherTitle.hasErr = false;
  }
}

infoFields.name.elem.focus();
updateTitleField((titleSelect.value = 'full-stack js developer'));

basicInfoFieldset.addEventListener('keyup', (e) => {
  const fieldObj = infoFields[e.target.id];
  validateField(fieldObj);
});

titleSelect.addEventListener('change', (e) => {
  const selectedRole = e.target.value;
  updateTitleField(selectedRole);
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
const onlyDigits = /^\d+$/;

const paymentState = {
  creditCard: {
    id: 'credit-card',
    elem: document.getElementById('credit-card'),
    num: {
      elem: document.getElementById('cc-num'),
      hasErr: false,
    },
    zip: {
      elem: document.getElementById('zip'),
      hasErr: false,
    },
    cvv: {
      elem: document.getElementById('cvv'),
      hasErr: false,
    },
    expiration: {
      expMonthElem: document.getElementById('exp-month'),
      expYearElem: document.getElementById('exp-year'),
      hasErr: false,
    },
    selectorVal: 'credit card',
    active: true,
    getDate() {
      const monthOptions = this.expiration.expMonthElem.options;
      const yearOptions = this.expiration.expYearElem.options;
      const month = monthOptions[monthOptions.selectedIndex].value;
      const year = yearOptions[yearOptions.selectedIndex].value;

      return year + month;
    },
    isValidZip() {
      const code = this.zip.elem.value;
      return onlyDigits.test(code) && code.length === 5;
    },
    isValidNum() {
      // Just checking for length and number, not actual validity
      const num = this.num.elem.value;
      return onlyDigits.test(num) && (num.length >= 13 && num.length <= 16);
    },
    isValidCvv() {
      const cvv = this.cvv.elem.value;
      return onlyDigits.test(cvv) && cvv.length === 3;
    },
    isValid() {
      return this.isValidZip() && this.isValidNum() && this.isValidCvv();
    },
    addErr(elem, msg) {
      // Add error classes
      elem.previousElementSibling.classList.add('error-label');
      elem.classList.add('error-input');
      // Create error msg
      const errDiv = document.createElement('div');
      errDiv.classList.add('error-msg');
      errDiv.innerText = msg;
      return elem.insertAdjacentElement('afterend', errDiv);
    },
    removeErr(elem) {
      // Remove error classes
      elem.previousElementSibling.classList.remove('error-label');
      elem.classList.remove('error-input');
      // Remove error msg
      elem.nextElementSibling.remove();
    },
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

const zipInput = paymentState.creditCard.zip.elem;
const numInput = paymentState.creditCard.num.elem;
const cvvInput = paymentState.creditCard.cvv.elem;
const expMonthSelect = paymentState.creditCard.expiration.expMonthElem;
const expYearSelect = paymentState.creditCard.expiration.expYearElem;

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

zipInput.addEventListener('keyup', () => {
  const { creditCard } = paymentState;
  const { zip } = creditCard;
  if (!creditCard.isValidZip() && !zip.hasErr) {
    creditCard.addErr(zip.elem, 'Please use a 5 digit zipcode.');
    zip.hasErr = true;
  } else if (creditCard.isValidZip() && zip.hasErr) {
    creditCard.removeErr(zip.elem);
    zip.hasErr = false;
  }
});

numInput.addEventListener('keyup', () => {
  const { creditCard } = paymentState;
  const { num } = creditCard;
  if (!creditCard.isValidNum() && !num.hasErr) {
    creditCard.addErr(num.elem, 'Please use a number between 13 and 16 digits.');
    num.hasErr = true;
  } else if (creditCard.isValidNum() && num.hasErr) {
    creditCard.removeErr(num.elem);
    num.hasErr = false;
  }
});

cvvInput.addEventListener('keyup', () => {
  const { creditCard } = paymentState;
  const { cvv } = creditCard;
  if (!creditCard.isValidCvv() && !cvv.hasErr) {
    creditCard.addErr(cvv.elem, 'Please use a CVV that is 3 digits.');
    cvv.hasErr = true;
  } else if (creditCard.isValidCvv() && cvv.hasErr) {
    creditCard.removeErr(cvv.elem);
    cvv.hasErr = false;
  }
});

expMonthSelect.addEventListener('change', (e) => {
  const { creditCard } = paymentState;
  const { expiration } = creditCard;
  const selectedDate = paymentState.creditCard.getDate();
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString();

  if (selectedDate < formattedDate && !expiration.hasErr) {
    creditCard.addErr(expiration.expMonthElem, 'Please select a date in the future.');
    expiration.hasErr = true;
  } else if (selectedDate >= formattedDate && expiration.hasErr) {
    creditCard.removeErr(expiration.expMonthElem);
    expiration.hasErr = false;
  }
});

expYearSelect.addEventListener('change', (e) => {
  const { creditCard } = paymentState;
  const { expiration } = creditCard;
  const selectedDate = paymentState.creditCard.getDate();
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString();

  if (selectedDate < formattedDate && !expiration.hasErr) {
    creditCard.addErr(expiration.expMonthElem, 'Please select a date in the future.');
    expiration.hasErr = true;
  } else if (selectedDate >= formattedDate && expiration.hasErr) {
    creditCard.removeErr(expiration.expMonthElem);
    expiration.hasErr = false;
  }
});
// END Payment Fieldset
