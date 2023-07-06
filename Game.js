import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import Comment from "./Comment";
import moment from "moment";
import { EB_URL } from "@env";

const Game = ({ route, navigation }) => {
  const [game, setGame] = useState(null);
  const [gameComments, setGameComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [region, setRegion] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [gameUser, setGameUser] = useState({
    id: null,
    userName: null,
  });
  const [whoJoined, setWhoJoined] = useState(false);
  const { gameId, currentUserId } = route.params;

  const getComments = async () => {
    try {
      const serverResponse = await fetch(`${EB_URL}/game/${gameId}`);
      const gameData = await serverResponse.json();
      setGameComments(gameData.comments);
    } catch (error) {
      console.error(error);
      throw new Error("there was an issue getting the comments");
    }
  };

  const getGame = async () => {
    try {
      const gameResponse = await fetch(`${EB_URL}/game/${gameId}`);
      const gameData = await gameResponse.json();
      setGame(gameData);
    } catch (error) {
      console.error("There was an issue reloading the game", error);
    }
  };

  useEffect(() => {
    const apiCall = async () => {
      const serverResponse = await fetch(`${EB_URL}/game/${gameId}`);
      const gameData = await serverResponse.json();

      setGame(gameData);
      setGameUser({
        id: gameData.user.id,
        userName: gameData.user.userName,
      });

      setGameComments(gameData.comments);
      if (gameData.facility.id == 2) {
        setRegion({
          latitude: gameData.latitude,
          longitude: gameData.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
        setLocationName(
          `${gameData.number} ${gameData.street} ${gameData.city}, ${gameData.state}`
        );
      } else {
        setRegion({
          latitude: gameData.facility.latitude,
          longitude: gameData.facility.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
        setLocationName(gameData.facility.name);
      }
      setIsLoading(false);
    };

    apiCall();
  }, [gameId]);

  const handleTextChange = (newText) => {
    if (newText.length <= 50) {
      setCommentText(newText);
    } else {
      //setTextEditable(false);
      return;
    }
  };

  const onRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const getJoinIdByUserId = (joins, userId) => {
    const foundJoin = joins.find((join) => join.user.id == userId);
    return foundJoin ? foundJoin.id : null;
  };

  const join = async (userId, gameId) => {
    try {
      await fetch(`${EB_URL}/addJoin/${userId}/${gameId}`, {
        method: "PUT",
      });
      getGame();
    } catch (error) {
      console.error(error);
    }
  };
  const handleJoin = (userId, gameId) => {
    Alert.alert("Join Game", "Join this game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Join",
        onPress: () => {
          join(userId, gameId);
        },
      },
    ]);
  };
  const unjoin = async (joinId) => {
    try {
      await fetch(`${EB_URL}/deleteJoin/${joinId}`, {
        method: "DELETE",
      });
      getGame();
    } catch (error) {
      console.error(error);
    }
  };
  const handleUnjoin = (joins, userId) => {
    Alert.alert("Unjoin Game", "Unjoin this game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Unjoin",
        style: "destructive",
        onPress: () => {
          unjoin(getJoinIdByUserId(joins, userId));
        },
      },
    ]);
  };

  const timeFormatter = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    // Convert military time to 12-hour time
    const hour12 = (hour % 12 || 12).toString();
    // Determine AM/PM suffix
    const suffix = hour < 12 ? "AM" : "PM";
    // Format the time with the suffix
    const formattedTime = `${hour12}:${minute.replace(/:00$/, "")}${suffix}`;

    return formattedTime;
  };

  const handleAddComment = async () => {
    if (commentText == "" || !currentUserId || !game.id) {
      return;
    }

    const comment = {
      text: commentText,
      userId: currentUserId,
      gameId: game.id,
    };

    try {
      await fetch(`${EB_URL}/addComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      });
      setCommentText("");
      getComments();
    } catch (error) {
      console.error(error);
      throw new Error("there was an issue adding the comment");
    }
  };

  const Joined = ({ joins }) => {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {joins.length
          ? joins.map((join, index) => (
              <Text style={{ color: "white", fontSize: 20 }} key={index}>
                @{join.user.userName}
              </Text>
            ))
          : null}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.logoText}>point.game!</Text>
          <Text
            style={{
              color: "white",
              fontSize: 30,
              textAlign: "center",
              fontFamily: "Kanit2",
            }}
          >
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>point.game!</Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Pressable onPress={() => setShowDetails(!showDetails)}>
            {showDetails ? (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontFamily: "KanitReg",
                  fontSize: 20,
                }}
              >
                Hide Details -
              </Text>
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontFamily: "KanitReg",
                  fontSize: 20,
                }}
              >
                Show Details +
              </Text>
            )}
          </Pressable>
        </View>
        {showDetails ? (
          <View style={{ marginVertical: 15 }}>
            <Text style={styles.gamecardSportText}>{game.sport}</Text>
            <Text style={styles.gamecardSecondaryText}>{locationName}</Text>
            <Text style={styles.gamecardTertiaryText}>
              {moment.utc(game.date).format("M/DD")} @{" "}
              {timeFormatter(game.time)}
            </Text>
            <Text style={styles.gamecardText}>{game.surface}</Text>

            <Pressable
              onPress={() => {
                navigation.navigate("Profile", {
                  profileUserId: gameUser.id,
                  currentUserId: currentUserId,
                });
              }}
            >
              <Text
                style={{
                  fontFamily: "KanitReg",
                  fontSize: 21,
                  color: "white",
                }}
              >
                By: {gameUser.userName}
              </Text>
            </Pressable>
            {game.joins.length ? (
              <View style={{ paddingRight: 75 }}>
                <View>
                  <Pressable
                    onPress={() => setWhoJoined(!whoJoined)}
                    style={{ flexDirection: "row" }}
                  >
                    <Text
                      style={{
                        fontFamily: "KanitReg",
                        fontSize: 21,
                        color: "white",
                      }}
                    >
                      Playing: {game.joins.length}
                    </Text>
                    <View style={{ marginLeft: 15 }}>
                      {whoJoined ? (
                        <Text
                          style={{
                            fontSize: 24,
                            color: "white",
                            fontWeight: 800,
                          }}
                        >
                          -
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 24,
                            color: "white",
                            fontWeight: 800,
                          }}
                        >
                          +
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </View>
                {whoJoined ? <Joined joins={game.joins} /> : null}
              </View>
            ) : null}
            <View style={{ marginTop: 10 }}>
              {currentUserId == gameUser.id ? null : (
                <View style={{ marginVertical: 10, width: "100%" }}>
                  {getJoinIdByUserId(game.joins, currentUserId) != null ? (
                    <Pressable
                      style={{
                        borderWidth: 2,
                        borderRadius: 5,
                        backgroundColor: "white",
                        borderColor: "#26A96C",
                        marginRight: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                      onPress={() => handleUnjoin(game.joins, currentUserId)}
                    >
                      <Text
                        style={{
                          color: "#26A96C",
                          fontSize: 20,
                          fontFamily: "KanitReg",
                          textAlign: "center",
                        }}
                      >
                        Joined
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "#26A96C",
                        borderColor: "#26A96C",
                        marginRight: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                      onPress={() => handleJoin(currentUserId, game.id)}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 20,
                          fontFamily: "KanitReg",
                          textAlign: "center",
                        }}
                      >
                        Join
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : null}
        <View>
          {region !== null ? (
            <MapView
              style={{ height: 100, borderRadius: 5, marginBottom: 15 }}
              region={region}
              onRegionChange={onRegionChange}
              zoomEnabled={true}
            >
              <Marker coordinate={region} title={locationName} />
            </MapView>
          ) : null}
        </View>
        <View style={{ marginBottom: 5, flexDirection: "row-reverse" }}>
          <Text style={{ color: "white", fontFamily: "KanitLight" }}>
            {commentText.length}/50
          </Text>
        </View>
        <View style={{ height: 50, marginBottom: 15 }}>
          <TextInput
            style={{
              backgroundColor: "white",
              borderColor: "white",
              borderWidth: 1,
              borderRadius: 6,
              paddingHorizontal: 10,
              color: "black",
              height: "100%",
              fontSize: 15,
              fontFamily: "KanitLight",
            }}
            placeholder="Leave a comment"
            placeholderTextColor="#5A5A5A"
            value={commentText}
            onChangeText={handleTextChange}
          />
        </View>
        <View
          style={{
            paddingHorizontal: 100,
          }}
        >
          <Pressable
            style={{
              borderWidth: 2,
              borderColor: "#26A96C",
              borderRadius: 5,
              backgroundColor: "#26A96C",
              padding: 3,
            }}
            onPress={() => handleAddComment()}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 18,
                fontFamily: "KanitReg",
              }}
            >
              Submit
            </Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 30 }}>
          {gameComments.length ? (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              {gameComments.length
                ? gameComments.map((comment, index) => (
                    <Comment item={comment} key={index} />
                  ))
                : null}
            </ScrollView>
          ) : (
            <Text style={{ color: "white", fontSize: 20, textAlign: "center" }}>
              No comments posted
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#032b43",
    paddingTop: 50,
    paddingHorizontal: 35,
    paddingBottom: 30,
  },
  gamecardSportText: {
    fontFamily: "KanitReg",
    fontSize: 25,
    color: "white",
  },
  gamecardSecondaryText: {
    fontFamily: "KanitMed",
    fontSize: 19,
    color: "white",
  },
  gamecardTertiaryText: {
    fontFamily: "KanitReg",
    fontSize: 19,
    color: "white",
  },

  gamecardText: {
    fontFamily: "KanitLight",
    fontSize: 18,
    color: "white",
  },
  header: {
    alignContent: "center",
  },
  logoText: {
    color: "white",
    fontFamily: "Kanit2",
    fontSize: 40,
    textAlign: "center",
    alignSelf: "center",
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "space-around",
  },
  header1: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput1: {
    height: 40,
    borderColor: "#000000",
    backgroundColor: "white",
    borderBottomWidth: 1,
    marginBottom: 36,
    color: "black",
  },
  btnContainer: {
    backgroundColor: "white",
    marginTop: 12,
  },
});
