import React from "react";
import {
  Text,
  View,
  ScrollView,
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

const logo = require("../assets/icon_scorecard.png");
const pricon = require("../assets/preload.gif");

function CorpSupportScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();

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
                name="account-question"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Support Center
              </Text>
            </View>
            <View style={globalStyle.listItem}>
              <View style={{ paddingBottom: 20 }}>
                <Text style={globalStyle.slideTite}>Technical Support</Text>
                <Text style={styles.property_label}>Technical email</Text>
                <Text style={styles.property_value}>support@shulebora.com</Text>

                <Text style={globalStyle.seperator}></Text>

                <Text style={styles.property_label}>Technical phone</Text>
                <Text style={styles.property_value}>+254(0)703650796</Text>
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
    fontSize: 11,
    fontWeight: "300",
  },
  property_value: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
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

export default CorpSupportScreen;
