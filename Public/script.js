//attempt variable corresponds to the row the user can input values into
let currentTry = 1;
let gameOver = false;
let gameWon = false;
let gameLost = false;

const starterBox = document.getElementById(`row${currentTry}pos1`);
//double check to see if this is necessary to assign this.
let currentBox = starterBox;

//calls getWord to the server to get a word. This word shouldnt change while window does not close
window.onload = function() {
    getWord()
}
//on page first load it should focus on the first input box
//need to refactor in later to save everything to sessionStorage so user can navigate away from the page and come back to the same position.
starterBox.focus();

function getWord(){
    fetch('/answers')
        .then(response => response.json())
        .then(json => {
            console.log("word set");
        })
}

//MOUSE CLICK EVENT LISTENER:
//disables mouse click on the DOM except for the keyboard.
document.addEventListener('mousedown', inputBoxOnly, true);

function inputBoxOnly(e) {
    if(gameWon){
        alert("You've already won today. Please wait till your ego deflates a bit before trying again.");
        return;
    }
    if(gameLost){
        alert("Sorry thats you're attempt for today. Please read a dictionary or something before trying again.");
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    //event delegation function to handle clicking on on-screen keyboard
    addValue(e);
    //currentbox is set every new user input so if user tries to click away from input fields, it should auto focus back on the last input field
    if(document.activeElement !== currentBox){
        currentBox.focus();
    }
}

//PHYSICAL KEYBOARD EVENT LISTENER
document.addEventListener('keydown', function updateValue(event) {
    if(gameWon){
        alert("You've already won today. Please wait till your ego deflates a bit before trying again.");
        return;
    }
    if(gameLost){
        alert("Sorry thats you're attempt for today. Please read a dictionary or something before trying again.");
        return;
    }
    var regex = /^[a-z]/;
    //inputs value if its a letter
    if(regex.test(event.key)){
        currentBox = document.activeElement;
        currentBox.innerHTML = event.key;
        currentBox.dataset.filled = "true";
        autotab();
        return;
    }
    //detects if backspace/delete is pressed
    if(event.key === "Backspace" || event.key ==="Delete"){
        deleteTab();
        return;
    }
    //detects if enter is pressed and only submits if its the last input box of the row and a value has been submitted
    if(event.key === "Enter"){
        if(currentBox === document.getElementById(`row${currentTry}pos5`) && currentBox.dataset.filled == "true"){
            //calls server to check answer
        checkAnswer();
        //double check to see if this is necessary seeing as we call it in checkAnswers but for some reason it wasnt working properly before
        document.getElementById(`row${currentTry}pos1`).focus();
        }
        return;
    }
    event.preventDefault();
    
})

//stores the answer of the current Row and saves it into an array to send to server
function getAnswer(){
    let answer = [
        document.getElementById(`row${currentTry}pos1`).innerHTML,
        document.getElementById(`row${currentTry}pos2`).innerHTML,
        document.getElementById(`row${currentTry}pos3`).innerHTML,
        document.getElementById(`row${currentTry}pos4`).innerHTML,
        document.getElementById(`row${currentTry}pos5`).innerHTML,
        ]
    return answer;
}

//stores currentTry and the user input into JSON and calls server
function checkAnswer(){
    let options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attempt:currentTry,
                answer:getAnswer()
            }),
        };      
    //POST request and sends options over
    fetch('/answers', options)
      .then(response => response.json())
      .then(data => {
        //this is to debug to see the response. can delete
        console.log('Success:', data);
        //updates relevant data attributes in the HTML for correct/wrong answers
        updateBoxes(data);
        //updates the currentTry to a +1 value
        currentTry = data.attempt;
        //should focus on the next new row
        document.getElementById(`row${currentTry}pos1`).focus();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}

//sets relevent data attributes in the HTML
function updateBoxes(json){
    let correctLetters = 0;
    //an array to capture the correct letters to give the answer
    let x = [];
    //checks if letter positions are correct
    for (let i = 0; i < json.answer.length; i++) {
        if(json.answer[i] == true){
            //if correct - make boxes and keyboard letter green and increment correctLetters counter for won game status
            document.getElementById(`row${currentTry}pos${i+1}`).dataset.state = "correct";
            document.getElementById(document.getElementById(`row${currentTry}pos${i+1}`).innerHTML).dataset.state = "KBcorrect";
            correctLetters++;
            x.push(document.getElementById(`row${currentTry}pos${i+1}`).innerHTML);
        }
        //sets boxes and keyboard letters to be yellow
        else if (json.isItThere[i] == "exists"){
            document.getElementById(`row${currentTry}pos${i+1}`).dataset.state = "exists";
            document.getElementById(document.getElementById(`row${currentTry}pos${i+1}`).innerHTML).dataset.state = "KBexists";
        }
        //sets boxes and keyboard letters to be black
        else {
            document.getElementById(`row${currentTry}pos${i+1}`).dataset.state = "missing";
            document.getElementById(document.getElementById(`row${currentTry}pos${i+1}`).innerHTML).dataset.state = "KBmissing";
        }
    }
    //checks for winning game conditions and calls winGame function if all 5 letters are correct
    if(correctLetters === 5){
        let correctAnswer = x.join("");
        winGame(correctAnswer);
    }
    if(correctLetters !== 5 && currentTry === 6){
        loseGame();
    }
    //this may or may not be necessary, added it in multiple spots to resolve a bug in that the correct box wasnt being focused whenever a value was updated
    document.getElementById(`row${currentTry+1}pos1`).focus();
}

//this is the function that handles the delegated event listener for mouse clicks on the on screen keyboard
function addValue(event){
    if(gameWon){
        alert("You've already won today. Please wait till your ego deflates a bit before trying again.");
        return;
    }
    if(gameLost){
        alert("Sorry thats you're attempt for today. Please read a dictionary or something before trying again.");
        return;
    }
    //when a keyboard letter is pressed, the letter is inserted into the currentBox focus and it moves focus to the input box
    var ele = event.target;
    currentBox = document.activeElement;
    if(ele.classList.contains("charKey")){
        currentBox.innerHTML = ele.getAttribute('value');
        currentBox.focus()
        //sets it as a filled box styling in css
        currentBox.dataset.filled = "true";
        autotab();
    }
    //when enter is pressed, it checks if all 5 letters are filled before checking if the answer is right
    if(ele.classList.contains("enter")){
        if(currentBox === document.getElementById(`row${currentTry}pos5`) && currentBox.dataset.filled == "true"){
        checkAnswer();
        //json is recieved from the server and updates the currentTry function/number of attempts to +1 and then makes the next line the focus
        document.getElementById(`row${currentTry}pos1`).focus();
        }
    }
    if(ele.classList.contains("delete")){
        deleteTab();
    }
    //otherwise, do nothing
    event.preventDefault();
}

//logic for deleting input values and returning to the previous input field.
function deleteTab(){
    currentBox = document.activeElement;
    currentBox.innerHTML ="";
    currentBox.dataset.filled = 'false';
    //if its the first box, do not change input box target
    if(currentBox === document.getElementById(`row${currentTry}pos1`)){
        return;
    }
    //tabbing backwards when deleting values - if the try catch block isnt there it fails for some reason
    for (let i = 1; i < 6; i++) {
        if(currentBox === document.getElementById(`row${currentTry}pos${i}`)){
            try{
                currentBox = document.getElementById(`row${currentTry}pos${i-1}`);
                currentBox.focus();
                break;
            }
            catch (error){
                console.log(error)
            } 
        }    
    } 
}

//logic for moving to next input field.
function autotab(){
    currentBox = document.activeElement;
    //do nothing if you are on the last input box of a row
    if(currentBox === document.getElementById(`row${currentTry}pos5`)){
        return;
    }
    //if the try catch block isnt there it seems to fail just like delete tab
    for (let i = 1; i < 5; i++) {
        if(currentBox === document.getElementById(`row${currentTry}pos${i}`) && currentBox !== document.getElementById(`row${currentTry}pos5`)){
            try{
                currentBox = document.getElementById(`row${currentTry}pos${i+1}`);
                currentBox.focus();
                break;
            }
            catch (error){
                console.log(error)
            } 
        }    
    } 
}

function winGame(correctAnswer){
    gameOver = true;
    gameWon = true;
    alert(`congratulations!!!! you win!!!!!!! You managed to guess ${correctAnswer} in ${currentTry} guesses.`);
}

function loseGame(){
    gameOver = true;
    gameLost = true;
    alert(`sorry, but you didn't manage to guess the answer in 6 guesses. Better luck next time.`)
}