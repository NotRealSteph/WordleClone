const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

//array of 5 letter words that can be the answer
const words = [];
//array for the answer
const answer = [];
//array of true or false for whether letters exist in the answer
const checkedLetters = [];
//array for checking if individual letters are in correct/missing/exist positions
const checkedPositions = [];
//variable for keeping track of duplicate letters that exist in the answer
let duplicateLetters = {};

app.use(express.static('Public'));
app.use(bodyParser.json());

//reading the word list and generating the array of words
fs.readFile('words.txt', 'utf8', function(error, word){
    if(error) throw error;
    //identifying spaces and new line characters within a regular expression
    let delimiter = /\r\n/;
    //split word up by delimiter
    let dataAsArray = [] = word.split(delimiter);
    //push the words into the array of words
    for (let k = 0; k < dataAsArray.length; k++) {
        words.push(dataAsArray[k]);
    }
});

//selects a random word for the puzzle
app.get('/answers', (req, res) =>{
    if(answer.length == 0){
        let x = words[Math.floor(Math.random()*words.length)];
        storeAnswer(x);
        res.json(answer);
    }
});

//stores the selected word into the Answer array and checks for duplicate letters in the answer
function storeAnswer(x){
    let splitX = [] = x.split("");
        for (let i = 0; i < splitX.length; i++) {
            answer.push(splitX[i]);
            }
        duplicateLetters = findDuplicateLetters();
        console.log(answer);
}

//does a loop that adds the letter in the answer to the object with key value of +=1
//FYI: when it encounters that the letter key already exists, it increments it by 1 or sets it at 1 if it doesnt exist yet.
//this creates a counter for duplicates
function findDuplicateLetters() {
    let toMap = {};
    for (let i = 0; i < answer.length; i++) {
       if(toMap[answer[i]]) {
        toMap[answer[i]] += 1;
       }
       else{
       toMap[answer[i]] = 1;
       }
    }
     return toMap;
}

//calls compareAnswers to see if the user input was correct or not, then sends right/wrong answers with extra attempt.
//note does not send the actual answer to the client - only correct or incorrect positions.
app.post('/answers', (req, res) =>{
    console.log(req.body);
    let answerOptions = req.body;
    compareAnswers(answerOptions);
    let finalResult = {attempt:answerOptions.attempt+1,
                        answer:checkedLetters,
                        isItThere:checkedPositions,
                    };
    res.json(finalResult);
});

//check for duplicate letters and put in a counter here for the "exists" option to keep track.
function compareAnswers(answerOptions){
    let toMap = {};
    //first loop is for checking for correct answers
    //also sets a counter toMap (can change the name) - keeps tracked of UTILISED duplicate letters for correct answers so future "exists" letters in incorrect positions are properly counted and EXTRA duplicate letters are marked as MISSING
    for (let i = 0; i < answer.length; i++) {
        if(answerOptions.answer[i] == answer[i]){
            if(toMap[answerOptions.answer[i]]) {
                toMap[answerOptions.answer[i]] += 1;
            }
            else {
                toMap[answerOptions.answer[i]] = 1
            }
        }
    }
    
    //probably a better way to do this. Im guessing to use local variables for the arrays and return it to be included in the response
    for (let i = 0; i < answer.length; i++) {
        if(checkedLetters.length > 4){
            checkedLetters.shift()
            checkedPositions.shift();
        };
        //correct letters are marked as correct. no need to increment duplicate counter because we already did that in the first loop above
        if(answerOptions.answer[i] == answer[i]){
            checkedLetters.push(true);
            checkedPositions.push("correct");    
        }
        //if the letter is in the answer but not in the correct position and it IS a duplicate letter
        else if(answer.includes(answerOptions.answer[i]) && answerOptions.answer[i] != answer[i] && duplicateLetters[answerOptions.answer[i]]){
            //check if the toMap duplicates counter is equal to or greater than the actual number of duplicate letters
            if(toMap[answerOptions.answer[i]]  >= duplicateLetters[answerOptions.answer[i]]){
                //if it is, mark the letter as missing/false
                checkedLetters.push(false);
                checkedPositions.push("missing");
            }
            else {
                //if it isnt and there are still duplicate letters not yet used, mark the letter as existing/false (will show yellow on client side)
                checkedLetters.push(false);
                checkedPositions.push("exists");
                if(toMap[answerOptions.answer[i]]) {
                    toMap[answerOptions.answer[i]] += 1;
                   }
                   else {
                    toMap[answerOptions.answer[i]] = 1
                }
            }
            //just for debugging, can delete when done.
            console.log(toMap[answerOptions.answer[i]]);
        }
        else{
            //otherwise if the letter is wrong, then return false and keep track on the counter that the letter doesnt exist.
            checkedLetters.push(false);
            checkedPositions.push("missing");
            toMap[answerOptions.answer[i]] = 0;
        }
    }
    //just for debugging. can delete
    console.log(toMap);
}

//let port = process.env.PORT;
//if (port == null || port == "") {
//  port = 8000;
//}
//app.listen(port);

app.listen(3000, () => {
    console.log("http://localhost:3000");
});
