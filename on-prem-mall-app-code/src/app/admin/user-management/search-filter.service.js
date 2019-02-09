'use strict';

angular.module('shopperTrak').filter('searchFilter', SearchFilter);

function SearchFilter(ObjectUtils) {
  return function(input, searchTerm) {
    if(!ObjectUtils.isNullOrUndefined(searchTerm) && searchTerm !== '') {
      var filteredList = [];
      searchTerm = searchTerm.toLowerCase();

      _.each(input, function(item) {
        var found = false;

        if(!ObjectUtils.isNullOrUndefined(item.username) &&
          item.username.toLowerCase().indexOf(searchTerm) !== -1 &&
          found === false) {
          found = true;
          filteredList.push(item);
        }

        if(!ObjectUtils.isNullOrUndefined(item.fullname) &&
          item.fullname.toLowerCase().indexOf(searchTerm) !== -1 &&
          found === false) {
          found = true;
          filteredList.push(item);
        }
      });

      return filteredList;
    } else {
      return input;
    }
  };
}