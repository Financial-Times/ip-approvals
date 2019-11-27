const fetch = require('node-fetch');
require('dotenv').config()

//once we have the approver name from the first api call (below) make another call to get their slack id
const secondPeopleAPIcall = (approver) => {
  approver = approver.replace(' ', '.')
  const peopleAPIurl = `https://ip-people.herokuapp.com/api/people/${approver}`
  const options = {
    method: 'GET',
    headers: {
      'apikey': process.env.PEOPLE_API_KEY
    }
  };

  return new Promise((resolve, reject) => {
    fetch(peopleAPIurl, options)
      .then(response => {
        console.log('peopleAPI response 2: ', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver slack id:' , json[0].slack.id)
        resolve({
          approverId: json[0].slack.id,
        })
      })
  })
}

//the first people api call defined here and run below gets the approver name from the requester's details.
//it calls in the secondPeopleAPI function defined above which gets the get the approvers slack id.
//at the end we have the four things we need: approverId, approverName, requesterId and requesterName
const peopleApiCall = (person) => {
  const peopleAPIurl = `https://ip-people.herokuapp.com/api/people/${person}`

  const options = {
    method: 'GET',
    headers: {
      'apikey': process.env.PEOPLE_API_KEY
    }
  };

  return new Promise((resolve, reject) => {
    fetch(peopleAPIurl, options)
      .then(response => {
        console.log('peopleAPI response 1: ', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver name is: ', json[0].finance[0].name, ' requester id is: ', json[0].slack.id)
        secondPeopleAPIcall(json[0].finance[0].name)
          .then(result => {
            resolve({
              approverId: result.approverId,
              approverName: json[0].finance[0].name,
              requesterId: json[0].slack.id,
              requesterName: json[0].name
            })
          })
      })
      .catch(err => {
        console.log(err)
        return reject(err)
      })
  })
}

//send slack messages to the requester and approvers containing details of the request
module.exports = {
  sendSlackMessage: (details) => {
    console.log('details of the request: ', details);
    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo, uuid } = details
    //person is the requester's email address before the @ symbol
    const person = emailAddress.split('@')[0]

    return new Promise((resolve, reject) => {
      console.log('trying to send');
      console.log('people api call');

      //make the peopleApi call, get the variables we need, then send the slack messages.
      peopleApiCall(person)
        .then(result => {

          console.log(result)

          const messageForRequester = {
            //text that appears in slack notification.
            text: `Hi ${result.requesterName}, your approver ${result.approverName} has received your new ${reason} request.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Booking url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
            channel: `${result.requesterId}`,
            //text that appears in slack message.
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Hi ${result.requesterName}, your approver ${result.approverName} has received your new ${reason} request.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
                },
              }
            ]
          }

          const messageForApprover = {
            //attention: if testing locally, change this user's slack id else result.approverId is sent to real budget approver.
            //to send to actual budget approver, use channel: result.approverId
            //to send to Jill, for example, use channel: `U03E98JJN`,
            channel: `U03E98JJN`,
            //channel: result.approverId,
            //text that appears in the slack notification
            text: `Hi ${result.approverName}, you have a new ${reason} request from ${result.requesterName}\n• Cost: £${cost}\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n\n• Url: ${url}• Additional info: ${additionalInfo}\n• Request id: ${uuid}`,
            // text that appears in the slack id
            
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `Hi ${result.approverName}, you have a new ${reason} request from ${result.requesterName}.\n• Cost: £${cost}\n• Travel/accomodation cost: £${travelCost}\n• Calendar year: ${calendarYear}\n• Url: ${url}\n• Additional info: ${additionalInfo}\n• Request id: ${uuid}`
                }
              },
              {
                "type": "actions",
                "block_id": "approvalblock",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Approve"
                    },
                    "style": "primary",
                    "value": "approve"
                  },
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Deny"
                    },
                    "style": "danger",
                    "value": "deny"
                  }
                ]
              }
            ]
          }
          //provide token and connect to slack to send messages
          const slackUrl = "https://slack.com/api/chat.postMessage"

          fetch(slackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForApprover)
          })
          .then(response => response.json())
          .then(data =>  {
              console.log('response for approver: ', data);
              return resolve(data)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })

          fetch(slackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForRequester)
          })
            .then(response => response.json())
            .then(data => 

            {
              console.log('response for requester', data)
              return resolve(data)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })
        })
    })
  }
}