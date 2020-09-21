import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Paragraph, TouchableRipple } from "react-native-paper";
import { Dialog } from "react-native-simple-dialogs";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiGetLessons, apiGetUserStatus } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";

const logo = require("../assets/icon_lesson.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
function SubjectTopicsScreen({ navigation, route }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [topic, updateTopic] = React.useState([]);
  const [topicsubject, updateTopicSubject] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: false });
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
    setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myTopics = [];
    let the_subject = null;
    async function fetchTopics() {
      await AsyncStorage.getItem("topics_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          s = JSON.parse(response);
          myTopics = s.payload.data;
          the_subject = s.payload.subject;
          //   console.log("topic list = " + JSON.parse(JSON.stringify(myTopics)));
          if (!ignore) {
            if (Object.keys(JSON.parse(JSON.stringify(myTopics))).length == 0) {
              setEmpty(true);
            }
            updateTopic(JSON.parse(JSON.stringify(myTopics)));
            updateTopicSubject(the_subject);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateTopic([]);
          updateTopicSubject("None");
          console.log("storage err: " + error);
        });
    }
    fetchTopics();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);
  React.useEffect(() => {
    // setPreload({ visible: true });
    // console.log
    let ignore = false;
    let s = null;
    let myTopics = [];
    let the_subject = null;
    async function fetchTopics() {
      await AsyncStorage.getItem("topics_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          s = JSON.parse(response);
          myTopics = s.payload.data;
          the_subject = s.payload.subject;
          console.log("topic list = " + JSON.parse(JSON.stringify(myTopics)));
          if (!ignore) {
            if (Object.keys(JSON.parse(JSON.stringify(myTopics))).length == 0) {
              setEmpty(true);
            }
            updateTopic(JSON.parse(JSON.stringify(myTopics)));
            updateTopicSubject(the_subject);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateTopic([]);
          updateTopicSubject("None");
          console.log("storage err: " + error);
        });
    }
    fetchTopics();
    return () => {
      ignore = true;
    };
  }, [topicsubject]);

  const handleTopicAction = async (id) => {
    setPreload({ visible: true });
    await AsyncStorage.getItem("userToken")
      .then(async (token) => {
        await apiGetLessons(token, id)
          .then(async (response) => {
            if (!response) {
              console.log("empty resp");
            }
            await AsyncStorage.setItem("lessons_data", JSON.stringify(response))
              .then(() => {
                setPreload({ visible: false });
                // navigate("SubjectTopics");
                navigation.reset({
                  index: 0,
                  routes: [{ name: "TopicLessons" }],
                });
              })
              .catch((err) => {
                setPreload({ visible: false });
                Alert.alert(
                  "Topics error!",
                  "Could not find topics, try again later",
                  [{ text: "Okay" }]
                );
              });
          })
          .catch((error) => {
            setPreload({ visible: false });
            Alert.alert(
              "Topics error!",
              "Could not find topics, try again later",
              [{ text: "Okay" }]
            );
            // console.log("fetch question error: " + error);
          });
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert("Topics error", "Could not find topics, try again later", [
          { text: "Okay" },
        ]);
        // console.log("storage err: " + error);
      });
  };
  const Item = ({ id, topic, number, pdf, video }) => (
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
                { color: colors.primary, textTransform: "uppercase" },
              ]}
            >
              Chapter {number}
            </Text>
          </View>
        </View>
        <View style={[globalStyle.row, { marginBottom: 5 }]}>
          <Paragraph
            style={[
              styles.paragraph,
              styles.caption,
              { color: colors.secondary, fontWeight: "bold" },
            ]}
          >
            {topic}
          </Paragraph>
        </View>
        <View
          style={[
            globalStyle.row,
            { marginBottom: 15, justifyContent: "flex-start" },
          ]}
        >
          {/* action */}
          <TouchableOpacity
            style={[styles.signIn, { alignItems: "center" }]}
            onPress={() => {
              handleTopicAction(id);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary_dark]}
              style={[styles.signIn, { flexDirection: "row" }]}
            >
              <Icon
                name="play-circle"
                style={{ marginRight: 5 }}
                color={colors.white}
                size={27}
              />
              <Text style={(styles.textSign, { color: colors.white })}>
                Lessons
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* end action */}
          <View
            style={{
              alignItems: "flex-end",
              flexDirection: "row",
              marginRight: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Icon name="file-outline" style={styles.iconButton} size={20} />
              <Paragraph
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {pdf}
              </Paragraph>
            </View>
            <View style={{ flexDirection: "row", marginLeft: 5 }}>
              <Icon
                name="play-circle-outline"
                style={styles.iconButton}
                size={20}
              />
              <Paragraph style={{ color: colors.primary, fontSize: 13 }}>
                {video}
              </Paragraph>
            </View>
          </View>
        </View>
      </Animatable.View>
    </TouchableRipple>
  );
  const renderItem = ({ item }) => (
    <Item
      id={item.id}
      topic={item.topic}
      number={item.number}
      pdf={item.pdf}
      video={item.video}
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
                {topicsubject}
              </Text>
            </View>
            <View>
              <FlatList
                data={topic}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
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
                No topics found. Please check back later
              </Text>
            </View>
          )}
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

export default SubjectTopicsScreen;
