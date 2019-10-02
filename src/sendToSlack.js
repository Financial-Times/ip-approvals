//const Slack = require('slack-node');
const fetch = require('node-fetch');
const moment = require('moment');

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
          requester: json[0].slack.id
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
    const { emailAddress, cost, reason, url, calendarYear, travelCost, additionalInfo } = details

    console.log(`${emailAddress} wants £${cost} for ${reason}`)

    const person = emailAddress.split('@')[0]

    // console.log('Calling People API')
    // const response = await peopleApiCall(person)

    // console.log("approver", response[0].finance[0].name, "slack id", response[0].slack.id)

    // const secondResponse = await peopleApiCall(response[0].finance[0].name)

    // console.log("approver's slack id", secondResponse[0].slack.id)

    // // hard-coded to Kate's Slack id but will use info above
    // const approver = response[0].slack.id

    // // also hard-coded to Kate's id
    // const requester = response[0].slack.id
    // // const requester = emailAddress;

    // const message = {
    //   "username": "Approvals Bot",
    //   "icon_emoji": "https://www.pngix.com/pngfile/big/0-7360_hand-holding-cash-money-hand-holding-money-png.png",
    //   "attachments": [
    //     {
    //       "fallback": "Approve button",
    //       "attachment_type": "default",
    //       "attachments": [{
    //         "text": "Approve"
    //       }],
    //       "callback_id": "123",
    //       "actions": [
    //         {
    //           "name": "approve",
    //           "type": "button",
    //           "text": "Approve",
    //           "style": "primary",
    //           "value": "yeeeee"
    //         },
    //         {
    //           "name": "deny",
    //           "type": "button",
    //           "text": "Deny",
    //           "style": "danger",
    //           "value": "hawwwwwwww"
    //         }
    //       ]
    //     }
    //   ],
    //   "text": "boooooo",
		// "channel": "U03E98JJN"
    // }

    return new Promise((resolve, reject) => {
      console.log('trying to send');

      console.log('people api call')

      peopleApiCall(person)
      .then(result => {

        console.log(result)

        const messageForRequester = {
          "username":"Mopsa", 
          "text":`:corn: Hi ${person}, your approver is ${result.approverName} they have received your request`,
          "channel": `${result.requester}`,
          "icon_emoji": ":corn:"
        }

        // angelique U03E70QNB

        // const messageForApprover = {
        //   "username":"Mopsa", 
        //   "text":`:corn: Hi ${approverName}, you have a new TTC request from ${result.requester}`,
        //   "channel": `${result.approverId}`,
        //   "icon_emoji": ":corn:"
        // }

        const messageForApprover = {
          "username":"Mopsa", 
          "text":`:corn: Hi Angelique, you have a new TTC request from ${person}`,
          "channel": 'U03E70QNB',
          "icon_emoji": ":corn:"
        }

        const url = 'https://hooks.slack.com/services/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'
  
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageForApprover)
        })
        .then(response => {
          console.log('response', response.statusText)
          return resolve(response)
        })
        .catch(err => {
          console.log(err)
          return reject(err)
        })

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageForRequester)
        })
        .then(response => {
          console.log('response', response.statusText)
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