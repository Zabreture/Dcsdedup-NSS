async function init() {
    const http = require('http');
    const OPRF = require('oprf');
    const crypto = require('crypto');
    const express = require('express');
    const args = require('../src/args.json');
    const oprf = new OPRF();
    const secretKey = args.secret_key;
    const app = express().use(express.json()).all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Content-Type', 'application/json;charset=utf-8');
        next();
    })
    const httpServer = http.createServer(app);
    httpServer.listen(81, function(){
        console.log("Http listening on " + args.base_url);
        console.log("Successfully initialized\n----------------------");
        console.log('Waiting for request ...\n----------------------');
    })

    await oprf.ready;
    app.post('/keyServer', (req, res) => {
        console.log('Received OPRF request');
        const maskedPoint = oprf.decodePoint(req.body.maskedPoint, 'utf8');
        const salted = oprf.scalarMult(maskedPoint, Buffer.from(secretKey, 'hex'));
        console.log('    Key has been signed\n----------------------');
        res.json({
            salted: oprf.encodePoint(salted, 'utf8')
        })
    })

    app.post('/roundTrip', (req, res) => {
        console.log('Received round trip request');
        console.log('    Response send back\n----------------------');
        res.json({
            dataBack: crypto.randomBytes(req.body.resSize),
        })
    })
}


init();