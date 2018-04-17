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
  // Create error msg that appears under elements
  const errDiv = document.createElement('div');
  // Give it an id to hook onto for removal
  // Don't use a data- attr to do this; safari complains
  errDiv.classList.add('error-msg', id);
  errDiv.innerText = msg;
  return this.insertAdjacentElement('afterend', errDiv);
};

HTMLElement.prototype.removeErr = function removeErr(id, label) {
  // Remove error classes
  label.classList.remove('error-label');
  // Remove msg that was added
  document.querySelector(`div.error-msg.${id}`).remove();
  if (this.classList.contains('error-input')) this.classList.remove('error-input');
};

// Removes a specific elem from an array
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
// Create field objects
// Each will have its own validation method, error state/msg, and label element to use for errors
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
    id: 'mail',
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
    id: 'otherTitle',
    elem: document.getElementById('otherTitle'),
    isValid() {
      return this.elem.value.length > 0 && this.elem.value[0] !== ' ';
    },
    hasErr: false,
    errMsg: 'This field cannot be blank, or begin with a space.',
    labelElem: document.querySelector('label[for="title"]'),
    active: false,
  },
};

// Get parent
const basicInfoFieldset = document.querySelector('fieldset.basic');
const titleSelect = document.getElementById('title');

function updateTitleField(selectedOption) {
  const { otherTitle } = infoFields;

  // Show "other" text input
  otherTitle.active = selectedOption === 'other';
  otherTitle.elem.style = otherTitle.active ? 'display: block' : 'display: none';

  // If another selection is made, clear errors on "other" input so form will submit
  if (otherTitle.active === false && otherTitle.hasErr) {
    otherTitle.elem.value = '';
    otherTitle.elem.removeErr(otherTitle.id, otherTitle.labelElem);
    otherTitle.hasErr = false;
  }
}

// Initial focus
infoFields.name.elem.focus();
// Simultaneously set title selection and update state
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
// Add this later since we're not actually initializing the object (elem would be undefined)
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

  // Keep track of selected activities and their dates
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

  // Disable activities that share the same date as selected activities
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

// Payment object
// Payment types
// Credit card fields
// Most state is managed in here
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
      labelElem: document.querySelector('label[for="ccNum"]'),
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
      labelElem: document.querySelector('label[for="zip"]'),
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
      labelElem: document.querySelector('label[for="cvv"]'),
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
      return this.ccNum.isValid() && this.zip.isValid() && this.cvv.isValid();
    },
    removeFieldErrors() {
      if (this.ccNum.hasErr) {
        this.ccNum.elem.removeErr(this.ccNum.id, this.ccNum.labelElem);
        this.ccNum.elem.value = '';
        this.ccNum.hasErr = false;
      }
      if (this.zip.hasErr) {
        this.zip.elem.removeErr(this.zip.id, this.zip.labelElem);
        this.zip.elem.value = '';
        this.zip.hasErr = false;
      }
      if (this.cvv.hasErr) {
        this.cvv.elem.removeErr(this.cvv.id, this.cvv.labelElem);
        this.cvv.elem.value = '';
        this.cvv.hasErr = false;
      }
      if (this.expiration.hasErr) {
        this.expiration.elem.removeErr(this.expiration.id, this.expiration.labelElem);
        this.expiration.hasErr = false;
      }
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

// Simultaneously set payment selection to credit card and update state
updatePaymentState((paymentSelect.value = 'credit card'));

paymentSelect.addEventListener('change', (e) => {
  const paymentSelection = e.target.value;
  const { creditCard } = paymentState;
  updatePaymentState(paymentSelection);

  // Remove errors from credit card fields if it's not the selected payment
  if (creditCard.active === false) {
    creditCard.removeFieldErrors();
  }
});

creditCardFields.addEventListener('change', () => {
  const { expiration } = paymentState.creditCard;
  validateField(expiration, false);
});

creditCardFields.addEventListener('keyup', (e) => {
  const fieldObj = paymentState.creditCard[e.target.id];
  validateField(fieldObj);
});
// END Payment Fieldset

/* =================================================================================================
Form
================================================================================================= */
const form = document.querySelector('form');
const submitBtn = document.querySelector('button');

const fieldsToCheck = [
  infoFields.name,
  infoFields.mail,
  infoFields.otherTitle,
  activitiesFieldset,
  paymentState.creditCard.ccNum,
  paymentState.creditCard.zip,
  paymentState.creditCard.cvv,
  paymentState.creditCard.expiration,
];

// Adds and removes errors based on the field's isValid() method
function validateField(fieldObj, textInput = true) {
  if (fieldObj.isValid() && fieldObj.hasErr) {
    fieldObj.elem.removeErr(fieldObj.id, fieldObj.labelElem);
    fieldObj.hasErr = false;
  } else if (!fieldObj.isValid() && !fieldObj.hasErr) {
    fieldObj.elem.addErr(fieldObj.id, fieldObj.errMsg, fieldObj.labelElem, textInput);
    fieldObj.hasErr = true;
  }
}

// Boolean if the form has any errors
function formInvalid() {
  const invalidFields = fieldsToCheck.filter(fieldObj => fieldObj.hasErr);
  return invalidFields.length > 0;
}

// Runs validatation on all appropriate fields
function validateForm() {
  fieldsToCheck.forEach((fieldObj) => {
    if (fieldObj.active || fieldObj.active === undefined) {
      validateField(fieldObj, !(fieldObj.id === 'activities' || fieldObj.id === 'expiration'));
    }
  });
  return formInvalid();
}

// Diable submit button if form is invalid
function toggleDisabledBtn() {
  if (formInvalid()) {
    submitBtn.setAttribute('disabled', '');
  } else {
    submitBtn.removeAttribute('disabled');
  }
}

form.addEventListener('change', () => {
  toggleDisabledBtn();
});

form.addEventListener('keyup', () => {
  toggleDisabledBtn();
});

submitBtn.addEventListener('click', (e) => {
  if (validateForm()) {
    e.preventDefault();
    toggleDisabledBtn();
  }
});
// END Form
