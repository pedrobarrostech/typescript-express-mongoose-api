'use strict';

const express = require('express');
const compression = require('compression');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const httpStatus = require('http-status');
const clientRoutes = require('./server/modules/Client/routes');
const userRoutes = require('./server/modules/User/routes');
const authRoutes = require('./server/modules/Auth/routes');

let app = express();

// view engine setup
app.set('views', __dirname);
app.set('view engine', 'ejs');

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// 
app.use(compression());


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


//
// connect to database and register models
///////////////////////////////////////////////////////////
require('./server/lib/connectMongoose');

//
// serve API V1 routes
///////////////////////////////////////////////////////////
app.use('/apiv1/clients', clientRoutes);
app.use('/apiv1/users', userRoutes);
app.use('/apiv1/auth', authRoutes);


// catch not handled and return 404
app.use((req, res, next) => next({
    message: 'Not Found',
    status: 404,
    stack: (new Error()).stack
}));

//
// error handlers (dev / prod)
///////////////////////////////////////////////////////////

// development error handler - will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        if (isApi(req)) {
            res.json({success: false, error: err});
        } else {
            res.render('error', {message: err.message, error: err});
        }
    });
}

// production error handler - no stack-traces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (isApi(req)) {
        res.json({success: false, error: err});
    } else {
        const err = new Error('API not found ' + httpStatus.NOT_FOUND);
        return next(err);
    }
});



function isApi(req) {
    return req.url.indexOf('/apiv1/') === 0;
}

export = app;
