import React from "react";
// import LinearGradient from "react-native-linear-gradient";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { ConfirmDialog } from "react-native-simple-dialogs";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import colors from "../config/colors";
import configs from "../config/configs";
// import SignInScreen from "./SignInScreen";
function SplashScreen({ navigation }) {
  const [resizemode, updateResizeMode] = React.useState({
    mode: Video.RESIZE_MODE_STRETCH,
  });
  const [playerloading, updatePlayerLoading] = React.useState({
    icon: "shulebora-leaners.jpg", //"nowLoading.gif",
    hasPoster: true,
  });
  const [playing, setPlaying] = React.useState({
    url: configs.media_api + 'help.mp4',
    autoplay: false,
  });
  const changeScreenOrientation = async (e) => {
    if (e.fullscreenUpdate === 0) {
      updateResizeMode({ mode: Video.RESIZE_MODE_CONTAIN });
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
      );
    }
    if (e.fullscreenUpdate === 3) {
      updateResizeMode({ mode: Video.RESIZE_MODE_STRETCH });
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }
  };
  const [helpv, setHelpv] = React.useState({ visible: false });
  return (
    <View style={styles.container}>
      {/* dialog */}
      <ConfirmDialog
        titleStyle={{ color: colors.secondary }}
        buttonsStyle={{
          backgroundColor: colors.white,
          borderBottomColor: colors.secondary,
          borderBottomWidth: 1,
          borderRightColor: colors.secondary,
          borderRightWidth: 1,
          width: "30%",
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
          borderRadius: 10,
          height: 30,
          shadowColor: colors.secondary,
        }}
        dialogStyle={{
          borderRadius: 15
        }}
        title="How it works"
        visible={helpv.visible}
        onTouchOutside={() => {
          setHelpv({ visible: false });
          setPlaying({ ...playing, autoplay: false });
        }}
        positiveButton={{
          title: "Got it",
          titleStyle: {
            color: colors.secondary,
          },
          onPress: () => {
            setHelpv({ visible: false });
            setPlaying({ ...playing, autoplay: false });
          },
        }}
      >
        <View>
          {/* <Text>Here is the help video</Text> */}
          <Video
            source={{
              uri: playing.url,
              headers: {
                Accept: "application/octet-stream",
              },
            }}
            posterSource={{
              uri: configs.media_api + playerloading.icon,
            }}
            usePoster={playerloading.hasPoster}
            onLoadStart={() => {
              updatePlayerLoading({
                icon: "nowLoading.gif",
                hasPoster: true,
              });
            }}
            onLoad={() => {
              updatePlayerLoading({ ...playerloading, hasPoster: false });
            }}
            posterStyle={{
              width: "100%",
              height: 180,
              resizeMode: "stretch",
            }}
            rate={1.0}
            onFullscreenUpdate={(e) => {
              changeScreenOrientation(e);
            }}
            volume={1.0}
            isMuted={false}
            resizeMode={resizemode.mode}
            shouldPlay={playing.autoplay}
            isLooping={false}
            useNativeControls={true}
            style={{
              width: "100%",
              minHeight: 204,
              borderRadius: 4,
            }}
          />
        </View>
      </ConfirmDialog>
      {/* end dialog */}
      <View style={styles.header}>
        <Animatable.Image
          animation="bounceIn"
          duration={1500}
          source={require("../assets/shulebora-logo-light.png")}
          resizeMode="contain"
          style={styles.logo}
        />
        <Animatable.View animation="bounceIn" duration={1500} style={[styles.button, { marginRight: 8 }]}>
          <TouchableOpacity
            onPress={() => {
              setHelpv({ visible: true });
              setPlaying({ ...playing, autoplay: true });
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary]}
              style={[styles.signIn, { borderBottomColor: colors.white, borderBottomWidth: 1, borderRightColor: colors.white, borderRightWidth: 1 }]}
            >
              <MaterialIcons name="play-circle" color={colors.white} size={20} />
              <Text style={styles.textSign}>How It Works</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>
      <Animatable.View
        animation="fadeInUpBig"
        duration={1500}
        style={styles.footer}
      >
        <Text style={styles.title}>Shule Bora Digital</Text>
        <Text style={styles.text}>Learn From the Best, at Your Own Pace</Text>
        <View style={{ flexDirection: "row", width: "100%" }}>
          <View style={[styles.button, { marginRight: 8 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("PreviewScreen")}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary_dark]}
                style={styles.signIn}
              >
                <MaterialIcons name="video" color={colors.white} size={20} />
                <Text style={styles.textSign}>Try for Free</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={[styles.button]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignInScreen")}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondary_dark]}
                style={[styles.signIn]}
              >
                <Text style={styles.textSign}>Get Started</Text>
                <MaterialIcons
                  name="arrow-right"
                  color={colors.white}
                  size={20}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    </View>
  );
}
export default SplashScreen;

const { height } = Dimensions.get("screen");
const height_logo = height * 0.28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  logo: {
    width: height_logo,
    height: height_logo,
  },
  title: {
    color: "#05375a",
    fontSize: 30,
    fontWeight: "bold",
  },
  text: {
    color: "grey",
    marginTop: 5,
  },
  button: {
    alignItems: "flex-end",
    marginTop: 30,
  },
  signIn: {
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
  },
  textSign: {
    color: colors.white,
    fontWeight: "bold",
  },
});
