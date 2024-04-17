const User = require("./db/schemas/User")
const Session = require("./db/schemas/Session")
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config()


async function signUpWithEmail(req, res, next) {
    // check email is not already in the database
        // if it is, redirect to log in
    // add user to database
    // redirect to login
    if (req.body.email === undefined || req.body.username === undefined || req.body.password === undefined) {
        console.log(req.body)
        // console.log(req.body.username === undefined)
        // console.log(req.body.password === undefined)
        err = new Error("Details not entered correctly. Please try again.")
        err.status = 400;
        return next(err)
    }

    try {
        if (await User.exists({ email: req.body.email })) {
            err = new Error("Email already exists. Please log in.")
            err.status = 303
            return next(err)
        }
        if (await User.exists({ username: req.body.username })) {
            err = new Error("That username is already taken. Please try a different one.")
            err.status = 400
            return next(err)
        }

        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })

        newUser.save().then(console.log("User saved"));
        return res.send("hi there! success");
        // next(); is not needed here because you've just responded to the request.
        // res.sendFile(path.join(__dirname + '/../views/clientPage.html'));
    } catch (err) {
        return next(err);
    }
}

async function signUpWithGoogle(req, res, next) {
    try {
        // check email is not already in the database
        // if it is, redirect to log in
        // add user to database
        // redirect to login
        if (req.body.google_jwt === undefined) {
            console.log(req.body)
            // console.log(req.body.username === undefined)
            // console.log(req.body.password === undefined)
            err = new Error("Details not entered correctly. Please try again.")
            err.status = 400;
            return next(err)
        }

        // Verify jwt
        async function verify(client_id, jwtToken) {
            const client = new OAuth2Client(client_id);
            // Call verifyIdToken to verify and decode it
            const ticket = await client.verifyIdToken({
                idToken: jwtToken,
                audience: client_id,
            });
            // Get the JSON with all the user info
            const payload = ticket.getPayload();
            return payload;
        }
        const payload = await verify(process.env.GOOGLE_CLIENT_ID, req.body.google_jwt)
        console.log(payload.sub)
        return res.send("Success so far!!")
    } catch (err) {
        return res.next(err)
    }


    try {
        if (await User.exists({ email: req.body.email })) {
            err = new Error("Email already exists. Please log in.")
            err.status = 303
            return next(err)
        }
        if (await User.exists({ username: req.body.username })) {
            err = new Error("That username is already taken. Please try a different one.")
            err.status = 400
            return next(err)
        }

        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })

        newUser.save().then(console.log("User saved"));
        return res.send("hi there! success");
        // next(); is not needed here because you've just responded to the request.
        // res.sendFile(path.join(__dirname + '/../views/clientPage.html'));
    } catch (err) {
        return next(err);
    }
}

async function logInWithEmail(req, res, next) {
    if (req.body.email === undefined || req.body.password === undefined) {
        err = new Error("Details not entered correctly. Please try again.")
        err.status = 400;
        return next(err)
    }

    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password })
        if (user === null) {
            err = new Error("Email or password incorrect. Please try again.")
            err.status = 401
            return next(err)
        }

        const newSession = new Session({
            user: user,
        })

        await newSession.save()
        return res.send(JSON.stringify({
            token: newSession.id,
            username: user.username
        }));
    } catch (err) {
        return next(err);
    }
}

async function signOut(req, res, next) {
    if (req.body.token === undefined) {
        err = new Error("Token not entered correctly. Please try again.")
        err.status = 400;
        return next(err)
    }

    try {
        let session = await Session.findById(req.body.token)
        console.log(session)
        session.active = false
        await session.save()
        
        return res.send("hi there! success");
    } catch (err) {
        return next(err);
    }
}


module.exports = { signUpWithEmail, signUpWithGoogle, logInWithEmail, signOut }