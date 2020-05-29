import { Alert } from 'react-native';

/*
getHeight(board, column) will return the height (number of chips) of the provided column
in the provided board. The board argument is a list with two elements: first is a grid
(list of lists) representing the position of the chips, and second is an int (0-3, inclusive)
represenging the orientation of the board. The column is an int (0-6, inclusive) representing
the index of the column. It returns an int count representing the number of chips in that 
column.
*/
export function getHeight(board, column) {
    let boardGrid = board[0]
    let orientation = board[1]
    let col = column
    if (orientation == 1 || orientation == 2) {
        col = (6 - (orientation % 2)) - col
    }
    if (orientation % 2 == 0) {
        let count = 0
        for (let i = 0; i < 6; i++) {
            if (boardGrid[i][col]) {
                count += 1
            }
        }
        return count
    } else {
        let count = 0
        for (let i = 0; i < 7; i++) {
            if (boardGrid[col][i]) {
                count += 1
            }
        }
        return count
    }
}

/*
dropChip(board, column, color) will drop a chip of the provided color into the provided
column in the provided board and will return the resulting board. The board argument is a list 
with two elements: first is a grid (list of lists) representing the position of the chips, and 
second is an int (0-3, inclusive) represenging the orientation of the board. The column is an 
int (0-6, inclusive) representing the index of the column. The color is a string ("0" or "1")
representing whether the chip being dropped is for player 1 or 2, respectively. The board returned
is in the same form as the board argument (a list with two elements).
*/
export function dropChip(board, column, color) {
    let boardGrid = JSON.parse(JSON.stringify(board[0]))
    if (board[1] == 0) {
        for (let i = boardGrid.length - 1; i >= 0; i--) {
            if (boardGrid[i][column] === '') {
                boardGrid[i][column] = color + " "
                break
            }
        }
    } else if (board[1] === 2) {
        column = Math.abs(column - 6)
        for (let i = 0; i < boardGrid.length; i++) {
            if (boardGrid[i][column] === '') {
                boardGrid[i][column] = color + " "
                break
            }
        }
    } else if (board[1] === 1) {
        column = Math.abs(column - 5)
        for (let i = boardGrid[0].length - 1; i >= 0; i--) {
            if (boardGrid[column][i] === '') {
                boardGrid[column][i] = color + " "
                break
            }
        }
    } else {
        for (let i = 0; i < boardGrid[0].length; i++) {
            if (boardGrid[column][i] === '') {
                boardGrid[column][i] = color + " "
                break
            }
        }
    }
    return [boardGrid, board[1]]
}

/*
rotateBoard(board, direction) will take a board and rotation direction and return 
the board that results after the chips have fallen according to the new gravity. 
The board argument is a list with two elements: first is a grid (list of lists) 
representing the position of the chips, and second is an int (0-3, inclusive) 
represenging the orientation of the board. The direction is an int representing 
the direction of rotation (-1 = ccw, 1 = cw).
*/
export function rotateBoard(board, direction) {
    let boardGrid = board[0]
    let orientation = board[1]
    let boardGridCopy = JSON.parse(JSON.stringify(boardGrid))
    let endingDir = (orientation + direction + 4) % 4
    if (endingDir % 2 === 0) {
        for (let c = 0; c < boardGridCopy[0].length; c++) {
            let copy = []
            for (let r = 0; r < boardGridCopy.length; r++) {
                copy.push(boardGridCopy[r][c])
            }
            let temp = copy.filter((item) => item !== '')
            let blanks = []
            for (let empty = 0; empty < copy.length - temp.length; empty++) {
                blanks.push('')
            }
            if (endingDir === 0) {
                let col = blanks.concat(temp)
                for (let r = 0; r < boardGridCopy.length; r++) {
                    boardGridCopy[r][c] = col[r]
                }
            } else {
                let col = temp.concat(blanks)
                for (let r = 0; r < boardGridCopy.length; r++) {
                    boardGridCopy[r][c] = col[r]
                }
            }
        }
    } else {
        for (let r = 0; r < boardGridCopy.length; r++) {
            let temp = boardGridCopy[r].filter((item) => item !== '')
            let blanks = []
            for (let empty = 0; empty < boardGridCopy[r].length - temp.length; empty++) {
                blanks.push('')
            }
            if (endingDir === 1) {
                boardGridCopy[r] = blanks.concat(temp)
            } else {
                boardGridCopy[r] = temp.concat(blanks)
            }
        }
    }
    return [boardGridCopy, endingDir]
}

/*
getWin(boardGrid) takes a board grid as an argument and determines the status
of the game. The board grid is a list of lists representing the position of the
chips (the first element in a list representing a board). It returns a list with
three elements: the first is a boolean for if the game is over (true if the game
is over and false otherwise), the second is the winner if applicable, and the third
is the board updated to highlight the chips that result in a win for the player.
*/
export function getWin(boardGrid) {
    let boardGridCopy = JSON.parse(JSON.stringify(boardGrid))
    let oneWin = false
    let twoWin = false
    for (let r = 0; r < boardGridCopy.length; r++) {
        for (let c = 0; c < boardGridCopy[0].length; c++) {
            if (boardGridCopy[r][c] === "0 ") {
                if (c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let col = c; col < c + 4; col++) {
                        if (boardGridCopy[r][col] !== "0 ") {
                            win = false
                        }
                    }
                    if (win) {
                        oneWin = true
                        for (let col = c; col < c + 4; col++) {
                            boardGridCopy[r][col] = "0w"
                        }
                    }
                }
                if (r < boardGridCopy.length - 3) {
                    let win = true
                    for (let row = r; row < r + 4; row++) {
                        if (boardGridCopy[row][c] !== "0 ") {
                            win = false
                        }
                    }
                    if (win) {
                        oneWin = true
                        for (let row = r; row < r + 4; row++) {
                            boardGridCopy[row][c] = "0w"
                        }
                    }
                }
                if (r < boardGridCopy.length - 3 && c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let inc = 0; inc < 4; inc++) {
                        if (boardGridCopy[r + inc][c + inc] !== "0 ") {
                            win = false
                        }
                    }
                    if (win) {
                        oneWin = true
                        for (let inc = 0; inc < 4; inc++) {
                            boardGridCopy[r + inc][c + inc] = "0w"
                        }
                    }
                }
                if (r > 2 && c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let inc = 0; inc < 4; inc++) {
                        if (boardGridCopy[r - inc][c + inc] !== "0 ") {
                            win = false
                        }
                    }
                    if (win) {
                        oneWin = true
                        for (let inc = 0; inc < 4; inc++) {
                            boardGridCopy[r - inc][c + inc] = "0w"
                        }
                    }
                }
            }

            if (boardGridCopy[r][c] === "1 ") {
                if (c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let col = c; col < c + 4; col++) {
                        if (boardGridCopy[r][col] !== "1 ") {
                            win = false
                        }
                    }
                    if (win) {
                        twoWin = true
                        for (let col = c; col < c + 4; col++) {
                            boardGridCopy[r][col] = "1w"
                        }
                    }
                }
                if (r < boardGridCopy.length - 3) {
                    let win = true
                    for (let row = r; row < r + 4; row++) {
                        if (boardGridCopy[row][c] !== "1 ") {
                            win = false
                        }
                    }
                    if (win) {
                        twoWin = true
                        for (let row = r; row < r + 4; row++) {
                            boardGridCopy[row][c] = "1w"
                        }
                    }
                }
                if (r < boardGridCopy.length - 3 && c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let inc = 0; inc < 4; inc++) {
                        if (boardGridCopy[r + inc][c + inc] !== "1 ") {
                            win = false
                        }
                    }
                    if (win) {
                        twoWin = true
                        for (let inc = 0; inc < 4; inc++) {
                            boardGridCopy[r + inc][c + inc] = "1w"
                        }
                    }
                }
                if (r > 2 && c < boardGridCopy[0].length - 3) {
                    let win = true
                    for (let inc = 0; inc < 4; inc++) {
                        if (boardGridCopy[r - inc][c + inc] !== "1 ") {
                            win = false
                        }
                    }
                    if (win) {
                        twoWin = true
                        for (let inc = 0; inc < 4; inc++) {
                            boardGridCopy[r - inc][c + inc] = "1w"
                        }
                    }
                }
            }
        }
    }
    let full = true
    for (let c = 0; c < 7; c++) {
        if(getHeight([boardGridCopy, 0], c) < 6) {
            full = false
        }
    }
    let gameOver = full || oneWin || twoWin
    let winner = null
    if(oneWin && twoWin) {
        winner = "tie"
    } else if(oneWin) {
        winner = "one"
    } else if(twoWin) {
        winner = "two"
    } else if(full) {
        winner = "full"
    }
    return [gameOver, winner, boardGridCopy]
}

/*
alertWinner(winner) will Alert based on the winner provided.
*/
export function alertWinner(winner) {
    if(winner == "one" || winner == "two") {
        Alert.alert(
            "Player " + winner + " wins!",
            'Press "Reset Game" to play again.',
            [
                { text: 'OK' },
            ],
            { cancelable: false },
        );
    } else {
        Alert.alert(
            "It's a tie!",
            'Press "Reset Game" to play again.',
            [
                { text: 'OK' },
            ],
            { cancelable: false },
        );
    }
}