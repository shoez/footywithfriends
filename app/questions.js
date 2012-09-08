module.exports = { 
	total: 13,
	1: {
		question: 'Number of tackles',
		id: 1,
		type: "multiple", // or 'binary'
		options: ['0-4', '5-8', '9-12', 'More!'],
		scoring: 10
	},
	2: {
		question: 'Number of balls strung together by City',
		id: 2,
		type: "multiple", // or 'binary'
		options: ['1-3', '4-6', '7-9', '9+'],
		scoring: 50
	},
	3: {
		question: 'Substitution likey by Southampton',
		id: 3,
		type: "binary", // or 'binary'
		options: ['Yes', 'No'],
		scoring: 200
	},
	4: {
		question: 'Fastest shot on target',
		id: 4,
		type: "multiple", // or 'binary'
		options: ['<10mph', '<25mph', '<40mph', '>45mph'],
		scoring: 15
	},
	5: {
		question: 'Shots at goal for Man City',
		id: 5,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3', '4'],
		scoring: 20
	},
	6: {
		question: 'Shots at goal for Southampton',
		id: 6,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3', '4'],
		scoring: 20
	},
	7: {
		question: 'Number of times Southampton give ball away',
		id: 7,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3', '4'],
		scoring: 20
	},
	8: {
		question: 'A booking on the way?',
		id: 8,
		type: "binary", // or 'binary'
		options: ['Absolutely', 'Not a chance'],
		scoring: 100
	},
	9: {
		question: 'City attempts at goal',
		id: 9,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3', '4'],
		scoring: 20
	},
	10: {
		question: 'Free kicks awarded to Southampton',
		id: 10,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3'],
		scoring: 20
	},
	11: {
		question: 'Fouls awarded to Man City',
		id: 11,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3', '4'],
		scoring: 50
	},
	12: {
		question: 'Free kicks awarded to Man City',
		id: 12,
		type: "multiple", // or 'binary'
		options: ['0', '1', '2', '3'],
		scoring: 50
	},
	13: {
		question: 'Substitution likey by Man City',
		id: 13,
		type: "binary", // or 'binary'
		options: ['Yes', 'No'],
		scoring: 200
	}

};


