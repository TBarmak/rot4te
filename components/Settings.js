import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Switch, Slider } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function Settings({ route, navigation }) {
    const [oneFirst, setOneFirst] = useState(true)
    const [useOriginalColors, setUseOriginalColors] = useState(true)
    const [sliderVal, setSliderVal] = useState(1)

    const { cameFrom } = route.params
    const { prevOneFirst } = route.params
    const { colors } = route.params
    const { currDifficulty } = route.params

    /* Get the current settings from route.params, and update the state */
    useEffect(() => setOneFirst(prevOneFirst), [prevOneFirst])
    useEffect(() => setUseOriginalColors(colors[0] == "red" && colors[1] == "yellow"), [colors])
    useEffect(() => setSliderVal(currDifficulty), [currDifficulty])

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={styles.item}>
                    <Text style={{ fontFamily: "sans-serif-light", color: "#fff", fontSize: 20 }}>Left Color Goes First</Text>
                    <Switch
                        trackColor={{ false: "#fff", true: "red" }}
                        thumbColor={oneFirst ? "yellow" : "#fff"}
                        ios_backgroundColor="#fff"
                        onValueChange={() => {
                            setOneFirst(!oneFirst)
                        }}
                        value={oneFirst}
                    />
                </View>
                <View style={styles.item}>
                    <Text style={{ fontFamily: "sans-serif-light", color: "#fff", fontSize: 20 }}>Color Scheme</Text>
                    <Switch
                        trackColor={{ false: "darkblue", true: "red" }}
                        thumbColor={useOriginalColors ? "yellow" : "orangered"}
                        ios_backgroundColor="#fff"
                        onValueChange={() => {
                            setUseOriginalColors(!useOriginalColors)
                        }}
                        value={useOriginalColors}
                    />
                </View>
                {cameFrom == "Play Bot" ?
                    <View style={styles.item}>
                        <Text style={{ fontFamily: "sans-serif-light", color: "#fff", fontSize: 20 }}>Difficulty</Text>
                        <Slider
                            style={{ width: 200 }}
                            trackStyle={{height: 30}}
                            value={sliderVal}
                            onValueChange={(val) => setSliderVal(val)}
                            minimumValue={0}
                            maximumValue={2}
                            step={1}
                            thumbTintColor="#ff0"
                            minimumTrackTintColor="#f00"
                            maximumTrackTintColor="#fff"
                        />
                    </View> : null}
            </View>
            <TouchableOpacity style={styles.save} onPress={() => navigation.navigate(cameFrom, { oneFirst: oneFirst, colorScheme: useOriginalColors ? ["red", "yellow"] : ["orangered", "darkblue"], difficulty: sliderVal})}>
                <Text style={{ fontFamily: "sans-serif-light", color: "#fff", fontSize: 25 }}>Save Changes</Text>
            </TouchableOpacity>
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
    save: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: screenWidth * 0.8,
        height: screenWidth * 0.15,
        backgroundColor: "#1e90ff",
        padding: 10,
        borderRadius: screenWidth * 0.08,
        margin: 20
    },
    topContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 10,
        margin: 20
    },
    item: {
        margin: 10,
        backgroundColor: "#1e90ff",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderRadius: screenWidth * 0.3
    }
});