import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
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
import {
  apiGetSubjects,
  apiGetTopics,
  apiGetForum,
  apiGetUserStatus,
} from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";

const logo = require("../assets/icon_book.png");
const pricon = require("../assets/preload.gif");

function WelcomeScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [subject, updateSubject] = React.useState([]);
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

  React.useEffect(() => {
    let ignore = false;
    let s = null;
    let mySubjects = [];
    async function fetchSubjects() {
      await AsyncStorage.multiGet(["userToken", "IS_PAID"])
        .then(async (multiple) => {
          if (multiple[1][1] == "0") {
            navigation.navigate("Packages");
          }
          // console.log(multiple[1][1]);
          await apiGetSubjects(multiple[0][1])
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              mySubjects = s.payload.data;
              // console.log(
              //   "subjects list = " + JSON.parse(JSON.stringify(mySubjects))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(mySubjects))).length ==
                  0
                ) {
                  setEmpty(true);
                }
                if (multiple[1][1] == "0") {
                  setAccess(false);
                }
                updateSubject(JSON.parse(JSON.stringify(mySubjects)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              console.log("fetch subject error error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchSubjects();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubjectAction = async (id) => {
    setPreload({ visible: true });
    if (!access) {
      navigation.navigate("Packages");
      return;
    }
    await AsyncStorage.getItem("userToken")
      .then(async (token) => {
        await apiGetTopics(token, id)
          .then(async (response) => {
            if (!response) {
              console.log("empty resp");
            }
            await AsyncStorage.setItem("topics_data", JSON.stringify(response))
              .then(() => {
                setPreload({ visible: false });
                // navigate("SubjectTopics");
                navigation.reset({
                  index: 0,
                  routes: [{ name: "SubjectTopics" }],
                });
              })
              .catch((err) => {
                setPreload({ visible: false });
                Alert.alert(
                  "Topics error!",
                  "Could save found topics, try again later",
                  [{ text: "Okay" }]
                );
              });
          })
          .catch((error) => {
            setPreload({ visible: false });
            Alert.alert(
              "Access error",
              "Could not find topics, try again later",
              [{ text: "Okay" }]
            );
            signOut();
          });
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert("Storage error", "Could not find topics, try again later", [
          { text: "Okay" },
        ]);
        // console.log("storage err: " + error);
      });
  };
  const handleForumAction = async (id) => {
    setPreload({ visible: true });

    if (!access) {
      navigation.navigate("Packages");
      return;
    }
    await AsyncStorage.getItem("userToken")
      .then(async (token) => {
        await apiGetForum(token, id)
          .then(async (response) => {
            if (!response) {
              console.log("empty resp");
            }
            await AsyncStorage.setItem("forum_data", JSON.stringify(response))
              .then(() => {
                setPreload({ visible: false });
                // console.log(response);
                navigation.reset({
                  index: 0,
                  routes: [{ name: "SubjectForum" }],
                });
              })
              .catch((err) => {
                setPreload({ visible: false });
                Alert.alert(
                  "Forum error!",
                  "Could not save found Forums, try again later",
                  [{ text: "Okay" }]
                );
              });
          })
          .catch((error) => {
            setPreload({ visible: false });
            console.log(error);
            Alert.alert(
              "Access error",
              "Could not find Forum, try again later",
              [{ text: "Okay" }]
            );
            signOut();
          });
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert("Storage error", "Could not find Forums, try again later", [
          { text: "Okay" },
        ]);
        // console.log("storage err: " + error);
      });
  };
  const Item = ({ id, title }) => (
    <TouchableHighlight style={globalStyle.listItem} underlayColor="#f1f1f1">
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
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          {/* action */}
          <TouchableOpacity
            onPress={() => {
              handleSubjectAction(id);
            }}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondary_dark]}
              style={[styles.signIn, { flexDirection: "row" }]}
            >
              <Text style={(styles.textSign, { color: colors.white })}>
                Topics
              </Text>
              <Icon name="arrow-right" color={colors.white} size={20} />
            </LinearGradient>
          </TouchableOpacity>
          {/* end action */}

          {/* action */}
          <TouchableOpacity
            onPress={() => {
              handleForumAction(id);
            }}
          >
            <LinearGradient
              colors={[colors.white, colors.white]}
              style={[
                styles.signInHalf,
                { flexDirection: "row", borderColor: colors.secondary },
              ]}
            >
              <Icon
                name="account-group"
                style={{ marginRight: 4 }}
                color={colors.secondary}
                size={20}
              />
              <Text style={(styles.textSign, { color: colors.secondary })}>
                Forum
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* end action */}
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({ item }) => <Item id={item.id} title={item.name} />;
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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={globalStyle.scrollContainer}>
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
                Subjects
              </Text>
            </View>
            <View>
              <FlatList
                data={subject}
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
                  No subjects found. Please check back later
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
  // return (
  //   <View style={styles.container}>
  //     <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
  //     <Text style={{ color: themeColors.text }}>Welcome</Text>
  //     <Button
  //       title="Go to Details"
  //       onPress={() => navigation.navigate("Details")}
  //     ></Button>
  //   </View>
  // );
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
    width: "70%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: colors.primary,
    borderWidth: 1,
    marginTop: 0,
    marginRight: 10,
  },
  signInHalf: {
    width: "70%",
    height: 30,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: colors.primary,
    borderWidth: 1,
    marginTop: 0,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
