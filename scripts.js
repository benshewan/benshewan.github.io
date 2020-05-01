(() => {
    let clickedStart = 0;
    let modal;
    let players = [];
    let currentPlayer = 1;
    //attach listener to start button
    document.getElementById("start-game").addEventListener("click", () => {
        if (!(clickedStart >= 1)) {
            StartGame();
            clickedStart++;
        }
    });

    //Fisher-Yates shuffle algorith taken from Jeff's post here: 
    //https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array 
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    function updatePlayerData() {
        let playerAmount = document.getElementById("players").value;
        for (playerAmount; playerAmount != 0; playerAmount--) {
            document.getElementById(`player-${playerAmount}`).innerHTML = `$${players[playerAmount-1]}`
        }
    }

    //function run when start button is pressed, begins building the table
    function StartGame() {
        //create player score board
        let playerAmount = document.getElementById("players").value;
        document.getElementById("player-scores").innerHTML = ""
        for (playerAmount; playerAmount != 0; playerAmount--) {
            players.push(0);
            console.log(players)
            console.log(currentPlayer)
            document.getElementById("player-scores").innerHTML += `<span>Player ${playerAmount}:</span><span id="player-${playerAmount}" style="margin-right: 20px">$${players[currentPlayer-1]}</span>`
        }

        //if random category is chosen then pick a random number
        function categoryCheck(value) {
            if (value === "any") {
                value = Math.floor(Math.random() * 23) + 9;
            }
            return value
        }
        //run api requesting function and unveil the game board
        for (let i = 1; i <= 5; i++) {
            let category = document.getElementById(`category-${i}`).value;
            category = categoryCheck(category);
            ApiRequest(category, i);
            if (i === 5) {
                setTimeout(() => {
                    document.getElementById("game-setup").style.display = "none";
                    document.getElementById("game-board").style.display = "flex";
                    document.getElementById("player-scores").style.display = "block";
                    document.getElementById("current-player").style.display = "block";
                }, 1500)
            }
        }
    }

    //takes data from api calls and inserts into table
    function fillTable(quizData, column) {
        document.getElementById(`row-${column}`).innerText = quizData[0].results[0].category;
        console.log(quizData)
        for (let j = 1; j <= 5; j++) {
            let currentCell = document.getElementById(`${j}${column}`);
            currentCell.addEventListener("click", cellEvent);

            function cellEvent() {
                console.log(quizData)
                let question
                let questionBank = [];
                if (j === 1) {
                    question = quizData[0].results[0];
                } else if (j === 2) {
                    question = quizData[0].results[1];
                } else if (j === 3) {
                    question = quizData[1].results[0];
                } else if (j === 4) {
                    question = quizData[1].results[1];
                } else {
                    question = quizData[2].results[0];
                }
                console.log(question);
                //create the bank of answers for the question
                question.incorrect_answers = question.incorrect_answers.filter(answer => answer !== question.correct_answer);
                questionBank = question.incorrect_answers;
                questionBank.push(question.correct_answer);
                questionBank = shuffle(questionBank);

                //function run when an answer is selected
                function questionClick(i) {
                    console.log(question.correct_answer)
                    let clickedObject = document.getElementById(`option-${i}`);
                    let selectedAnswer = clickedObject.innerText;
                    //run when answer is correct
                    if (selectedAnswer === question.correct_answer) {
                        console.log("you did it!");
                        currentCell.style.backgroundColor = "red";
                        console.log(currentPlayer)
                        players[currentPlayer-1] += parseInt(currentCell.innerText.match(/\d+/g));
                        //removes event listener since question was answered correctly
                        currentCell.removeEventListener("click", cellEvent);
                        //run when answer is wrong
                    } else {
                        console.log("what a failure!");
                        currentCell.style.backgroundColor = "#0078e7";
                    }
                    modal.close();
                    modal.destroy();
                    updatePlayerData();
                    currentPlayer = currentPlayer % document.getElementById("players").value +1;
                    document.getElementById("current-player").innerHTML = `<h1>Player ${currentPlayer}</h1>`;
                }
                //create the popup modal for the question selected
                modal = picoModal({
                    content: `<h1>Category: ${question.category}</h1>
                    <h1 id="money-header">${document.getElementById(`${j}${column}`).innerText}</h1>
                    <p id="question">${question.question}</p>
                    <button id="option-1" class="pure-button">${questionBank[0]}</button>
                    <br>
                    <button id="option-2" class="pure-button">${questionBank[1]}</button>
                    <br>
                    <button id="option-3" class="pure-button">${questionBank[2]}</button>
                    <br>
                    <button id="option-4" class="pure-button">${questionBank[3]}</button>`,
                    closeButton: false,
                    overlayClose: false,
                    escCloses: false
                });
                modal.show();
                //add event listeners to the answers
                for (let i = 1; i <= 4; i++) {
                    document.getElementById(`option-${i}`).addEventListener("click", () => questionClick(i));
                }
            }
        }
    }
    //send three separate api requests and bundle all the data together
    async function ApiRequest(categoryId, index) {
        let easyURL = `https://opentdb.com/api.php?amount=2&category=${categoryId}&difficulty=easy&type=multiple`;
        let mediumURL = `https://opentdb.com/api.php?amount=2&category=${categoryId}&difficulty=medium&type=multiple`;
        let hardURL = `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=hard&type=multiple`;
        let data = [];
        await fetch(easyURL)
            .then(response => response.json())
            .then(json => data.push(json))
        await fetch(mediumURL)
            .then(response => response.json())
            .then(json => data.push(json))
        await fetch(hardURL)
            .then(response => response.json())
            .then(json => data.push(json));
        fillTable(data, index)
        //console.log(data)
    }
})()