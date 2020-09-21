import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";
import { Paragraph, TouchableRipple } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import Moment from "react-moment";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  apiGetLiveLessons,
  apiPostCorpOrder,
  apiPayOrder,
  apiPayStatus,
} from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
// import { loadOptions } from "@babel/core";

const logo = require("../assets/icon_lesson.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function CorpWelcomeScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [liveclass, updateLiveClass] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: true });
  const [empty, setEmpty] = React.useState(false);
  const [timer, setTimer] = React.useState(3000);
  const [mpesa, updateMpesa] = React.useState({
    mpesaResponse: null,
    shoMpesaView: false,
    mpesaInstructions: "0~0~0",
    showMpesaInstructions: false,
    mpesaPaymentStatus: false,
  });
  const [render, setRender] = React.useState(false);
  const [walk, setWalk] = React.useState(false);
  const [loop, setLoop] = React.useState(0);
  const [access, setAccess] = React.useState(true);

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
            //
            if (payStatus === 2) {
              setRender(render);
            } else if (payStatus === 0) {
              setRender(render);
              /** remove paid order, replace with new order */
              await AsyncStorage.setItem(
                "defaultOrder",
                "CRP-" + createcode(8)
              );
              setTimeout(() => {
                setPreload({ visible: false });
                navigation.reset({
                  index: 0,
                  routes: [{ name: "CorpLessons" }],
                });
              }, 3000);
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
  /** end check */
  const onRefresh = React.useCallback(() => {
    setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myLivelessons = [];
    async function fetchLiveLessons() {
      await AsyncStorage.multiGet(["userToken", "userType"])
        .then(async (multiple) => {
          await apiGetLiveLessons(multiple[0][1])
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              myLivelessons = s.payload.data;
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myLivelessons)))
                    .length == 0
                ) {
                  setEmpty(true);
                } else {
                  setEmpty(false);
                }
                if (multiple[1][1] !== "111") {
                  setAccess(false);
                  signOut();
                }
                updateLiveClass(JSON.parse(JSON.stringify(myLivelessons)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              // console.log("fetch live lessons error error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          console.log("D:: " + error);
          signOut();
        });
    }
    fetchLiveLessons();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);
  /** end */
  React.useEffect(() => {
    let ignore = false;
    let s = null;
    let myLivelessons = [];
    async function fetchLiveLessons() {
      await AsyncStorage.multiGet(["userToken", "userType"])
        .then(async (multiple) => {
          await apiGetLiveLessons(multiple[0][1])
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              myLivelessons = s.payload.data;
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myLivelessons)))
                    .length == 0
                ) {
                  setEmpty(true);
                } else {
                  setEmpty(false);
                }
                if (multiple[1][1] !== "111") {
                  setAccess(false);
                  signOut();
                }
                updateLiveClass(JSON.parse(JSON.stringify(myLivelessons)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              // console.log("fetch live lessons error error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          console.log("D:: " + error);
          signOut();
        });
    }
    fetchLiveLessons();
    return () => {
      ignore = true;
    };
  }, []);

  const createcode = (length = 8) => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  const handleOrderAction = async (lesson) => {
    if (lesson.length === 0) {
      Alert.alert("Order Error!", "Select a valid lesson from the list", [
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
        await apiPostCorpOrder(multiple[0][1], lesson, multiple[1][1])
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
            Alert.alert(
              "Order error!",
              "Could not place order, try again later",
              [{ text: "Okay" }]
            );
            return;
          });
      })
      .catch((error) => {
        console.log("place order error: " + error);
        setPreload({ visible: false });
        Alert.alert("Order error!", "Could not place order, try again later", [
          { text: "Okay" },
        ]);
        return;
        // console.log("storage err: " + error);
      });
  };
  const Item = ({ lesson, subject, topic, datetime, price }) => (
    <TouchableRipple style={globalStyle.listItem} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <Image
            style={[globalStyle.thumb, { height: 30, width: 30 }]}
            source={logo}
          />

          <View style={globalStyle.text}>
            <Text
              style={[
                globalStyle.name,
                { color: colors.primary, textTransform: "capitalize" },
              ]}
            >
              {subject}
            </Text>
          </View>
        </View>
        {/* subject */}
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          <View style={{ flexDirection: "row", marginLeft: 5, marginRight: 5 }}>
            <Paragraph
              style={{
                color: colors.black,
                fontWeight: "bold",
                textTransform: "capitalize",
                marginRight: 4,
              }}
            >
              Topic(s):
            </Paragraph>
            <Paragraph
              style={{
                color: colors.primary,
                fontWeight: "bold",
                paddingRight: "18%",
                flexShrink: 1,
                textTransform: "capitalize",
              }}
            >
              {topic}
            </Paragraph>
          </View>
        </View>
        {/* topic */}
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Paragraph
              style={{
                color: colors.black,
                fontWeight: "bold",
                textTransform: "capitalize",
                marginRight: 4,
              }}
            >
              Cost:
            </Paragraph>
            <Paragraph
              style={{
                color: colors.black,
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {"Ksh. " + price}
            </Paragraph>
          </View>
        </View>
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Icon name="calendar-outline" style={styles.iconButton} size={20} />
            <Moment element={Text} format="MMMM Do">
              {datetime}
            </Moment>
          </View>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Icon name="clock-outline" style={styles.iconButton} size={20} />
            <Moment element={Text} format="HH:mm a">
              {datetime}
            </Moment>
          </View>
        </View>
        <View
          style={[globalStyle.row, { marginBottom: 35, flexDirection: "row" }]}
        >
          <TouchableOpacity
            style={styles.signIn}
            onPress={() => {
              handleOrderAction(lesson);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary_dark]}
              style={[
                styles.signIn,
                { flexDirection: "row", padding: 20, width: "80%" },
              ]}
            >
              <Icon
                name="shopify"
                style={[{ color: colors.white, marginRight: 3 }]}
                size={20}
              />
              <Text style={(styles.textSign, { color: colors.white })}>
                Buy Now
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </TouchableRipple>
  );
  const renderItem = ({ item }) => (
    <Item
      lesson={item.id}
      subject={item.subjects}
      topic={item.topics}
      datetime={item.zoom_time}
      price={item.price}
    />
  );
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
        <ScrollView
          style={globalStyle.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <LinearGradient
            style={globalStyle.header}
            colors={[colors.secondary_dark, colors.secondary]}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          >
            {/* <View style={globalStyle.titleContainer}>
            <Text style={globalStyle.title}> List Views </Text>
          </View> */}
          </LinearGradient>
          <View style={globalStyle.marginTopValue}>
            <View style={styles.section}>
              <Icon
                name="webcam"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Upcoming Live Sessions
              </Text>
            </View>
            <View style={{ marginBottom: 40 }}>
              <FlatList
                data={liveclass}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
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
                  No Live Sessions found. Please check back later
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
  iconButton: {
    width: 60,
  },
});

export default CorpWelcomeScreen;
