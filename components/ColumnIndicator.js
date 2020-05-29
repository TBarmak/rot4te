import React from 'react'
import { View, StyleSheet, Dimensions} from 'react-native';

export default function ChipGrid(props) {
    if(props.orientation % 2 == 0) {
        let col = props.column
        if(props.orientation == 2) {
            col = Math.abs(col - 6)
        }
        return(
            <View style={{width: "100%", height: "100%", flexDirection: "row"}}>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 0 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 1 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 2 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 3 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 4 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 5 ? "#ccc" : "transparent"}}/>
                <View style={{height: "100%", width: "14.3%", backgroundColor: col == 6 ? "#ccc" : "transparent"}}/>
            </View>
        )
    } else {
        let col = props.column
        if(props.orientation == 1) {
            col = Math.abs(col - 5)
        }
        return(
            <View style={{width: "100%", height: "100%", flexDirection: "column"}}>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 0 ? "#ccc" : "transparent"}}/>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 1 ? "#ccc" : "transparent"}}/>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 2 ? "#ccc" : "transparent"}}/>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 3 ? "#ccc" : "transparent"}}/>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 4 ? "#ccc" : "transparent"}}/>
                <View style={{width: "100%", height: "16.7%", backgroundColor: col == 5 ? "#ccc" : "transparent"}}/>
            </View>
        )
    }
}