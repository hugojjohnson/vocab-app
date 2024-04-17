const Session = require("./db/schemas/Session")

async function verifySession(req, res, next) {
    if (req.body.token === undefined) {
        let err = new Error("Token not included in request.")
        err.status = 403
        return next(err)
    }
    const session = await Session.findById(req.body.token)

    if (session.active !== true) {
        let err = new Error("Session inactive. You have been logged out.")
        err.status = 403
        return next(err)
    }
    return next()
}

async function tokenToUserId(token) {
    const session = await Session.findById(token)
    if (session === null) {
        throw new Error("Token is not valid.")
    }

    if (session.active !== true) {
        throw new Error("Session inactive. You have been logged out.")
    }
    return session.user
}

module.exports = { verifySession, tokenToUserId } // add functions down here