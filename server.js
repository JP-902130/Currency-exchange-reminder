const express = require("express");
const app = express();
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

const fire_message_with_twilio = async (phone_number, CNY_rate) => {
  try {
    const message = await client.messages.create({
      body: `Today's exchange rate is ${CNY_rate}! This is lower than the barrier. Please consider to transfer money!`,
      from: process.env.SENDER_PHONE_NUMBER,
      to: phone_number,
    });
    console.log("Sending Succeeds!");
  } catch (e) {
    console.log(e);
  }
};

app.get("/", (req, res) => {
  var dayInMilliseconds = 1000 * 60 * 60 * 24;
  const send_sms = async () => {
    var all_countries_currencies = {};

    try {
      const res = await fetch(process.env.EXCHANGE_RATE_APIKEY);
      const data = await res.json();
      all_countries_currencies = data.conversion_rates;
      const CNY_rate = all_countries_currencies.CNY;
      if (CNY_rate >= 6.1) {
        console.log(
          "The rate is higher than the boundary, no msg being sent to the phone!"
        );
        return;
      } else {
        console.log(
          "The rate is lower than the boundary, the msg is sent to the phone!"
        );
      }
      await fire_message_with_twilio(
        process.env.RECEIVER_PHONE_NUMBER,
        CNY_rate
      );
    } catch (e) {
      console.log(e);
    }
  };
  setInterval(() => send_sms(), dayInMilliseconds);
  // send_sms();
});

app.listen(3000);
