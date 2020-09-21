import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";



import globalStyle from "../utils/styles";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../components/context";
import { ScrollView } from "react-native-gesture-handler";

import { useTheme } from "react-native-paper";

import colors from "../config/colors";
import { apiLogin } from "../utils/network";

const logo = require("../assets/icon_book.png");
const pricon = require("../assets/preload.gif");

function SignInScreen({ navigation }) {
  const [data, setData] = React.useState({
    // phone: "0705007980",
    // password: "shulebora2020",
    phone: "",
    password: "",
    check_textInputChange: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
  });
  const [preload, setPreload] = React.useState({ visible: false });
  const { signIn } = React.useContext(AuthContext);

  const textInputChange = (val) => {
    if (val.length === 10) {
      setData({
        ...data,
        phone: val,
        check_textInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        phone: val,
        check_textInputChange: false,
        isValidUser: false,
      });
    }
  };
  const handlePasswordChange = (val) => {
    if (val.trim().length >= 8) {
      setData({
        ...data,
        password: val,
        isValidPassword: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false,
      });
    }
  };
  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };
  const handleValidUser = (val) => {
    if (val.length === 10) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };
  const loginHandler = (userName, Password) => {
    if (data.phone.length !== 10 || data.password.length === 0) {
      Alert.alert(
        "Empty fields!",
        "Valid Phone and Password must be provided",
        [{ text: "Okay" }]
      );
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    apiLogin(userName, Password)
      .then((found) => {
        foundUser = found;
        // console.log("from api " + foundUser);
        if (foundUser.status === 2) {
          Alert.alert("Access Denied!", "Invalid phone or password", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
        if (foundUser.status === 3) {
          Alert.alert("Access Denied!", "Your account is inactive", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
        if (foundUser.status !== 0) {
          Alert.alert("Invalid Access!", "Invalid user information", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
        setPreload({ visible: false });
        signIn(foundUser);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Access error!", "Network request error", [
          { text: "Okay" },
        ]);
        setPreload({ visible: false });
        return;
      });
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      {/* dialog */}
      <Dialog
        dialogStyle={[
          globalStyle.listItem,
          {
            width: "90%",
            borderWidth: 0,
          },
        ]}
        visible={preload.visible}
        onTouchOutside={() => {
          setPreload({ visible: false });
        }}
      >
        <View
          style={{
            backgroundColor: colors.white,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            height: 50,
          }}
        >
          <Image
            style={[styles.iconButton, { width: 60, height: 60 }]}
            source={pricon}
          />
        </View>
      </Dialog>
      {/* end dialog */}
      <View style={styles.header}>
        <Text style={[styles.text_header, { textAlign: "center" }]}>
          Shule Bora Login
        </Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          <Text style={styles.text_footer}>Phone Number</Text>
          <View style={styles.action}>
            <FontAwesome name="user" color={colors.secondary} size={20} />
            <TextInput
              placeholder="e.g. 0722002200"
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => textInputChange(val)}
              onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
            />
            {data.check_textInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color={colors.primary} size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {data.isValidUser ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Provide a valid phone</Text>
            </Animatable.View>
          )}

          <Text style={[styles.text_footer, { marginTop: 20 }]}>Password</Text>
          <View style={styles.action}>
            <FontAwesome name="lock" color={colors.secondary} size={20} />
            <TextInput
              placeholder="Your password"
              secureTextEntry={data.secureTextEntry ? true : false}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => handlePasswordChange(val)}
            />
            <TouchableOpacity onPress={updateSecureTextEntry}>
              {data.secureTextEntry ? (
                <Feather name="eye-off" color={colors.grey} size={20} />
              ) : (
                  <Feather name="eye" color={colors.primary} size={20} />
                )}
            </TouchableOpacity>
          </View>
          {data.isValidPassword ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Provide a valid password</Text>
            </Animatable.View>
          )}
          {/* buttons */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("RequestPwdResetScreen");
            }}
          >
            <Text style={{ color: colors.primary, marginTop: 15 }}>
              Forgot password?
            </Text>
          </TouchableOpacity>
          <View style={styles.button}>
            {/* login button */}
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => {
                loginHandler(data.phone, data.password);
              }}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondary_dark]}
                style={styles.signIn}
              >
                <Text style={(styles.textSign, { color: colors.white })}>
                  Sign In
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            {/* create account */}
            <View style={[globalStyle.row, { flex: 1 }]}>
              {/* student account */}
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUpScreen")}
                style={[
                  styles.signInHalf,
                  {
                    borderColor: colors.secondary,
                    borderWidth: 1,
                    marginTop: 0,
                    marginRight: 10,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: colors.secondary,
                      textAlign: "center",
                      marginRight: 5,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
              {/* corp account */}
              <TouchableOpacity
                onPress={() => navigation.navigate("CorpSignUpScreen")}
                style={[
                  styles.signInHalf,
                  {
                    borderColor: colors.primary,
                    borderWidth: 1,
                    marginTop: 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.textSign,
                    { color: colors.primary, textAlign: "center", margin: 5 },
                  ]}
                >
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>
            {/* end create account */}
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
}
export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    marginTop: 50,
    flex: 1,
    width: "100%",
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  signInHalf: {
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
