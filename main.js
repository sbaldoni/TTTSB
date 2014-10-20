var TTTApp = angular.module('TTTApp', ["firebase"]);
TTTApp.controller('TTTCtrl', function($scope, $firebase) {
    var ticTacRef = new Firebase("https://tttmaster.firebaseio.com/");
 	$scope.fbRoot = $firebase(ticTacRef);

 	$scope.fbRoot.$on("loaded", function() {
		var IDs = $scope.fbRoot.$getIndex();
		if(IDs.length == 0) {
			// Set all items here to be shared between players on different browsers.
	 		$scope.fbRoot.$add({ 
	 			cells:['','','','','','','','',''], 
	 			play: true, 
	 			turns: 0, 
	 			p1score: 0, 
	 			p2score: 0, 
	 			ties: 0, 
	 			winner: '', 
	 			nextPlayer: 'Player 1, your move!', 
	 			player1: 'X', 
	 			player2: 'O',
	 		});
			$scope.fbRoot.$on("change", function() {
				IDs = $scope.fbRoot.$getIndex();
				$scope.object = $scope.fbRoot.$child(IDs[0]);
			});
		}
		else {
			$scope.object = $scope.fbRoot.$child(IDs[0]);
		}
	});

 	// gateKeeper variable used to prevent one player making both X and O moves.
	var gateKeeper;
    $scope.nextMove = function(x) {
        if ($scope.object.play) {        
            if ($scope.object.turns % 2 == 0 && ($scope.object.cells[x] == '' && gateKeeper != 'O')) {
            	gateKeeper = 'X'; 
				$scope.object.cells[x] = gateKeeper;
				$scope.object.turns++;
				$scope.object.nextPlayer = $scope.object.player2 + ' is next!';
				$scope.object.$save();
            }
            else if ($scope.object.turns % 2 == 1 && ($scope.object.cells[x] == '' && gateKeeper != 'X')) {
            	gateKeeper = 'O';
				$scope.object.cells[x] = gateKeeper;
				$scope.object.turns++;
				$scope.object.nextPlayer = $scope.object.player1 + ' is next!';
				$scope.object.$save();	
            }
        checksForWin(); 
        }
    };

    // checksForWin Function will check for win after each time nextMove function is run.
    function checksForWin() {
    	var cell = $scope.object.cells;
       	var win = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

        for (var i = 0; i < win.length; i++) {
            if ((cell[win[i][0]] == 'X' && cell[win[i][1]] == 'X' && cell[win[i][2]] == 'X')) {
                $scope.object.winner = $scope.object.player1 + ' wins in ' + $scope.object.turns + ' moves!';
                $scope.object.play = false;
                $scope.object.nextPlayer = '';
                $scope.object.p1score++;
                $scope.object.$save();
            }
            else if ((cell[win[i][0]] == 'O' && cell[win[i][1]] == 'O' && cell[win[i][2]] == 'O')) {
                $scope.object.winner = $scope.object.player2 +' wins in ' + $scope.object.turns + ' moves!';
                $scope.object.nextPlayer = '';
                $scope.object.p2score++;
                $scope.object.play = false;
                $scope.object.$save();
            }
        }
        // Keep outside of for-loop to prevent incorrect ties counter.
        if ($scope.object.play && $scope.object.turns == 9) {
            $scope.object.winner = 'Draw!';
            $scope.object.nextPlayer = '';
            $scope.object.ties++;
            $scope.object.play = false;
            $scope.object.$save();
        }
    };

    // Reset game without overwritting current scores, draw, and player names.
    $scope.resetGame = function() {
    	if (!$scope.object.play) { // Ensure play is false to prevent restarts mid-game.
	    	$scope.object.$set({
				cells:['','','','','','','','',''], 
				play: true, 
				turns: 0,
				p1score: $scope.object.p1score,
				p2score: $scope.object.p2score,
				ties: $scope.object.ties,
				winner: '', 
				nextPlayer: $scope.object.player1 + ', your move!', 
				player1: $scope.object.player1, 
				player2: $scope.object.player2
	    	});
    	}
    	else {
	    	alert("Game isn't over yet!");
	    }
    };

    // Clear score totals without overwritting player names.
    $scope.clearTotals = function() {
        $scope.object.$set({
        	cells:['','','','','','','','',''], 
			play: true, 
			turns: 0, 
			p1score: 0,
			p2score: 0,
			ties:0,
			winner: '', 
			nextPlayer: $scope.object.player1 + ', your move!', 
			player1: $scope.object.player1, 
			player2: $scope.object.player2
        });
    };

    // Transitions between stylesheets. Initial stylesheet set to prevent missing sytling.
    // Need to address sheet change only occurs once pointer moves away from button...?
    $scope.stylePath = 'style.css';
    $scope.changeStyle = function() {
        if ($scope.stylePath == 'style.css') {
            $scope.stylePath = 'style2.css';
        }
        else {
            $scope.stylePath = 'style.css';
        }
    };   
});
