const express = require('express')
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const port = process.env.PORT
app.use(bodyParser.urlencoded({ extended: false }))
// const fetch = require('node-fetch')
const { WebhookClient } = require('dialogflow-fulfillment');
// var intent = request.body;

// app.post("/hello", (request, response) => {
//     const _agent = new WebhookClient({ request, response });
app.post("/webhook", function (request, response) {
    const _agent = new WebhookClient({ request, response })
    console.log("body is ", request.body)


    function welcome(agent) {
        agent.add('Hi, I am your weather assistant, kindly provide your city name enabling me to check current weather condition')
    }


    // switch (request.body.queryResult.intent.displayName) {
    //     case 'Default Welcome Intent':
    //         response.send({
    //             fulfillmentText: 'welcome intent trigered'
    //         })
    //         break
    //     default:
    //         response.send({
    //             fulfillmentText: "default triggerred"
    //         })
    // console.log(`Servier is running`)

    function showWeather(agent) {
        var city = agent.parameters.City;
        console.log(city)
        agent.context.set({
            'name': 'cityName',
            'lifespan': 5,
            'parameters': {
                uCity: agent.parameters.City,
            }
        });
        return new Promise((resolve, reject) => {
            var newRequest = require('request');
            newRequest(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0f7c8b20f4669c9b103c7b80a2ec1e78`, function (error, response, body) {
                console.log("agent.context", agent.context, "body near context is ", body)
                if (!error) {

                    var data = JSON.parse(body)
                    var wDescription = data.weather[0].description;
                    var humid = data.main.humidity
                    var temperature = data.main.temp
                    console.log("data is", data)
                    console.log("descriptoin is ", wDescription)
                    console.log("humidity is ", humid)
                    console.log("Temperatore is ", temperature)

                    agent.add(`weather is ${wDescription}, with humidity of ${humid} % in ${city}`)
                    resolve();
                } else (error) => {
                    console.log("error is ", error)
                    agent.add(`Error in server`)
                    reject()
                }
            })
        })

    }


    function rain(agent) {

        agent.context.get('cityName')
        var uCity = agent.context.uCity;
        console.log(uCity, "uCity in context is")
        return new Promise((resolve, reject) => {
            var newRequest = require('request');
            newRequest(`https://api.openweathermap.org/data/2.5/weather?q=${uCity}&appid=0f7c8b20f4669c9b103c7b80a2ec1e78`, function (error, response, body) {
                var data = JSON.parse(body)
                var eRain = data.rain;
                console.log("eRain is", eRain)
                if (!error && !eRain) {
                    agent.add(`Rain is not expected in ${uCity}`)
                    // var temperature = data.main.temp
                    // console.log("Temperatore is ", temperature)
                    resolve();
                } else if (eRain) {
                    agent.add(`Rain is expected in XXX hours`)
                }
                else (error) => {
                    console.log("error is ", error)
                    agent.add(`Error in server`)
                    reject()
                }
            })
        })
        // agent.add(`test`)
    }


    // let city = agent.context.parameters.City,

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Show Weather", showWeather);
    intentMap.set("rain", rain);


    _agent.handleRequest(intentMap);
}


)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))