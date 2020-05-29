import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import LoadingScreen from './LoadingScreen';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const chipWidth = screenWidth / 8;

export default function HomeScreen({ navigation }) {

    return (
        <View style={styles.container}>
            <View style={{width: "100%", height: "50%", position: "absolute", top: screenHeight * 0.2}}>
                <LoadingScreen/>
            </View>
            <View style={styles.titleView}>
                <Text style={{ color: "red", fontSize: screenWidth / 7, fontFamily: 'sans-serif' }}>4-In-A-Row</Text>
                <Text style={{ color: "yellow", fontSize: screenWidth / 8, transform: [{ rotate: "-45deg" }], fontFamily: 'sans-serif-light' }}>Rotate</Text>
            </View>
            <View style={styles.buttonView}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Pass and Play", { tutorial: false, oneFirst: true, colorScheme: ["red", "yellow"]})}>
                    <Text style={{ fontFamily: 'sans-serif-light', color: "white", fontSize: 22 }}>Pass And Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Play Bot", { oneFirst: true, colorScheme: ["red", "yellow"]})}>
                    <Text style={{ fontFamily: 'sans-serif-light', color: "white", fontSize: 22 }}>Play The Computer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Pass and Play", { tutorial: true, oneFirst: true, colorScheme: ["red", "yellow"] })}>
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
        padding: 30
    },
    chip: {
        position: "absolute",
        width: chipWidth,
        height: chipWidth,
        borderRadius: chipWidth / 2
    }
});