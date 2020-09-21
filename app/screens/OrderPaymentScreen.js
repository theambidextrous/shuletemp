import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { apiPayOrder, apiPayStatus, apiGetUserInfo } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import { keep, del } from "../utils/storage";
import conf from "../config/configs";

const logo = require("../assets/icon_book.png");
const pricon = require("../assets/preload.gif");

function OrderPaymentScreen({ navigation }) {
  const { signOut, signIn } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [order, updateOrder] = React.useState([]);
  const [timer, setTimer] = React.useState(30000);
  const [mpesa, updateMpesa] = React.useState({
    mpesaResponse: null,
    shoMpesaView: false,
    mpesaInstructions: "0~0~0",
    showMpesaInstructions: false,
    mpesaPaymentStatus: false,
  });
  const [preload, setPreload] = React.useState({ visible: false });
  const [empty, setEmpty] = React.useState(false);
  const [data, setData] = React.useState({
    phone: "",
    check_phoneInputChange: false,
    isValidPhone: true,
  });
  const [render, setRender] = React.useState(false);
  const [walk, setWalk] = React.useState(false);
  const [loop, setLoop] = React.useState(0);
  const fetching = React.useRef(false);
  //status checks ===================
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      setPreload({ visible: true });
      setTimeout(() => {
        // console.log("callback inside timeout :: ");
        checkPayStatus();
      }, timer);
      // console.log("callback running:: ");
      setPreload({ visible: false });
      return () => {
        // Do something when the screen is un-focused
        setLoop(0);
      };
    }, [render])
  );
  const checkPayStatus = async () => {
    if (!walk) {
      setRender(!render);
      // console.log("not time yet");
      return;
    }
    let s = null;
    let payStatus = null;
    setPreload({ visible: true });
    await AsyncStorage.multiGet(["userToken", "defaultOrder"])
      .then(async (multiple) => {
        await apiPayStatus(multiple[1][1])
          .then(async (response) => {
            if (!response) {
              // console.log("critical error");
              setRender(render);
              Alert.alert(
                "Network error!",
                "Please check your internet connection",
                [{ text: "Okay" }]
              );
              setPreload({ visible: false });
              return;
            }
            s = response;
            payStatus = s.payload.status;
            // console.log("status check ran: " + payStatus);
            if (payStatus === 2) {
              setRender(render);
            } else if (payStatus === 0) {
              setRender(render);
              await apiGetUserInfo(multiple[0][1])
                .then((userresponse) => {
                  keep("userToken", String(userresponse.payload.token));
                  keep(conf.secret, JSON.stringify(userresponse.payload.data));
                  keep(
                    "subscription_data",
                    JSON.stringify(userresponse.payload.subscription_data)
                  );
                  keep(
                    "IS_PAID",
                    JSON.stringify(userresponse.payload.data.is_paid)
                  );
                  del("defaultOrder");
                  Alert.alert("Payment Success!", "Thank you", [
                    { text: "Okay" },
                  ]);
                  setTimeout(() => {
                    setPreload({ visible: false });
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "HomePoint" }],
                    });
                  }, 3000);
                  return;
                })
                .catch((error) => {
                  setRender(render);
                  setPreload({ visible: false });
                  console.log(error);
                  signOut();
                });
            } else {
              setRender(!render);
              setPreload({ visible: false });
            }
          })
          .catch((error) => {
            // console.log("critical error: " + error);
            setRender(render);
            Alert.alert(
              "Network error!",
              "Please check your internet connection",
              [{ text: "Okay" }]
            );
            setPreload({ visible: false });
            return;
          });
      })
      .catch((error) => {
        // console.log("critical error: " + error);
        setRender(render);
        Alert.alert("Network error!", "Please check your internet connection", [
          { text: "Okay" },
        ]);
        setPreload({ visible: false });
        return;
      });
  };
  React.useEffect(() => {
    let ignore = false;
    let s = null;
    let myOrder = [];
    setPreload({ visible: false });
    async function fetchOrder() {
      await AsyncStorage.getItem("placed_order")
        .then((response) => {
          if (!response) {
            signOut();
          }
          s = JSON.parse(response);
          myOrder = s.payload.data;
          if (!ignore) {
            if (Object.keys(JSON.parse(JSON.stringify(myOrder))).length == 0) {
              setEmpty(true);
            }
            updateOrder(JSON.parse(JSON.stringify(myOrder)));
            setPreload({ visible: false });
            setRender(!render);
          }
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchOrder();
    return () => {
      ignore = true;
    };
  }, []);

  const phoneInputChange = (val) => {
    if (val.length >= 10) {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: true,
        isValidPhone: true,
      });
    } else {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: false,
        isValidPhone: false,
      });
    }
  };

  const handlePayAction = async (phone) => {
    setTimer(10000);
    setPreload({ visible: true });
    setRender(true);
    let s = null;
    let myResOrder = [];
    let myResMpesaInstructions = null;
    let myResMpesaResExpress = null;
    let myResMpesaResC2b = null;
    let myResMpesaResUrls = null;
    if (phone.length < 10) {
      Alert.alert("Phone Error!", "Enter a valid MPESA phone number", [
        { text: "Okay" },
      ]);
      return;
    }
    await AsyncStorage.multiGet(["userToken", "defaultOrder"])
      .then(async (multiple) => {
        await apiPayOrder(multiple[0][1], phone, multiple[1][1])
          .then(async (response) => {
            if (!response) {
              console.log("empty resp");
              signOut();
              return;
            } else {
              s = response;
              myResOrder = s.payload.data;
              myResMpesaInstructions = s.payload.mpesa.instructions;
              myResMpesaResExpress = s.payload.mpesa.a;
              myResMpesaResC2b = s.payload.mpesa.b;
              myResMpesaResUrls = s.payload.mpesa.c;
              updateMpesa({
                ...mpesa,
                mpesaResponse: myResMpesaResExpress,
                shoMpesaView: true,
                mpesaInstructions: myResMpesaInstructions,
                showMpesaInstructions: true,
              });
              setWalk(true);
            }
          })
          .catch((error) => {
            console.log(error);
            Alert.alert(
              "Payment error!",
              "Could not request mpesa services, try again later",
              [{ text: "Okay" }]
            );
            // console.log("fetch question error: " + error);
          });
      })
      .catch((error) => {
        Alert.alert("Order error!", "Could not place order, try again later", [
          { text: "Okay" },
        ]);
        // console.log("storage err: " + error);
      });
    setPreload({ visible: false });
  };
  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
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
                name="book"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                2. Make Payment
              </Text>
            </View>
            {empty == false && (
              <View>
                <View style={globalStyle.listItem}>
                  {/* pack selection */}
                  <Text style={styles.text_footer}>
                    Please Enter your MPESA number
                  </Text>
                  <View
                    style={[
                      styles.action,
                      { marginRight: 30, marginLeft: 30, marginTop: 30 },
                    ]}
                  >
                    <FontAwesome
                      name="mobile-phone"
                      color={colors.secondary}
                      style={[
                        styles.textInput,
                        { flex: 0, color: colors.secondary },
                      ]}
                      size={40}
                    />
                    <TextInput
                      placeholder="Your MPESA number"
                      style={[styles.textInput, { height: 40, fontSize: 16 }]}
                      autoCapitalize="none"
                      onChangeText={(val) => phoneInputChange(val)}
                    />
                    {data.check_phoneInputChange ? (
                      <Animatable.View animation="bounceIn">
                        <Feather
                          name="check-circle"
                          color={colors.primary}
                          size={20}
                        />
                      </Animatable.View>
                    ) : null}
                  </View>
                  <View
                    style={[styles.button, { marginBottom: 40, marginTop: 30 }]}
                  >
                    <TouchableOpacity
                      style={[styles.signIn, { width: "100%", height: 60 }]}
                      onPress={() => {
                        handlePayAction(data.phone);
                      }}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={styles.signIn}
                      >
                        <Text
                          style={(styles.textSign, { color: colors.white })}
                        >
                          Pay Now
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {mpesa.shoMpesaView == true && (
              <View
                style={[
                  globalStyle.listItem,
                  { flex: 1, flexDirection: "column" },
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.text_footer,
                      {
                        margin: 15,
                        justifyContent: "center",
                        color: colors.primary,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {mpesa.mpesaResponse}
                  </Text>
                  {/* instructions */}
                  <View style={styles.mpesaContainer}>
                    <View>
                      <Text style={styles.boldText}>
                        You may also pay as follows
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>1.) Select </Text>
                        <Text style={styles.boldText}>PAY BILL </Text>
                        <Text style={styles.plainText}>
                          from your Safaricom MPesa Menu.
                        </Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>
                          2.) Enter ShuleBora Business Number{" "}
                        </Text>
                        <Text style={styles.boldText}>
                          {mpesa.mpesaInstructions.split("~")[0]}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>3.) Select </Text>
                        <Text style={styles.boldText}>
                          Enter Account Number
                        </Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>
                          4.) Enter Order number{" "}
                        </Text>
                        <Text style={styles.boldText}>
                          {mpesa.mpesaInstructions.split("~")[1]}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>5.) Enter Amount </Text>
                        <Text style={styles.boldText}>
                          {mpesa.mpesaInstructions.split("~")[2]}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>6.) Enter your </Text>
                        <Text style={styles.boldText}>PIN</Text>
                        <Text style={styles.plainText}> then Press </Text>
                        <Text style={styles.boldText}>OK</Text>
                      </Text>
                      <Text
                        style={[
                          globalStyle.row,
                          { marginTop: 10, lineHeight: 20 },
                        ]}
                      >
                        <Text style={styles.plainText}>
                          7.) You will Receive a{" "}
                        </Text>
                        <Text style={styles.boldText}>
                          Confirmation Message
                        </Text>
                        <Text style={styles.plainText}> from MPesa</Text>
                      </Text>
                    </View>
                  </View>
                  {/* end instructions */}
                </View>
              </View>
            )}
            {empty == true && (
              <View
                style={[
                  globalStyle.listItem,
                  {
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={{ margin: 15 }}>
                  No pending orders found. Please check back later
                </Text>
              </View>
            )}
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
  mpesaContainer: {
    padding: 20,
    marginBottom: 20,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  plainText: {
    fontWeight: "300",
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
    marginTop: Platform.OS === "ios" ? 0 : 6,
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
});

export default OrderPaymentScreen;
