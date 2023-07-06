import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import React, { useEffect, useState, useContext, useRef } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { useIsFocused } from "@react-navigation/native";
import { UserContext } from "./UserContext";
import Games from "./Games.js";
import Filter from "./Filter.js";
import PostGame from "./PostGame";
import Breakdown from "./Breakdown.js";
import OvalButton from "./OvalButton.js";
import FilterButton from "./FilterButton.js";
import { getDistance } from "geolib";
import { EB_URL } from "@env";

const Home = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [gamesInState, setGamesInState] = useState([]);
  const [facilities, setFacilities] = useState(null);
  const [postGameVisible, setPostGameVisible] = useState(false);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sportFilterValue, setSportFilterValue] = useState("");
  const [surfaceFilterValue, setSurfaceFilterValue] = useState("");
  const [distanceFilterValue, setDistanceFilterValue] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLocal, setIsLocal] = useState(false);

  const [filterType, setFilterType] = useState(null);
  const [filtered, setFiltered] = useState(false);

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const currentUser = useContext(UserContext);

  const isFocused = useIsFocused();

  const syrCoords = {
    latitude: 43.0481,
    longitude: -76.1474,
  };

  useEffect(() => {
    if (!user.attributes || !user.username) {
      return;
    }

    const body = {
      email: user.attributes.email,
      userName: user.username,
      userLevel: "User",
      firstName: user.attributes.given_name,
    };

    const fetchUser = async () => {
      try {
        const serverResponse = await fetch(`${EB_URL}/check-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const serverData = await serverResponse.json();
        setUserId(serverData.id);
        setUserEmail(serverData.email);
        setUserLevel(serverData.userLevel);
      } catch (e) {
        console.error(e);
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (!currentUser.location || currentUser.location.latitude == null) {
      return;
    }
    const distanceInMeters = getDistance(syrCoords, currentUser.location);
    const miles = distanceInMeters / 1609.344;
    if (miles < 25) {
      setIsLocal(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser.location || currentUser.location.latitude == null) {
      return;
    }
    const apiCall = async () => {
      try {
        const gamesResponse = await fetch(
          `${EB_URL}/games/${currentUser.location.latitude}/${currentUser.location.longitude}`
        );
        const gamesData = await gamesResponse.json();
        const within25 = gamesData.filter((game) => game.distance <= 25);
        if (within25.length > 0) {
          setGamesInState(within25);
          setGames(within25);
          setLoading(false);
        } else {
          setGamesInState([]);
          setGames([]);
          setLoading(false);
        }
      } catch (e) {
        console.error("there was an issue fetching games");
      }
    };

    apiCall();
  }, [currentUser]);

  useEffect(() => {
    const apiCall = async () => {
      const serverResponse = await fetch(`${EB_URL}/facilities`);
      const facilitiesData = await serverResponse.json();
      const sortedFacilities = await facilitiesData.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0; // Names are equal
      });
      setFacilities(sortedFacilities);
    };
    apiCall();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (isFocused) {
      getGames();
    }
  }, [isFocused]);

  const getGames = async () => {
    try {
      setLoading(true);
      const gamesResponse = await fetch(
        `${EB_URL}/games/${currentUser.location.latitude}/${currentUser.location.longitude}`
      );
      const gamesData = await gamesResponse.json();
      const within25 = await gamesData.filter((game) => game.distance <= 25);
      if (within25?.length) {
        setGames(within25);
        setGamesInState(within25);
      } else {
        setGames([]);
        setGamesInState([]);
      }
      setSportFilterValue("");
      setSurfaceFilterValue("");
      setDistanceFilterValue(null);
      setLoading(false);
      setFiltered(false);
    } catch (e) {
      console.error("there was an issue fetching games");
    }
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

  const FadeInView = (props) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    return (
      <Animated.View
        style={{
          ...props.style,
          opacity: fadeAnim, // Bind opacity to animated value
        }}
      >
        {props.children}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View>
          <View style={styles.header}>
            <Text style={styles.logoText}>point.game!</Text>
            <Text style={styles.aboutText}>
              Find a game. Post a game. Play.
            </Text>
            <Text style={styles.aboutText}>{loading}</Text>
          </View>
          <FadeInView style={{ marginTop: 30 }}>
            <Text
              style={{
                color: "white",
                fontSize: 35,
                textAlign: "center",
                fontFamily: "Kanit2",
              }}
            >
              Loading games...
            </Text>
          </FadeInView>
        </View>
      </View>
    );
  }

  if (!loading && !filtered && !gamesInState.length) {
    return (
      <View style={styles.container}>
        <Breakdown
          visible={breakdownVisible}
          setVisible={setBreakdownVisible}
        />
        <PostGame
          visible={postGameVisible}
          setPostGameVisible={setPostGameVisible}
          facilities={facilities}
          getGames={getGames}
          userId={userId}
          isLocal={isLocal}
        />
        <View>
          <View style={styles.header}>
            <Text style={styles.logoText}>point.game!</Text>
            <View style={styles.breakdownView}>
              <Pressable onPress={() => setBreakdownVisible(true)}>
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 16,
                    fontFamily: "KanitReg",
                    textDecorationLine: "underline",
                  }}
                >
                  point.game Breakdown
                </Text>
              </Pressable>
            </View>
            <Text style={styles.aboutText}>
              Find a game. Post a game. Play.
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <OvalButton
              title="Post"
              onPress={() => {
                setPostGameVisible(true);
              }}
            />
            <OvalButton
              title="Profile"
              onPress={() => {
                navigation.navigate("Profile", {
                  profileUserId: userId,
                  currentUserId: userId,
                  userLevel: userLevel,
                });
              }}
            />
          </View>
          <View style={{ marginTop: 75, paddingHorizontal: 20 }}>
            <Text
              style={{
                color: "white",
                fontSize: 25,
                textAlign: "center",
                fontFamily: "KanitReg",
              }}
            >
              There are no games posted within 25 miles of your current
              location.
            </Text>
            <Pressable
              style={{
                marginTop: 20,
              }}
              onPress={() => setPostGameVisible(true)}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 25,
                  textAlign: "center",
                  fontFamily: "KanitReg",
                  textDecorationLine: "underline",
                  textDecorationColor: "white",
                }}
              >
                Post a game
              </Text>
            </Pressable>
            <Pressable
              style={{
                marginTop: 20,
              }}
              onPress={() => getGames()}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 25,
                  textAlign: "center",
                  fontFamily: "KanitReg",
                  textDecorationLine: "underline",
                  textDecorationColor: "white",
                }}
              >
                Check again
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Breakdown visible={breakdownVisible} setVisible={setBreakdownVisible} />
      <PostGame
        visible={postGameVisible}
        setPostGameVisible={setPostGameVisible}
        facilities={facilities}
        getGames={getGames}
        userId={userId}
        isLocal={isLocal}
      />
      <Filter
        visible={filterVisible}
        setFiltered={setFiltered}
        setFilterVisible={setFilterVisible}
        setFilterType={setFilterType}
        getGames={getGames}
        games={games}
        gamesInState={gamesInState}
        setGamesInState={setGamesInState}
        sportFilterValue={sportFilterValue}
        setSportFilterValue={setSportFilterValue}
        surfaceFilterValue={surfaceFilterValue}
        setSurfaceFilterValue={setSurfaceFilterValue}
        distanceFilterValue={distanceFilterValue}
        setDistanceFilterValue={setDistanceFilterValue}
      />
      <View style={styles.header}>
        <View style={{ marginBottom: 15 }}>
          {!filtered ? (
            <View>
              <Text style={styles.logoText}>point.game!</Text>

              <View style={styles.breakdownView}>
                <Pressable onPress={() => setBreakdownVisible(true)}>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 16,
                      fontFamily: "KanitReg",
                      textDecorationLine: "underline",
                    }}
                  >
                    point.game Breakdown
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          {!filtered ? (
            <Text style={styles.aboutText}>
              Find a game. Post a game. Play.
            </Text>
          ) : null}
          <Text style={styles.aboutText}>{loading}</Text>
        </View>
        <View style={styles.headerButtons}>
          <FilterButton
            title="Filter"
            onPress={() => {
              setFilterVisible(true);
            }}
            filtered={filtered}
          />
          <OvalButton
            title="Post"
            onPress={() => {
              setPostGameVisible(true);
            }}
          />
          <OvalButton
            title="Profile"
            onPress={() => {
              navigation.navigate("Profile", {
                profileUserId: userId,
                currentUserId: userId,
                userLevel: userLevel,
              });
            }}
          />
        </View>
      </View>
      <View style={styles.gameContainer}>
        <Games
          gamesInState={gamesInState}
          getGames={getGames}
          userId={userId}
          userLevel={userLevel}
          navigation={navigation}
          timeFormatter={timeFormatter}
        />
      </View>
      <View>
        {filtered ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 15,
            }}
          >
            <Pressable
              onPress={() => {
                setFiltered(false);
                getGames();
              }}
              style={{
                borderRadius: 5,
                borderWidth: 2,
                borderColor: "#d00000",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  color: "white",
                  backgroundColor: "#d00000",
                  paddingHorizontal: 10,
                  textAlign: "center",
                  fontFamily: "KanitReg",
                }}
              >
                Reset Filter
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#032b43",
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignContent: "center",
    ...Platform.select({
      android: {
        marginBottom: 30,
      },
    }),
  },
  logoText: {
    color: "white",
    fontFamily: "Kanit2",
    fontSize: 40,
    textAlign: "center",
    alignSelf: "center",
  },
  logoText2: {
    color: "white",
    fontFamily: "Kanit",
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  aboutText: {
    color: "white",
    fontFamily: "KanitLight",
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 60,
    marginTop: 10,
    marginBottom: 10,
  },
  headerButtons2: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 60,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  gameContainer: {
    flex: 3,
    paddingHorizontal: 40,
    paddingVertical: 5,
  },
  gameCard: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  gamecardSportText: {
    fontFamily: "Kanit2",
    fontSize: 20,
    color: "black",
  },
  gamecardSecondaryText: {
    fontFamily: "KanitMed",
    fontSize: 19,
    color: "black",
  },
  gamecardTertiaryText: {
    fontFamily: "KanitReg",
    fontSize: 19,
    color: "black",
  },

  gamecardText: {
    fontFamily: "KanitLight",
    fontSize: 18,
    color: "black",
  },
  gamecardLinkText: {
    fontFamily: "KanitReg",
    fontSize: 20,
    color: "black",
  },
  dividerLine: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginHorizontal: 3,
    marginTop: 5,
    marginBottom: 5,
  },
  unfilteredBtn: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    backgroundColor: "#032b43",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
  },
  filteredBtn: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
  },
  unfilteredTitle: {
    fontSize: 16,
    color: "white",
  },
  filteredTitle: {
    fontSize: 16,
    color: "#032b43",
  },
});
