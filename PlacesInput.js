import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Alert } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { PLACES_AUTOCOMPLETE_KEY } from "@env";

const GooglePlacesInput = ({
  visible,
  setPlacesVisible,
  location,
  setLocation,
  setLocationChosen,
  setLocationCurrent,
  setFacilityValue,
}) => {
  const googlePlacesRef = useRef();

  const onReset = () => {
    googlePlacesRef.current.clear();
    setLocation({
      address: null,
      latitude: null,
      longitude: null,
    });
  };

  const updateLocation = (address, details) => {
    const regex = /^(\d+)\s+([^,]+),\s*([^,]+),\s*([A-Za-z]{2})/;
    const match = regex.exec(address);

    if (match) {
      const [, number, street, city, state] = match;
      setLocation({
        number,
        street,
        city,
        state,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      });
      setFacilityValue(2);
    } else {
      console.log("Unable to use that location");
      Alert.alert(
        "Location Issue",
        "There was an issue with the selected location. Please try again or choose another location.",
        [
          {
            text: "OK",
            onPress: () => onReset(),
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={{ zIndex: 1, flex: 0.5 }}>
          <Pressable
            style={{ marginBottom: 10 }}
            onPress={() => setPlacesVisible(false)}
          >
            <Text style={{ color: "white", fontSize: 30, textAlign: "center" }}>
              Address
            </Text>
          </Pressable>

          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search"
            fetchDetails={true}
            onPress={(data, details) => {
              updateLocation(data.description, details);
            }}
            query={{
              key: PLACES_AUTOCOMPLETE_KEY,
              language: "en",
              components: "country:us",
            }}
            onFail={(error) => console.log(error)}
          />
        </View>
        <View style={{ flex: 0.5 }}>
          <View>
            {location.city == null ? null : (
              <View
                style={{
                  padding: 10,
                }}
              >
                {location.number &&
                location.street &&
                location.city &&
                location.state ? (
                  <View>
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontSize: 25,
                      }}
                    >
                      {location.number} {location.street}, {location.city}{" "}
                      {location.state}
                    </Text>
                    <View
                      style={{
                        marginTop: 30,
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <Pressable
                        style={{
                          borderColor: "#032b43",
                          borderWidth: 2,
                          borderRadius: 5,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          backgroundColor: "#032b43",
                        }}
                        onPress={() => {
                          setPlacesVisible(false);
                          setLocationChosen(true);
                          setLocationCurrent(false);
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontSize: 18,
                          }}
                        >
                          Choose This Location
                        </Text>
                      </Pressable>
                      <Pressable
                        style={{
                          borderColor: "#d00000",
                          borderWidth: 2,
                          borderRadius: 5,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          backgroundColor: "#d00000",
                        }}
                        onPress={() => {
                          onReset();
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontSize: 18,
                          }}
                        >
                          Reset
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      There was an issue with the selected address. Please try
                      again or choose another location.
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View style={{ marginTop: 30, paddingHorizontal: 75 }}>
              <Pressable
                style={{
                  borderWidth: 2,
                  borderColor: "white",
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}
                onPress={() => {
                  setPlacesVisible(false);
                  onReset();
                  setLocationCurrent(false);
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 23, textAlign: "center" }}
                >
                  Go Back
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#256D1B",
    flex: 1,
    paddingHorizontal: 30,
    ...Platform.select({
      ios: {
        paddingTop: 100,
      },
      android: {
        paddingTop: 50,
      },
    }),
  },
});

export default GooglePlacesInput;
