const mongoose = require("mongoose"),
    schema = new mongoose.Schema({

        name: {
            type: String,
            required: true,
            unique: true
        },

        url: {
            type: String,
            required: true
        },

        frequency: {
            type: Number,
            required: true
        },

        deepLinks: {
            type: Number,
            default: 0
        },

        maxDeepLevel: {
            type: Number,
            default: 1
        },

        target: String,

        referer: [String],

        isRunning: {
            type: Boolean,
            default: false
        },

        timeout: {
            type: Number,
            default: 30
        },

        requestsForDay: {
            type: Number,
            default: 0
        },

        counters: {
            type: [String],
            default: []
        }

    });

module.exports = mongoose.model("Site", schema);