import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, PanResponder, TouchableOpacity, Image, Easing } from 'react-native';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Feather';
import { getHeight } from '../boardFunctions';
import { dropChip } from '../boardFunctions';
import { rotateBoard } from '../boardFunctions';
import { getWin } from '../boardFunctions';
import { alertWinner } from '../boardFunctions';
import ColumnIndicator from './ColumnIndicator';
import RotateDropAnimation from './RotateDropAnimation';
import LoadingScreen from './LoadingScreen';
import Tutorial from './Tutorial';
import NavHeader from './NavHeader';
import { Audio } from 'expo-av';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

const chipWidth = screenWidth * 0.11

/* 
lanscapeColumns and portraitColumns correspond to the fraction of screen width where
each column in the board appears in that orientation. Used for absolute positioning of the
chips.
*/
let landscapeColumns = [0.05, 0.182, 0.314, 0.445, 0.576, 0.708, 0.838]
let portraitColumns = [0.155, 0.27, 0.386, 0.505, 0.622, 0.738]

export default function PlayBot({ route, navigation }) {
    const [positionValueOne, setpositionValueOne] = useState(new Animated.ValueXY({ x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 }))
    const [positionValueTwo, setpositionValueTwo] = useState(new Animated.ValueXY({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 }))
    const [turn, setTurn] = useState(true)
    const [botMove, setBotMove] = useState([0, 0, 0])
    const [botMovePartTwo, setBotMovePartTwo] = useState(false)
    const [botDepth, setBotDepth] = useState(2)
    const [winner, setWinner] = useState(null)
    const [dropped, setDropped] = useState(false)
    const [rotated, setRotated] = useState(false)
    const [board, setBoard] = useState([[['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']], 0])
    const [boardRotation, setBoardRotation] = useState(new Animated.Value(0))
    const [currCol, setCurrCol] = useState(-1)
    const [colors, setColors] = useState(["red", "yellow"])
    const [oneGoesFirst, setOneGoesFirst] = useState(true)
    const [blocked, setBlocked] = useState(false)
    const [boardZ, setBoardZ] = useState(-1)
    const [resetting, setResetting] = useState(true)
    const [showTutorial, setShowTutorial] = useState(false)
    const [tutorialIndex, setTutorialIndex] = useState(0)
    const [tutorialZIndex, setTutorialZIndex] = useState(2)

    const { oneFirst } = route.params
    const { colorScheme } = route.params
    const { tutorial } = route.params
    const { difficulty } = route.params
    const { music } = route.params

    const clinkSound = new Audio.Sound()

    async function makeClink() {
        try {
            await clinkSound.loadAsync(require('../assets/clink.wav'))
            await clinkSound.replayAsync()
        } catch (err) {
            console.log(err)
        }
    }

    /* Show the tutorial if the user came from pressing the tutorial button */
    useEffect(() => {
        setShowTutorial(tutorial)
    }, [tutorial])

    /* Set which player goes first from the route.params. */
    useEffect(() => {
        if (!oneFirst) {
            setOneGoesFirst(false)
        } else {
            setOneGoesFirst(true)
        }
    }, [oneFirst])

    /* Reset the game if the setting for who goes first is changed. */
    useEffect(() => {
        resetGame()
    }, [oneGoesFirst])

    /* 
    Change the color scheme based on what color scheme is passed it. The color scheme is a list containing
    two strings corresponding to the colors.
    */
    useEffect(() => {
        setColors(colorScheme)
    }, [colorScheme])

    /* Update the difficulty when it changes. */
    useEffect(() => {
        if (difficulty != undefined) {
            setBotDepth(difficulty)
        }
    }, [difficulty])

    /* If a chip has been dropped and rotated on a turn, the turn changes. */
    useEffect(() => {
        if (dropped && rotated) {
            setTurn(!turn)
            setDropped(false)
            setRotated(false)
        }
    }, [dropped, rotated])

    /* Any time the board changes, check if a player has won. */
    useEffect(() => {
        if (winner == null) {
            let res = getWin(board[0])
            setWinner(res[1])
        }
    }, [board])

    /* If there is a winner, change the board to highlight the circles and alert the winner. */
    useEffect(() => {
        if (winner != null) {
            let res = getWin(board[0])
            setBoard([res[2], board[1]])
            setTimeout(() => alertWinner(winner), 1500)
        }
    }, [winner])

    /* 
    When turn changes or the game is reset, check if the bot should make a move. If it should,
    get that move.
    */
    useEffect(() => {
        if (!turn && !resetting) {
            setBoardZ(-1)
            setTimeout(() => getBotMove(), 2000)
        }
    }, [turn, resetting])

    /* When the botMove is updated, execute the first part of the move (rotating or dropping). */
    useEffect(() => {
        if (!turn && winner == null && !resetting) {
            if (!botMove[2]) {
                makeBotDrop()
            } else {
                makeBotRotate()
            }
            setTimeout(() => setBotMovePartTwo(true), 3000)
        }
    }, [botMove])

    /* When the first part of the bot move is completed, start the second part of the move. */
    useEffect(() => {
        if (botMovePartTwo && winner == null && !resetting) {
            if (botMove[2]) {
                makeBotDrop()
            } else {
                makeBotRotate()
            }
        }
        setBotMovePartTwo(false)
    }, [botMovePartTwo])

    /* spin is used to interpolate the rotation of the board. */
    const spin = boardRotation.interpolate({
        inputRange: [0, 2 * Math.PI],
        outputRange: ['0deg', '360deg']
    })

    /*
    resetGame() resets the game and covers the board with a loading screen while 
    everything goes back to how it started. 
    */
    function resetGame() {
        setResetting(true)
        positionValueOne.stopAnimation()
        positionValueTwo.stopAnimation()
        boardRotation.stopAnimation()
        positionValueOne.setValue({ x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
        positionValueTwo.setValue({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
        boardRotation.setValue(0)
        setTimeout(() => {
            setBoard([[['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']], 0])
            setRotated(false)
            setDropped(false)
            setTurn(oneGoesFirst)
            setBlocked(false)
            setWinner(null)
            setBotDepth(difficulty != undefined ? difficulty : 1)
        }, 1200)
        setTimeout(() => setResetting(false), 2000)
    }

    /* 
    rotate(angle) takes an float argument (either Math.PI/2 or -Math.PI/2) and animates
    the rotation of the board. It then calls the rotateBoard function to update the position of the
    chips according to the new direction of gravity.
    */
    function rotate(angle) {
        if (turn && dropped && showTutorial) {
            setTimeout(() => {
                setTutorialIndex(tutorialIndex + 1)
                setTutorialZIndex(2)
            }, 7500)
        } else if (turn && showTutorial) {
            setTimeout(() => {
                setTutorialIndex(tutorialIndex + 1)
                setTutorialZIndex(2)
            }, 1000)
        }
        Animated.timing(
            boardRotation, {
            toValue: boardRotation._value + angle,
            easing: Easing.bounce,
            duration: 1000
        }
        ).start(() => {
            setRotated(true)
            setBoard(rotateBoard(board, angle / Math.abs(angle)))
            setBlocked(false)
        })
    }

    /*
    getClosestColumn(xVal) takes an xValue (float) and finds the column of the board
    that is closest to that xVal. It returns a list with two elements: first is the x-coordinate
    of the closest column and second is the index of that column.
    */
    function getClosestColumn(xVal) {
        xVal = parseFloat(JSON.stringify(xVal))
        if (board[1] % 2 == 0) {
            let min = 0
            for (let i = 0; i < landscapeColumns.length; i++) {
                if (Math.abs(landscapeColumns[i] * screenWidth - xVal) < Math.abs(landscapeColumns[min] * screenWidth - xVal)) {
                    min = i
                }
            }
            return [landscapeColumns[min] * screenWidth, min]
        } else {
            let min = 0
            for (let i = 0; i < portraitColumns.length; i++) {
                if (Math.abs(portraitColumns[i] * screenWidth - xVal) < Math.abs(portraitColumns[min] * screenWidth - xVal)) {
                    min = i
                }
            }
            return [portraitColumns[min] * screenWidth, min]
        }
    }

    /*
    getBotMove() will find a move for the bot and update the botMove state with that move. A move takes
    the form [colIndex (int), rotDir (int: -1 is ccw or 1 is cw), rotateFirst (boolean)].
    */
    function getBotMove() {
        let candidateMoves = []
        let bestScore = -1
        for (let col = 0; col < 7; col++) {
            for (let rotDir = -1; rotDir < 2; rotDir += 2) {
                for (let rotateFirst = 0; rotateFirst < 2; rotateFirst++) {
                    if (col < 6 || (board[1] % 2 == 0 && rotateFirst == 0) || (board[1] % 2 == 1 && rotateFirst == 1)) {
                        let score = scoreMove([col, rotDir, rotateFirst == 1], board, "1", botDepth)
                        if (score == bestScore) {
                            candidateMoves.push([col, rotDir, rotateFirst == 1])
                        } else if (score > bestScore) {
                            bestScore = score
                            candidateMoves = [[col, rotDir, rotateFirst == 1]]
                        }
                    }
                }
            }
        }
        let move = candidateMoves[Math.floor(Math.random() * candidateMoves.length)]
        setBotMove(move)
    }

    /*
    scoreMove(move, board, color, depth) will recursively score a move by looking "depth" moves ahead.
    The move argument takes the form [colIndex (int), rotDir (int: -1 is ccw or 1 is cw), rotateFirst (boolean)].
    The board takes the form of a list with two elements: the first is a grid (list of lists) representing 
    the positions of the chips in the board, and the second is an int representing the orientation of 
    the board (0-3, inclusive). The color is a string ("0" or "1"). And the depth is an integer. Returns 1 
    if there is a guaranteed win for player 2, 0 if the game cannot be determined in depth moves, and -1 if
    player 1 has a guaranteed win within depth moves.
    */
    function scoreMove(move, board, color, depth) {
        let result = testMove(move, board, color)
        if (result[0] !== 0 || depth == 0) {
            return result[0]
        }
        else {
            let scores = []
            for (let col = 0; col < 7; col++) {
                for (let rotDir = -1; rotDir < 2; rotDir += 2) {
                    for (let rotateFirst = 0; rotateFirst < 2; rotateFirst++) {
                        if (col < 6 || (result[1][1] % 2 == 0 && rotateFirst == 0) || (result[1][1] % 2 == 1 && rotateFirst == 1)) {
                            let score = scoreMove([col, rotDir, rotateFirst == 1], result[1], color == "1" ? "0" : "1", depth - 1)
                            if (score == -1 && color == "1" || score == 1 && color == "0") {
                                return score
                            }
                            scores.push(score)
                        }
                    }
                }
            }
            if (color == "1") {
                return Math.min(...scores)
            } else {
                return Math.max(...scores)
            }
        }
    }

    /*
    testMove(move, board, color) will apply the move provided to the board provided and will
    return a list that has two elements: first an int to indicate the outcome of the move
    (1 = player2 won, 0 = tie or incomplete, -1 = player2 lost), and the second item is the 
    board after the move is applied. The board takes the form of a list with two elements: the
    first is a grid (list of lists) representing the positions of the chips in the board, and 
    the second is an int representing the orientation of the board (0-3, inclusive). 
    */
    function testMove(move, board, color) {
        if (!move[2]) {
            if (getHeight(board, move[0]) >= 6 + (board[1] % 2)) {
                return [null]
            }
            let resultingBoard = dropChip(board, move[0], color)
            let outcome = getWin(resultingBoard[0])
            if (outcome[0]) {
                if (outcome[1] == "two") {
                    return [1, resultingBoard]
                } else if (outcome[1] == "one") {
                    return [-1, resultingBoard]
                }
            }
            resultingBoard = rotateBoard(resultingBoard, move[1])
            outcome = getWin(resultingBoard[0])
            if (!outcome[0] || outcome[1] == "tie") {
                return [0, resultingBoard]
            } else {
                if (outcome[1] == "two") {
                    return [1, resultingBoard]
                } else if (outcome[1] == "one") {
                    return [-1, resultingBoard]
                }
            }
        } else {
            let resultingBoard = rotateBoard(board, move[1])
            let outcome = getWin(board[0])
            if (outcome != 0) {
                if (outcome[1] == "two") {
                    return [1, resultingBoard]
                } else if (outcome[1] == "one") {
                    return [-1, resultingBoard]
                }
            }
            if (getHeight(resultingBoard, move[0]) >= 6 + (resultingBoard[1] % 2)) {
                return [null]
            }
            resultingBoard = dropChip(resultingBoard, move[0], color)
            outcome = getWin(resultingBoard[0])
            if (!outcome[0] || outcome[1] == "tie") {
                return [0, resultingBoard]
            } else {
                if (outcome[1] == "two") {
                    return [1, resultingBoard]
                } else if (outcome[1] == "one") {
                    return [-1, resultingBoard]
                }
            }
        }
    }

    /*
    makeBotDrop() reads in the move and animates the portion of the move that involves dropping the chip.
    */
    function makeBotDrop() {
        let newX = 0
        if (board[1] % 2 == 0) {
            newX = landscapeColumns[botMove[0]] * screenWidth
        } else {
            newX = portraitColumns[botMove[0]] * screenWidth
        }
        Animated.timing(
            positionValueTwo, {
            toValue: { x: newX, y: screenHeight * 0.15 },
            easing: Easing.ease,
            duration: 1000
        }
        ).start(() => {
            setBoardZ(1)
            setTimeout(() => makeClink(), 300)
            if (board[1] % 2 === 0) {
                Animated.timing(
                    positionValueTwo, {
                    toValue: { x: newX, y: screenHeight * 0.3 + screenWidth * 0.7 - (1.05 * chipWidth) * (1 + getHeight(board, botMove[0])) },
                    easing: Easing.bounce,
                    duration: 1000
                }
                ).start(() => {
                    setBoard(dropChip(board, botMove[0], "1"))
                    setDropped(true)
                    positionValueTwo.setValue({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                })
            } else {
                Animated.timing(
                    positionValueTwo, {
                    toValue: { x: newX, y: (screenHeight * 0.3 + screenWidth * 0.82) - (1.19 * chipWidth) * (1 + getHeight(board, botMove[0])) },
                    easing: Easing.bounce,
                    duration: 1000
                }
                ).start(() => {
                    setBoard(dropChip(board, botMove[0], "1"))
                    setDropped(true)
                    positionValueTwo.setValue({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                })
            }
        })
    }

    /*
    makeBotDrop() reads in the move and animates the portion of the move that involves rotating the board.
    */
    function makeBotRotate() {
        rotate(botMove[1] * Math.PI / 2)
    }

    /* 
    panResponderOne is for the chip on the left. If playerOne is allowed to move,
    the chip will move when dragged. On release, it will either fall down the column that
    it is closest to, or animate to its original spot if it wasn't raised high enough or 
    if the column it is above is full. When the chip is dropped, it will bounce into position. 
    The board will update and the chip will jump back to its original starting place (without animating). 
    The chip seen in the board will be from the RotateDropAnimation component. 
    */
    const panResponderOne = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            if (turn && winner == null && dropped == false && !blocked) {
                setBoardZ(-1)
                positionValueOne.setValue({ x: gestureState.moveX - chipWidth / 2, y: gestureState.moveY - chipWidth / 2 })
                if (parseFloat(JSON.stringify(positionValueOne.getLayout().top)) < screenHeight * 0.25) {
                    setCurrCol(getClosestColumn(positionValueOne.getLayout().left)[1])
                }
            }
        },
        onPanResponderRelease: () => {
            setCurrCol(-1)
            if (turn && winner == null) {
                let col = getClosestColumn(positionValueOne.getLayout().left)
                let newX = col[0]
                let newY = parseFloat(JSON.stringify(positionValueOne.getLayout().top))
                let colHeight = getHeight(board, col[1])
                if (colHeight < 6 + (board[1] % 2) && newY < screenHeight * 0.25 && !blocked) {
                    if (showTutorial) {
                        setTutorialIndex(tutorialIndex + 1)
                        if (showTutorial && rotated) {
                            setTimeout(() => setTutorialZIndex(2), 7500)
                        } else {
                            setTimeout(() => setTutorialZIndex(2), 1000)
                        }
                    }
                    setBlocked(true)
                    setBoardZ(1)
                    positionValueOne.setValue({ x: newX, y: newY })
                    setTimeout(() => makeClink(), 300)
                    if (board[1] % 2 === 0) {
                        Animated.timing(
                            positionValueOne, {
                            toValue: { x: newX, y: screenHeight * 0.3 + screenWidth * 0.7 - (1.05 * chipWidth) * (1 + colHeight) },
                            easing: Easing.bounce,
                            duration: 1000
                        }
                        ).start(() => {
                            setDropped(true)
                            setBoard(dropChip(board, col[1], "0"))
                            positionValueOne.setValue({ x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                            setBlocked(false)
                        })
                    } else {
                        Animated.timing(
                            positionValueOne, {
                            toValue: { x: newX, y: (screenHeight * 0.3 + screenWidth * 0.82) - (1.19 * chipWidth) * (1 + colHeight) },
                            easing: Easing.bounce,
                            duration: 1000
                        }
                        ).start(() => {
                            setDropped(true)
                            setBoard(dropChip(board, col[1], "0"))
                            positionValueOne.setValue({ x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                            setBlocked(false)
                        })
                    }
                } else {
                    if (showTutorial) {
                        setTutorialZIndex(2)
                    }
                    Animated.timing(
                        positionValueOne, {
                        toValue: { x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 },
                        easing: Easing.ease,
                        duration: 200
                    }
                    ).start()
                }

            }
        }
    })

    return (
        <View style={styles.container}>
            {resetting ?
                <View style={{ width: "100%", height: "100%", zIndex: 3, backgroundColor: "white" }}>
                    <View style={{ position: "absolute", left: 0, top: screenHeight * 3 / 8 }}>
                        <LoadingScreen style={{ top: screenHeight * 0.5 }} />
                    </View>
                </View> : null
            }
            <View style={{ height: "7%", width: "100%", marginTop: Constants.statusBarHeight }}>
                <NavHeader name={showTutorial ? "Tutorial" : "Play Computer"} goBack={navigation.goBack} />
            </View>
            {showTutorial ?
                <View style={{ ...styles.tutorialView, zIndex: tutorialZIndex }}>
                    <Tutorial index={tutorialIndex} setShowTutorial={setShowTutorial} setIndex={setTutorialIndex} setZ={setTutorialZIndex} dropped={dropped} />
                </View> : null
            }
            <View style={{ zIndex: -4, position: "absolute", width: "100%", height: "100%", backgroundColor: "#fff" }} />
            {!showTutorial ?
                <View style={styles.header}>
                    <TouchableOpacity style={styles.reset} onPress={() => resetGame()}>
                        <Text style={{ color: "white", fontSize: 20, fontFamily: 'sans-serif-light', padding: 5 }}>Reset Game</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Settings", { cameFrom: "Play Bot", prevOneFirst: oneGoesFirst, colors: colors, currDifficulty: botDepth, music: music })
                    }}>
                        <Icon
                            name="settings"
                            size={30}
                            color="#1e90ff"
                            style={{ margin: 20 }}
                        />
                    </TouchableOpacity>
                </View>
                : null}
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: boardZ }}>
                <Image source={require("../assets/board.png")} style={{ width: "100%", height: "100%" }} />
            </Animated.View>
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: -2 }}>
                <RotateDropAnimation data={board} size={chipWidth} colors={colors} drop={dropped} clink={makeClink} />
            </Animated.View>
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: -3 }}>
                <ColumnIndicator column={currCol} orientation={board[1]} />
            </Animated.View>
            <View style={{ ...styles.rotateButtons, backgroundColor: rotated ? "transparent" : "#ccc" }}>
                <TouchableOpacity style={{ backgroundColor: "#1e90ff", padding: 10, borderRadius: 100 }} onPress={() => {
                    if (turn && !rotated && winner == null && !blocked) {
                        setBlocked(true)
                        rotate(-Math.PI / 2)
                    }
                }
                }>
                    <Icon
                        name="rotate-ccw"
                        size={30}
                        color="white"
                    />
                </TouchableOpacity>
                <View style={{ width: chipWidth / 2, height: chipWidth / 2, borderRadius: chipWidth / 4, backgroundColor: turn ? colors[0] : colors[1] }} />
                <TouchableOpacity style={{ backgroundColor: "#1e90ff", padding: 10, borderRadius: 100 }} onPress={() => {
                    if (turn && !rotated && winner == null && !blocked) {
                        setBlocked(true)
                        rotate(Math.PI / 2)
                    }
                }
                }>
                    <Icon
                        name="rotate-cw"
                        size={30}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
            <View style={{ position: "absolute", top: screenHeight * 0.9 - chipWidth, left: screenWidth * 0.2 - chipWidth, backgroundColor: turn && !dropped ? "#ccc" : "transparent", width: 2 * chipWidth, height: 2 * chipWidth, borderRadius: chipWidth }} />
            <View style={{ ...styles.chip, backgroundColor: colors[0], top: screenHeight * 0.9 - chipWidth / 2, left: screenWidth * 0.2 - chipWidth / 2 }} />
            <Animated.View style={{ ...styles.chip, backgroundColor: colors[0], ...positionValueOne.getLayout() }} {...panResponderOne.panHandlers} />

            <View style={{ position: "absolute", top: screenHeight * 0.9 - chipWidth, left: screenWidth * 0.8 - chipWidth, backgroundColor: !turn && !dropped ? "#ccc" : "transparent", width: 2 * chipWidth, height: 2 * chipWidth, borderRadius: chipWidth }} />
            <View style={{ ...styles.chip, backgroundColor: colors[1], top: screenHeight * 0.9 - chipWidth / 2, left: screenWidth * 0.8 - chipWidth / 2 }} />
            <Animated.View style={{ ...styles.chip, backgroundColor: colors[1], ...positionValueTwo.getLayout() }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imageStyle: {
        position: "absolute",
        width: screenWidth * 0.9,
        height: screenWidth * 0.7,
        top: screenHeight * 0.3,
        left: screenWidth * 0.05
    },
    rotateButtons: {
        padding: 10,
        borderRadius: 100,
        position: "absolute",
        width: 2 * screenWidth / 5,
        height: screenWidth / 5,
        top: screenHeight * 0.4 + screenWidth * 0.7,
        left: 3 * screenWidth / 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    chip: {
        width: chipWidth,
        height: chipWidth,
        borderRadius: chipWidth / 2,
        position: "absolute"
    },
    reset: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
        width: screenWidth * 0.4,
        height: screenWidth * 0.15,
        backgroundColor: "#1e90ff",
        borderRadius: screenWidth * 0.1
    },
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    tutorialView: {
        width: "100%",
        height: "100%",
        position: "absolute"
    }
});