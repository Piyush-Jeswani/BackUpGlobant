$(document).ready(function() {var formatter = new CucumberHTML.DOMFormatter($('.cucumber-report'));formatter.uri("Dashboard/Dashboard-Properties.feature");
formatter.feature({
  "line": 1,
  "name": "Dashboard Profile",
  "description": "",
  "id": "dashboard-profile",
  "keyword": "Feature"
});
formatter.before({
  "duration": 20127326107,
  "status": "passed"
});
formatter.scenario({
  "comments": [
    {
      "line": 46,
      "value": "# https://quantcast.testrail.net/index.php?/tests/view/167"
    }
  ],
  "line": 48,
  "name": "(Please refer to TestRail for further details):",
  "description": "",
  "id": "dashboard-profile;(please-refer-to-testrail-for-further-details):",
  "type": "scenario",
  "keyword": "Scenario",
  "tags": [
    {
      "line": 47,
      "name": "@smokedev"
    }
  ]
});
formatter.step({
  "comments": [
    {
      "line": 49,
      "value": "#Precondition steps:"
    }
  ],
  "line": 50,
  "name": "I am logged into Quantcast Measure with a valid user and password",
  "rows": [
    {
      "cells": [
        "Santonelli@quantcast.com",
        "Quantesting"
      ],
      "line": 51
    }
  ],
  "keyword": "Given "
});
formatter.step({
  "line": 53,
  "name": "I navigate to the site profile page through url",
  "rows": [
    {
      "cells": [
        "androidcentral.com"
      ],
      "line": 54
    }
  ],
  "keyword": "When "
});
formatter.step({
  "line": 55,
  "name": "I click on the view wheel icon dropdownk",
  "keyword": "And "
});
formatter.step({
  "line": 56,
  "name": "I click the Impersonate option",
  "keyword": "And "
});
formatter.step({
  "line": 57,
  "name": "I navigate to the Dashboard",
  "keyword": "When "
});
formatter.step({
  "line": 58,
  "name": "I will land in the Dashboard as though I were the \u003cprofile\u003e\u0027s publisher",
  "keyword": "Then "
});
formatter.step({
  "comments": [
    {
      "line": 61,
      "value": "#Scenario\u0027s steps, the four steps mentioned below are already covered in precendition steps"
    },
    {
      "line": 62,
      "value": "#Given I am logged into Quantcast Measure with a valid \u003cuser\u003e and \u003cpassword\u003e"
    },
    {
      "line": 63,
      "value": "#And  I am at my Dashboard"
    },
    {
      "line": 64,
      "value": "#And   I have added a Site property"
    },
    {
      "line": 65,
      "value": "#And   my property is active"
    }
  ],
  "line": 66,
  "name": "I hover over my property\u0027s container",
  "keyword": "And "
});
formatter.step({
  "line": 67,
  "name": "I click the Edit Setting wheel icon",
  "keyword": "When "
});
formatter.step({
  "line": 68,
  "name": "I will navigate to my site\u0027s Settings edition page",
  "rows": [
    {
      "cells": [
        "Quantcast - Settings"
      ],
      "line": 69
    }
  ],
  "keyword": "When "
});
formatter.match({
  "location": "Test_Steps.i_am_logged_into_Quantcast_Measure_with_a_valid_user_and_password(DataTable)"
});
formatter.result({
  "duration": 12471538552,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_navigate_to_the_site_profile_page_through_url(DataTable)"
});
formatter.result({
  "duration": 8513045044,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_click_on_the_view_wheel_icon_dropdownk()"
});
formatter.result({
  "duration": 314585612,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_click_the_Impersonate_option()"
});
formatter.result({
  "duration": 7089001798,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_navigate_to_the_Dashboard()"
});
formatter.result({
  "duration": 7245504540,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_will_land_in_the_Dashboard_as_though_I_were_the_profile_s_publisher()"
});
formatter.result({
  "duration": 34990,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_hover_over_my_property_s_container()"
});
formatter.result({
  "duration": 20370698616,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_click_the_Edit_Setting_wheel_icon()"
});
formatter.result({
  "duration": 8122895028,
  "status": "passed"
});
formatter.match({
  "location": "Test_Steps.i_will_navigate_to_my_site_s_Settings_edition_page(DataTable)"
});
formatter.result({
  "duration": 61800442,
  "status": "passed"
});
formatter.after({
  "duration": 746613477,
  "status": "passed"
});
});