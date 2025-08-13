import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Images } from "../../utils/assets";

export default function CameraImagePreview({ imageUri, onConfirm, onCancel }) {
    return (
        <View style={styles.mainWrapper}>
            <Image style={styles.image} source={imageUri} />
            <View style={styles.imageButtonsContainer}>
                <TouchableOpacity style={styles.button} onPress={onCancel}>
                    <Image style={styles.buttonImage} source={Images.xMark} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onConfirm}>
                    <Image style={styles.buttonImage} source={Images.checkMark} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
    image: { flex: 4, width: "100%", height: "100%" },
    imageButtonsContainer: { flex: 1, flexDirection: "row", width: "100%", justifyContent: "space-around", alignItems: "center", backgroundColor: "black" },
    button: { height: 50, width: 50, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.5)", borderRadius: 50 },
    buttonImage: { width: 30, height: 30, borderRadius: 50 }
});
