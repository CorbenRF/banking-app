/* eslint-disable no-undef */
var valid = require("card-validator");

export function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function validateCardNumber(val) {
  var numberValidation = valid.number(val);
  console.log(numberValidation.isValid);
  return numberValidation.isValid;
}

export function validateCVV(val) {
  let testCVV = valid.cvv(val);
  return testCVV.isValid;
}
