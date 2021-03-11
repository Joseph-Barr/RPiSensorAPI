var express = require('express');
var router = express.Router();
var cors = require('cors')

const pool = require('../app').pool;
// POST sensor data
router.post('/add', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Connection Error: ' + err);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            });
            return;
        }; // Connection Error
        const timestamp = req.body.timestamp;
        const temperature = req.body.temperature;
        const humidity = req.body.humidity;

        const query = `
        INSERT INTO sensor_readings (timestamp, temperature, humidity)
        VALUES('${timestamp}', '${temperature}', '${humidity}');
        `
        // Use the connection
        connection.query(query, (error, results, fields) => {
            console.log(results);
            res.status(201).json({
                affectedRows: results.affectedRows,
                timestamp,
                temperature,
                humidity
            })

            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
        });
    });
});

/* GET lastest reading. This route has CORS enabled (as indicated by the middleware function)*/
router.get('/latest', cors(), function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Connection Error: ' + err);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            });
            return;
        }; // Connection Error

        const query = `
        SELECT *
        FROM sensor_readings
        ORDER BY timestamp DESC
        LIMIT 1;
        `
        // Use the connection
        connection.query(query, (error, results, fields) => {
            console.log(results);
            if (results.length > 0) { 
                res.status(200).json({
                    timestamp: results[0].timestamp,
                    temperature: results[0].temperature,
                    humidity: results[0].humidity
                });
            } else { 
                res.status(404).json({
                    error: true,
                    message: 'No Results Found'
                })
            }
            

            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
        });
    });
});

/* GET all sensor data. */
router.get('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('Connection Error: ' + err);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            });
            return;
        }; // Connection Error

        const query = `
        SELECT *
        FROM sensor_readings;
        `
        // Use the connection
        connection.query(query, (error, results, fields) => {
            console.log(results);
            res.status(200).json({
                results
            });

            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
        });
    });
});

module.exports = router;