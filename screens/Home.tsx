import * as React from "react";
import { Alert, Modal, Pressable, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import BocaDoFogao from "../components/BocaDeFogao";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import BocaDeFogaoModel, { EstadoDaBoca } from "../models/BocaDeFogaoModel";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import RelogioModel from "../models/RelogioModel";

export default function Home() {
    const [minutos, setMinutos] = React.useState(10);
    const [segundos, setSegundos] = React.useState(0);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [bocaSelecionada, setBocaSelecionada] = React.useState(2);
    const [bocas, setBocas] = React.useState([
        new BocaDeFogaoModel(10, 0),
        new BocaDeFogaoModel(3, 0),
        new BocaDeFogaoModel(2, 0),
        new BocaDeFogaoModel(5, 0),
        new BocaDeFogaoModel(10, 0),
    ]);

    React.useEffect(() => {
        const motor = setInterval(function () {
            setBocas(
                bocas.map((el) => {
                    if (el.isRodando()) {
                        el.milissegundosPassados += 100;
                        if (el.milissegundosPassados >= 1000) {
                            el.milissegundosPassados = 0;
                            el.relogioAtual.passarTempo(0, -1);
                        }
                    }
                    return el;
                })
            );
        }, 100);
        return () => {
            clearInterval(motor);
        };
    }, []);

    function playPause(): void {
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    if (el.estado == EstadoDaBoca.RODANDO) {
                        el.estado = EstadoDaBoca.PAUSADO;
                    } else {
                        el.estado = EstadoDaBoca.RODANDO;
                    }
                }
                index++;
                return el;
            })
        );
    }

    function stop(): void {
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    el.relogioAtual.minutos = el.relogioPadrao.minutos;
                    el.relogioAtual.segundos = el.relogioPadrao.segundos;
                    el.estado = EstadoDaBoca.INATIVADO;
                }
                index++;
                return el;
            })
        );
    }

    function abrirModal(): void {
        setModalVisible(!modalVisible)
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    setMinutos(el.relogioPadrao.minutos);
                    setSegundos(el.relogioPadrao.segundos);
                }
                index++;
                return el;
            })
        );
    }

    function fecharModal(): void {
        setModalVisible(!modalVisible)
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    el.relogioPadrao = new RelogioModel(minutos, segundos);
                    el.relogioAtual.minutos = el.relogioPadrao.minutos;
                    el.relogioAtual.segundos = el.relogioPadrao.segundos;
                    el.estado = EstadoDaBoca.INATIVADO;
                }
                index++;
                return el;
            })
        );
    }

    return (
        <View style={styles.container}>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View
                    onTouchEnd={() => setModalVisible(!modalVisible)}
                    style={[styles.centeredView, { backgroundColor: "rgba(255,255,255,0.5)" }]}
                >
                    <View
                        onTouchEnd={(e) => {
                            e.stopPropagation();
                        }}
                        style={styles.modalView}
                    >
                        <Text style={styles.modalText}>Minutos:</Text>
                        <View
                            style={[styles.container, { backgroundColor: "rgba(255,255,255,0)", flexDirection: "row" }]}
                        >
                            <Pressable
                                style={[styles.button]}
                                onPress={() => {
                                    setMinutos(minutos - 1);
                                }}
                            >
                                <Entypo name="minus" size={50} color="#993D63" />
                            </Pressable>
                            <Text style={[styles.modalText, { marginHorizontal: 10 }]}>{("00" + minutos).slice(-2)}</Text>
                            <Pressable style={[styles.button]} onPress={() => setMinutos(minutos + 1)}>
                                <Entypo name="plus" size={50} color="#993D63" />
                            </Pressable>
                        </View>
                        <Text style={styles.modalText}>Segundos:</Text>
                        <View
                            style={[
                                styles.container,
                                { backgroundColor: "rgba(255,255,255,0.5", flexDirection: "row" },
                            ]}
                        >
                            <Pressable style={[styles.button]} onPress={() => setSegundos(segundos - 1)}>
                                <Entypo name="minus" size={50} color="#993D63" />
                            </Pressable>
                            <Text style={[styles.modalText, { marginHorizontal: 10 }]}>{("00" + segundos).slice(-2)}</Text>
                            <Pressable style={[styles.button]} onPress={() => setSegundos(segundos + 1)}>
                                <Entypo name="plus" size={50} color="#993D63" />
                            </Pressable>
                        </View>
                        <Pressable style={[styles.buttonClose]} onPress={fecharModal}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <View style={[styles.container, { flex: 9, height: "100%" }]}>
                <View style={styles.linhaFogao} lightColor="#eee" darkColor="#F7E2EE">
                    <BocaDoFogao
                        onPress={() => setBocaSelecionada(0)}
                        selecionado={bocaSelecionada == 0}
                        model={bocas[0]}
                    />
                    <BocaDoFogao
                        onPress={() => setBocaSelecionada(1)}
                        selecionado={bocaSelecionada == 1}
                        model={bocas[1]}
                    />
                </View>
                <View style={styles.linhaFogao} lightColor="#eee" darkColor="#F7E2EE">
                    <BocaDoFogao
                        onPress={() => setBocaSelecionada(2)}
                        selecionado={bocaSelecionada == 2}
                        model={bocas[2]}
                        grande
                    />
                </View>
                <View style={styles.linhaFogao} lightColor="#eee" darkColor="#F7E2EE">
                    <BocaDoFogao
                        onPress={() => setBocaSelecionada(3)}
                        selecionado={bocaSelecionada == 3}
                        model={bocas[3]}
                    />
                    <BocaDoFogao
                        onPress={() => setBocaSelecionada(4)}
                        selecionado={bocaSelecionada == 4}
                        model={bocas[4]}
                    />
                </View>
            </View>
            <View
                style={[
                    styles.container,
                    { flexDirection: "column", justifyContent: "space-evenly", height: "100%", paddingVertical: 10 },
                ]}
                lightColor="#eee"
                darkColor="#41304C"
            >
                <TouchableOpacity style={[styles.button]} onPress={playPause}>
                    {bocas[bocaSelecionada].isRodando() ? (
                        <Entypo name="controller-paus" size={50} color="#993D63" />
                    ) : (
                        <Entypo name="controller-play" size={50} color="#993D63" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]} onPress={stop}>
                    <Entypo name="controller-stop" size={50} color="#993D63" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]} onPress={abrirModal}>
                    <MaterialIcons name="timer" size={50} color="#993D63" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    linhaFogao: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
    button: {
        backgroundColor: "rgba(0, 0, 0, 0)",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 24,
        fontWeight: "700",
    },
    modalView: {
        width: "50%",
        height: "80%",
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonClose: {
        height: 40,
        width: 120,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#2196F3"
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        color: "black",
        fontSize: 24,
        textAlign: "center",
    },
});
