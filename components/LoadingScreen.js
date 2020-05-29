import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Easing } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const chipWidth = screenWidth / 8

export default function LoadingScreen() {
    const [xCoordinate, setXCoordinate] = useState(new Animated.Value(0))
    const [yCoordinate, setYCoordinate] = useState(new Animated.Value(0))
    const [rightBound, setRightBound] = useState(new Animated.Value(screenWidth - chipWidth))

    /* Start the animation when the component mounts */
    useEffect(() => {
        moveX(screenWidth - chipWidth)
        moveY(screenHeight / 4)
    }, [])

    /*
    moveX(dest) animates the value of xCoordinate to the destination provided
    as the argument dest (int). After the animation terminates, it calls itself
    again to animate back to where it came from.
    */
    function moveX(dest) {
        Animated.timing(
            xCoordinate, {
            toValue: dest,
            easing: Easing.linear,
            duration: 1400
        }
        ).start(() => moveX(Math.abs(dest - (screenWidth - chipWidth))))
    }

    /*
    moveY(dest) animates the value of yCoordinate to the destination provided
    as the argument dest (int). After the animation terminates, it calls itself
    again to animate back to where it came from.
    */
    function moveY(dest) {
        Animated.timing(
            yCoordinate, {
            toValue: dest,
            easing: dest == 0 ? (t) => Math.pow(t, 1 / 2) : (t) => Math.pow(t, 2),
            duration: 500
        }
        ).start(() => moveY(Math.abs(dest - (screenHeight / 4))))
    }

    return (
        <View style={styles.container}>
            <Animated.View style={{ ...styles.chip, backgroundColor: "red", top: yCoordinate, left: xCoordinate }} />
            <Animated.View style={{ ...styles.chip, backgroundColor: "yellow", top: yCoordinate, left: Animated.subtract(rightBound, xCoordinate) }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chip: {
        position: "absolute",
        width: chipWidth,
        height: chipWidth,
        borderRadius: chipWidth / 2
    }
});