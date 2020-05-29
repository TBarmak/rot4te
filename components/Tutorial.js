import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const tutorialText = [
    "This is the first instruction.",
    "This is the second instruction.",
    "This is the third instruction.",
    "This is the fourth instruction",
    "This is the fifth instruction"
]

export default function Tutorial(props, {navigation}) {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.instruction}>{tutorialText[props.index]}</Text>
            </View>
            <View style={styles.buttonView}>
                <TouchableOpacity style={styles.button} onPress={() => {
                    if(props.index > 0) {
                        props.setIndex(props.index - 1)
                    }
                }}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {
                    if(props.index < tutorialText.length - 1) {
                        props.setIndex(props.index + 1)
                    } else {
                        props.setShowTutorial(false)
                    }
                }}>
                    <Text style={styles.buttonText}>Next</Text>
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
        justifyContent: "space-between",
        alignItems: "center",
        width: "60%"
    },
    button: {
        padding: 15,
        backgroundColor: "#1e90ff",
        borderRadius: 20
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "sans-serif-light"
    }
});