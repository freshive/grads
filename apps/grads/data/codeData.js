module.exports = [
	{
		description: 'To get things started, we need you to create and run a function that returns the twitter handle of the official FNB Guy.',
		problem: "/* Returns the Twitter handle of the official FNB Guy */ (function() { var fnbGuy = 'Official @FNBGuy'; return fnbGuy; })();",
		answer: '@RbJacobs'
	},
	{
		description: 'Still easy, write a function that takes an integer, 10111, as input and returns the number of digits in that integer. Bonus points for ensuring the number is an integer.',
		problem: '/* Returns the length of an integer */ (function(num) { return; })(10111);',
		answer: 5
	},
	{
		description: 'Convert a number to a string that represents a rounded size in bytes. f(156833213) // => "149.57 MB"',
		problem: "/* Useful byte conversion */ var convert = function(value) { var suffixes = ['B', 'KB', 'MB', 'GB', 'TB']; }; convert(156833213);",
		answer: "149.57 MB"
	},
	{
		description: "Ok Mr. Software Engineer. Find out if a string is a rotation of another string. Using ABCD as a paramerter, ABCD is a rotation of BCDA but not ACBD. Return 1 if it is a rotation otherwise return 0 if it is not.",
		problem: "/* Is String rotation function */ String.prototype.isRotation = function(rotation) { var s = this; return s; }; 'ABCD'.isRotation('BCDA');",
		answer: 1
	},
	{
		description: 'Given an integer array, [1,2,3,2,4,5,6], prove one element occurs even number of times and all others have odd occurrences. Find the element with even occurrences.',
		problem: '/* Returns the element with even occurrences */ var evenOccurences = function (array) { var hash = {}; return false; }; evenOccurences([1,2,3,2,4,5,6]);',
		answer: 2
	},
];