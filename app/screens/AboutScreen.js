import React from "react";
import {
  Text,
  View,
  ScrollView,
  Linking,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import conf from "../config/configs";

const logo = require("../assets/icon_scorecard.png");
const pricon = require("../assets/preload.gif");

function AboutScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error(err));
  };
  React.useEffect(() => {}, []);

  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
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
                name="information"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                About ShuleBora Digital
              </Text>
            </View>
            <View style={globalStyle.listItem}>
              <View style={{ paddingBottom: 20 }}>
                <Text style={globalStyle.slideTite}>Who we are</Text>
                <Text style={styles.property_value}>Brief</Text>
                <Text style={styles.property_label}>
                  We have partnered with top performing schools in the country
                  and their best teachers to bring to you up to date and
                  excellent learning material.
                </Text>
                <Text style={styles.property_label}>
                  We have partnered with top performing schools in the country
                  and their best teachers to bring to you up to date and
                  excellent learning material.
                </Text>

                <Text style={styles.property_value}>
                  Content sharing limitation
                </Text>
                <Text style={styles.property_label}>
                  All materials (therein referred to as "content") uploaded on
                  ShuleBora App(android/iOS) and website are premium and are
                  accessible to only authorized users who have purchased a valid
                  subscription.
                </Text>
                <Text style={styles.property_label}>
                  Even though users are allowed to download the content, they
                  are NOT allowed to sell or commercialize it in any way
                  whatsoever.
                </Text>

                <Text style={styles.property_value}>Copyright</Text>
                <Text style={styles.property_label}>
                  ShuleBora App(android/iOS) and website and any other related
                  materials including but not limited to logos, images, audio
                  files, pdf files & video files are all Copyrights of ShuleBora
                  Digital Ltd and therefore should not be acquired, used or
                  distributed without authorization.
                </Text>

                <Text style={styles.property_value}>Developer</Text>
                <Text>
                  <Text style={styles.property_label}>
                    ShuleBora App(android/iOS) and website is & maintained by
                  </Text>
                  <Text
                    style={[styles.property_link]}
                    onPress={() => {
                      openURL(conf.developer_page);
                    }}
                  >
                    {" "}
                    {conf.developer_name}.
                  </Text>
                </Text>
              </View>
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
  property_label: {
    color: colors.black_light,
    fontSize: 13,
    lineHeight: 23,
    fontWeight: "300",
  },
  property_value: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
  },
  property_link: {
    color: colors.primary,
    fontSize: 14,
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

export default AboutScreen;
