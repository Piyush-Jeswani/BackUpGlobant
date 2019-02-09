const login = require('../pages/login.js');
const admin = require('../pages/components/admin-tool-widget.js');
const nav = require('../pages/components/nav-header.js');
const users = require('../data/users');
const orgData = require('../data/orgs.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const apiCall = require('../pages/api-calls.js');


module.exports = {
  orgAdminUserCreationAndUsage() {
    /*
    *   Pre-requisite: Atleast 2 Tags should be present in North Face with site : 01 North Face - San Francisco
    *
    */

    describe('As a Org Admin user create a new org user for North Face, add Tags, Sites and Validate', () => {


      it('API Call : Create a Tag 1', (done) => {
        login.getToken(async (token) => {
          let response = await apiCall.createNewTag(token, orgData.MSRetailOrg.tag1Name, orgData.MSRetailOrg.tag1Value, orgData.MSRetailOrg.id);
          console.log("response :: " + response);
          if(JSON.stringify(response).includes('StatusCodeError') == false) {
            let json = JSON.parse(response);
            let tagnames = json["result"][0]["custom_tags"];
            for (let key in tagnames) {
              if (tagnames[key]["name"] == orgData.MSRetailOrg.tag1Name) {
                apiCall.specParams.tag1Id = tagnames[key]["_id"];
              }
            }
          }
        })
        done();
      });

      it('API Call : Add Site to Tag 1', (done) => {
        login.getToken(async (token) => {
          let response, json;
          for (let data of orgData.MSRetailOrg.tag1SiteId) {
            response = await apiCall.addSiteToTag(token, apiCall.specParams.tag1Id, orgData.MSRetailOrg.id, data);
            json = JSON.stringify(response);
          }
        })
        done();
      });


      it('API Call : Create a Tag 2', (done) => {
        login.getToken(async (token) => {
          let response = await apiCall.createNewTag(token, orgData.MSRetailOrg.tag2Name, orgData.MSRetailOrg.tag2Value, orgData.MSRetailOrg.id);
          console.log("response :: " + response);
          if(JSON.stringify(response).includes('StatusCodeError') == false) {
            let json = JSON.parse(response);
            let tagnames = json["result"][0]["custom_tags"];
            for (let key in tagnames) {
              if (tagnames[key]["name"] == orgData.MSRetailOrg.tag2Name) {
                apiCall.specParams.tag1Id = tagnames[key]["_id"];
              }
            }
          }
        })
        done();
      });

      it('API Call : Add Site to Tag 2', (done) => {
        login.getToken(async (token) => {
          let response, json;
          for (let data of orgData.MSRetailOrg.tag2SiteId) {
            response = await apiCall.addSiteToTag(token, apiCall.specParams.tag1Id, orgData.MSRetailOrg.id, data);
            json = JSON.stringify(response);
          }
        })
        done();
      });

      it('Validate the landing page to be Traffic on North Face', () => {
        browser.waitForAngular();
        admin.getLandingPageHeader().then(text => {
          expect(text).toBe(orgData.MSRetailSite.testSiteName);
        });
        browser.waitForAngular();
        admin.getLandingPageTitle().then(text => {
          expect(text).toBe(admin.specParams.siteLandingPageTitle);
        });
      });

      it('Navigate to the Admin Dashboard', () => {
        admin.navigateTo('Admin');
      });

      it('Navigate to users tab and create a new Org User', () => {
        admin.navigateToUsersTab().then(() => {
          admin.searchUserInUserTab(users.orgSuperUser);
          admin.clickAddNewUser();
          admin.enterNewUserDetails(users.orgUser);
          admin.toggleOffApplyFullAccess();
        });
      });

      it('Select Custom Tag from the Custom Tags Available list', () => {
        admin.selectCustomTags(1);
        admin.selectCustomTags(1);
      });

      it('Remove Custom Tag from the Chosen Custom Tags list', () => {
        admin.removeCustomTags(1);
      });

      it('Select Site at first row', () => {
        admin.selectSiteByIndex(0);
      });

      it('Click on Save User', () => {
        admin.clickSaveUser();
        admin.clickCancel();
      });

      it('Navigate to users tab and search the newly created user', () => {
        admin.navigateToUsersTab();
        admin.searchUserInUserTab(users.orgUser);
      });

      it('Validate the Org User and its access to one site only', () => {
        admin.getOrgUserFullname().then(text => {
          expect(text).toBe(users.orgUser.fullname);
        });
        admin.getOrgUserName().then(text => {
          expect(text).toBe(users.orgUser.userName);
        });
        admin.getOrgUserAccess().then(text => {
          expect(text).toBe(admin.specParams.userAccessFlagOneSite);
        });
        admin.getOrgUserRole().then(text => {
          expect(text).toBe('-');
        });
      });

      it('Click on the Edit User icon on the right', () => {
        admin.clickEditUser();
      });

      it('Select All Sites', () => {
        admin.selectAllSites();
      });

      it('Get All Sites Count', () => {
        admin.getSiteCountFromTable().then(text => {
          admin.setParamSiteCount(text);
        });
      });

      it('Click on Save User', () => {
        admin.clickSaveUser();
        admin.clickCancel();
      });

      it('Navigate to users tab and search the newly created user', () => {
        admin.navigateToUsersTab();
        admin.searchUserInUserTab(users.orgUser);
      });

      it('Validate the Org user details from the users table', () => {
        admin.getOrgUserFullname().then(text => {
          expect(text).toBe(users.orgUser.fullname);
        });
        admin.getOrgUserName().then(text => {
          expect(text).toBe(users.orgUser.userName);
        });
        admin.getOrgUserAccess().then(text => {
          expect(text).toBe(`${admin.specParams.userAccessFlagAllSite}${admin.specParams.siteCount}`);
        });
        admin.getOrgUserRole().then(text => {
          expect(text).toBe('-');
        });

      });

      it('Delete the Org user', () => {
        admin.deleteOrgUSer();
      });

    });

    describe('As an Org Admin User rename any KPI from the KPI Library', () => {

      it('Navigate to the Admin Dashboard', () => {
        admin.navigateTo('Admin');
      });

      it('Navigate to KPI tab and edit one of the KPIs', () => {
        admin.navigateToKPILibraryTab()
          .then(() => {
          browser.sleep(2000)
          }).then(() => {
            admin.editKPIByIndex(1)
          }).then(() => {
            admin.setKPIUIName(admin.specParams.kpiUINameEditted)
          }).then(() => {
            admin.clickSaveKPIButton()
          }).then(() => {
            browser.sleep(2000);
          });
        });

      it('Navigate to the Analytics Dashboard', () => {
        admin.navigateTo('Analytics');
      });

      it('Validate the KPIs ', () => {
        expect(admin.validatePowerHoursKPI(admin.specParams.kpiUINameEditted)).toBe(true);
        expect(admin.validateDailyAveragesKPI()).toContain(admin.specParams.kpiUINameEditted);
        expect(admin.validateOrganisationSummaryKPI(admin.specParams.kpiUINameEditted)).toBe(true);
      });

      it('Navigate to the Admin Dashboard', () => {
        admin.navigateTo('Admin');
      });

      it('Navigate to KPI tab', () => {
        admin.navigateToKPILibraryTab().then(() => {
          browser.sleep(2000);
        });
      });

      it('Restore the old KPI name', () => {
        admin.editKPIByIndex(1).then(() => {
        }).then(() => {
          admin.clearKPIUIName();
        }).then(() => {
          admin.clickSaveKPIButton();
        });
      });

      it('API Test : Delete Tag 1', (done) => {
        login.getToken(async (token) => {
          let doIt =  await apiCall.deleteTag(token,orgData.MSRetailOrg.tag1Value, orgData.MSRetailOrg.id);
        });
        done();
      });

      it('API Test : Delete Tag 2', (done) => {
        login.getToken(async (token) => {
          let doIt =  await apiCall.deleteTag(token,orgData.MSRetailOrg.tag2Value, orgData.MSRetailOrg.id);
        });
        done();
      });

      it('Logout of the Application', () => {
        nav.logout();
      });
    });
  },

  tagBasedOrgUserCreationAndUsage() {

    describe('As a Super User create a new org user for Belk Administration add Tag and validate access based on it', () => {

      it('API Call : Create a new Tag', (done) => {
        login.getToken(async (token) => {
          let response = await apiCall.createNewTag(token, users.belkorgUser.tag1Name, users.belkorgUser.tag1Value, users.belkorgUser.orgId);
          console.log("response :: " + response);
          if(JSON.stringify(response).includes('StatusCodeError') == false) {
            let json = JSON.parse(response);
            let tagnames = json["result"][0]["custom_tags"];
            for (let key in tagnames) {
              if (tagnames[key]["name"] == users.belkorgUser.tag1Name) {
                apiCall.specParams.tag1Id = tagnames[key]["_id"];
              }
            }
          }
        })
        done();
      });

      it('API Call : Add Site to Tag', (done) => {
        login.getToken(async (token) => {
          let response, json;
          for (let data of users.belkorgUser.tag1SiteId) {
            response = await apiCall.addSiteToTag(token, apiCall.specParams.tag1Id, users.belkorgUser.orgId, data);
            json = JSON.stringify(response);
          }
        })
        done();
      });

      it('Navigate to the Admin Dashboard', () => {
        admin.navigateTo('Admin');
      });

      it('Navigate to Organization Management', () => {
        admin.clickOrganizationManagement().then(flag => {
          expect(flag).toBe(true);
          browser.waitForAngular();
        });
      });

      it('Search Belk Administration and click on edit', () => {
        admin.enterOrgNameInSearchBox(users.belkorgUser.organization).then(val => {
          expect(val).toBe('Belk Administration');
          browser.sleep(2000);
        });
        admin.editOrganization();
      });

      it('Navigate to users tab and create a new Org User', (done) => {
        admin.navigateToUsersTab().then(() => {
          admin.searchUserInUserTab(users.orgSuperUser);
          admin.clickAddNewUser();
          admin.enterNewUserDetails(users.belkorgUser);
          admin.toggleOffApplyFullAccess();
          browser.sleep(3000);
          done();
        });
      });

      it('Select Custom Tag from the Custom Tags Available list', () => {
        admin.selectCustomTagByName(users.belkorgUser.tag1);
      });

      it('Click on Save User', () => {
        admin.clickSaveUser();
        admin.clickCancel();
      });

      it('Logout of the application and login using the newly created org user', () => {
        nav.logout();
        login.loginAsUser(users.belkorgUser);
      });

      it('Validate the landing page to be Belk Administration', () => {
        admin.getLandingPageHeader().then(text => {
          expect(text).toBe(users.belkorgUser.organization);
        });
        browser.waitForAngular();
        admin.getLandingPageTitle().then(text => {
          expect(text).toBe('RETAIL ORGANIZATION SUMMARY');
        });
      });

      it('Validate that the user can see the list of sites corresponding to the assigned tag', () => {
        admin.getSiteCount().then(count => {
          expect(count).toBe(6);
        });
        admin.validateAllSites().then(text => {
          expect(text).toEqual(users.belkorgUser.tag1Sites);
        })
      });

      it('validate the presence of applied tag in the filter section on the landing page', () => {
        admin.clickFilters().then(() => {
          expect(admin.validateTagInFilters()).toContain(users.belkorgUser.tag1Value);
        })
      });

      //ToDo : Revisit the test after PR for SA-3577 is merged
      // it('Apply filter and validate the UI for changes', () => {
      //   admin.clickTag1DropDown().then(() => {
      //     return admin.clickTag1DropDownValue();
      //   }).then(() => {
      //     return admin.clickApplyFilter();
      //   }).then(() => {
      //     return browser.sleep(5000);
      //   }).then(() => {
      //     return expect(admin.getFilterSiteCount()).toBe(users.belkorgUser.sitescount);
      //   }).then(() => {
      //     return admin.clickClearFilter();
      //     })
      // });

      describe('Navigate to each site in the Tag and validate it Export Current View functionality', () => {
        users.belkorgUser.tag1Sites.forEach(data => {

          it(`Navigate to ${data} site`, (done) => {
            admin.navigateToSite(data).then(() => {
              expect(admin.getLandingPageHeader()).toBe(data);
            })
            done()
          });

          it('Add first three widgets to exports', (done) => {
            admin.clickAddToExportByWidgetIndex(0);
            admin.clickAddToExportByWidgetIndex(1);
            done();
          });

          it('click on Export Selected dropdown link', (done) => {
            admin.clickExportPDFButton();
            expect(admin.validateWidgetCountOnExportSelectedButton()).toBe('(2)');
            admin.clickExportSelected();
            done();
          });

          it('Validate the PDF Export Page', (done) => {
            expect(admin.validateExportWidgetList()).toEqual(users.belkorgUser.widgetList);
            done();
          });

          it('Clear the Export nd navigate back', (done) => {
            admin.clickClearExportButtonOnExportPDFPage()
              .then(() => {
                admin.clickBackButtonOnExportPDFPage();
              })
            done();
          });

          it('Navigate back to Organization Summary', (done) => {
            admin.navigateToSite('← Organization Summary')
              .then(() => {
                browser.waitForAngular();
              })
            done();
          });
        })
      })

      it('Logout of the application and login using the newly created org user', () => {
        nav.logout();
        login.loginAsSuperUser();
      });

      it('Navigate to the Admin Dashboard', () => {
        admin.navigateTo('Admin');
      });

      it('Navigate to the User Management Dashboard', () => {
        admin.clickUserManagement();
      });

      it('Search the newly created Org User', () => {
        admin.enterUserNameInSearchBox(users.belkorgUser);
      });

      it('Delete the Org user', () => {
        admin.deleteNewlyCreatedUser();
      });

      it('API Test : Delete the new Tag', (done) => {
        login.getToken(async (token) => {
          let doIt =  await apiCall.deleteTag(token,users.belkorgUser.tag1Value,users.belkorgUser.orgId);
        });
        done();
      });
    });
  },

};
