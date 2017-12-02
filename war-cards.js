class Card {
	constructor(suit, value) {
		this.suit = suit;
		this.value = parseInt(value, 10);
		this.name = function() {
			const value = this.value;
			const suit = this.suit;
			let num  = 0;
			if (value < 11) {
				num = value.toString();
			} else if (value == 14) {
				num = 'A';
			} else {
				switch (value) {
					case 11: 
						num = 'J';
						break;
					case 12:
						num = 'Q';
						break;
					case 13:
						num = 'K';
						break;
				}
			}
			return `${num} of ${suit}s`;
		}
	}
}

const Cards = {}
Cards.makeDeck = function(numCards) {
	const deck = [];
	const suits = [
		'♦️ Diamond',
		'♥️ Heart',
		'♠️ Spade',
		'♣️ Club'
	];

	for (i = 2; i < numCards + 2; i++) {
		suits.forEach(s => {
			const card = new Card(s, i);
			deck.push(card);
		});
	}
	// console.log(deck);
	return deck;
};

Cards.shuffle = function(deck) {
	if (!Array.isArray(deck)) {
		return deck;
	}
	let newDeck = [];

	while (deck.length > 0) {
		const randoIndex = Math.floor(Math.random() * deck.length);

		const card = deck.splice(randoIndex, 1);
		newDeck.push(card[0]);
	}
	return newDeck;
};

// args.deck [card]
// args players [players]
Cards.deal = function(args) {
	let deck = args.deck;
	let players = args.players;
	for (i = deck.length - 1; i >= 0; i--) {
		var card = deck.splice(i, 1);
		players[i % 2].hand.push(card[0]);
	}
	const toReturn = {
		deck,
		players
	}
	return toReturn;
}

class Player {
	constructor(name) {
		this.name = name;
		this.hand = [];
		this.winnings = [];
		this.shuffles = [];
		this.beginningStats = {};
	}

	makeBeginningStats() {
		let startJ = 0;
		let startQ = 0;
		let startK = 0;
		let startA = 0;
		let handValue = 0;
		let highValues = 0;

		this.hand.forEach(card => {
			switch (card.value) {
				case 11:
					startJ++;
					break;
				case 12:
					startQ++;
					break;
				case 13:
					startK++;
					break;
				case 14:
					startA++
					break;
				default:
					break;
			}
			
			handValue += card.value;

			if (card.value > 7) {
				highValues += card.value;
			}
		});
		this.beginningStats = {
			startJ,
			startQ,
			startK,
			startA,
			handValue,
			highValues
		};
	}

	log() {
		console.log(`== ${this.name} ==`);
		console.log(`Has ${this.winnings.length} cards`);
		console.log(`===========================`);
		console.log('');
	}
}

class Game {
	constructor(providedDeck) {
		this.players = [];
		this.table = {
			player0: [],
			player1: []
		}
		this.numHands = 0;
		this.numTies = 0;
		this.gameComplete = false;
		this.gameStart = new Date().getTime();
		this.gameEnd = '';
		this.gameWinner = -1;

		// create players
		const player1 = new Player('Art');
		const player2 = new Player('Bob');
		let deck = Cards.makeDeck(13);

		if (providedDeck) {
			deck = providedDeck.slice(0);
		} else {
			deck = Cards.shuffle(deck);
		}

		let newData = Cards.deal({
			deck,
			players: [player1, player2]
		});

		this.players = newData.players;

		this.players.forEach(p => {
			p.makeBeginningStats();
		});
	}

	playHand(isTie) {
		this.placeCardsOnTable(isTie ? 2 : 1);
		const winner = this.compareTable();
		if (winner === -1) {
			this.numTies++;
			return this.playHand(true);
		}

		// assign winnings
		let allCards = this.emptyTable();		
		this.players[winner].winnings = this.players[winner].winnings.concat(allCards);

		const totalWinnersCards = this.players[winner].winnings.length + this.players[winner].hand.length;
		this.numHands++;
		if (totalWinnersCards === 52) {
			this.gameComplete = true;
			this.gameEnd = new Date().getTime();
			this.gameWinner = winner;
		}
	}

	placeCardsOnTable(numCards) {
		for (i = 0; i < numCards; i++) {
			this.players.forEach((p, index) => {
				this.checkHand(p);
				const card = p.hand.pop();

				// card will be undefined if player has 0 in hand and 0 winnings
				if (card) {
					this.table[`player${index}`].push(card);
				}
			});
		}
	}

	compareTable() {
		const val0 = this.table.player0[this.table.player0.length - 1].value;
		const val1 = this.table.player1[this.table.player1.length - 1].value;

		if (val0 > val1) {
			// player 0 wins
			return 0;
		} else if (val1 > val0) {
			// player 1 wins
			return 1;
		}
		
		// tie
		return -1;
	}

	emptyTable() {
		const allCards = this.table.player0.concat(this.table.player1);
		this.table.player0 = [];
		this.table.player1 = [];
		return allCards;
	}

	checkHand(player) {
		if (player.hand.length === 0) {
			const numCards = player.winnings.length;
			// place shuffled winnings in hand
			player.hand = Cards.shuffle(player.winnings);

			// track shuffle
			player.shuffles.push(numCards);

			// empty winnings
			player.winnings = [];
		}
	}
}

function playGame(providedDeck) {
	const game = new Game(providedDeck);

	while(!game.gameComplete) {
		game.playHand(false);
	}

	const totalTimeSec = game.gameEnd - game.gameStart;
	const winningPlayer = game.players[game.gameWinner];
	const loser = game.gameWinner === 1 ? 0 : 1;
	const losingPlayer = game.players[loser];

	const winnerHandValue = winningPlayer.beginningStats.handValue;
	const loserHandValue = losingPlayer.beginningStats.handValue;

	const winnerHighValue = winningPlayer.beginningStats.highValues;
	const loserHighValue = losingPlayer.beginningStats.highValues;
	const code = document.createElement("code");

	let report = "============ GAME OVER =============\n";
	report += `Game Stats:\n`;
	report += `Total Hands: ${game.numHands}\n`;
	report += `Elapsed Time: ${totalTimeSec} ms\n`;
	report += `Hands per ms: ${game.numHands / totalTimeSec}\n`;
	report += `Number of Ties: ${game.numTies}\n`;
	report += '-------------------------------------\n';
	report += `Winner: ${winningPlayer.name}\n`;
	report += `Number of Shuffles: ${winningPlayer.shuffles.length}\n`;
	report += `Shuffles: ${winningPlayer.shuffles.join(', ')}\n`;
	Object.keys(winningPlayer.beginningStats).forEach(stat => {
		report += `${stat}: ${winningPlayer.beginningStats[stat]}\n`;
	})
	report += `Hand Value: winner ${winnerHandValue} : ${loserHandValue}\n`;
	report += `High Hand Value: winner ${winnerHighValue} : ${loserHighValue}\n`;

	report += '=====================================\n';
	gameStorage.push(game);
	return report;
}

let games = [];
let gameStorage = [];
let handData = [];
let graphX = [];
let graphY = [];

var pieData = [{
	values: [0,0],
	labels: ['Art', 'Bob'],
	type: 'pie'
}]

let myDeck = Cards.makeDeck(13);
myDeck = Cards.shuffle(myDeck);

function promiseGame() {
	return Promise.resolve()
	.then(() => {
		return playGame();
	});
}

for (i = 0; i < 1000; i++) {
	games.push(promiseGame());
}

Promise.resolve(null)
.then(() => {
	return Promise.all(games);
})
.then(reports => {
	reports.forEach(report => {
		const code = document.createElement("code");
		const info = document.getElementById("info");
		code.innerHTML = report;
		const div = document.createElement('div');
		div.classList = 'gameInfo';
		div.appendChild(code);
		info.appendChild(div);
		// reportStorage.push(report);
	});
	// return PlotlyReady();
	return null;
})
.then(() => {
	for (i = 0; i < 20; i++) {
		graphX.push(0);

		const num1 = i * 75;
		const num2 = ((i + 1) * 75) - 1;
		if ( i == 19) {
			graphY.push(`greater than ${i*75}`);
		} else {
			graphY.push(`${num1} - ${num2}`);
		}
	}
	gameStorage.forEach(g => {
		var cat = EvaluateHand(g.numHands);
		graphX[cat] = graphX[cat] + 1;

		console.log(g);
		var winner = g.gameWinner;
		pieData[0].values[winner] = pieData[0].values[winner] + 1;
	});
	TESTER = document.getElementById('tester');

	Plotly.plot( TESTER, [{
		x: graphY,
		y: graphX }], { 
		margin: { t: 0 } } );
	
	var WinnerPie = document.getElementById('winner-pie');

	Plotly.plot(WinnerPie, pieData,{
		height: 400,
		width: 500
	  });

	

	/* Current Plotly.js version */
	console.log( Plotly.BUILD );
	return null;
})
.then(() => {
	var $dataElem = document.getElementsByClassName('game-info');
	for (i = 0; i < $dataElem.length; i++) {
		var elem = $dataElem[i];
		console.log('ELEM: ', elem);
		fadeIn(elem)
	};
});

var plotlyTO = 0;

function PlotlyReady() {
	plotlyTO = setTimeout(function() {
		if (typeof Plotly != 'undefined') {
			clearTimeout(plotlyTO);
			console.log("noice");
			return true;
		} else {
			PlotlyReady();
		}
	}, 10);
}
PlotlyReady();

function EvaluateHand(h) {
	const category = Math.floor(h % 75);
	return category;
}

function fadeIn(el) {
	var opacity = 0
  
	el.style.opacity = 0
	el.style.filter = ''
  
	var last = +new Date
	var tick = function() {
	  el.style.display = "block";
	  opacity += (new Date - last) / 400
	  el.style.opacity = opacity
	  el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')'
  
	  last = +new Date
  
	  if (opacity < 1)
		(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
	}
  
	tick()
  }



