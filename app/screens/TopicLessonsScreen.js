import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Linking,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Paragraph, TouchableRipple } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import { Dialog } from "react-native-simple-dialogs";
import { ConfirmDialog } from "react-native-simple-dialogs";

import { Video } from "expo-av";
// import { ScreenOrientation } from "expo";
import * as ScreenOrientation from "expo-screen-orientation";
import Moment from "react-moment";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiGetUserStatus } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import configs from "../config/configs";

const logo = require("../assets/icon_lesson.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
function TopicLessonsScreen({ navigation, route }) {
  const [resizemode, updateResizeMode] = React.useState({
    mode: Video.RESIZE_MODE_STRETCH,
  });
  const [playerloading, updatePlayerLoading] = React.useState({
    icon: "shulebora-leaners.jpg", //"nowLoading.gif",
    hasPoster: true,
  });
  const [playing, setPlaying] = React.useState({
    url: null,
    token: null,
    autoplay: false,
  });
  const changeScreenOrientation = async (e) => {
    if (e.fullscreenUpdate === 0) {
      updateResizeMode({ mode: Video.RESIZE_MODE_CONTAIN });
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
      );
    }
    if (e.fullscreenUpdate === 3) {
      updateResizeMode({ mode: Video.RESIZE_MODE_STRETCH });
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }
  };
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [lesson, updateLesson] = React.useState([]);
  const [lessontopic, updateLessonTopic] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: false });
  const [dialog, setDialog] = React.useState({ visible: false, text: null });
  const [videostate, setVideoState] = React.useState(true);
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
        setPlaying({ ...playing, autoplay: false });
        setPreload({ visible: false });
      };
    }, [])
  );
  /** end user check */

  const onRefresh = React.useCallback(() => {
    setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myLessons = [];
    let the_topic = null;
    async function fetchLessons() {
      await AsyncStorage.getItem("lessons_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          s = JSON.parse(response);
          myLessons = s.payload.data;
          the_topic = s.payload.topic;
          //   console.log("topic list = " + JSON.parse(JSON.stringify(myTopics)));
          if (!ignore) {
            if (
              Object.keys(JSON.parse(JSON.stringify(myLessons))).length == 0
            ) {
              setEmpty(true);
            }
            updateLesson(JSON.parse(JSON.stringify(myLessons)));
            updateLessonTopic(the_topic);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateLesson([]);
          updateLessonTopic("None");
          console.log("storage err: " + error);
        });
    }
    fetchLessons();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);
  React.useEffect(() => {
    // setPreload({ visible: true });
    // console.log
    setPreload({ visible: false });
    let ignore = false;
    let s = null;
    let myLessons = [];
    let the_topic = null;
    async function fetchLessons() {
      await AsyncStorage.getItem("lessons_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          s = JSON.parse(response);
          myLessons = s.payload.data;
          the_topic = s.payload.topic;
          // console.log("topic list = " + JSON.stringify(myLessons));
          if (!ignore) {
            if (
              Object.keys(JSON.parse(JSON.stringify(myLessons))).length == 0
            ) {
              setEmpty(true);
            }
            updateLesson(JSON.parse(JSON.stringify(myLessons)));
            updateLessonTopic(the_topic);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateLesson([]);
          updateLessonTopic("None");
          console.log("storage err: " + error);
        });
    }
    fetchLessons();
    return () => {
      ignore = true;
    };
  }, [lessontopic]);

  const openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error(err));
  };
  const handleDialog = () => {
    setDialog({ ...dialog, visible: false });
  };
  const handleDownload = async (file, xtoken, flname) => {
    flname = flname.replace("'", "");
    setPreload({ visible: true });
    /** check if CAMERA_ROLL perm is allowed */
    const status = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    // console.log("perm status " + status.status);
    if (status.status === "granted") {
      const file_string = file.split(".");
      const dirname = file_string[0];
      const extension = file_string[1];
      let temp_file_url =
        FileSystem.documentDirectory +
        dirname +
        "/" +
        flname.toLowerCase() +
        "." +
        extension;
      const exits_info = await FileSystem.getInfoAsync(temp_file_url);
      if (!exits_info.exists) {
        await FileSystem.makeDirectoryAsync(temp_file_url, {
          intermediates: true,
        })
          .then(() => {
            // console.log("local file created at " + temp_file_url);
          })
          .catch((error) => {
            setPreload({ visible: false });
            Alert.alert(
              "Directory Error!",
              "Could not create file. Try again later",
              [{ text: "Okay" }]
            );
            return;
          });
      }
      // await AsyncStorage.getItem("userToken").then(async (xtoken) => {
      await FileSystem.downloadAsync(
        configs.base_api + "topics/doc/download/" + file,
        temp_file_url,
        {
          headers: {
            Accept: "application/octet-stream",
            Authorization: "Bearer " + xtoken,
          },
        }
      )
        .then(async ({ uri, status, http_headers }) => {
          /** send to media library */
          // console.log();
          if (status === 504) {
            Alert.alert(
              "Download Error!",
              "You have exhausted your daily download limit. Try again tomorrow",
              [{ text: "Okay" }]
            );
            return;
          }
          if (status !== 200) {
            Alert.alert(
              "Download Error!",
              "Connectivity error occured. Check your internet connection",
              [{ text: "Okay" }]
            );
            return;
          }
          await MediaLibrary.saveToLibraryAsync(uri)
            .then(() => {
              setPreload({ visible: false });
              setDialog({
                visible: true,
                text: flname + " has been saved to Files/Videos on your phone",
              });
            })
            .catch((error) => {
              // console.log(error);
              setPreload({ visible: false });
              Alert.alert(
                "File Saving Error!",
                "Could not save file to storage . Try again later",
                [{ text: "Okay" }]
              );
            });
          /** end send */
        })
        .catch((error) => {
          setPreload({ visible: false });
          Alert.alert(
            "Download Error!",
            "Could not download file. Try again tomorrow",
            [{ text: "Okay" }]
          );
          // console.error(error);
        });
      // });
    } else {
      const ask_status = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (ask_status.status !== "granted") {
        setPreload({ visible: false });
        Alert.alert("Permission Error!", "ShuleBora needs to access storage", [
          { text: "Okay" },
        ]);
      }
    }
    setPreload({ visible: false });
    // await FileSystem.downloadAsync(url, FileSystem.documentDirectory + file);
  };
  const Item = ({
    type,
    subtopic,
    file_content,
    video_content,
    token,
    intro,
    datetime,
    zoom_link,
  }) => (
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
                {subtopic}
              </Text>
            </View>
          </View>
          {type == "LIVE" && (
            <View
              style={[
                globalStyle.row,
                { marginBottom: 5, flexDirection: "column" },
              ]}
            >
              <Paragraph
                style={[
                  styles.paragraph,
                  styles.caption,
                  { color: colors.black_light },
                ]}
              >
                Live Lesson
            </Paragraph>
              <Paragraph
                onPress={() => {
                  openURL(zoom_link);
                }}
                style={[
                  styles.paragraph,
                  styles.caption,
                  {
                    color: colors.white,
                    padding: 10,
                    width: "50%",
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                Join Live Class Here
            </Paragraph>
            </View>
          )}
          {type == "RECORDED" && file_content !== "n/a" && (
            <View style={[globalStyle.row, { marginBottom: 5 }]}>
              <Paragraph
                style={[
                  styles.paragraph,
                  styles.caption,
                  { color: colors.black_light },
                ]}
              >
                PDF Lesson ({" "}
                <Text style={{ fontSize: 11, color: colors.primary }}>
                  Tap To Download
              </Text>{" "}
              )
            </Paragraph>
            </View>
          )}
          {type == "RECORDED" && video_content !== "n/a" && (
            <View style={[globalStyle.row, { marginBottom: 5 }]}>
              <Paragraph
                style={[
                  styles.paragraph,
                  styles.caption,
                  { color: colors.black_light },
                ]}
              >
                Video Lesson ({" "}
                <Text style={{ fontSize: 11, color: colors.primary }}>
                  Click on Play to open it in Player
              </Text>{" "}
              )
            </Paragraph>
            </View>
          )}
          {type == "RECORDED" && video_content !== "n/a" && (
            <View style={{ flexDirection: "row", marginBottom: 15 }}>
              <TouchableOpacity
                style={{
                  minWidth: "40%",
                }}
                onPress={() => {
                  setPlaying({
                    url: configs.base_api + "topics/doc/stream/" + video_content,
                    token: token,
                    autoplay: true,
                  });
                  setPreload({ visible: true });
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primary_dark]}
                  style={{
                    flexDirection: "row",
                    borderRadius: 10,
                    margin: 10,
                    height: 35,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name="play"
                    style={{ marginRight: 2 }}
                    color={colors.white}
                    size={27}
                  />
                  <Text style={(styles.textSign, { color: colors.white })}>
                    Play Video
                </Text>
                </LinearGradient>
              </TouchableOpacity>
              {/* down load */}
              <TouchableOpacity
                style={{
                  minWidth: "50%",
                }}
                onPress={() => {
                  handleDownload(
                    video_content,
                    token,
                    subtopic.replace(/\s/g, "-")
                  );
                }}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.secondary_dark]}
                  style={{
                    flexDirection: "row",
                    margin: 10,
                    height: 35,
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name="download"
                    style={{ marginRight: 2 }}
                    color={colors.white}
                    size={27}
                  />
                  <Text style={(styles.textSign, { color: colors.white })}>
                    Save Video
                </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {type == "RECORDED" && file_content !== "n/a" && (
            <View style={[globalStyle.row, { marginBottom: 15 }]}>
              {/* action */}
              <TouchableOpacity
                style={styles.signIn}
                onPress={() => {
                  handleDownload(
                    file_content,
                    token,
                    subtopic.replace(/\s/g, "-")
                  );
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primary_dark]}
                  style={[styles.signIn, { flexDirection: "row" }]}
                >
                  <Icon
                    name="download"
                    style={{ marginRight: 5 }}
                    color={colors.white}
                    size={27}
                  />
                  <Text style={(styles.textSign, { color: colors.white })}>
                    Save PDF
                </Text>
                </LinearGradient>
              </TouchableOpacity>
              {/* end action */}
            </View>
          )}
          {type == "LIVE" && (
            <View style={[globalStyle.row, { marginBottom: 15 }]}>
              <View style={{ flexDirection: "row", marginLeft: 5 }}>
                <Icon
                  name="calendar-outline"
                  style={styles.iconButton}
                  size={20}
                />
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
          )}
        </Animatable.View>
      </TouchableRipple>
    );
  const renderItem = ({ item }) => (
    <Item
      type={item.type}
      subtopic={item.sub_topic}
      file_content={item.file_content}
      video_content={item.video_content}
      token={item.token}
      intro={item.introduction}
      zoom_link={item.zoom_link}
      datetime={item.zoom_time}
    />
  );
  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      {/* dialog */}
      <ConfirmDialog
        titleStyle={{ color: colors.white }}
        buttonsStyle={{
          backgroundColor: colors.white,
          width: "30%",
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
          borderRadius: 10,
          height: 30,
          shadowColor: colors.secondary,
        }}
        dialogStyle={[
          globalStyle.listItem,
          {
            borderRadius: 20,
            width: "90%",
            backgroundColor: colors.primary,
          },
        ]}
        title="Download Success"
        visible={dialog.visible}
        onTouchOutside={() =>
          setDialog({ ...dialog, visible: false, text: null })
        }
        positiveButton={{
          title: "Got it",
          onPress: () => handleDialog(),
        }}
      >
        <View>
          <Text>{dialog.text}</Text>
        </View>
      </ConfirmDialog>
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
        <View>
          <LinearGradient
            style={globalStyle.header}
            colors={[colors.secondary_dark, colors.secondary]}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          ></LinearGradient>
          <View style={[styles.section, { height: 50 }]}>
            <Icon
              name="book"
              size={30}
              style={{ color: colors.white_dark, marginLeft: 15 }}
            />
            <Text
              style={[
                globalStyle.nameLeft,
                {
                  fontSize: 14,
                  marginBottom: 20,
                  color: colors.white_dark,
                  textTransform: "capitalize",
                },
              ]}
            >
              {lessontopic}
            </Text>
          </View>
          {/* VIDEO VIEW ================= */}
          <View
            style={[
              globalStyle.row,
              {
                backgroundColor: colors.primary,
                borderWidth: 2,
                padding: 4,
                borderColor: colors.primary,
                borderRadius: 0,
              },
            ]}
          >
            <Video
              source={{
                uri: playing.url,
                headers: {
                  Accept: "application/octet-stream",
                  Authorization: "Bearer " + playing.token,
                },
              }}
              posterSource={{
                uri: configs.media_api + playerloading.icon,
              }}
              usePoster={playerloading.hasPoster}
              onLoadStart={() => {
                updatePlayerLoading({
                  icon: "nowLoading.gif",
                  hasPoster: true,
                });
              }}
              onLoad={() => {
                updatePlayerLoading({ ...playerloading, hasPoster: false });
                setPreload({ visible: false });
              }}
              posterStyle={{
                width: "100%",
                height: 204,
                resizeMode: "stretch",
              }}
              rate={1.0}
              onFullscreenUpdate={(e) => {
                changeScreenOrientation(e);
              }}
              volume={1.0}
              isMuted={false}
              resizeMode={resizemode.mode}
              shouldPlay={playing.autoplay}
              isLooping={false}
              useNativeControls={true}
              style={{
                width: "100%",
                minHeight: 204,
                borderRadius: 4,
                flex: 1,
              }}
            />
          </View>
          {/* END VIDEO VIEW */}
        </View>
        <ScrollView
          style={globalStyle.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={globalStyle.marginTopValue}>
            <View>
              <FlatList
                data={lesson}
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
                  No lessons found. Please check back later
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: 40 }}></View>
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

export default TopicLessonsScreen;
