module.exports = [
	{
		description: 'Transfer, fill or empty all the content of the viles until vial two has 4 parts liquid and vial one is empty.',
		viles:[
			{ capacity: 5, fillAmount: 0, transferTo: 1, height: 35 },
			{ capacity: 8, fillAmount: 8, transferTo: 0, height: 28 }
		],
		solution: [0, 4]
	},
	{
		description: 'Transfer, fill or empty all the content of the viles until vial two has 8 parts liquid and vial one is empty.',
		viles:[
			{ capacity: 9, fillAmount: 0, transferTo: 1, height: 26.5 },
			{ capacity: 11, fillAmount: 11, transferTo: 0, height: 26.2 }
		],
		solution: [0, 8]
	}
];