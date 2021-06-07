import * as React from "react";
import { Alert, AppState, AppStateStatus, Modal, Pressable, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import BocaDoFogao from "../components/BocaDeFogao";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import BocaDeFogaoModel, { EstadoDaBoca } from "../models/BocaDeFogaoModel";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import RelogioModel from "../models/RelogioModel";
import { Audio } from "expo-av";
import { useKeepAwake } from "expo-keep-awake";
import FlashMessage, { showMessage } from "react-native-flash-message";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

export default function Home() {
    const [sound, setSound] = React.useState<Audio.Sound>();
    const appState = React.useRef(AppState.currentState);
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
    const [somTocando, setSomTocando] = React.useState(false);
    const [avisoExibido, setAvisoExibido] = React.useState(false);
    const [motorLigado, setMotorLigado] = React.useState(true);

    useKeepAwake();
    React.useEffect(() => {
        AppState.addEventListener("change", _handleAppStateChange);

        carregarSom();

        const motor = setInterval(function () {
            if (motorLigado) {
                setBocas(
                    bocas.map((el) => {
                        if (el.isRodando()) {
                            el.milissegundosPassados += 1000;
                            if (el.milissegundosPassados >= 1000) {
                                el.milissegundosPassados = 0;
                                el.relogioAtual.passarTempo(0, -1);
                                el.ultimoUpdate = new Date().getTime();
                                if (el.acabou()) {
                                    el.estado = EstadoDaBoca.TOCANDO;
                                }
                            }
                        }
                        return el;
                    })
                );
            }
        }, 1000);
        return () => {
            clearInterval(motor);
            AppState.removeEventListener("change", _handleAppStateChange);
            sound?.stopAsync();
            sound?.unloadAsync();
        };
    }, []);

    React.useEffect(() => {
        const bocasTocando: Array<BocaDeFogaoModel> = bocas.filter((el) => {
            return el.estado == EstadoDaBoca.TOCANDO;
        });

        const bocasRodando: Array<BocaDeFogaoModel> = getBocasRodando();

        if (bocasRodando.length > 0 && !avisoExibido) {
            showMessage({
                message: "Aviso:",
                description: `Mantenha-se no app para que possamos te avisar quando o relógio tocar, nós enviaremos uma notificação caso não esteja presente`,
                type: "warning",
                backgroundColor: "#F6EFEF",
                color: "#000100",
                duration: 7000,
                floating: true,
                hideOnPress: true,
                icon: "warning",
            });
            setAvisoExibido(true);
        }

        try {
            if (bocasTocando.length > 0 && !somTocando) {
                sound?.playAsync();
                setSomTocando(true);
            } else if (somTocando) {
                sound?.stopAsync();
                setSomTocando(false);
            }
        } catch (e) {
            // An error occurred!
        }
    }, [bocas]);

    async function carregarSom() {
        try {
            const audio: any = await Audio.Sound.createAsync(require("../assets/alarme.wav"), { isLooping: true });

            setSound(audio.sound);
        } catch (error) {
            Alert.alert("Ops!", "Ocorreu um erro ao carregar o som de alarme.", [{ text: "OK" }], { cancelable: true });
        }
    }

    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === "active") {
            setBocas(
                bocas.map((el) => {
                    if (el.isRodando()) {
                        el.ajustarRelogio();
                    }
                    return el;
                })
            );
            Notifications.cancelAllScheduledNotificationsAsync();
            Notifications.dismissAllNotificationsAsync();
            setMotorLigado(true);
        } else {
            setMotorLigado(false);
            getBocasRodando().map((el) => {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "O Tempo Acabou!",
                        body: "Uma de suas bocas está tocando",
                    },
                    trigger: {
                        seconds: el.relogioAtual.getTime() / 1000,
                    },
                });
            });
        }

        appState.current = nextAppState;
    };

    function getBocasRodando(): Array<BocaDeFogaoModel> {
        return bocas.filter((el) => {
            return el.isRodando();
        });
    }

    function playPause(): void {
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    switch (el.estado) {
                        case EstadoDaBoca.RODANDO:
                            el.estado = EstadoDaBoca.PAUSADO;
                            break;
                        case EstadoDaBoca.INATIVADO:
                        case EstadoDaBoca.PAUSADO:
                            el.estado = EstadoDaBoca.RODANDO;
                            break;
                        case EstadoDaBoca.TOCANDO:
                            stop(bocaSelecionada);
                            break;
                    }
                }
                index++;
                return el;
            })
        );
    }

    function stop(boca: number): void {
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == boca) {
                    el.relogioAtual.minutos = el.relogioPadrao.minutos;
                    el.relogioAtual.segundos = el.relogioPadrao.segundos;
                    el.estado = EstadoDaBoca.INATIVADO;
                }
                index++;
                return el;
            })
        );
    }

    function abrirModal(boca: number): void {
        setModalVisible(!modalVisible);
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == boca) {
                    setMinutos(el.relogioPadrao.minutos);
                    setSegundos(el.relogioPadrao.segundos);
                }
                index++;
                return el;
            })
        );
        setBocaSelecionada(boca);
    }

    function fecharModal(): void {
        setModalVisible(!modalVisible);
        let index = 0;
        setBocas(
            bocas.map((el): BocaDeFogaoModel => {
                if (index == bocaSelecionada) {
                    if (minutos == 0 && segundos == 0) {
                        el.relogioPadrao = new RelogioModel(1, segundos);
                    } else {
                        el.relogioPadrao = new RelogioModel(minutos, segundos);
                    }
                    el.relogioAtual.minutos = el.relogioPadrao.minutos;
                    el.relogioAtual.segundos = el.relogioPadrao.segundos;
                    el.estado = EstadoDaBoca.INATIVADO;
                }
                index++;
                return el;
            })
        );
    }

    function handleBocaClick(boca: number) {
        if (bocas[boca].estado == EstadoDaBoca.TOCANDO) {
            stop(boca);
        }
        setBocaSelecionada(boca);
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
                        <Text style={[styles.modalText, { backgroundColor: "rgba(255,0,0,0)", marginLeft: 0 }]}>
                            Minutos:
                        </Text>
                        <View
                            style={[styles.container, { backgroundColor: "rgba(255,255,255,0)", flexDirection: "row" }]}
                        >
                            <Pressable
                                style={[styles.button, { paddingHorizontal: 30 }]}
                                onPress={() => setMinutos(minutos <= 9 ? 0 : minutos - 10)}
                                onLongPress={() => setMinutos(0)}
                            >
                                <Entypo name="controller-jump-to-start" size={30} color="#993D63" />
                            </Pressable>
                            <Pressable
                                style={[styles.button]}
                                onPress={() => setMinutos(minutos <= 0 ? 0 : minutos - 1)}
                                onLongPress={() => setMinutos(0)}
                            >
                                <Entypo name="controller-fast-backward" size={30} color="#993D63" />
                            </Pressable>
                            <Text style={[styles.modalText, { paddingHorizontal: 30 }]}>
                                {(minutos < 10 ? 0 : "") + minutos.toString()}
                            </Text>
                            <Pressable style={[styles.button]} onPress={() => setMinutos(minutos + 1)}>
                                <Entypo name="controller-fast-forward" size={30} color="#993D63" />
                            </Pressable>
                            <Pressable
                                style={[styles.button, { paddingHorizontal: 30 }]}
                                onPress={() => setMinutos(minutos + 10)}
                            >
                                <Entypo name="controller-next" size={30} color="#993D63" />
                            </Pressable>
                        </View>
                        <Text style={[styles.modalText, { backgroundColor: "rgba(255,0,0,0)", marginLeft: 0 }]}>
                            Segundos:
                        </Text>
                        <View style={[styles.container, { backgroundColor: "rgba(255,0,0,0)", flexDirection: "row" }]}>
                            <Pressable
                                style={[styles.button, { paddingHorizontal: 30 }]}
                                onPress={() => setSegundos(segundos <= 9 ? 50 : segundos - 10)}
                                onLongPress={() => setSegundos(0)}
                            >
                                <Entypo name="controller-jump-to-start" size={30} color="#993D63" />
                            </Pressable>
                            <Pressable
                                style={[styles.button]}
                                onPress={() => setSegundos(segundos <= 0 ? 59 : segundos - 1)}
                                onLongPress={() => setSegundos(0)}
                            >
                                <Entypo name="controller-fast-backward" size={30} color="#993D63" />
                            </Pressable>
                            <Text style={[styles.modalText, { paddingHorizontal: 30 }]}>
                                {("00" + segundos).slice(-2)}
                            </Text>
                            <Pressable
                                style={[styles.button]}
                                onPress={() => setSegundos(segundos >= 59 ? 0 : segundos + 1)}
                            >
                                <Entypo name="controller-fast-forward" size={30} color="#993D63" />
                            </Pressable>
                            <Pressable
                                style={[styles.button, { paddingHorizontal: 30 }]}
                                onPress={() => setSegundos(segundos >= 50 ? 0 : segundos + 10)}
                            >
                                <Entypo name="controller-next" size={30} color="#993D63" />
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
                        onPress={() => handleBocaClick(0)}
                        onLongPress={() => abrirModal(0)}
                        selecionado={bocaSelecionada == 0}
                        model={bocas[0]}
                    />
                    <BocaDoFogao
                        onPress={() => handleBocaClick(1)}
                        onLongPress={() => abrirModal(1)}
                        selecionado={bocaSelecionada == 1}
                        model={bocas[1]}
                    />
                </View>
                <View style={styles.linhaFogao} lightColor="#eee" darkColor="#F7E2EE">
                    <BocaDoFogao
                        onPress={() => handleBocaClick(2)}
                        onLongPress={() => abrirModal(2)}
                        selecionado={bocaSelecionada == 2}
                        model={bocas[2]}
                        grande
                    />
                </View>
                <View style={styles.linhaFogao} lightColor="#eee" darkColor="#F7E2EE">
                    <BocaDoFogao
                        onPress={() => handleBocaClick(3)}
                        onLongPress={() => abrirModal(3)}
                        selecionado={bocaSelecionada == 3}
                        model={bocas[3]}
                    />
                    <BocaDoFogao
                        onPress={() => handleBocaClick(4)}
                        onLongPress={() => abrirModal(4)}
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
                    {bocas[bocaSelecionada].estado == EstadoDaBoca.RODANDO ||
                    bocas[bocaSelecionada].estado == EstadoDaBoca.TOCANDO ? (
                        <Entypo name="controller-paus" size={50} color="#993D63" />
                    ) : (
                        <Entypo name="controller-play" size={50} color="#993D63" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]} onPress={() => stop(bocaSelecionada)}>
                    <Entypo name="controller-stop" size={50} color="#993D63" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]} onPress={() => abrirModal(bocaSelecionada)}>
                    <MaterialIcons name="timer" size={50} color="#993D63" />
                </TouchableOpacity>
            </View>
            <FlashMessage position="bottom" />
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
        paddingVertical: 5,
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2196F3",
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
