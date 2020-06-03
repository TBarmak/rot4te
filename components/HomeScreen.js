import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native';
import LoadingScreen from './LoadingScreen';
import { Audio } from 'expo-av';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const chipWidth = screenWidth / 8;

export default function HomeScreen({ navigation }) {
    const backgroundAudio = new Audio.Sound()

    async function startBackgroundMusic() {
        try {
            await backgroundAudio.loadAsync(require('../assets/background.wav'), { isLooping: true })
            await backgroundAudio.playAsync()
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        startBackgroundMusic()
    }, [])

    return (
        <View style={styles.container}>
            <View style={{ width: "100%", height: "50%", position: "absolute", top: screenHeight * 0.2 }}>
                <LoadingScreen />
            </View>
            <View style={styles.titleView}>
                <Image source={require("../assets/logo.png")} style={{ width: screenWidth * 0.8, height: screenWidth * 0.8, zIndex: -1 }} />
            </View>
            <View style={styles.buttonView}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Pass and Play", { oneFirst: true, colorScheme: ["red", "yellow"], music: backgroundAudio })}>
                    <Text style={{ fontFamily: 'sans-serif-light', color: "white", fontSize: 22 }}>Pass And Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Play Bot", { tutorial: false, oneFirst: true, colorScheme: ["red", "yellow"], music: backgroundAudio })}>
                    <Text style={{ fontFamily: 'sans-serif-light', color: "white", fontSize: 22 }}>Play The Computer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Play Bot", { tutorial: true, oneFirst: true, colorScheme: ["red", "yellow"], music: backgroundAudio })}>
                    <Text style={{ fontFamily: 'sans-serif-light', color: "white", fontSize: 22 }}>Tutorial</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: screenHeight,
        width: screenWidth,
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleView: {
        width: "100%",
        height: "50%",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonView: {
        width: "100%",
        height: "50%",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    button: {
        backgroundColor: "#1e90ff",
        width: "80%",
        height: "15%",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    chip: {
        position: "absolute",
        width: chipWidth,
        height: chipWidth,
        borderRadius: chipWidth / 2
    }
});