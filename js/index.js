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

HTMLElement.prototype.addErr = function addErr(id, msg, label, textInput) {
  // Add error classes
  label.classList.add('error-label');
  if (textInput) this.classList.add('error-input');
  // Create error msg
  const errDiv = document.createElement('div');
  errDiv.classList.add('error-msg');
  errDiv.setAttribute('data-field', id);
  errDiv.innerText = msg;
  return this.insertAdjacentElement('afterend', errDiv);
};

HTMLElement.prototype.removeErr = function removeErr(id, label) {
  // Remove error classes
  label.classList.remove('error-label');
  document.querySelector(`div[data-field=${id}`).remove();
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
function validateField(fieldObj, textInput = true) {
  if (fieldObj.isValid() && fieldObj.hasErr) {
    fieldObj.elem.removeErr(fieldObj.id, fieldObj.labelElem);
    fieldObj.hasErr = false;
  } else if (!fieldObj.isValid() && !fieldObj.hasErr) {
    fieldObj.elem.addErr(fieldObj.id, fieldObj.errMsg, fieldObj.labelElem, textInput);
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
    id: 'name',
    elem: document.getElementById('name'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
    errMsg: 'This field cannot be blank, or begin with a space.',
    labelElem: document.querySelector('label[for="name"]'),
  },
  mail: {
    id: 'name',
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
    id: 'name',
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
const activitiesFieldset = {
  id: 'activities',
  elem: document.querySelector('fieldset.activities'),
  selectedActivities: [],
  selectedDates: [],
  isValid() {
    return this.selectedActivities.length > 0;
  },
  hasErr: false,
  errMsg: 'Please select at least one activity.',
};
activitiesFieldset.labelElem = activitiesFieldset.elem.querySelector('legend');

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

const totalCost = addTotalToDOM(activitiesFieldset.elem);
const totalCostDigit = totalCost.querySelector('span');

function updateTotal() {
  totalCostDigit.innerText = activitiesFieldset.selectedActivities.reduce(
    (runningTotal, activity) => runningTotal + getActivityCost(activity.getNestedText()),
    0,
  );
}

activitiesFieldset.elem.addEventListener('change', (e) => {
  const selectedActivity = e.target;
  const selectedActivityDate = getActivityDate(selectedActivity.getNestedText());
  const { selectedActivities, selectedDates } = activitiesFieldset;

  if (selectedActivity.checked) {
    selectedActivities.push(selectedActivity);
    selectedDates.push(selectedActivityDate);
  } else if (selectedActivity.checked === false) {
    removeFromArray(selectedActivities, selectedActivity);
    removeFromArray(selectedDates, selectedActivityDate);
  }

  const otherActivityInputs = getSiblings(
    [...activitiesFieldset.elem.querySelectorAll('input')],
    selectedActivities,
  );

  otherActivityInputs.forEach((activity) => {
    activity.disabled = selectedDates.includes(getActivityDate(activity.getNestedText()));
    if (activity.disabled) activity.checked = false;
  });

  validateField(activitiesFieldset, false);
  updateTotal();
});
// END Activities Registration Fieldset

/* =================================================================================================
Payment Fieldset
================================================================================================= */
const creditCardFields = document.getElementById('credit-card');
const paymentSelect = document.getElementById('payment');
const onlyDigits = /^\d+$/;

const paymentState = {
  creditCard: {
    id: 'credit-card',
    elem: document.getElementById('credit-card'),
    ccNum: {
      id: 'ccNum',
      elem: document.getElementById('ccNum'),
      isValid() {
        // Just checking for length and number, not actual validity
        const num = this.elem.value;
        return onlyDigits.test(num) && (num.length >= 13 && num.length <= 16);
      },
      hasErr: false,
      errMsg: 'Please use a number between 13 and 16 digits.',
      labelElem: document.querySelector('label[for=ccNum]'),
    },
    zip: {
      id: 'zip',
      elem: document.getElementById('zip'),
      isValid() {
        const code = this.elem.value;
        return onlyDigits.test(code) && code.length === 5;
      },
      hasErr: false,
      errMsg: 'Please use a 5 digit zipcode.',
      labelElem: document.querySelector('label[for=zip]'),
    },
    cvv: {
      id: 'cvv',
      elem: document.getElementById('cvv'),
      isValid() {
        const cvv = this.elem.value;
        return onlyDigits.test(cvv) && cvv.length === 3;
      },
      hasErr: false,
      errMsg: 'Please use a CVV that is 3 digits.',
      labelElem: document.querySelector('label[for=cvv]'),
    },
    expiration: {
      id: 'expiration',
      elem: document.getElementById('expiration'),
      expMonthElem: document.getElementById('exp-month'),
      expYearElem: document.getElementById('exp-year'),
      getFormattedDate() {
        const monthOptions = this.expMonthElem.options;
        const yearOptions = this.expYearElem.options;
        const month = monthOptions[monthOptions.selectedIndex].value;
        const year = yearOptions[yearOptions.selectedIndex].value;

        return year + month;
      },
      isValid() {
        const selectedDate = this.getFormattedDate();
        const currentDate = new Date();
        const currentDateFormatted =
          currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString();
        return selectedDate >= currentDateFormatted;
      },
      hasErr: false,
      errMsg: 'Please select a date in the future.',
      labelElem: document.querySelector('fieldset.payment > legend'),
    },
    selectorVal: 'credit card',
    active: true,
    isValid() {
      return this.num.isValid() && this.zip.isValid() && this.cvv.isValid();
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

creditCardFields.addEventListener('change', (e) => {
  if (e.target.id === 'payment') {
    const paymentSelection = e.target.value;
    updatePaymentState(paymentSelection);
  } else {
    const { expiration } = paymentState.creditCard;
    validateField(expiration, false);
  }
});

creditCardFields.addEventListener('keyup', (e) => {
  const fieldObj = paymentState.creditCard[e.target.id];
  validateField(fieldObj);
});
// END Payment Fieldset
