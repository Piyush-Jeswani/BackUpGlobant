
class NumberUtils {
  constructor (ObjectUtils) {
    this.ObjectUtils = ObjectUtils;
  }

  /**
   * Checks if the value passed in is of type string. If it is
   * then convert it to a number and return it otherwise if its not a number 
   * then return the value passed in.
   * @param value value passed into function.
   * @return {object} return value.
   */
  getNumberValue (value) {
    if (typeof value === 'string') {
      return Number(value);
    }

    return value;
  }

  /**
   * Checks if the value passed is a valid non zero number and returns
   * true if it is, otherwise returns false.
   * @param value value passed into function.
   * @return {Boolean} return true if value is a valid non zero number 
   * otherwise returns false.
   */
  isValidNonZeroNumber (value) {
    return !this.ObjectUtils.isNullOrUndefinedOrBlank(value) &&
      !isNaN(value) && isFinite(value) && value !== 0;
  }

  /**
   * Checks if the value passed is a valid number and returns
   * true if it is, otherwise returns false.
   * @param value value passed into function.
   * @return {Boolean} return true if value is a valid number 
   * otherwise returns false.
   */
  isValidNumber (value) {
    return !this.ObjectUtils.isNullOrUndefinedOrBlank(value) &&
      !isNaN(value) && isFinite(value);
  }

  /**
   * Rounds the number up to the specified precision
   * @param num The number to round
   * @param precision The number of decimal places to preserve
   */
  roundUp (value, precision) {
    const powerOfTen = 10;

    precision = Math.pow(powerOfTen, precision);
    return Math.ceil(value * precision) / precision;
  }

  /**
   * Rounds the number down to the specified precision
   * @param num The number to round
   * @param precision The number of decimal places to preserve
   */
  roundDown (value, precision) {
    const powerOfTen = 10;

    precision = Math.pow(powerOfTen, precision);
    return Math.floor(value * precision) / precision;
  }
}

angular.module('shopperTrak')
  .service('NumberUtils', NumberUtils);

NumberUtils.$inject = ['ObjectUtils'];
