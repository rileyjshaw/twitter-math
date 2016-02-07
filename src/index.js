// Spews math facts.
import Kefir from 'kefir';
import redis from 'redis';
import Twit from 'twit';

import englishNumbers from './english-numbers';
import inboundTweets from './stubs/inbound';
import bot from './stubs/bot';

const db = redis.createClient();
const DB_KEY = 'TWITTER_MATH_FACTS';

////////////////////
// Util functions //
////////////////////

// Return a random int in [0, n].
const rand = (n = 1) => Math.floor(Math.random() * (n + 1));

// Return `item` with an "s" appended, unless |amount| is 1.
const pluralize = (item, amount) => item + (amount * amount !== 1 ? 's' : '');

// Determine if a submission is correct. Far from perfect, but it's something…
function isCorrect (text, answer) {
	// An array of numerical responses, eg. 64 or 100.00
	const numbersInResponse = text.match(/\d+\.?\d*/);

	return numbersInResponse
		// True if there is a single numerical response and it matches the answer,
		? numbersInResponse[0] == answer && numbersInResponse.length === 1
		// or if no number literals exist but the plain English equivalent does.
		: text.toLowerCase().match(englishNumbers[answer]);
}

// Return a new question (string) and the answer (int).
function newQuestion () {
	const a  = rand(10);
	const b  = rand(10);
	const op = rand() ? 'plus' : 'times';

	return {
		q: `What is ${englishNumbers[a]} ${op} ${englishNumbers[b]}?`,
		a: op === 'plus' ? a + b : a * b,
	};
}

/////////////
// Streams //
/////////////

const questions = inboundTweets
	.scan((question, {text}) => isCorrect(text, question.a)
		? newQuestion()
		: question
	, newQuestion())
	.skipDuplicates()
	.toProperty()
	;

// A stream of users with the correct answer.
const winners = questions
	.sampledBy(inboundTweets, ({a}, {name, text}) => ({answer: a, name, text}))
	.filter(({answer, text}) => isCorrect(text, answer))
	// .flatMap(({name}) => incrementScore(name))
	;

const twitterPosts = winners.flatMap(postWinner);

//////////////////
// Side effects //
//////////////////

const postQuestion = ({q}) => console.log('posting a new question: ' + q);

// Return a stream that increments a user's score in Redis.
const incrementScore = (name) => Kefir
	.fromNodeCallback(cb => db.zincrby(DB_KEY, 1, name, cb))
	.map(score => ({name, score}))
	;

const postWinner = ({name, score}) => Kefir
	.fromNodeCallback(cb => bot.post('statuses/update', {
		status: `${rand() ? 'Congrats' : 'Well done'} @${name}!` +
			` You now have ${score} ${pluralize('point', score)}.`,
	}, cb))
	;

questions.onValue(postQuestion);

/////////////
// Logging //
/////////////

questions.log('New question:');
inboundTweets.log('New incoming tweet:');
winners.log('New winner:');
twitterPosts.log('New post:');
//postQuestion.log();
//postWinner.log();
