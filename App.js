import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "./UserContext.js";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import Home from "./Home.js";
import Profile from "./Profile.js";
import Game from "./Game.js";
import * as SystemUI from "expo-system-ui";
import * as Font from "expo-font";
import config from "./src/aws-exports.js";
Amplify.configure(config);

const Stack = createNativeStackNavigator();

const App = () => {
  const [loaded, setLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      Kanit: require("./assets/fonts/Kanit-SemiBoldItalic.ttf"),
      Kanit2: require("./assets/fonts/Kanit-SemiBold.ttf"),
      KanitLight: require("./assets/fonts/Kanit-Light.ttf"),
      KanitReg: require("./assets/fonts/Kanit-Regular.ttf"),
      KanitMed: require("./assets/fonts/Kanit-Medium.ttf"),
      SourceSansPro: require("./assets/fonts/SourceSansPro-SemiBold.ttf"),
      Arimo: require("./assets/fonts/Arimo-SemiBold.ttf"),
    });
    setLoaded(true);
  };

  if (!loaded) {
    loadFonts();
    return null;
  }
  const MyAppHeader = () => {
    return (
      <View>
        <Text
          style={{
            fontSize: 40,
            color: "#032b43",
            fontFamily: "Kanit2",
            textAlign: "center",
          }}
        >
          point.game!
        </Text>
      </View>
    );
  };
  return (
    <Authenticator.Provider>
      <Authenticator Header={MyAppHeader}>
        <SafeAreaProvider>
          <UserProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="Home"
                  component={Home}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="Profile"
                  component={Profile}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="Game"
                  component={Game}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </UserProvider>
        </SafeAreaProvider>
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#032b43",
    alignItems: "center",
    justifyContent: "center",
  },
});
