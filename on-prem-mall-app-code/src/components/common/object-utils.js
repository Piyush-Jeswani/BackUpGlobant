
class ObjectUtils {

  /**
     * Check if the item passed in is undefined.
     * @param {object} item - The item being checked.
     * @return {Boolean} true if item is undefined otherwise false.
     */
  isUndefined(item) {
    return typeof item === 'undefined';
  }

  /**
     * Check if the item passed in is null or undefined.
     * @param {object} item - The item being checked.
     * @return {Boolean} true if item is null or undefined otherwise false.
     */
  isNullOrUndefined(item) {
    if (typeof item === 'undefined') {
      return true;
    }
    if (item === null) {
      return true;
    }

    return false;
  }

  /**
     * Check if the item passed in is null, undefined or empty.
     * @param {object} item - The item being checked.
     * @return {Boolean} true if item is null, undefined or empty otherwise false.
     */
  isNullOrUndefinedOrEmpty(item) {
    if (this.isNullOrUndefined(item) || this.isNullOrUndefined(item.length) || item.length === 0) {
      return true;
    }
    if (item === '' || this.isNullOrUndefined(item.length)) {
      return true;
    }

    return false;
  }

  /**
     * Check if the item passed in is null, undefined or blank.
     * @param {object} item - The item being checked.
     * @return {Boolean} true if item is null, undefined or blank otherwise false.
     */
  isNullOrUndefinedOrBlank(item) {
    if (this.isNullOrUndefined(item)) {
      return true;
    }
    if (item === '') {
      return true;
    }

    return false;
  }

  /**
     * Check if the object passed in is empty.
     * @param {object} obj - The object being checked.
     * @return {Boolean} true if obj is empty otherwise false.
     */
  isEmptyObject(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true && JSON.stringify(obj) === JSON.stringify({});
  }

  /**
     * Check if the object passed in is null, undefined or empty.
     * @param {object} obj - The object being checked.
     * @return {Boolean} true if obj is null, undefined or empty otherwise false.
     */
  isNullOrUndefinedOrEmptyObject(obj) {
    if (this.isNullOrUndefined(obj)) {
      return true;
    }

    if (this.isEmptyObject(obj)) {
      return true;
    }

    return false;
  }

  /**
     * Get a nested property with a certain value from the object passed in.
     * @param {object} obj - The object being passed in.
     * @param {String} path - The path into the object.
     * @param {String} value - The value passed in.
     * @return {object} return object found.
     */
  // From https://github.com/remy/undefsafe/blob/master/lib/undefsafe.js
  getNestedProperty(obj, path, value) {
    var parts = path.split('.');
    var key = null;
    var type = typeof obj;
    var parent = obj;

    var star = parts.filter(function (_) { return _ === '*' }).length > 0;

    // we're dealing with a primitive
    if (type !== 'object' && type !== 'function') {
      return obj;
    } else if (path.trim() === '') {
      return obj;
    }

    key = parts[0];
    var i = 0;
    for (; i < parts.length; i++) {
      key = parts[i];
      parent = obj;

      if (key === '*') {
        // loop through each property
        var prop = '';

        for (prop in parent) {
          var shallowObj = this.getNestedProperty(obj[prop], parts.slice(i + 1).join('.'), value);
          if (shallowObj) {
            if ((value && shallowObj === value) || (!value)) {
              return shallowObj;
            }
          }
        }
        return undefined;
      }

      obj = obj[key];
      if (obj === undefined || obj === null) {
        break;
      }
    }

    // if we have a null object, make sure it's the one the user was after,
    // if it's not (i.e. parts has a length) then give undefined back.
    if (obj === null && i !== parts.length - 1) {
      obj = undefined;
    } else if (!star && value) {
      key = path.split('.').pop();
      parent[key] = value;
    }
    return obj;
  }

  /**
     * Rename a propert within an object passed in.
     * @param {object} obj - The object being passed in.
     * @param {String} sourcePropName - Source property name.
     * @param {String} destinationPropName - Destination property name.
     * @return {object} return object with the updated property name.
     */
  rename(obj, sourcePropName, destinationPropName) {
    if (!_.isUndefined(obj) && _.isUndefined(obj[destinationPropName]) && !_.isUndefined(obj[sourcePropName])) {
      obj[destinationPropName] = obj[sourcePropName];
      delete obj[sourcePropName];
    }
    return obj;
  }
}

angular.module('shopperTrak.utils', [])
  .service('ObjectUtils', ObjectUtils)

ObjectUtils.$inject = [];