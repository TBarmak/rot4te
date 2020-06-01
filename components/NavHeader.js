import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function NavHeader(props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={props.goBack}>
                <Icon
                    name="arrow-left"
                    size={30}
                    color="#1e90ff"
                    style={{ margin: 10 }}
                />
            </TouchableOpacity>
            <Text style={styles.text}>{props.name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderBottomColor: "#1e90ff",
        borderBottomWidth: 3
    },
    text: {
        color: "#1e90ff",
        fontSize: 20,
        fontFamily: "sans-serif-light",
        margin: 10
    }
});