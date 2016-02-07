import Kefir from 'kefir';
import readline from 'readline';

const rl = readline.createInterface(process.stdin, process.stdout);

const inboundTweets = Kefir.fromEvents(rl, 'line')
	.map(line => ({
		text: `@mathfactsbot the answer is definitely ${line.split(' ')[0]}!`,
		user: { screen_name: line.split(' ')[1] || 'rileyjshaw' },
	}))
	.map(({text, user: {screen_name: name}}) => ({name, text}))
	;

export default inboundTweets;
