import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  StyleSheet,
  StatusBar,
  Picker,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../components/context";

import globalStyle from "../utils/styles";
import { useTheme } from "react-native-paper";
import { apiNewStudent } from "../utils/network";
const logo = require("../assets/icon_book.png");
const pricon = require("../assets/preload.gif");

import colors from "../config/colors";
import { ScrollView } from "react-native-gesture-handler";

function SignUpScreen({ navigation }) {
  const [data, setData] = React.useState({
    name: "",
    phone: "",
    county: "",
    form: "",
    password: "",
    confirm_password: "",
    check_nameInputChange: false,
    check_phoneInputChange: false,
    check_countyInputChange: false,
    check_formInputChange: false,
    secureTextEntry: true,
    confirm_secureTextEntry: true,
    isValidUser: true,
  });
  const [preload, setPreload] = React.useState({ visible: false });
  const { signUp } = React.useContext(AuthContext);
  const nameInputChange = (val) => {
    if (val.length !== 0) {
      setData({
        ...data,
        name: val,
        check_nameInputChange: true,
      });
    } else {
      setData({
        ...data,
        name: val,
        check_nameInputChange: false,
      });
    }
  };
  const phoneInputChange = (val) => {
    if (val.length !== 0) {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: true,
      });
    } else {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: false,
      });
    }
  };
  const countynputChange = (val) => {
    if (val.length !== 0) {
      setData({
        ...data,
        county: val,
        check_countyInputChange: true,
      });
    } else {
      setData({
        ...data,
        county: val,
        check_countyInputChange: false,
      });
    }
  };
  const formInputChange = (val) => {
    if (val !== "nn") {
      setData({
        ...data,
        form: val,
        check_formInputChange: true,
      });
    } else {
      setData({
        ...data,
        form: val,
        check_formInputChange: false,
      });
    }
  };
  const handlePasswordChange = (val) => {
    setData({
      ...data,
      password: val,
    });
  };
  const handleConfirmPasswordChange = (val) => {
    setData({
      ...data,
      confirm_password: val,
    });
  };
  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };
  const updateConfirmSecureTextEntry = () => {
    setData({
      ...data,
      confirm_secureTextEntry: !data.confirm_secureTextEntry,
    });
  };
  const registerHandler = (payload) => {
    if (
      payload.name.length === 0 ||
      payload.county.length === 0 ||
      payload.phone.length === 0 ||
      payload.form.length === 0 ||
      payload.password.length === 0 ||
      payload.confirm_password.length === 0
    ) {
      Alert.alert("Empty fields!", "All fields are required", [
        { text: "Okay" },
      ]);
      return;
    }
    if (payload.password !== payload.confirm_password) {
      Alert.alert("Password Error!", "Passwords must Match", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    apiNewStudent(payload)
      .then((found) => {
        foundUser = found;
        if (foundUser.status === 2) {
          setPreload({ visible: false });
          Alert.alert(
            "Invalid Access!",
            "Phone " + payload.phone + " already exists",
            [{ text: "Okay" }]
          );
          return;
        }
        if (foundUser.status === 0) {
          signUp(foundUser);
          setPreload({ visible: false });
          return;
        } else {
          Alert.alert("Invalid Access!", "Invalid user information", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert(
          "Access error!",
          "Error occured and could not create account. Try again later",
          [{ text: "Okay" }]
        );
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
          setPreload({ visible: true });
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
          Create New Account
        </Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          {/* name */}
          <Text style={styles.text_footer}>Full Name</Text>
          <View style={styles.action}>
            <FontAwesome name="user" color={colors.secondary} size={20} />
            <TextInput
              placeholder="Your full name"
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => nameInputChange(val)}
            />
            {data.check_nameInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color={colors.primary} size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {/* phone */}
          <Text style={styles.text_footer}>Phone Number</Text>
          <View style={styles.action}>
            <FontAwesome name="phone" color={colors.secondary} size={20} />
            <TextInput
              placeholder="e.g. 0722002200"
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => phoneInputChange(val)}
            />
            {data.check_phoneInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color={colors.primary} size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {/* county */}
          <Text style={styles.text_footer}>County</Text>
          <View style={styles.action}>
            <FontAwesome name="flag" color={colors.secondary} size={20} />
            <TextInput
              placeholder="e.g. Garrisa"
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => countynputChange(val)}
            />
            {data.check_countyInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color={colors.primary} size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {/* form */}
          <Text style={styles.text_footer}>Form/Level</Text>
          <View style={styles.action}>
            <FontAwesome
              name="graduation-cap"
              color={colors.secondary}
              size={25}
            />
            <Picker
              selectedValue={data.form}
              style={{ height: 30, width: 150 }}
              onValueChange={(val, itemIndex) => formInputChange(val)}
            >
              <Picker.Item label="Select One" value="nn" />
              <Picker.Item label="Form 1" value="is_h~1" />
              <Picker.Item label="Form 2" value="is_h~3" />
              <Picker.Item label="Form 3" value="is_h~4" />
              <Picker.Item label="Form 4" value="is_h~5" />
            </Picker>
            {data.check_formInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color={colors.primary} size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {/* password */}
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
          {/* confirm password */}
          <Text style={[styles.text_footer, { marginTop: 20 }]}>
            Confirm Password
          </Text>
          <View style={styles.action}>
            <FontAwesome name="lock" color={colors.secondary} size={20} />
            <TextInput
              placeholder="Confirm Your password"
              secureTextEntry={data.confirm_secureTextEntry ? true : false}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => handleConfirmPasswordChange(val)}
            />
            <TouchableOpacity onPress={updateConfirmSecureTextEntry}>
              {data.confirm_secureTextEntry ? (
                <Feather name="eye-off" color={colors.grey} size={20} />
              ) : (
                <Feather name="eye" color={colors.primary} size={20} />
              )}
            </TouchableOpacity>
          </View>
          {/* buttons */}
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => {
                registerHandler(data);
              }}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondary_dark]}
                style={styles.signIn}
              >
                <Text style={(styles.textSign, { color: colors.white })}>
                  Sign Up
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignInScreen")}
              style={[
                styles.signIn,
                {
                  borderColor: colors.secondary,
                  borderWidth: 1,
                  marginTop: 15,
                },
              ]}
            >
              <Text style={[styles.textSign, { color: colors.secondary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
}
export default SignUpScreen;

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
    flex: 7,
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
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
