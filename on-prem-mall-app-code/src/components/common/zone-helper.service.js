class ZoneHelperService {
  constructor (ObjectUtils) {
    this.ObjectUtils = ObjectUtils;
	}

  /**
    * Removes any leading 'x' character from the target name.
		* Then it returns the resulting string.
    * @param {string} targetName the string passed in.
    * @returns {string} returns null if target name is not valid, otherwise
		* returns target string with prepended 'x' removed if it is there.
    */	
	removeLeadingX (targetName) {
		if (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(targetName)) {
			const firstCharacter = targetName.charAt(0);
			if (firstCharacter === 'x' && firstCharacter.toLowerCase()) {
				targetName = targetName.substring(1);
			}

			return targetName;			
		}

		return null;		
	}
}

angular
	.module('shopperTrak')
	.service('ZoneHelperService', ZoneHelperService);

ZoneHelperService.$inject = ['ObjectUtils'];
