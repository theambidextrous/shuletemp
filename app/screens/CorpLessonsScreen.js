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
  Clipboard,
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
import { apiGetLiveLessonsPaid, apiGetUserStatus } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";

const logo = require("../assets/icon_lesson.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function CorpLessonsScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [liveclass, updateLiveClass] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: true });
  const [empty, setEmpty] = React.useState(false);
  const [access, setAccess] = React.useState(true);

  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      async function fetchUserStatus() {
        await AsyncStorage.getItem("userToken")
          .then(async (token) => {
            await apiGetUserStatus(token)
              .then((res) => {
                //all is well
              })
              .catch((error) => {
                //user access denied
                signOut();
              });
          })
          .catch((error) => {
            signOut();
          });
      }
      fetchUserStatus();
      return () => {
        // Do something when the screen is un-focused
        setPreload({ visible: false });
      };
    }, [])
  );
  /** end user check */
  const onRefresh = React.useCallback(() => {
    setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myLivelessons = [];
    async function fetchLiveLessons() {
      await AsyncStorage.multiGet(["userToken", "userType"])
        .then(async (multiple) => {
          await apiGetLiveLessonsPaid(multiple[0][1])
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
                setEmpty(false);
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
          await apiGetLiveLessonsPaid(multiple[0][1])
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

  const handleCopyAction = async (link) => {
    if (link.length === 0) {
      Alert.alert("Copy Error", "Empty link could not be copied", [
        { text: "Okay" },
      ]);
      return;
    }
    setPreload({ visible: true });
    await Clipboard.setString(link);
    Alert.alert("Success", "Copied to Clipboard", [{ text: "Okay" }]);
  };
  const Item = ({ subject, topic, zoom_link, datetime }) => (
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
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Paragraph
              style={{
                color: colors.black,
                fontWeight: "bold",
                textTransform: "capitalize",
                marginRight: 4,
              }}
            >
              Topic:
            </Paragraph>
            <Paragraph
              style={{
                color: colors.primary,
                fontWeight: "bold",
                paddingRight: "15%",
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
          <TouchableOpacity style={styles.signIn}>
            <Text style={(styles.textSign, { color: colors.black })}>
              <Text style={{ fontWeight: "bold" }}>Live Class Link:</Text>
            </Text>
            <Text style={(styles.textSign, { color: colors.black })}>
              <Text style={{ color: colors.primary }}>{zoom_link}</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[globalStyle.row, { marginBottom: 35, flexDirection: "row" }]}
        >
          <TouchableOpacity
            style={styles.signIn}
            onPress={() => {
              handleCopyAction(zoom_link);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary_dark]}
              style={[
                styles.signIn,
                { flexDirection: "row", padding: 20, width: "90%" },
              ]}
            >
              <Icon
                name="content-copy"
                style={[
                  styles.iconButton,
                  { color: colors.white, marginRight: 5 },
                ]}
                size={20}
              />
              <Text style={(styles.textSign, { color: colors.white })}>
                Copy Link to Clipboard
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </TouchableRipple>
  );
  const renderItem = ({ item }) => (
    <Item
      id={item.id}
      subject={item.subjects}
      topic={item.topics}
      zoom_link={item.zoom_link}
      datetime={item.zoom_time}
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
                My Session Purchases
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
                <Text style={{ margin: 15 }}>You have no purchases</Text>
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
    color: colors.primary,
  },
});

export default CorpLessonsScreen;
