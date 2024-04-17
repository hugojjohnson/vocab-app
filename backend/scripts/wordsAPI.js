const auth = require("./auth")

const Text = require("./db/schemas/Text")
const Word = require("./db/schemas/Word")
const User = require("./db/schemas/User")

// You're going to have to update this in TextCard.js too to save me another request :)
const supportedLanguages = {
    french: "🇫🇷",
    spanish: "🇪🇸",
    italian: "🇮🇹",
    portugese: "🇵🇹",
    german: "🇩🇪"
}
// Get supported languages
async function getSupportedLanguages(req, res, next) {
    return res.send(JSON.stringify(supportedLanguages))
}

// Add text
async function addText(req, res, next) {
    if (req.body.token === undefined || req.body.language === undefined || req.body.title === undefined || req.body.text === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }
    const userToken = await auth.tokenToUserId(req.body.token)

    try {
        const newText = new Text({
            user: userToken,
            language: req.body.language,
            title: req.body.title,
            value: req.body.text,
        })

        await newText.save();
        return res.send("success! the text has been created.");
    } catch (err) {
        return next(err)
    }
}

// Get all texts for a specific user
async function getAllTexts(req, res, next) {
    if (req.body.token === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }
    const userId = await auth.tokenToUserId(req.body.token)
    const texts = await Text.find({ user: userId })
    return res.send(JSON.stringify(texts))

}

// Get text
async function getText(req, res, next) {
    if (req.body.token === undefined || req.body.textId === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }

    const userId = await auth.tokenToUserId(req.body.token)
    const foundText = await Text.findById(req.body.textId)
    if (foundText.user.toString() === userId.toString()) {
        return res.send(foundText.value)
    }
    let err = new Error("Text ID does not match user.")
    err.status = 403
    return next(err)
}

// Get readable text: read up to the first unknown word. 
async function getReadableText(req, res, next) {
    if (req.body.token === undefined || req.body.textId === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }

    const userId = await auth.tokenToUserId(req.body.token)
    const foundText = await Text.findById(req.body.textId)

    if (foundText.user.toString() !== userId.toString()) {
        let err = new Error("Text ID does not match user.")
        err.status = 403
        return next(err)
    }

    const totalWordList = generateWordList(foundText.value)

    const userObj = await Word.findOne({ user: userId })
    let currentKnownWords = (userObj && userObj.known) || []
    const unknownObj = (userObj && userObj.unknown) || []
    for (const i of unknownObj) {
        if (i.learned) {
            currentKnownWords.push(i.value)
        }
    }

    let firstUnknownWord = ""
    for (const i of totalWordList) {
        if (!currentKnownWords.includes(i)) {
            firstUnknownWord = i
            break
        }
    }

    let index = foundText.value.indexOf(firstUnknownWord) !== -1; // true
    if (index === -1) {
        return res.send(foundText.value)
    }

    return res.send(foundText.value.substring(0, index))
}

function generateWordList(text) {
    // Takes a text as input and returns an ordered array of each of the words, apprearing once.
    text = text.toLowerCase();

    text = text.replace(/[`~!@#$%^&*()-_=+}{}]/g, "")
    text = text.replace(/[\s]+/g, " ")
    text = text.split(" ")

    let tempWordList = []

    for (const i of text) {
        if (!tempWordList.includes(i)) {
            tempWordList.push(i)
        }
    }
    return tempWordList
}

// Get unknown word list
async function getUnknownWordList(req, res, next) {
    if (req.body.token === undefined || req.body.textId === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }

    let foundText = {}
    try {
        foundText = await Text.findById(req.body.textId)
    } catch (err) {
        err.status = 400
        next(err)
    }

    if (foundText === null || foundText.value === undefined) {
        let err = new Error("Sorry, that text could not be found.")
        err.status = 500
        return next(err)
    }
    const totalWordList = generateWordList(foundText.value)

    const userId = await auth.tokenToUserId(req.body.token)
    const userObj = await Word.findOne({ user: userId })

    const known = (userObj && userObj.known) || []

    const unknownObj = (userObj && userObj.unknown) || []
    let unknown = []
    for (const i of unknownObj) {
        unknown.push(i.value)
    }

    let wordList = []
    for (const i of totalWordList) {
        if (known.includes(i) || unknown.includes(i)) {
            continue
        }
        wordList.push(i)
    }

    return res.send(wordList)
}

// Sort words: pass a list of known and unknown words
async function sortWords(req, res, next) {
    if (req.body.token === undefined || req.body.knownWords === undefined || req.body.unknownWords === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }
    console.log(req.body.knownWords)
    console.log(req.body.unknownWords)
    // req.body.knownWords = JSON.parse(req.body.knownWords)
    // req.body.unknownWords = JSON.parse(req.body.unknownWords)

    const userId = await auth.tokenToUserId(req.body.token)
    let wordObj = await Word.findOne({ user: userId })
    if (wordObj === null) {
        wordObj = new Word({
            user: userId,
            unknown: [],
            known: []
        })
    }
    for (const i of req.body.knownWords) {
        console.log(wordObj)
        wordObj.known.push(i)
    }
    for (const i of req.body.unknownWords) {
        wordObj.unknown.push({ value: i })
    }

    await wordObj.save()

    return res.send("Success!")
}

// Get learn words
async function getLearnWords(req, res, next) {
    if (req.body.token === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }

    const userId = await auth.tokenToUserId(req.body.token)
    let wordObj = await Word.findOne({ user: userId })

    return res.send(JSON.stringify(wordObj.unknown))
}

// Set learn words: set the 'learned' value to true for some words and update the date learned.
async function setLearnWords(req, res, next) {
    if (req.body.token === undefined || req.body.words === undefined) {
        let err = new Error("Details not entered correctly. Please try again.")
        err.status = 400
        return next(err)
    }

    req.body.words = JSON.parse(req.body.words)

    const userId = await auth.tokenToUserId(req.body.token)
    let wordObj = await Word.findOne({ user: userId })

    for (const i of wordObj.unknown) {
        if (i.learned) {
            continue
        }
        if (req.body.words.includes(i.value)) {
            i.learned = true
        }
    }

    await wordObj.save();

    return res.send("Success!")
}



module.exports = { getSupportedLanguages, addText, getAllTexts, getText, getReadableText, getUnknownWordList, sortWords, getLearnWords, setLearnWords }