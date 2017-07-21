'use strict';

module.exports = {
    get: getAndReplacePlaceholder
};

let messages = {
    WELCOME: 'Willkommen bei stimmt\'s oder stimmt\'s nicht. Es läuft noch kein Spiel. Wollen wir eins beginnen?',
    DONT_UNDERSTAND: 'Ich habe dich nicht ganz verstanden. ',
    UNHANDLED: 'Ich habe dich leider nicht verstanden. Gerne kannst du Hilfe anfordern, dann erkläre ich dir mehr.',
    STARTING_HELP: 'Ich helfe gern. Du kannst jetzt ein Spiel beginnen. Sage dazu: "Starte ein Spiel" oder sage "Stop" zum Beenden. Wie lautet deine Anweisung?',
    GUESSMODE_WELCOME: 'Super! Dann fangen wir an. Ich erzähle dir {rounds} Behauptungen und du musst sagen, ob sie wahr oder falsch sind. Bist du bereit?',
    GUESSMODE_HELP_FIRST: 'Sage "Ja", wenn du bereit für die erste Behauptung bist. Oder sage "Nein", wenn du das Spiel beenden möchtest.',
    GUESSMODE_HELP: 'Ich helfe gern. Sage mir, ob die Behauptung richtig ist. Bitte antworte mit: "Das ist wahr" oder mit: "Das ist falsch". Du kannst das Spiel jederzeit mit "Stop" oder "Abbrechen" beenden.',
    GUESSMODE_STATEMENT: 'Die {count}. Behauptung lautet: {statement} Ist das ... <emphasis level="strong">wahr</emphasis> ... oder ... <emphasis level="strong">falsch</emphasis>?',
    GUESSMODE_ANSWER_UNKNOWN: 'Bitte antworte mit: "Das ist wahr" oder mit: "Das ist falsch".',
    GUESSMODE_ALREADY_ANSWERED: 'Du hast diese Frage schon beantwortet. Bist du bereit für die nächste Behauptung? Antworte mit "Ja" oder "Nein"',
    GUESSMODE_ANSWER_RIGHT: 'Deine Antwort ist korrekt.',
    GUESSMODE_ANSWER_WRONG: 'Leider falsch gelegen.',
    GUESSMODE_ORIGINAL_STATEMENT_RIGHT: 'Die Behauptung stimmt.',
    GUESSMODE_ORIGINAL_STATEMENT_WRONG: 'Die Behauptung stimmt so nicht.',
    GUESSMODE_READY_FOR_NEXT_ROUND: 'Bist du bereit für die nächste Behauptung?',
    GUESSMODE_GAMEOVER: 'Du hast alle Behauptungen beantwortet. Von {all} Behauptungen waren {right} richtig beantwortet. Bis zum nächsten Spiel.',
    CYA_SOON: 'Kein Problem. Bis bald!',
};

function getAndReplacePlaceholder(key, variables) {
    variables = variables || {};
    return (messages[key] || key).replace(/\{([^\}]*)\}/g, (full, part) => variables[part] || '');
}