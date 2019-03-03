class Game {
	/**
     * Create a Game.
     * @param {number} numOfPairs - Number of card pairs for the game.
     */
	constructor(numOfPairs) {
		/**
		  * Number of card pairs for the game
          * @type {number}
          */
		this.numOfPairs = numOfPairs;
		
		/**
		  * Array of revealed cards.
          * @type {Card[]}
          */
		this.revealedCards = [];
		
		/**
		  * The score (number of matches found).
          * @type {number}
          */
		this.score = 0;
		
		/**
		  * The number of turns taken.
          * @type {number}
          */
		this.turnsCount = 0;
		
		/**
		  * If the game has been completed.
          * @type {bool}
          */
		this.isDone = false;
		
		/**
		  * If user interaction is allowed.
          * @type {bool}
          */
		this.isInteractionAllowed = true;
		
		/**
		  * The emoji HTML entities for the card faces.
          * @type {string[]}
          */
		this.emojiEntities = (function() {
			let allEmojiCodes = range(0x1F601, 0x1F64F);
			let subsetEmojiCodes = allEmojiCodes.sort(() => 0.5 - Math.random()).slice(0, 12);
			return subsetEmojiCodes.map(emoji => String.fromCodePoint(emoji));
		})();
		
		/**
		  * The cards.
          * @type {Card[]}
          */
		this.cards = this.createCards();
	}
	
	/**
     * Create the game's set of cards.
     * @return {jQuery[]} Array of cards.
     */
	createCards() {
		let self = this;
		let cards = [];
		
		// Create matching pairs of cards
		for(let i = 1; i <= this.numOfPairs; i++) {
			let card1 = new Card(this.emojiEntities[i-1]);
			let card2 = new Card(this.emojiEntities[i-1]);
			card1.matchId = i;
			card2.matchId = i;
			cards.push(card1);
			cards.push(card2);
		}
		
		// Set up player interactions with cards
		cards.forEach( function (card) {
			card.$view.click( function () {
				if(!card.isRevealed && self.isInteractionAllowed) {
					card.flip();
					self.revealedCards.push(card);
					if(self.revealedCards.length == 2) {
						self.processRevealedCards();
					}
				}
			});
		});
		
		return cards;
	}
	
	/**
     * Insert the cards' views into the board.
     */
	dealCards() {
		this.cards.forEach( function (card) {
			$("#board").append(card.$view);
		});
	}
	
	/**
     * Check if two cards match.
     * @return {bool} True if cards match, false otherwise.
     */
	isMatch(card1, card2) {
		return (card1.matchId == card2.matchId);
	}
	
	/**
     * Update the score in the DOM.
     */
	updateScore() {
		$('#matches').text(this.score);
	}
	
	/**
     * Update the turns in the DOM.
     */
	updateTurns() {
		$('#turns').text(this.turnsCount);
	}
	
	/**
     * Set all revealed cards face down.
     */
	resetRevealedCards() {
		this.revealedCards.forEach(card => card.flip());
	}
	
	/**
     * Shuffle the array of cards.
     */
	shuffleCards() {
	    for (let i = this.cards.length - 1; i > 0; i--) {
	        const j = Math.floor(Math.random() * (i + 1));
	        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
	    }
	}
	
	/**
     * Start the game.
     */
	play() {
		$("#turns").text(0);
		$("#matches").text(0);
		$("#pairs").text(this.numOfPairs);
		this.createCards();
		this.shuffleCards();
		this.dealCards();
	}
	
	/**
     * Show the victory screen.
     */
	showVictoryScreen() {
		$("#victory-screen").fadeIn();
	}
	
	/**
     * Determine if a match was found and update game accordingly.
     */
	processRevealedCards() {
		this.isInteractionAllowed = false;
		setTimeout(function () {
			if( this.isMatch(this.revealedCards[0], this.revealedCards[1]) ) {
				this.revealedCards.forEach(card => card.setMatched());
				this.score++;
				if(this.score == this.numOfPairs) {
					this.showVictoryScreen();
				}
				this.updateScore();
			} else {
				this.resetRevealedCards();
			}
			this.turnsCount++;
			this.updateTurns();
			this.revealedCards = [];
			this.isInteractionAllowed = true;
		}.bind(this), 1000);
	}
}






class Card {
	
	/**
     * Create a Card.
     * @param {string} emoji - Emoji HTML entity to show on the card.
     */
	constructor(emoji) {
		/**
		  * ID for identifying matcing pairs of cards. Card with the same matchId are matches.
          * @type {number}
          */
		this.matchId = 0;
		
		/**
		  * Emoji entity to show on the card.
          * @type {string}
          */
		this.emoji = emoji;
		
		/**
		  * The card's HTML view.
          * @type {jQuery}
          */
		this.$view = this.makeView();
		
		/**
		  * If the card is revealed (face up, waiting to be matched).
          * @type {bool}
          */
		this.isRevealed = false;
	}
	
	/**
     * Make the card's HTML view.
     * @param {string} emoji - Emoji HTML entity.
     * @return {jQuery} The card's HTML view.
     */
	makeView() {
		let $card = $("<div>", {"class": "card"}).append( $("<div>", {"class": "card-outer"})
					.append( $("<div>", {"class": "card-inner"})
							 .append( $("<div>", {"class": "card-back"}))
							 .append( $("<div>", {"class": "card-face"})
							 		  .append( $("<div>", {"class": "card-icon"})
							 		  		   .text(this.emoji) ) ) ));
		return $card;
	};
	
	/**
     * Flip the card.
     */
	flip() {
		this.isRevealed ? this.hide() : this.reveal();
	};
	
	/**
     * Set the card face up.
     */
	reveal() {
		this.$view.addClass('revealed');
		this.isRevealed = true;
	}
	
	/**
     * Set the card face down.
     */
	hide() {
		this.$view.removeClass('revealed');
		this.isRevealed = false;
	}
	
	/**
     * Set the card as matched with another card.
     */
	setMatched() {
		this.$view.addClass('matched');
	}
};









/* Helper functions */

/**
 * Create an array of numbers for a given range.
 * @param {number} start - Beginning of range.
 * @param {number} end - End of range.
 */
function range(start, end) {
    return [...Array(end-start+1).keys()].map(i => i + start);
}