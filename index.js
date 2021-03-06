'use strict';

var questions = require('./data/questions');
var messages = require('./data/messages');
var Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.37f82415-4d1a-4d39-a36e-c31e787f0a56';
const ROUNDS = 5;
const STATES = {
    STARTING: '_STARTING',
    GUESSMODE: '_GUESSMODE'
};
const ANSWER = {
    UNANSWERED: 0,
    RIGHT: 1,
    WRONG: -1
};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers, startingGameHandler, guessGameHandler);
    // alexa.appId = APP_ID;
    alexa.execute();
};

var handlers = {
    'NewSession': function () {
        this.handler.state = STATES.STARTING;
        this.emit(':ask', messages.get('WELCOME'), 'Bitte "ja" zum starten und "nein" zum Beenden sagen.')
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', 'Du kannst jetzt ein Spiel beginnen. Sage dazu: "Starte ein Spiel" oder sage "Stop" zum Beenden. Wie lautet deine Anweisung?');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Schade, hoffentlich bis bald.');
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Wir brechen ab. Bis bald.');
    },
    'Unhandled': function () {
        this.emit(':tell', messages.get('UNHANDLED'));
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Auf Wiedersehen!");
    }
};

function startTheGame() {
    this.attributes.currentQuestion = {};
    this.attributes.answers = {};
    this.handler.state = STATES.GUESSMODE;
    this.emit(':ask', messages.get('GUESSMODE_WELCOME', { rounds: ROUNDS }));
}

var startingGameHandler = Alexa.CreateStateHandler(STATES.STARTING, Object.assign({}, handlers, {
    'AMAZON.YesIntent': startTheGame,

    'BeginTruthOrLie': startTheGame,

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', messages.get('STARTING_HELP'));
    },

    'AMAZON.NoIntent': function () {
        this.emit(':tell', messages.get('CYA_SOON'));
    }
}));

var guessGameHandler = Alexa.CreateStateHandler(STATES.GUESSMODE, {

    'AMAZON.HelpIntent': function () {
        if (Object.keys(this.attributes.answers).length === 0) {
            this.emit(':ask', messages.get('GUESSMODE_HELP_FIRST'));
        } else {
            this.emit(':ask', messages.get('GUESSMODE_HELP'));
        }
    },

    'AMAZON.YesIntent': function () {
        if (isCurrentAnswerUnanswered(this.attributes)) {
            return this.emit(':ask', messages.get('GUESSMODE_ANSWER_UNKNOWN'));
        }

        let questionId = getNewQuestionId(Object.keys(this.attributes.answers).map(answer => Number(answer.replace(/\D/g, ''))));
        this.attributes.currentQuestion = getQuestionById(questionId);

        this.attributes.answers['a' + this.attributes.currentQuestion.id] = ANSWER.UNANSWERED;

        this.emit(':ask', getCurrentQuestionMessage(this.attributes));
    },

    'AMAZON.NoIntent': function () {
        if (isCurrentAnswerUnanswered(this.attributes)) {
            return this.emit(':ask', messages.get('GUESSMODE_ANSWER_UNKNOWN'));
        }

        this.emit(':tell', messages.get('CYA_SOON'));
    },

    'TruthOrLieAnswerIntent': function () {
        let truthOrLieSlot = this.event.request.intent.slots && this.event.request.intent.slots.TruthOrLie && this.event.request.intent.slots.TruthOrLie.value;
        let guessedTruth = guessedTruthOrLieAnswer(truthOrLieSlot);
        if (guessedTruth === null) {
            this.emit(':ask', messages.get('DONT_UNDERSTAND') + messages.get('GUESSMODE_ANSWER_UNKNOWN'));
            return;
        }

        if (!isCurrentAnswerUnanswered(this.attributes)) {
            this.emit(':ask', messages.get('GUESSMODE_ALREADY_ANSWERED'));
            return;
        }

        let msgs = [];

        if (this.attributes.currentQuestion.truth === guessedTruth) {
            this.attributes.answers['a' + this.attributes.currentQuestion.id] = ANSWER.RIGHT;
            msgs.push('GUESSMODE_ANSWER_RIGHT');
        } else {
            this.attributes.answers['a' + this.attributes.currentQuestion.id] = ANSWER.WRONG;
            msgs.push('GUESSMODE_ANSWER_WRONG');
            if (this.attributes.currentQuestion.truth) {
                msgs.push('GUESSMODE_ORIGINAL_STATEMENT_RIGHT');
            } else {
                msgs.push('GUESSMODE_ORIGINAL_STATEMENT_WRONG');
            }
        }

        if (this.attributes.currentQuestion.explanation) {
            msgs.push(this.attributes.currentQuestion.explanation);
        }

        if (Object.keys(this.attributes.answers).length < ROUNDS) {
            msgs.push('GUESSMODE_READY_FOR_NEXT_ROUND');
            let msg = msgs.reduce((curr, next) => curr + ' ' + messages.get.apply(null, [].concat(next)), '');
            this.emit(':ask', msg);
        } else {
            let rightCount = Object.keys(this.attributes.answers).filter(answer => this.attributes.answers[answer] === ANSWER.RIGHT).length;
            msgs.push(['GUESSMODE_GAMEOVER', { all: Object.keys(this.attributes.answers).length, right: rightCount }]);
            let msg = msgs.reduce((curr, next) => curr + ' ' + messages.get.apply(null, [].concat(next)), '');
            this.emit(':tell', msg);
        }

    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Schade, hoffentlich bis bald.');
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Wir brechen ab. Bis bald.');
    },
    'Unhandled': function () {
        this.emit(':ask', messages.get('UNHANDLED'));
    }

});

function isCurrentAnswerUnanswered(attributes) {
    return attributes.currentQuestion.id && attributes.answers['a' + attributes.currentQuestion.id] === ANSWER.UNANSWERED;
}

function guessedTruthOrLieAnswer(truthOrLieSlot) {
    let truthOrLie = null;
    if (!truthOrLieSlot) {
        return truthOrLie;
    }
    if (truthOrLieSlot.match(/wahr|richtig|stimmt(?! nicht)/)) {
        truthOrLie = true;
    } else if (truthOrLieSlot.match(/falsch|lüge|stimmt nicht/)) {
        truthOrLie = false;
    }
    return truthOrLie;
}

function getNewQuestionId(playedQuestions) {
    if (global && global.TEST_MODE) {
        return 1;
    }
    let questionId;
    do {
        questionId = Math.floor(Math.random() * questions.length);
    } while (playedQuestions.indexOf(questionId) !== -1);
    return questionId;
}

function getQuestionById(id) {
    let statement = questions[id];
    statement.id = id;
    statement.question = statement.question.trim().replace(/\.?$/, '.');
    return statement;
}

function getCurrentQuestionMessage(attributes) {
    return messages.get('GUESSMODE_STATEMENT', {
        count: Object.keys(attributes.answers).length,
        statement: attributes.currentQuestion.question
    });
}
