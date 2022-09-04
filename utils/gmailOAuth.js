// require('dotenv').config()
// const { google } = require('googleapis')

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GMAIL_REDIRECT_URL
// )

// // Generate a url that asks permissions for Gmail scopes
// const GMAIL_SCOPES = [
//   'https://mail.google.com/',
//   'https://www.googleapis.com/auth/gmail.modify',
//   'https://www.googleapis.com/auth/gmail.compose',
//   'https://www.googleapis.com/auth/gmail.send',
// ]

// const url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: GMAIL_SCOPES,
// })

// // console.info(`authUrl: ${url}`)

// // const myUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com%2F%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.compose%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&response_type=code&client_id=635007107507-ht55d9pklvjhhl683tji81bq236qk58v.apps.googleusercontent.com&redirect_uri=http%3A%2F%2F127.0.0.1%3A9809%2Fapi%2Fv1%2Fauth%2FgoogleRedirect`

// // Replace with the code you've got on
// const code =
//   '4/0AdQt8qjFizeGM2Zg6KXqCkJGXV3VNyixXWTk14uhsTiD68N2awc_Vb477rtQ29zfVAjpqA'

// const getToken = async () => {
//   const { tokens } = await oauth2Client.getToken(code)
//   console.info(tokens)
// }
// getToken().catch(() => {})

// {
//   access_token: 'ya29.a0AVA9y1untXU3zHQmjajTwnAxf2SAvm08mqxnfucmt1Tv-85_gTeHGSGPfmpDKfc8bkTZkCzo1uK55HryGEPkYVcO3ypDBvlFz0e6QIXREVDDee5VZecznZnAu_BPshwC9tdKrAL6Xs47xnRjUgax74fxRonsaCgYKATASAQASFQE65dr8Y9-Xk8VJIEhmnstCL8EhfA0163',
//   refresh_token: '1//03uyFfAATYVRxCgYIARAAGAMSNwF-L9IrDzv4HwCAI11yin2qCDdAHuFdhLwJd6rj0Sh-lTjQt2JosK8DU6OQB_lEA4pXQI4zB_g',
//   scope: 'https://mail.google.com/ https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify',
//   token_type: 'Bearer',
//   expiry_date: 1662323582025
// }
