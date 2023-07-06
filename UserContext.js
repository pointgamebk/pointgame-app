import React, { createContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const checkLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const userLocation = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = userLocation.coords;
        setLocation({
          latitude,
          longitude,
        });
      } else {
        handleNoLocation();
      }
    } catch (error) {
      handleNoLocation();
      console.error(error);
    }
  };

  const handleNoLocation = () => {
    Alert.alert(
      "Location Issue",
      "We were unable to get your current location. Please update location permissions in order to use the app as intended",
      [{ text: "OK", onPress: () => console.log("no coordinates") }]
    );
  };

  useEffect(() => {
    checkLocationPermissions();
  }, []);

  useEffect(() => {
    console.log({ location });
  }, [location]);

  const userContextValue = {
    location,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
