import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, PanResponder, TouchableOpacity, Image, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getHeight } from '../boardFunctions';
import { dropChip } from '../boardFunctions';
import { rotateBoard } from '../boardFunctions';
import { getWin } from '../boardFunctions';
import { alertWinner } from '../boardFunctions';
import ColumnIndicator from './ColumnIndicator';
import RotateDropAnimation from './RotateDropAnimation';
import LoadingScreen from './LoadingScreen';

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

export default function PassPlay({ route, navigation }) {
    const [positionValueOne, setpositionValueOne] = useState(new Animated.ValueXY({ x: screenWidth / 5 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 }))
    const [positionValueTwo, setpositionValueTwo] = useState(new Animated.ValueXY({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 }))
    const [turn, setTurn] = useState(true)
    const [winner, setWinner] = useState(null)
    const [dropped, setDropped] = useState(false)
    const [rotated, setRotated] = useState(false)
    const [board, setBoard] = useState([[['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']], 0])
    const [boardRotation, setBoardRotation] = useState(new Animated.Value(0))
    const [currCol, setCurrCol] = useState(-1)
    const [colors, setColors] = useState(["red", "yellow"])
    const [blocked, setBlocked] = useState(false)
    const [boardZ, setBoardZ] = useState(-1)
    const [oneGoesFirst, setOneGoesFirst] = useState(true)
    const [resetting, setResetting] = useState(true)

    const { oneFirst } = route.params
    const { colorScheme } = route.params

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
            setTimeout(() => alertWinner(res[1]), 1500)
        }
    }, [winner])

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
        }, 1200)
        setTimeout(() => setResetting(false), 2000)
    }

    /* 
    rotate(angle) takes an float argument (either Math.PI/2 or -Math.PI/2) and animates
    the rotation of the board. It then calls the rotateBoard function to update the position of the
    chips according to the new direction of gravity.
    */
    function rotate(angle) {
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

    /* spin is used to interpolate the rotation of the board. */
    const spin = boardRotation.interpolate({
        inputRange: [0, 2 * Math.PI],
        outputRange: ['0deg', '360deg']
    })

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
                    setBlocked(true)
                    setBoardZ(1)
                    positionValueOne.setValue({ x: newX, y: newY })
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

    /* 
    panResponderTwo is for the chip on the right. If playerTwo is allowed to move,
    the chip will move when dragged. On release, it will either fall down the column that
    it is closest to, or animate to its original spot if it wasn't raised high enough or 
    if the column it is above is full. When the chip is dropped, it will bounce into position. 
    The board will update and the chip will jump back to its original starting place (without animating). The chip 
    seen in the board will be from the RotateDropAnimation component. 
    */
    const panResponderTwo = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            if (!turn && winner == null && dropped === false && !blocked) {
                setBoardZ(-1)
                positionValueTwo.setValue({ x: gestureState.moveX - chipWidth / 2, y: gestureState.moveY - chipWidth / 2 })
                if (parseFloat(JSON.stringify(positionValueTwo.getLayout().top)) < screenHeight * 0.25) {
                    setCurrCol(getClosestColumn(positionValueTwo.getLayout().left)[1])
                }
            }
        },
        onPanResponderRelease: () => {
            setCurrCol(-1)
            if (!turn && winner == null) {
                let col = getClosestColumn(positionValueTwo.getLayout().left)
                let newX = col[0]
                let newY = parseFloat(JSON.stringify(positionValueTwo.getLayout().top))
                let colHeight = getHeight(board, col[1])
                if (colHeight < 6 + (board[1] % 2) && newY < screenHeight * 0.25) {
                    setBlocked(true)
                    setBoardZ(1)
                    positionValueTwo.setValue({ x: newX, y: newY })
                    if (board[1] % 2 === 0) {
                        Animated.timing(
                            positionValueTwo, {
                            toValue: { x: newX, y: screenHeight * 0.3 + screenWidth * 0.7 - (1.05 * chipWidth) * (1 + colHeight) },
                            easing: Easing.bounce,
                            duration: 1000
                        }
                        ).start(() => {
                            setDropped(true)
                            setBoard(dropChip(board, col[1], "1"))
                            positionValueTwo.setValue({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                            setBlocked(false)
                        })
                    } else {
                        Animated.timing(
                            positionValueTwo, {
                            toValue: { x: newX, y: (screenHeight * 0.3 + screenWidth * 0.82) - (1.19 * chipWidth) * (1 + colHeight) },
                            easing: Easing.bounce,
                            duration: 1000
                        }
                        ).start(() => {
                            setDropped(true)
                            setBoard(dropChip(board, col[1], "1"))
                            positionValueTwo.setValue({ x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 })
                            setBlocked(false)
                        })
                    }
                } else {
                    Animated.timing(
                        positionValueTwo, {
                        toValue: { x: screenWidth * 0.8 - chipWidth / 2, y: screenHeight * 0.9 - chipWidth / 2 },
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
            <View style={styles.header}>
                <TouchableOpacity style={styles.reset} onPress={() => resetGame()}>
                    <Text style={{ color: "white", fontSize: 20, fontFamily: 'sans-serif-light', padding: 5 }}>Reset Game</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("Settings", { cameFrom: "Pass and Play", prevOneFirst: oneGoesFirst, colors: colors })
                }}>
                    <Icon
                        name="settings"
                        size={30}
                        color="#1e90ff"
                        style={{ margin: 20 }}
                    />
                </TouchableOpacity>
            </View>
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: boardZ }}>
                <Image source={require("../assets/board.png")} style={{ width: "100%", height: "100%" }} />
            </Animated.View>
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: -2 }}>
                <RotateDropAnimation data={board} size={chipWidth} colors={colors} drop={dropped} />
            </Animated.View>
            <Animated.View style={{ ...styles.imageStyle, transform: [{ rotate: spin }], zIndex: -3 }}>
                <ColumnIndicator column={currCol} orientation={board[1]} />
            </Animated.View>
            <View style={{ ...styles.rotateButtons, backgroundColor: rotated ? "transparent" : "#ccc" }}>
                <TouchableOpacity style={{ backgroundColor: "#1e90ff", padding: 10, borderRadius: 100 }} onPress={() => {
                    if (!rotated && winner == null && !blocked) {
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
                    if (!rotated && winner == null && !blocked) {
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
            <Animated.View style={{ ...styles.chip, backgroundColor: colors[1], ...positionValueTwo.getLayout() }} {...panResponderTwo.panHandlers} />
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
        margin: 20,
        width: screenWidth * 0.4,
        height: screenWidth * 0.15,
        backgroundColor: "#1e90ff",
        borderRadius: screenWidth * 0.1
    },
    header: {
        width: "100%",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
});