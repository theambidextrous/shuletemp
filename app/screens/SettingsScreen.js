import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Dialog } from "react-native-simple-dialogs";

import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyle from "../utils/styles";
import colors from "../config/colors";

const logo = require("../assets/icon_scorecard.png");
const pricon = require("../assets/preload.gif");
const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function PapersScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();

  const [preload, setPreload] = React.useState({ visible: true });

  React.useEffect(() => {
    setPreload({ visible: false });
  }, []);
  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      {/* dialog */}
      <Dialog
        dialogStyle={[
          globalStyle.listItem,
          {
            backgroundColor: "rgba(52, 52, 52, 0)",
            borderColor: "rgba(52, 52, 52, 0)",
            width: "80%",
            height: 40,
          },
        ]}
        visible={preload.visible}
        onTouchOutside={() => setPreload({ visible: false })}
      >
        <View
          style={[
            globalStyle.listItem,
            {
              backgroundColor: colors.white,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              height: 50,
            },
          ]}
        >
          <Image
            style={[styles.iconButton, { width: 20, height: 20 }]}
            source={pricon}
          />
        </View>
      </Dialog>
      {/* end dialog */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={globalStyle.scrollContainer}>
          <LinearGradient
            style={globalStyle.header}
            colors={[colors.secondary_dark, colors.secondary]}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          ></LinearGradient>
          <View style={globalStyle.marginTopValue}>
            <View style={styles.section}>
              <Icon
                name="settings"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Settings
              </Text>
            </View>
            <View style={globalStyle.listItem}>
              <Text style={globalStyle.slideTite}>Profile Information</Text>
              <Text>Settings here</Text>
              <Text>Settings here</Text>
              <Text>Settings here</Text>
              <Text>Settings here</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  signIn: {
    width: "50%",
    height: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    marginRight: 10,
  },
});

export default PapersScreen;
