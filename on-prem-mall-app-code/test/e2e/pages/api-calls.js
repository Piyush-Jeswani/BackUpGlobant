'use strict';

let apiBaseUrl = 'https://rdc-api-staging.shoppertrak.com/api/v1'; // default
const loadUtils = require('./common-utils/load-utils.js');
const rp = require('request-promise');


const mockAngularModule = {
  constant(key, value) {
    if (key === 'apiUrl') {
      apiBaseUrl = value;
    }
    return this;
  }
};
const mockContextWithAngular = {
  angular: {
    module() {
      return mockAngularModule;
    }
  }
};
loadUtils.resolveFileWithNewContext(`${__dirname}/../../../src/components/common/config.js`, mockContextWithAngular);

module.exports = {

  specParams: {
    tag1Id: '',
  },

  createNewTag: async (token, tagName, tagValue, orgId) => {
    let payload = {
      orgTagValues: [{"name": tagName}],
      orgTagType: tagValue
    };
    let options = {
      uri: `${apiBaseUrl}/organizations/${orgId}/custom-tags`,
      method: 'POST',
      headers: {
        'User-Agent': 'Request-Promise',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      auth: {
        'bearer': token
      },
      body: JSON.stringify(payload)
    };
    return await rp(options).then((response) => {
      return response;
    })
      .catch((err) => {
        console.log(`[Warning] : ${err}`);
        return err;
      })
  },


  addSiteToTag: async (token, tagId, orgId, siteId) => {
    let reqBody = {
      customTagId: [tagId]
    };
    let option = {
      uri: `https://rdc-api-staging.shoppertrak.com/api/v1/organizations/${orgId}/sites/${siteId}/custom-tags`,
      method: 'POST',
      headers: {
        'User-Agent': 'Request-Promise',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      auth: {
        'bearer': token
      },
      body: JSON.stringify(reqBody)
    };
    return await rp(option).then((body) => {
      return body;
    })
      .catch((err) => {
        console.log(`[Warning] : ${err}`);
        return err;
      })
  },


  deleteTag: async (token, tagValue, orgId) => {
    let options = {
      uri: `https://rdc-api-staging.shoppertrak.com/api/v1/organizations/${orgId}/custom-tags/${tagValue}`,
      method: 'DELETE',
      headers: {
        'User-Agent': 'Request-Promise',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      auth: {
        'bearer': token
      },
    };
    return await rp(options).then(function (response) {
      return response;
    })
      .catch((err) => {
        console.log(`[Warning] : ${err}`);
      })
  }





}
