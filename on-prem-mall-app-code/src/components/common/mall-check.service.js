class MallCheckService {
  constructor (ObjectUtils) {
    this.ObjectUtils = ObjectUtils;
    this.exclusionList = ['mall'];
  }

  /**
   * This function checks if an organization, site or zone is a mall or not.
   * Return true if its not a mall otherwise false.
   * 
   * @param {object} orgOrSite parameter passed in
   * @param {object} zone parameter passed in
   * @return {bool} true or false
   */  
  isNotMall (orgOrSite, zone) {
    if (this.ObjectUtils.isNullOrUndefined(orgOrSite)) {
      return false;
    }

    //Check to see that the organisation is a retail organisation.
    if ('portal_settings' in orgOrSite) {
      //organisation
      if (this.ObjectUtils.isNullOrUndefined(orgOrSite.portal_settings) ||
        this.ObjectUtils.isNullOrUndefined(orgOrSite.portal_settings.organization_type)) {
        return false;
      }

      const organization_type = orgOrSite.portal_settings.organization_type;

      if (this.ObjectUtils.isNullOrUndefined(organization_type)) {
        return false;
      }
        
      return !this.isOrgExcluded(organization_type);
    } else if ('type' in orgOrSite) {
      //site
      //assuming that sites have zones
      if (!this.ObjectUtils.isNullOrUndefined(zone) && !this.ObjectUtils.isNullOrUndefined(zone.type)) {
        const zoneType = zone.type.toLowerCase();
        if (zoneType === 'tenantcommon') {
          return true;
        }
      }

      if (this.ObjectUtils.isNullOrUndefined(orgOrSite.type)) {
        return false;
      } 
        
      return !this.isOrgExcluded(orgOrSite.type);   
    } 
      
    return false;

  }

  /**
   * This function checks if the type of org is excluded or not,
   * based on an exclusion list.
   * 
   * @param {type} type of org parameter passed in
   * @return {bool} true or false
   */  
  isOrgExcluded (type) {
    const invalidIndex = -1;
    //view not allowed for mall so far...
    const orgType = type.toLowerCase();
    const index = this.exclusionList.indexOf(orgType);
    return index > invalidIndex;
  }

  /**
   * This function checks if the org object has custom tags setup in it.
   * 
   * @param {anOrg} anOrg object parameter passed in
   * @return {bool} true or false
   */  
  hasCustomTags (anOrg) {
    if (this.ObjectUtils.getNestedProperty(anOrg, 'custom_tags.length')) {
      return anOrg.custom_tags.length > 0;
    } 
      
    return false;

  }

  /**
   * This function checks if the org object has hierarchy tags setup in it.
   * 
   * @param {anOrg} anOrg object parameter passed in
   * @return {bool} true or false
   */
  hasHierarchyTags (anOrg) {
    if (this.ObjectUtils.getNestedProperty(anOrg, 'portal_settings.group_structures')) {
      return anOrg.portal_settings.group_structures.length > 0;
    }  
    return false;
    
  }

  /**
   * This function checks if the org object has custom or hierarchy tags setup in it.
   * 
   * @param {anOrg} anOrg object parameter passed in
   * @return {bool} true or false
   */
  //Wrapper function that checks if the org has Hierarchy or CustomTags.
  hasTags (anOrg) {
    return this.hasCustomTags(anOrg) || this.hasHierarchyTags(anOrg);
  }
}

angular.module('shopperTrak')
  .service('MallCheckService', MallCheckService);

MallCheckService.$inject = [
  'ObjectUtils'];
