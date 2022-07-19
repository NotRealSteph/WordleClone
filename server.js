const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

const words = [];
const answer = [];
const checkedLetters = [];
const checkedPositions = [];
let duplicateLetters = {};

app.use(express.static('Public'));
app.use(bodyParser.json());

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
        res.json(x);
    }
});

//refactor to include duplicate letters counter
function storeAnswer(x){
    let splitX = [] = x.split("");
        for (let i = 0; i < splitX.length; i++) {
            answer.push(splitX[i]);
            }
        duplicateLetters = findDuplicateLetters();
        console.log(answer);
}

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
app.post('/answers', (req, res) =>{
    console.log(req.body);
    let answerOptions = req.body;
    compareAnswers(answerOptions);
    //will need to send duplicate letter counters in the answer back to user
    let finalResult = {attempt:answerOptions.attempt+1,
                        answer:checkedLetters,
                        isItThere:checkedPositions,
                       //duplicates:duplicateLetters,
                    };
    //console log the results just for debugging. can delete afterwards.
    res.json(finalResult);
});

//check for duplicate letters and put in a counter here for the "exists" option to keep track.
function compareAnswers(answerOptions){
    let toMap = {};
debugger;
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
    
    for (let i = 0; i < answer.length; i++) {
        if(checkedLetters.length > 4){
            checkedLetters.shift()
            checkedPositions.shift();
        };
        if(answerOptions.answer[i] == answer[i]){
            checkedLetters.push(true);
            checkedPositions.push("correct");    
        }
        //need to fix the logic here.
        //when all the duplicate letters are filled in correct positions, logic works
        //when one duplicate letter is correct but the others are "existing" then they all show up yellow

        else if(answer.includes(answerOptions.answer[i]) && answerOptions.answer[i] != answer[i] && duplicateLetters[answerOptions.answer[i]]){
            if(toMap[answerOptions.answer[i]]  >= duplicateLetters[answerOptions.answer[i]]){
                checkedLetters.push(false);
                checkedPositions.push("missing");
            }
            else {
                checkedLetters.push(false);
                checkedPositions.push("exists");
                if(toMap[answerOptions.answer[i]]) {
                    toMap[answerOptions.answer[i]] += 1;
                   }
                   else {
                    toMap[answerOptions.answer[i]] = 1
                }
            }
            console.log(toMap[answerOptions.answer[i]]);
        }
        else{
            checkedLetters.push(false);
            checkedPositions.push("missing");
            toMap[answerOptions.answer[i]] = 0;
        }
    }
    console.log(toMap);
}

app.listen(3000,()=>{
    console.log('http://localhost:3000');
});