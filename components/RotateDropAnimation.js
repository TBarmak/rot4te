import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function RotateDropAnimation(props) {
    const [coor, setCoor] = useState([])
    const [board, setBoard] = useState([[['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', ''], ['', '', '', '', '', '', '']], 0])

    /* When the board state is updated, reset the position of the animated coordinates.*/
    useEffect(() => {
        let lst = []
        for (let r = 0; r < 6; r++) {
            let row = []
            for (let c = 0; c < 7; c++) {
                row.push(new Animated.ValueXY({ x: (0.02 * props.size) + (1.193 * props.size) * c, y: (0.04 * props.size) + (1.06 * props.size) * r }))
            }
            lst.push(row)
        }
        setCoor(lst)
    }, [board])

    /* 
    When the board props changes, if a drop was made, update the board immediately. 
    Otherwise, animate the dropping of the chips resulting from the rotation.
    */
    useEffect(() => {
        if (props.data[1] == board[1]) {
            let copy = JSON.parse(JSON.stringify(props.data))
            setBoard(copy)
        } else {
            animateRotation(props.data[1])
            setTimeout(() => setBoard(JSON.parse(JSON.stringify(props.data))), 500)
        }
    }, [props.data])

    /*
    animateRotation(direction) animates the chips to fall according to the direction provided.
    The direction argument is an int (0-3, inclusive) that represents the ending orientation of the board.
    */
    function animateRotation(direction) {
        let clinked = false
        if (direction == 0) {
            for (let c = 0; c < board[0][0].length; c++) {
                let count = 0
                for (let r = board[0].length - 1; r >= 0; r--) {
                    if (board[0][r][c] != '') {
                        if (!clinked && count != board[0].length - 1 - r) {
                            props.clink()
                            clinked = true
                        }
                        Animated.timing(
                            coor[r][c], {
                            toValue: { x: (0.02 * props.size) + (1.193 * props.size) * c, y: (0.04 * props.size) + (1.06 * props.size) * (board[0].length - (count + 1)) },
                            easing: Easing.bounce,
                            duration: 500
                        }
                        ).start()
                        count += 1
                    }
                }
            }
        } else if (direction == 1) {
            for (let r = 0; r < board[0].length; r++) {
                let count = 0
                for (let c = board[0][0].length - 1; c >= 0; c--) {
                    if (board[0][r][c] != '') {
                        if (!clinked && count != board[0][0].length - 1 - c) {
                            props.clink()
                            clinked = true
                        }
                        Animated.timing(
                            coor[r][c], {
                            toValue: { x: (0.02 * props.size) + (1.193 * props.size) * (board[0][0].length - (count + 1)), y: (0.04 * props.size) + (1.06 * props.size) * r },
                            easing: Easing.bounce,
                            duration: 500
                        }
                        ).start()
                        count += 1
                    }
                }
            }
        } else if (direction == 2) {
            for (let c = 0; c < board[0][0].length; c++) {
                let count = 0
                for (let r = 0; r < board[0].length; r++) {
                    if (board[0][r][c] != '') {
                        if (!clinked && count != r) {
                            props.clink()
                            clinked = true
                        }
                        Animated.timing(
                            coor[r][c], {
                            toValue: { x: (0.02 * props.size) + (1.193 * props.size) * c, y: (0.04 * props.size) + (1.06 * props.size) * count },
                            easing: Easing.bounce,
                            duration: 500
                        }
                        ).start()
                        count += 1
                    }
                }
            }
        } else {
            for (let r = 0; r < board[0].length; r++) {
                let count = 0
                for (let c = 0; c < board[0][0].length; c++) {
                    if (board[0][r][c] != '') {
                        if (!clinked && count != c) {
                            props.clink()
                            clinked = true
                        }
                        Animated.timing(
                            coor[r][c], {
                            toValue: { x: (0.02 * props.size) + (1.193 * props.size) * count, y: (0.04 * props.size) + (1.06 * props.size) * r },
                            easing: Easing.bounce,
                            duration: 500
                        }
                        ).start()
                        count += 1
                    }
                }
            }
        }
    }

    /* While the coor grid is being created, return an empty view. */
    if (coor.length == 0) {
        return (
            <View />
        )
    }

    return (
        <View style={styles.container}>
            {board[0].map((row, r) => {
                return row.map((item, c) => {
                    return (
                        <Animated.View style={{
                            position: "absolute",
                            width: props.size * 0.997,
                            height: props.size * 0.997,
                            borderRadius: props.size / 2,
                            backgroundColor: item == '' ? "transparent" : props.colors[parseInt(item.slice(0, -1))],
                            zIndex: 1,
                            borderWidth: item.slice(-1) === 'w' ? 6 : 0,
                            borderColor: item.slice(-1) === "w" ? "#0f0" : "transparent",
                            ...coor[r][c].getLayout()
                        }} />
                    )
                })
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        height: "100%",
        paddingHorizontal: screenWidth * 0.05,
    }
})