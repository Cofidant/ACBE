const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

const fifteenMinutes = 15 * 60 * 1000
const thirtyMinutes = fifteenMinutes * 2
const twoHours = thirtyMinutes * 4
const twenty4hours = twoHours * 12
const threeDays = twenty4hours * 3
const thirtyDays = threeDays * 10

/**
 * Formats a Date to YYYY-MM-DD
 * @param {Date} date
 */
const formatYYYmmDD = (date) => {
  const dateArr = date.toLocaleDateString().split(' ')[0].split('/')
  return dateArr.reverse().join('-')
}

/**
 * Formats a date
 * @param {Date} date
 * @returns A string formatted date in MMM DD YYYY
 */
const formatMMMddYYYY = (date) => {
  let temp
  if (!(date instanceof Date)) {
    temp = new Date(date)
  }
  if (temp === 'Invalid Date') temp = new Date()
  return temp.toString().split(' ').slice(1, 4).join(' ')
}

module.exports = {
  fifteenMinutes,
  thirtyMinutes,
  twoHours,
  twenty4hours,
  threeDays,
  thirtyDays,
  formatYYYmmDD,
  formatMMMddYYYY,
  sleep,
}
