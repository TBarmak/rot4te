import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

const chipWidth = screenWidth * 0.11

const tutorialText = [
    "Welcome to the Rot4te tutorial!",
    "This game is a new take on 4 In A Row.",
    "The twist is that the board must rotate every turn.",
    "Upon rotating, the chips fall according to the new orientation.",
    "On your turn, you must drop a chip and rotate the board.",
    "You can do this in any order you like.",
    "Here are the chips:",
    "And here are the buttons to rotate:",
    "The circle in the middle indicates whose turn it is.",
    "The gray highlighting indicates what is available to you.",
    "It is red's turn and they can rotate or drop.",
    "You can drop a chip by dragging it above the desired column.",
    "Or you can rotate by clicking the rotate buttons.",
    "Click 'okay' to make a move.",
    "Good job! Now finish the move.",
    "The bot replied with its move.",
    "First to get 4-In-A-Row wins!"
]

/* Coordinates to highlight parts of the game (top, left, width, height) */
const tutorialBoxes = [
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [0.9 * screenHeight - (chipWidth), 0.2 * screenWidth - chipWidth, 0.6 * screenWidth + 2 * chipWidth, 2 * chipWidth],
    [screenHeight * 0.4 + screenWidth * 0.7, 3 * screenWidth / 10, 2 * screenWidth / 5, screenWidth / 5],
    [screenHeight * 0.4 + screenWidth * 0.75, screenWidth * 0.45, screenWidth / 10, screenWidth / 10],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0],
    [-1, -1, 0, 0]
]

export default function Tutorial(props, { navigation }) {
    /* 
    Make the on press be associated with the "next" button. The touchable opacity doesn't serve much of a purpose.
    Make the back button not show up when it's the first instruction. Maybe have an animation of the appearance
    and disappearance of the buttons (later on).
    */
    return (
        <View style={styles.container}>
            <View style={{
                position: "absolute",
                top: tutorialBoxes[props.index][0],
                left: tutorialBoxes[props.index][1],
                width: tutorialBoxes[props.index][2],
                height: tutorialBoxes[props.index][3],
                borderColor: "#1e90ff",
                borderWidth: 4,
                borderRadius: 10
            }} />
            <View>
                <Text style={styles.instruction}>{tutorialText[props.index]}</Text>
            </View>
            <View style={styles.buttonView}>
                {props.index > 0 && props.index < 14 ?
                    <TouchableOpacity style={styles.button} onPress={() => {
                        if (props.index > 0) {
                            props.setIndex(props.index - 1)
                        }
                    }}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                    : null}
                <TouchableOpacity style={styles.button} onPress={() => {
                    if (props.index < tutorialText.length - 1) {
                        if (props.index != 13 && props.index != 14) {
                            props.setIndex(props.index + 1)
                        } else {
                            props.setZ(-5)
                        }
                    } else {
                        props.setShowTutorial(false)
                    }
                }}>
                    <Text style={styles.buttonText}>Okay</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    instruction: {
        color: "#fff",
        fontSize: 40,
        fontFamily: "sans-serif-light",
        padding: 20,
    },
    buttonView: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "60%"
    },
    button: {
        padding: 15,
        backgroundColor: "#1e90ff",
        borderRadius: 100
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "sans-serif-light"
    }
});