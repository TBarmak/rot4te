import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Tutorial({navigation}) {
    return (
        <View style={styles.container}>
            <Text>This is the tutorial screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: "center",
        alignItems: "center"
    }
});