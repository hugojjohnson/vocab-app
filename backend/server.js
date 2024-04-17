// Requires
const path = require("path");
const cors = require('cors');
const express = require('express')
require('dotenv').config()
const mongoose = require("mongoose");

// User requires
const auth = require('./scripts/auth');
const adminAPI = require("./scripts/userAPI");
const wordsAPI = require("./scripts/wordsAPI");

const app = express();
const CURRENT_URL = process.env.CURRENT_URL || "http://localhost:3000"
const uri = `mongodb+srv://hugojohnson271:${process.env.MONGO_DB_PASSWORD}@main.w9udpx8.mongodb.net/main?retryWrites=true&w=majority`;
mongoose.connect(uri);

// ========== Set-up middleware (You can move this into a different file if you want to) ==========
// If you want to send JSON, you need this middleware, which sents the Content-Type header.
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
// Accept JSON from a post request.
app.use(express.urlencoded({ extended: true })); // turn url parameters (e.g. ?name=alan) into req.body.
app.use(express.json()); // parse incoming data into json.
var allowCrossDomain = function (req, res, next) {
    // Something called CORS; I'm not sure what it is but we need this code here.
    res.header('Access-Control-Allow-Origin', CURRENT_URL);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
}
app.use(allowCrossDomain);
app.use(cors({ credentials: true, origin: CURRENT_URL }));
app.use('/public', express.static('public')) // serve static files




// Members
app.post("/users/sign-up/email", (req, res, next) => {
    return adminAPI.signUpWithEmail(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/users/sign-in/email", (req, res, next) => {
    return adminAPI.logInWithEmail(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/users/sign-out", auth.verifySession, async (req, res, next) => {
    return await adminAPI.signOut(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});
// Google
app.post("/users/sign-up/google", (req, res, next) => {
    return adminAPI.signUpWithGoogle(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/users/sign-in/google", (req, res, next) => {
    return adminAPI.logInWithEmail(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/users/sign-out", auth.verifySession, async (req, res, next) => {
    return await adminAPI.signOut(req, res, next);
    // note the RETURN here - otherwise it will also serve page 404.
});

app.post("/protected", auth.verifySession, async (req, res, next) => {
    return res.send(await auth.tokenToUserId(req.body.token))
    // note the RETURN here - otherwise it will also serve page 404.
});


app.get("/supported-languages", async (req, res, next) => {
    try {
        return await wordsAPI.getSupportedLanguages(req, res, next)
    } catch (err) {
        next(err)
    }
});
app.post("/texts/add", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.addText(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/texts/get-all", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.getAllTexts(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/texts/get", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.getText(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});

app.post("/texts/get", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.getReadableText(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});

app.post("/texts/get-word-list", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.getUnknownWordList(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});

app.post("/texts/sort-words", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.sortWords(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/texts/get-learn-words", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.getLearnWords(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});
app.post("/texts/set-learn-words", auth.verifySession, async (req, res, next) => {
    try {
        return await wordsAPI.setLearnWords(req, res, next)
    } catch (err) {
        next(err)
    }
    // note the RETURN here - otherwise it will also serve page 404.
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('404: Page not found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    console.error(err)
    console.error(error.message)
    res.status(err.status || 500);
    res.send(err.message);
});

const port = process.env.PORT || 3001;
app.listen(port);
