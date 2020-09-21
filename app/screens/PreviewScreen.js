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
  Dimensions,
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
import { apiGetFreeLessons } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import configs from "../config/configs";

const logo = require("../assets/icon_lesson.png");
const pricon = require("../assets/preload.gif");
function PreviewScreen({ navigation }) {
  const [lesson, updateLesson] = React.useState([]);
  const [preload, setPreload] = React.useState({ visible: false });
  const [empty, setEmpty] = React.useState(false);
  const [resizemode, updateResizeMode] = React.useState({
    mode: Video.RESIZE_MODE_STRETCH,
  });
  const [playerloading, updatePlayerLoading] = React.useState({
    icon: "shulebora-leaners.jpg",
    hasPoster: true,
  });
  const [playing, setPlaying] = React.useState({
    url: null,
    token: null,
    autoplay: false,
  });
  const changeResizeMode = async (e) => {
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
  React.useEffect(() => {
    setPreload({ visible: true });
    let ignore = false;
    let myLessons = [];
    async function fetchLessons() {
      await apiGetFreeLessons()
        .then((response) => {
          // console.log("freelessons:: " + response);
          if (!response) {
            console.log("empty resp");
          }
          myLessons = response.payload.data;
          if (!ignore) {
            if (
              Object.keys(JSON.parse(JSON.stringify(myLessons))).length == 0
            ) {
              setEmpty(true);
            }
            setEmpty(false);
            updateLesson(JSON.parse(JSON.stringify(myLessons)));
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateLesson([]);
          console.log("storage err: " + error);
        });
    }
    fetchLessons();
    return () => {
      ignore = true;
    };
  }, []);
  const Item = ({
    type,
    subject,
    topic,
    subtopic,
    video_content,
    token,
    intro,
    datetime,
  }) => (
    <TouchableRipple
      style={[
        globalStyle.listItem,
        {
          paddingLeft: 10,
          paddingRight: 10,
          marginRight: 10,
          marginLeft: 10,
          padding: 8,
        },
      ]}
      underlayColor="#f1f1f1"
    >
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
                {
                  color: colors.primary,
                  textTransform: "capitalize",
                  fontSize: 15,
                },
              ]}
            >
              {subject + " > "}
              <Text style={{ color: colors.black_light }}>{topic}</Text>
            </Text>
          </View>
        </View>
        <View
          style={[
            globalStyle.row,
            { marginBottom: 25, flexDirection: "column" },
          ]}
        >
          <Text
            style={{
              color: colors.primary,
              textTransform: "capitalize",
              fontSize: 20,
              textDecorationLine: "underline",
              marginBottom: 15,
            }}
          >
            Lesson: <Text style={{ color: colors.secondary }}>{subtopic}</Text>
          </Text>
          <TouchableOpacity
            style={styles.signIn}
            onPress={() => {
              setPlaying({
                url:
                  configs.base_api + "topics/doc/free/stream/" + video_content,
                token: token,
                autoplay: true,
              });
              setPreload({ visible: true });
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary_dark]}
              style={[styles.signIn, { flexDirection: "row" }]}
            >
              <Icon
                name="play"
                style={{ marginRight: 5 }}
                color={colors.white}
                size={27}
              />
              <Text style={(styles.textSign, { color: colors.white })}>
                Play Video
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </TouchableRipple>
  );
  const renderItem = ({ item }) => (
    <Item
      type={item.type}
      subject={item.subject}
      topic={item.topic}
      subtopic={item.sub_topic}
      video_content={item.video_content}
      token={item.token}
      intro={item.introduction}
    />
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <SafeAreaView style={{ flex: 1 }}>
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
          <Animatable.View animation="bounceIn" duration={1500}>
            <Text style={styles.title}>Preview Lessons</Text>
          </Animatable.View>
        </View>
        {/* video player */}
        <Animatable.View
          animation="fadeInUpBig"
          duration={0}
          style={[styles.player]}
        >
          <View
            style={[
              globalStyle.row,
              {
                marginBottom: 5,
                backgroundColor: colors.secondary_dark,
                borderRadius: 10,
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
                changeResizeMode(e);
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
        </Animatable.View>
        {/* end player */}
        {/* scrollable */}
        <Animatable.View
          animation="fadeInUpBig"
          duration={1500}
          style={[styles.footer]}
        >
          <ScrollView style={globalStyle.scrollContainer}>
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
                  No preview lessons found. Please check back later
                </Text>
              </View>
            )}
          </ScrollView>
        </Animatable.View>
      </SafeAreaView>
    </View>
  );
}
export default PreviewScreen;

const { height } = Dimensions.get("screen");
const height_logo = height * 0.28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  player: {
    flex: 3,
    justifyContent: "center",
    backgroundColor: colors.black,
    borderWidth: 0,
    borderColor: colors.white_dark,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  footer: {
    flex: 5,
    justifyContent: "center",
    backgroundColor: colors.white_dark,
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  logo: {
    width: height_logo,
    height: height_logo,
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "bold",
  },
  text: {
    color: "grey",
    marginTop: 5,
  },
  button: {
    alignItems: "flex-end",
    marginTop: 30,
  },
  signIn: {
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
  },
  textSign: {
    color: colors.white,
    fontWeight: "bold",
  },
});
