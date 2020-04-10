/* eslint-disable */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const promisePoller = require('promise-poller');
const index = google.gmail('v1');
const conf = require('../../conf');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname,'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');


function getEmail(email) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  return  promisePoller.default({
    taskFn: () => authorize(JSON.parse(content), getRecentEmail, email),
    interval: conf.timeout.email.interval,
    retries: conf.timeout.email.retries
  });

}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {...} args The callback to call with the authorized client.
 */
function authorize(credentials, callback, ...args) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0],
  );

  // Check if we have previously stored a token.
  const token = fs.readFileSync(TOKEN_PATH);
  if (!token) return getNewToken(oAuth2Client, callback);
  oAuth2Client.setCredentials(JSON.parse(token));
  return callback(oAuth2Client, ...args);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getMessage(params) {
  return index.users.messages.get(params)
      .then((response) => {
        message_raw = response.data.payload.parts[0].body.data;
        buff = new Buffer.from(message_raw, 'base64');
        return buff.toString()
      })
}

/**
 * Get the recent email from your Gmail account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {String} email
 */
function getRecentEmail(auth, email) {
  // Only get the recent email - 'maxResults' parameter
  return index.users.messages.list({ auth, userId: 'me', maxResults: 1, q: `to:${email}` })
      .then((response) => getMessage({ auth, userId: 'me', id: response.data.messages[0].id}))
      .then((email) => {
        logger.debug(`Get Email:\n${email}`);
        return email
      })
}

module.exports = {
  getEmail
};
