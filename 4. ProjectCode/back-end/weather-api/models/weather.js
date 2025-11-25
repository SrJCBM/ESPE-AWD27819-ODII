const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
    temperature: Number,
    description: String,
    humidity: Number,
    wind_speed: Number,
    date_observed: String,
    weather_source: String
});

module.exports = mongoose.model("Weather", weatherSchema);
