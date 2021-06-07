import * as React from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import BocaDeFogaoModel, { EstadoDaBoca } from "../models/BocaDeFogaoModel";

interface BocaDoFogaoProps {
    grande?: boolean
    selecionado?: boolean,
    model: BocaDeFogaoModel,
    onPress: () => void,
    onLongPress: () => void,
}
export default function BocaDoFogao(props: BocaDoFogaoProps) {
    let tamanho: number = props.grande ? 200 : 150;
    let width: number = tamanho;
    let height: number = tamanho;
    let borderColor: string = '';
    switch (props.model.estado) {
        case EstadoDaBoca.INATIVADO:
            borderColor = '#010100';
            break;
        case EstadoDaBoca.TOCANDO:
        case EstadoDaBoca.RODANDO:
            borderColor = '#33c7cc';
            break;
        case EstadoDaBoca.PAUSADO:        
            borderColor = '#EE1533';
            break;
    }
    let color: string = props.model.estado == EstadoDaBoca.TOCANDO ? '#EE1533' : props.selecionado ? '#33cc66' : 'white';
    
    return (
        <TouchableOpacity
            style={[styles.button, {width, height, borderColor}]}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
        >
            <Text style={[styles.buttonText, {color}]}>{props.model.relogioAtual.toString()}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 150,
        width: 150,
        backgroundColor: '#998BA5',
        borderWidth: 8,
        borderRadius: 200,
        margin: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 32,
        fontWeight: "700",
    },
});
