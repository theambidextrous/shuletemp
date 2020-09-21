import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Paragraph, TouchableRipple } from "react-native-paper";
import { Dialog } from "react-native-simple-dialogs";
import Moment from "react-moment";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiGetQuestion, apiGetUserStatus } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";

const logo = require("../assets/icon_help.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
function AssignmentsScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [question, updateQuestion] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: true });
  const [empty, setEmpty] = React.useState(false);

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
    let ignore = false;
    let s = null;
    let myQuestions = [];
    async function fetchQuestions() {
      await AsyncStorage.multiGet(["userToken", "IS_PAID"])
        .then(async (multiple) => {
          if (multiple[1][1] == "0") {
            navigation.navigate("Packages");
            return;
          }
          await apiGetQuestion(multiple[0][1])
            .then((response) => {
              if (!response) {
                console.log("empty resp");
                // signOut();
              }
              s = response;
              myQuestions = s.payload.data;
              // console.log(
              //   "question list = " + JSON.parse(JSON.stringify(myQuestions))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myQuestions))).length ==
                  0
                ) {
                  setEmpty(true);
                }
                updateQuestion(JSON.parse(JSON.stringify(myQuestions)));
              }
            })
            .catch((error) => {
              setEmpty(true);
              console.log("fetch question error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          console.log("storage err: " + error);
          signOut();
        });
    }
    fetchQuestions();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    let ignore = false;
    let s = null;
    let myQuestions = [];
    async function fetchQuestions() {
      await AsyncStorage.multiGet(["userToken", "IS_PAID"])
        .then(async (multiple) => {
          if (multiple[1][1] == "0") {
            navigation.navigate("Packages");
            return;
          }
          await apiGetQuestion(multiple[0][1])
            .then((response) => {
              if (!response) {
                console.log("empty resp");
                // signOut();
              }
              s = response;
              myQuestions = s.payload.data;
              // console.log(
              //   "question list = " + JSON.parse(JSON.stringify(myQuestions))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myQuestions))).length ==
                  0
                ) {
                  setEmpty(true);
                }
                updateQuestion(JSON.parse(JSON.stringify(myQuestions)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              console.log("fetch question error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          console.log("storage err: " + error);
          signOut();
        });
    }
    fetchQuestions();
    return () => {
      ignore = true;
    };
  }, []);
  const Item = ({ title, content, subject, datetime }) => (
    <TouchableRipple style={globalStyle.listItem} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <Image style={globalStyle.thumb} source={logo} />
          <View style={globalStyle.text}>
            <Text
              style={[
                globalStyle.name,
                { color: colors.primary, textTransform: "uppercase" },
              ]}
            >
              {title}
            </Text>
          </View>
        </View>
        <View style={[globalStyle.row, { marginBottom: 5 }]}>
          {/* action */}
          <Paragraph
            style={[
              styles.paragraph,
              styles.caption,
              { color: colors.black_light },
            ]}
          >
            {content}
          </Paragraph>
          {/* end action */}
        </View>
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Icon name="book-open" style={styles.iconButton} size={20} />
            <Paragraph
              style={{
                color: colors.primary,
                fontSize: 13,
                textTransform: "capitalize",
              }}
            >
              {subject}
            </Paragraph>
          </View>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <Icon name="clock" style={styles.iconButton} size={20} />
            <Paragraph style={{ color: colors.primary, fontSize: 13 }}>
              {/* {Moment(datetime).format("d MMM")} */}
              <Moment element={Text} format="MMMM Do">
                {datetime}
              </Moment>
            </Paragraph>
          </View>
        </View>
      </Animatable.View>
    </TouchableRipple>
  );
  const renderItem = ({ item }) => (
    <Item
      title={item.title}
      content={item.content}
      subject={item.subject}
      datetime={item.created_at}
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
          ></LinearGradient>
          <View style={globalStyle.marginTopValue}>
            <View style={styles.section}>
              <Icon
                name="briefcase"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Topical Questions
              </Text>
            </View>
            <View>
              <FlatList
                data={question}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
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
                  No topical questions found. Please check back later
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
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
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
    color: colors.secondary,
  },
});

export default AssignmentsScreen;
