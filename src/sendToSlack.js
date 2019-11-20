const fetch = require('node-fetch');
//const moment = require('moment');

require('dotenv').config()

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
        console.log('response number 2', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver slack id', json[0].slack.id)
        resolve({
          approverId: json[0].slack.id,
        })
      })
  })
}

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
        console.log('response', response.statusText)
        return response.json();
      })
      .then(json => {
        console.log('approver name, ', json[0].finance[0].name, ' requester id, ', json[0].slack.id)
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

module.exports = {
  sendSlackMessage: (details) => {
    console.log(details);
    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo, uuid } = details

    console.log(`${emailAddress} wants £${cost} for ${reason}`)

    const person = emailAddress.split('@')[0]

    return new Promise((resolve, reject) => {
      console.log('trying to send');

      console.log('people api call')

      peopleApiCall(person)
        .then(result => {

          console.log(result)

          const messageForRequester = {
            text: `:corn: Hi ${result.requesterName}, your approver ${result.approverName} has received your request.`,
            channel: `${result.requesterId}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:corn: Hi ${result.requesterName}, your approver ${result.approverName} has received your request.`,
                },
              }
            ]
          }

          const messageForApprover = {
            // change back to result.approverId
            channel: 'UDW1KUF6H',
            text: `:corn: Hi ${result.approverName}, you have a new TTC request ${uuid} from ${result.requesterName}`,
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `:corn: Hi ${result.approverName}, you have a new TTC request ${uuid} from ${result.requesterName}`
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

          const url = "https://slack.com/api/chat.postMessage"

          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForApprover)
          })
            .then(response => {
              console.log('response for approver', response.data)
              return resolve(response)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })

          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`
            },
            body: JSON.stringify(messageForRequester)
          })
            .then(response => {
              console.log('response for requester', response.data)
              return resolve(response)
            })
            .catch(err => {
              console.log(err)
              return reject(err)
            })
        })
    })
  }
}