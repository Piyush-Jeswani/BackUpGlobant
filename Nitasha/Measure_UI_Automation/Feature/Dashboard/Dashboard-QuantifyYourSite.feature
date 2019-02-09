Feature: Dashboard- Quantify your site

@smoke
Scenario: I login with valid credential on a profile page and I can upload mobile app and can delete it.
Given I am logged into Quantcast Measure with a valid user and password
| Santiago.Antonelli@globant.com | Automation765890 |
And I click the ADD PROPERTY button
And I click the Add Mobile app option from the displayed menu
And I navigate to the Submit Your mobile app
And I enter the appname of my mobile app to be quantified
| TBD |
And I select underThirteen? in the underThirteen Mobile radio button
| Yes |
And I click the SUBMIT button
And I navigate to the ""Your SDK"" page
When I click the I've installed the SDK button
Then I navigate back to my Dashboard
And the new mobile app property appears with app_name in the container and the "Waiting" label in yellow
| TBD |
And upon hovering over the container it will get greyed out and display the ""Download SDK"" button
And I click the Edit Setting wheel icon
And I navigate to the mobile app's setting page
When click the Delete Mobile App button and I confirm the warning modal
Then the mobile app property is deleted and its container removed from my Dashboard


@smoke
Scenario: I login with valid credential on a profile page and I can upload website and can delete it.
Given I am logged into Quantcast Measure with a valid user and password
| Santiago.Antonelli@globant.com | Automation765890 |
And I click the ADD PROPERTY button
And I click the Add Website option from the displayed menu
And I navigate to the Submit Your Site page
And I enter valid url of a valid site
And I select underThirteen? in the underThirteen website radio button
| Yes |
And I click the site SUBMIT button
And I navigate to the Add Tag page
When I click the "I've added my tag" button
Then I navigate back to my Dashboard
And the new property appears with url in the container and the "Waiting" label in yellow
And I have NOT added the tag to my site
And I hover over my property's container
When I click the Trash delete icon
Then the site property is deleted and its container removed from my Dashboard
