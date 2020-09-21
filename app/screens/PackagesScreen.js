import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  Picker,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import {
  apiGetPacks,
  apiPostOrder,
  apiGetUserInfo,
  apiPayStatus,
  apiPayOrder,
} from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import { keep, del } from "../utils/storage";
import conf from "../config/configs";

const pricon = require("../assets/preload.gif");
const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function PackageScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [mpack, updatePack] = React.useState([]);
  const [preload, setPreload] = React.useState({ visible: false });
  const [empty, setEmpty] = React.useState(false);
  const [timer, setTimer] = React.useState(3000);
  const [render, setRender] = React.useState(false);
  const [walk, setWalk] = React.useState(false);
  const [loop, setLoop] = React.useState(0);
  const [data, setData] = React.useState({
    pack: "",
    price: "",
    check_packageInputChange: false,
    isValidPack: true,
  });

  /** payment check */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      setPreload({ visible: true });
      // console.log("focus event running: ");
      setTimeout(() => {
        if (walk) {
          checkPayStatus();
        } else {
          // console.log("walk is not on yet");
        }
      }, timer);
      setPreload({ visible: false });
      return () => {
        // setWalk(false);
        setLoop(loop);
      };
    }, [render])
  );
  const checkPayStatus = async () => {
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
            setLoop(loop + 1);
            // console.log(
            //   "check::: found status " + payStatus + " loop count is " + loop
            // );
            if (loop >= 10) {
              /** kill process after 100 seconds */
              setPreload({ visible: false });
              Alert.alert(
                "Payment Processing error!",
                "We could not verify your payment. Please try again later",
                [{ text: "Okay", onPress: () => signOut() }]
              );
              setTimeout(() => {
                signOut();
              }, 5000);
            }
            if (payStatus === 2) {
              setRender(render);
              setWalk(false);
              setPreload({ visible: false });
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
              setWalk(true);
              return;
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
            setRender(render);
            setWalk(false);
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
        setRender(render);
        setWalk(false);
        setPreload({ visible: false });
        return;
      });
  };
  /** end check */
  React.useEffect(() => {
    setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myPack = [];
    async function fetchPackages() {
      await AsyncStorage.getItem("userToken")
        .then(async (token) => {
          await apiGetPacks(token)
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              myPack = s.payload.data;
              // console.log(
              //   "subjects list = " + JSON.parse(JSON.stringify(myPack))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myPack))).length == 0
                ) {
                  setEmpty(true);
                }
                setRender(render);
                setWalk(false);
                updatePack(JSON.parse(JSON.stringify(myPack)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              // console.log("fetch packages error error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchPackages();
    setPreload({ visible: false });
    return () => {
      ignore = true;
    };
  }, []);

  const packageInputChange = (val) => {
    if (val !== "nn") {
      setData({
        ...data,
        pack: val,
        price: 0,
        check_packageInputChange: true,
        isValidPack: true,
      });
    } else {
      setData({
        ...data,
        pack: val,
        price: 0,
        check_packageInputChange: false,
        isValidPack: false,
      });
    }
  };

  const handleOrderAction = async (pack) => {
    if (pack === "nn") {
      Alert.alert("Order Error!", "Select a valid package from the list", [
        { text: "Okay" },
      ]);
      return;
    }
    setPreload({ visible: true });
    setTimer(10000);
    setRender(!render);
    setWalk(true);
    await AsyncStorage.multiGet(["userToken", "defaultOrder"])
      .then(async (multiple) => {
        setPreload({ visible: true });
        await apiPostOrder(multiple[0][1], pack, multiple[1][1])
          .then(async (response) => {
            setPreload({ visible: true });
            // console.log(multiple[1][1]);
            if (!response) {
              console.log("empty resp");
              signOut();
            } else {
              /** order placed trigger payment */
              await apiPayOrder(multiple[0][1], multiple[1][1])
                .then(async (response) => {
                  if (!response) {
                    console.log("empty resp");
                    signOut();
                    return;
                  } else {
                    let s = null;
                    let myResOrder = [];
                    let myResMpesaInstructions = null;
                    let myResMpesaResExpress = null;
                    s = response;
                    myResOrder = s.payload.data;
                    myResMpesaInstructions = s.payload.mpesa.phone;
                    myResMpesaResExpress = s.payload.mpesa.a;
                    setWalk(true);
                    setTimeout(() => {
                      setPreload({ visible: false });
                    }, 4000);
                    Alert.alert("Request Success", myResMpesaResExpress, [
                      {
                        text: "Okay",
                        onPress: () => {
                          setWalk(true);
                          setRender(!render);
                        },
                      },
                    ]);
                  }
                })
                .catch((error) => {
                  console.log(error);
                  Alert.alert(
                    "Payment error!",
                    "Could not request mpesa services, try again later",
                    [{ text: "Okay" }]
                  );
                  setWalk(false);
                  setRender(render);
                  setPreload({ visible: false });
                  return;
                  // console.log("fetch question error: " + error);
                });
              /** end pay */
            }
          })
          .catch((error) => {
            console.log("place order error: " + error);
            setPreload({ visible: false });
            setWalk(false);
            setRender(render);
            Alert.alert(
              "Order error!",
              "Could not place order, try again later",
              [{ text: "Okay" }]
            );
            return;
          });
      })
      .catch((error) => {
        setWalk(false);
        setRender(render);
        console.log("place order error: " + error);
        setPreload({ visible: false });
        Alert.alert("Order error!", "Could not place order, try again later", [
          { text: "Okay" },
        ]);
        return;
        // console.log("storage err: " + error);
      });
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
                name="shopping"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                1. Choose Subscription
              </Text>
            </View>
            {empty == false && (
              <View>
                <View style={globalStyle.listItem}>
                  {/* pack selection */}
                  {/* <Text style={styles.text_footer}>Choose a Subscription</Text> */}
                  <View style={styles.action}>
                    {/* <FontAwesome
                    name="shopping-cart"
                    color={colors.secondary}
                    size={20}
                  /> */}
                    <Picker
                      selectedValue={data.pack}
                      style={{
                        height: 50,
                        width: "80%",
                        color: colors.black_light,
                      }}
                      onValueChange={(val, itemIndex) =>
                        packageInputChange(val)
                      }
                    >
                      <Picker.Item label="Pick one from here" value="nn" />
                      {mpack.map((item, index) => {
                        return (
                          <Picker.Item
                            label={item.name + " - KES " + item.price}
                            value={item.id}
                            key={index}
                          />
                        );
                      })}
                    </Picker>
                    {data.check_packageInputChange ? (
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
                        handleOrderAction(data.pack);
                      }}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={[
                          styles.signIn,
                          { flexDirection: "row", width: "90%" },
                        ]}
                      >
                        <Icon
                          name="shopping"
                          style={{ color: colors.white }}
                          size={30}
                        />
                        <Text
                          style={[styles.textSign, { color: colors.white }]}
                        >
                          Pay Now
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
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
                  No packages found. Please check back later
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
});

export default PackageScreen;
