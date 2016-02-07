// Exports the numbers [0, 100] in plain English
const singles = [
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine'
];

const weirdos = [
	'ten',
	'eleven',
	'twelve',
	'thirteen',
	'fourteen',
	'fifteen',
	'sixteen',
	'seventeen',
	'eighteen',
	'nineteen'
];

const elders = [
	'twenty',
	'thirty',
	'forty',
	'fifty',
	'sixty',
	'seventy',
	'eighty',
	'ninety'
].reduce(
	// reduce is nicer than map here because it leaves us w/ a flat array.
	(prev, decade) => [
		...prev,
		// for each decade, return the decade
		decade,
		// ...plus decade-one, decade-two...
		...singles.map(n => new RegExp(`${decade}[ -]?${n}`)),
	], []
);

export default [
	'zero',
	...singles,
	...weirdos,
	...elders,
	/one[ -]?hundred/,
];
