import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import React, { useState } from "react";

const Breakdown = ({ visible, setVisible }) => {
  const [whatIsOpen, setWhatIsOpen] = useState(false);
  const [howDoesOpen, setHowDoesOpen] = useState(false);
  const [gameExpOpen, setGameExpOpen] = useState(false);
  const [profExpOpen, setProfExpOpen] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      style={{
        backgroundColor: "#256D1B",
      }}
    >
      <ScrollView
        style={{
          backgroundColor: "#256D1B",
          paddingTop: 75,
          paddingHorizontal: 30,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 30,
            fontFamily: "KanitReg",
            textDecorationLine: "underline",
          }}
        >
          The Breakdown
        </Text>
        <Pressable
          onPress={() => {
            setVisible(false);
            setWhatIsOpen(false);
            setHowDoesOpen(false);
            setGameExpOpen(false);
            setProfExpOpen(false);
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 17,
              fontFamily: "KanitReg",
            }}
          >
            Close Breakdown
          </Text>
        </Pressable>
        <View>
          <Pressable
            onPress={() => setWhatIsOpen(!whatIsOpen)}
            style={{ marginTop: 40 }}
          >
            <View>
              {!whatIsOpen ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "KanitReg",
                  }}
                >
                  What is point.game? +
                </Text>
              ) : (
                <View>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 25,
                      fontFamily: "KanitReg",
                    }}
                  >
                    What is point.game? -
                  </Text>
                  <View
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderColor: "white",
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={styles.bodyText}>
                      point.game was created for recreational sports players to
                      easily set up and/or join a game in their community.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => setHowDoesOpen(!howDoesOpen)}
            style={{ marginTop: 40 }}
          >
            <View>
              {!howDoesOpen ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "KanitReg",
                  }}
                >
                  How does it work? +
                </Text>
              ) : (
                <View style={{ paddingBottom: 20 }}>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 25,
                      fontFamily: "KanitReg",
                    }}
                  >
                    How does it work? -
                  </Text>
                  <View
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderColor: "white",
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={styles.bodyText}>
                      To start, point.game requests your location. This is used
                      to search the system for any games within 25 milies of
                      your current location. If there are no games within that
                      distance, you will see a screen like this:{"\n"}
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 350 }}
                        source={require("./assets/images/nogames-1.png")}
                      />
                    </View>
                    <Text style={styles.bodyText}>
                      For instructions on how to post a game, please read
                      further.
                    </Text>
                    <Text style={styles.headerText}>How to post a Game</Text>
                    <Text style={styles.bodyText}>
                      On the top of your homepage, you'll see a button titled
                      Post. Also, if there are no games in your area currently,
                      you'll have the option to open the Post menu from the link
                      in that message.{"\n"}
                      Each game must have a sport to be played, the surface that
                      the game will be played on, and the location of the game.
                      All the available options wil be listed, and you will be
                      guided through the process.
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 200 }}
                        source={require("./assets/images/postfirstscreen.jpg")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Choosing a location</Text>
                    <Text style={styles.bodyText}>
                      Users who are local to Syracuse, NY will see some of the
                      city parks listed as location options, while all other
                      users will be prompted to choose their “Current Location”
                      as the game’s location, or to select “Another Location”.
                      Syracuse users can scroll to the bottom of the parks list
                      and choose "Not Listed" to see the following options.
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 250 }}
                        source={require("./assets/images/syracuse.png")}
                      />
                    </View>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 200 }}
                        source={require("./assets/images/notlisted1.jpg")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Current Location</Text>
                    <Text style={styles.bodyText}>
                      If this option is chosen, the game's location will be
                      based on the location you shared upon signing in. If the
                      location is able to be formatted, you will see it listed
                      below the buttons, and the "Current Location" button will
                      change to a white background:
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 100 }}
                        source={require("./assets/images/currentlocation.png")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Another Location</Text>
                    <Text style={styles.bodyText}>
                      If this option is chosen, you will see an input titled
                      "Address". Here you can enter the locations address and
                      make your selection:{"\n"}
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 100 }}
                        source={require("./assets/images/address.jpg")}
                      />
                    </View>
                    <Text style={styles.bodyText}>
                      Please note that locations must follow a specific format,
                      and if your chosen location will not format, it wil be
                      rejected. In general, locations with a number, street,
                      city and state will work. Once you make an acceptable
                      selection, you will see it listed on the page:{"\n"}
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 150 }}
                        source={require("./assets/images/placesaddress.jpg")}
                      />
                    </View>
                    <Text style={styles.bodyText}>
                      From there, you can either "Choose This Location", or
                      Reset and choose another. If the location is chosen, you
                      will be directed back to the Post menu, where you will see
                      your chosen location listed again, and "Another Location"
                      will change to "Chosen Location":
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 200 }}
                        source={require("./assets/images/chosenlocation.jpg")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Posted Game Limit</Text>
                    <Text style={styles.bodyText}>
                      Each user is limited to a maximum of three games posted at
                      once. If a fourth game is posted, you will be prompted to
                      either delete a game, or wait until a currently posted
                      game date has passed before adding another. Users can
                      delete games by clicking the red "X" on any game they've
                      personally posted. As stated in the prompt, deleted games
                      and any information attached (comments, joins, etc.)
                      cannot be restored.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => setGameExpOpen(!gameExpOpen)}
            style={{ marginTop: 40 }}
          >
            <View>
              {!gameExpOpen ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "KanitReg",
                  }}
                >
                  What is a Game? +
                </Text>
              ) : (
                <View>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 25,
                      fontFamily: "KanitReg",
                    }}
                  >
                    What is a Game? -
                  </Text>
                  <View
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderColor: "white",
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={styles.bodyText}>
                      Each posted Game in point.game serves as a central point
                      for a number of functions. To begin, all users will see
                      any games posted within 25 miles of their current location
                      on the GameFeed. All games will have a "More" button. All
                      games except games you personally posted will also have a
                      "Join" or "Joined" button:
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 375 }}
                        source={require("./assets/images/moreandjoin-1.png")}
                      />
                    </View>
                    <Text style={styles.headerText2}>More</Text>
                    <Text style={styles.bodyText}>
                      Clicking a games "More" button will take you to a page
                      dedicated to that specific game. Here you can see more
                      details, such as a visual of the location, a list of all
                      users currently joined on this game, and a place to leave
                      a comment related to the game. If there are any comments
                      posted on the game, they will show below as well. If there
                      are any users joined on the game, you will see a "Playing"
                      field next to the number of players joined. Clicking this
                      will show a list of their usernames:
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 500 }}
                        source={require("./assets/images/gamepage1.png")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Join/Unjoin</Text>
                    <Text style={styles.bodyText}>
                      For any game that you have not posted, you will have the
                      ability to "Join" it. To do so, simply click the button
                      and confirm when prompted. From here, the playing count on
                      the game will increase (or appear if you are the first
                      joined). You will also see the "Join" button change to
                      "Joined". To unjoin a game, click this button and accept
                      the prompt. You will be removed from the joined list and
                      the playing count will decrease as well.
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 250 }}
                        source={require("./assets/images/moreandjoined.png")}
                      />
                    </View>
                    <Text style={styles.headerText2}>Posted By</Text>
                    <Text style={styles.bodyText}>
                      Clicking the name of the games poster will take you to
                      their Profile page. There you can see any games that user
                      has currently posted, as well as any they have joined.
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 325 }}
                        source={require("./assets/images/otheruser1.png")}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => setProfExpOpen(!profExpOpen)}
            style={{ marginTop: 40 }}
          >
            <View>
              {!profExpOpen ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "KanitReg",
                  }}
                >
                  What is my Profile? +
                </Text>
              ) : (
                <View>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 25,
                      fontFamily: "KanitReg",
                    }}
                  >
                    What is my Profile? -
                  </Text>
                  <View
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderColor: "white",
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={styles.bodyText}>
                      Your Profile page is where you (as well as other users)
                      can see any games you've posted, along with any you've
                      joined. The "Posted" and "Joined" buttons will toggle
                      between the lists. Here you can also access Settings and
                      other general information related to, as well as sign out
                      of, your account.
                    </Text>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 300 }}
                        source={require("./assets/images/profileposted.png")}
                      />
                    </View>
                    <View style={{ padding: 5 }}>
                      <Image
                        style={{ width: "100%", height: 500 }}
                        source={require("./assets/images/profilejoined.png")}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        </View>
        <View style={{ width: "100%", marginBottom: 50 }}></View>
      </ScrollView>
    </Modal>
  );
};

export default Breakdown;

const styles = StyleSheet.create({
  breakdownView: {
    ...Platform.select({
      android: {
        marginBottom: 30,
      },
    }),
  },
  headerText: {
    color: "black",
    fontSize: 21,
    fontFamily: "KanitReg",
  },
  headerText2: {
    color: "black",
    fontSize: 20,
    fontFamily: "KanitReg",
  },
  bodyText: {
    color: "black",
    fontSize: 18,
    fontFamily: "KanitLight",
  },
});
