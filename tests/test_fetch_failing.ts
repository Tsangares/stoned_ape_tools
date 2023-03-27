fetch("https://np.ironhelmet.com/api", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://np.ironhelmet.com/game/%7Bgame_number%7D",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "game_number={game_number}&api_version=0.1&code={apikey}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});