import {
  View,
  Text,
  Platform,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext.js";
import { Picker } from "@react-native-picker/picker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import GooglePlacesInput from "./PlacesInput";
import { format } from "date-fns";
import moment from "moment";
import { EB_URL, MAPS_API_KEY } from "@env";

const PostGame = ({
  visible,
  setPostGameVisible,
  facilities,
  getGames,
  userId,
  isLocal,
}) => {
  const [sportValue, setSportValue] = useState("");
  const [surfaceValue, setSurfaceValue] = useState("");
  const [facilityValue, setFacilityValue] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [details, setDetails] = useState("");

  const [placesVisible, setPlacesVisible] = useState(false);
  const [locationChosen, setLocationChosen] = useState(false);
  const [locationCurrent, setLocationCurrent] = useState(false);
  const [location, setLocation] = useState({
    number: null,
    street: null,
    city: null,
    state: null,
    latitude: null,
    longitude: null,
  });

  const currentUser = useContext(UserContext);

  //setting min and max dates for RNDateTimePicker
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(minDate.getDate() + 7);

  const handleDateChange = (event, selectedDate) => {
    setDate(selectedDate || date);
  };

  const handleTimeChange = (event, selectedTime) => {
    setTime(selectedTime || time);
  };

  const onChange = (event, selectedDate) => {
    setDate(selectedDate);
    setTime(selectedDate);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: false,
      minimumDate: minDate,
      maximumDate: maxDate,
    });
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const chosenCheck = () => {
    if (locationCurrent) {
      setLocation({
        number: null,
        street: null,
        city: null,
        state: null,
        latitude: null,
        longitude: null,
      });
    }
    return;
  };

  const handleTextChange = (newText) => {
    if (newText.length <= 100) {
      setDetails(newText);
    } else {
      return;
    }
  };

  const getCurrentAddress = async () => {
    if (!currentUser.location.latitude || !currentUser.location.longitude) {
      console.log("can't get current location");
      return;
    }
    function parseAddress(address) {
      const regex =
        /^(\d+) ([A-Za-z0-9\s]+), ([A-Za-z\s]+), ([A-Z]{2}) (\d{5})(-\d{4})?/;
      const match = regex.exec(address);
      if (!match) {
        console.log("address issue");
        setLocationCurrent(false);
        Alert.alert(
          "Location Issue",
          "There was an issue formatting your chosen address. Please try again or enter the location manually.",
          {
            text: "OK",
            onPress: () => {
              setLocationCurrent(false);
              setLocation({
                number: null,
                street: null,
                city: null,
                state: null,
                zip: null,
                latitude: null,
                longitude: null,
              });
              return;
            },
          }
        );
        return;
      }
      const [_, number, street, city, state, zip] = match;
      return { number, street, city, state, zip };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentUser.location.latitude},${currentUser.location.longitude}&key=${MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log({ data });
      const address = data.results[0].formatted_address;
      const currentLocation = parseAddress(address);
      setLocation({
        city: currentLocation.city,
        street: currentLocation.street,
        number: currentLocation.number,
        state: currentLocation.state,
        latitude: currentUser.location.latitude,
        longitude: currentUser.location.longitude,
      });
      if (!isLocal) {
        setFacilityValue(2);
      }
    } catch (e) {
      console.log("address location issue");
      setLocationCurrent(false);
      setLocation({
        number: null,
        street: null,
        city: null,
        state: null,
        zip: null,
        latitude: null,
        longitude: null,
      });
      Alert.alert(
        "Location Issue",
        "There was an issue formatting your current address. Please try again or enter the location manually.",
        {
          text: "OK",
        }
      );
    }
  };

  useEffect(() => {
    console.log(currentUser.location);
  }, []);

  const onCloseModal = () => {
    setPostGameVisible(false);
    setPlacesVisible(false);
    setSportValue("");
    setFacilityValue(null);
    setSurfaceValue("");
    setDetails("");
    setDate(new Date());
    setTime(new Date());
    setLocation({
      number: null,
      street: null,
      city: null,
      state: null,
      latitude: null,
      longitude: null,
    });
    setLocationChosen(false);
    setLocationCurrent(false);
  };

  const FacilityPicker = ({ setFacilityValue, facilities }) => {
    if (!facilities) {
      return;
    }
    return (
      <Picker
        selectedValue={facilityValue}
        onValueChange={(itemValue, itemIndex) => {
          setFacilityValue(itemValue);
        }}
        itemStyle={{
          color: "white",
          backgroundColor: "#256D1B",
          fontSize: 30,
          fontFamily: "KanitReg",
        }}
        dropdownItemStyle={{
          color: "white",
          backgroundColor: "#0a210f",
          fontSize: 30,
          fontFamily: "KanitReg",
        }}
        style={styles.picker}
        dropdownIconColor="white"
      >
        <Picker.Item
          style={{ fontSize: 26 }}
          label="Choose a location"
          value={null}
        />
        {facilities.map((facility) => (
          <Picker.Item
            style={{ fontSize: 26 }}
            key={facility.id}
            label={facility.name}
            value={facility.id}
          />
        ))}
      </Picker>
    );
  };

  const addGame = async () => {
    if (!sportValue || !facilityValue || !surfaceValue || !date || !time) {
      console.log("enter all fields");
      return;
    }

    if (facilityValue == 2) {
      if (!location.number || !location.latitude || !location.longitude) {
        console.log("enter valid address");
        return;
      }
    }

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const game = {
      sport: sportValue,
      surface: surfaceValue,
      date: format(date, "MM/dd/yyyy"),
      time: formattedTime,
      facilityId: facilityValue,
      userId,
      details,
      city: location.city,
      street: location.street,
      number: location.number,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      const gameResponse = await fetch(`${EB_URL}/newGame/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(game),
      });
      const gameData = await gameResponse.json();
      if (gameData.msg == "too many games") {
        Alert.alert(
          "Posted Game Limit",
          "Users can have a maximum of three games posted at one time. Either delete a game, or wait until one has passed before posting another.",
          [
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      }

      setSportValue("");
      setFacilityValue(null);
      setSurfaceValue("");
      setDetails("");
      setDate(new Date());
      setTime(new Date());
      setLocation({
        number: null,
        street: null,
        city: null,
        state: null,
        latitude: null,
        longitude: null,
      });
      getGames();
      setPostGameVisible(false);
    } catch (error) {
      console.error(error);
      throw new Error("there was an issue adding the game");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      style={{ backgroundColor: "#0a210f" }}
    >
      <GooglePlacesInput
        visible={placesVisible}
        setPlacesVisible={setPlacesVisible}
        location={location}
        setLocation={setLocation}
        setLocationChosen={setLocationChosen}
        setLocationCurrent={setLocationCurrent}
        setFacilityValue={setFacilityValue}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#256D1B" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={{ backgroundColor: "#256D1B" }}>
          <ScrollView
            style={{ backgroundColor: "#256D1B" }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.postContainer}>
              <View style={{ paddingHorizontal: 40 }}>
                <Picker
                  selectedValue={sportValue}
                  onValueChange={(itemValue, itemIndex) => {
                    setSportValue(itemValue);
                  }}
                  style={styles.picker}
                  dropdownIconColor="white"
                  itemStyle={{
                    color: "white",
                    backgroundColor: "#256D1B",
                    fontSize: 33,
                    fontFamily: "KanitReg",
                  }}
                  dropdownItemStyle={{
                    color: "white",
                    backgroundColor: "#0a210f",
                    fontSize: 33,
                    fontFamily: "KanitReg",
                  }}
                >
                  <Picker.Item
                    style={{ fontSize: 30 }}
                    label="Choose the sport"
                    value=""
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Baseball"
                    value="Baseball"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Basketball"
                    value="Basketball"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Football"
                    value="Football"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Frisbee"
                    value="Frisbee"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Golf"
                    value="Golf"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Hockey"
                    value="Hockey"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Kickball"
                    value="Kickball"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Lacrosse"
                    value="Lacrosse"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Pickleball"
                    value="Pickleball"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Soccer"
                    value="Soccer"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Softball"
                    value="Softball"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Tennis"
                    value="Tennis"
                  />
                  <Picker.Item
                    style={{ fontSize: 25 }}
                    label="Volleyball"
                    value="Volleyball"
                  />
                </Picker>
              </View>
              <View style={{ paddingHorizontal: 40 }}>
                {sportValue == "" ? null : (
                  <Picker
                    selectedValue={surfaceValue}
                    onValueChange={(itemValue, itemIndex) => {
                      setSurfaceValue(itemValue);
                    }}
                    itemStyle={{
                      color: "white",
                      backgroundColor: "#256D1B",
                      fontSize: 33,
                      fontFamily: "KanitReg",
                    }}
                    dropdownItemStyle={{
                      color: "white",
                      backgroundColor: "#0a210f",
                      fontSize: 33,
                      fontFamily: "KanitReg",
                    }}
                    style={styles.picker}
                    dropdownIconColor="white"
                  >
                    <Picker.Item
                      style={{ fontSize: 30 }}
                      label="Choose a surface"
                      value=""
                    />
                    <Picker.Item
                      style={{ fontSize: 27 }}
                      label="Indoor"
                      value="Indoor"
                    />
                    <Picker.Item
                      style={{ fontSize: 27 }}
                      label="Outdoor"
                      value="Outdoor"
                    />
                    <Picker.Item
                      style={{ fontSize: 27 }}
                      label="Court (Indoor)"
                      value="Court (Indoor)"
                    />
                    <Picker.Item
                      style={{ fontSize: 27 }}
                      label="Court (Outdoor)"
                      value="Court (Outdoor)"
                    />
                    <Picker.Item
                      style={{ fontSize: 27 }}
                      label="Turf"
                      value="Turf"
                    />
                  </Picker>
                )}
              </View>
              <View>
                {!isLocal ? null : (
                  <View style={{ paddingHorizontal: 40 }}>
                    {surfaceValue == "" || sportValue == "" ? null : (
                      <FacilityPicker
                        setFacilityValue={setFacilityValue}
                        facilities={facilities}
                      />
                    )}
                  </View>
                )}
              </View>
              <View>
                {isLocal ? (
                  <View>
                    {facilityValue !== 2 ||
                    sportValue == "" ||
                    surfaceValue == "" ? null : (
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginBottom: 25,
                            paddingHorizontal: 10,
                          }}
                        >
                          {!locationCurrent ? (
                            <Pressable
                              style={{
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setLocationCurrent(true);
                                setLocationChosen(false);
                                getCurrentAddress();
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 17,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Current Location
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={{
                                backgroundColor: "white",
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setLocationCurrent(true);
                                setLocationChosen(false);
                              }}
                            >
                              <Text
                                style={{
                                  color: "#0a210f",
                                  fontSize: 17,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Current Location
                              </Text>
                            </Pressable>
                          )}
                          {!locationChosen ? (
                            <Pressable
                              style={{
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setPlacesVisible(true);
                                chosenCheck();
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 17,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Another Location
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={{
                                backgroundColor: "white",
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setPlacesVisible(true);
                                setLocationChosen(false);
                                setLocation({
                                  number: null,
                                  street: null,
                                  city: null,
                                  state: null,
                                  latitude: null,
                                  longitude: null,
                                });
                              }}
                            >
                              <Text
                                style={{
                                  color: "#0a210f",
                                  fontSize: 17,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Chosen Location
                              </Text>
                            </Pressable>
                          )}
                        </View>
                        <View style={{ paddingHorizontal: 20 }}>
                          {!locationChosen ? null : (
                            <View>
                              {!currentUser.location.latitude ||
                              !currentUser.location.longitude ? (
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center",
                                    fontSize: 16,
                                    fontFamily: "KanitReg",
                                  }}
                                >
                                  There was an issue retrieving your current
                                  location. Please try again or choose the
                                  location manually.
                                </Text>
                              ) : (
                                <View>
                                  {location.number ? (
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: 25,
                                        fontFamily: "KanitReg",
                                      }}
                                    >
                                      {location.number} {location.street},{" "}
                                      {location.city} {location.state}
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: 16,
                                      }}
                                    >
                                      There was an issue formatting your current
                                      address. Please try again or choose the
                                      location manually.
                                    </Text>
                                  )}
                                </View>
                              )}
                            </View>
                          )}
                          {!locationCurrent ? null : (
                            <View>
                              {location.number ? (
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center",
                                    fontSize: 22,
                                    fontFamily: "KanitReg",
                                  }}
                                >
                                  {location.number} {location.street},{" "}
                                  {location.city} {location.state}
                                </Text>
                              ) : null}
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    {sportValue == "" || surfaceValue == "" ? null : (
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginBottom: 25,
                            paddingHorizontal: 10,
                          }}
                        >
                          {!locationCurrent ? (
                            <Pressable
                              style={{
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setLocationCurrent(true);
                                setLocationChosen(false);
                                getCurrentAddress();
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 20,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Current Location
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={{
                                backgroundColor: "white",
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setLocationCurrent(true);
                                setLocationChosen(false);
                              }}
                            >
                              <Text
                                style={{
                                  color: "#0a210f",
                                  fontSize: 20,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Current Location
                              </Text>
                            </Pressable>
                          )}
                          {!locationChosen ? (
                            <Pressable
                              style={{
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setPlacesVisible(true);
                                chosenCheck();
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 20,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Another Location
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={{
                                backgroundColor: "white",
                                borderColor: "white",
                                borderWidth: 2,
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                setPlacesVisible(true);
                                setLocationChosen(false);
                                setLocation({
                                  number: null,
                                  street: null,
                                  city: null,
                                  state: null,
                                  latitude: null,
                                  longitude: null,
                                });
                              }}
                            >
                              <Text
                                style={{
                                  color: "#0a210f",
                                  fontSize: 20,
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Chosen Location
                              </Text>
                            </Pressable>
                          )}
                        </View>
                        <View style={{ paddingHorizontal: 20 }}>
                          {!locationChosen ? null : (
                            <View>
                              {!currentUser.location.latitude ||
                              !currentUser.location.longitude ? (
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center",
                                    fontSize: 16,
                                  }}
                                >
                                  There was an issue retrieving your current
                                  location. Please try again or choose the
                                  location manually.
                                </Text>
                              ) : (
                                <View style={{ marginBottom: 15 }}>
                                  {location.number ? (
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: 28,
                                        fontFamily: "KanitReg",
                                      }}
                                    >
                                      {location.number} {location.street},{" "}
                                      {location.city} {location.state}
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: 16,
                                        fontFamily: "KanitReg",
                                      }}
                                    >
                                      There was an issue formatting your current
                                      address. Please try again or choose the
                                      location manually.
                                    </Text>
                                  )}
                                </View>
                              )}
                            </View>
                          )}
                          {!locationCurrent ? null : (
                            <View style={{ marginBottom: 15 }}>
                              {location.number ? (
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center",
                                    fontSize: 28,
                                    fontFamily: "KanitReg",
                                  }}
                                >
                                  {location.number} {location.street},{" "}
                                  {location.city} {location.state}
                                </Text>
                              ) : null}
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View>
                {isLocal ? (
                  <View>
                    {facilityValue == 2 ? (
                      <View>
                        {sportValue == "" ||
                        surfaceValue == "" ||
                        (!locationChosen && !locationCurrent) ? null : (
                          <View>
                            {Platform.OS === "ios" ? (
                              <View>
                                <View style={{ marginBottom: 10 }}>
                                  <Text
                                    style={{
                                      color: "white",
                                      fontSize: 23,
                                      fontFamily: "KanitReg",
                                      textAlign: "center",
                                    }}
                                  >
                                    Choose the date and time:
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <RNDateTimePicker
                                    mode="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    display="spinner"
                                    textColor="white"
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                  />
                                  <RNDateTimePicker
                                    mode="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    display="spinner"
                                    textColor="white"
                                  />
                                </View>
                                <View
                                  style={{
                                    marginBottom: 5,
                                    flexDirection: "row-reverse",
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontFamily: "KanitLight",
                                    }}
                                  >
                                    {details.length}/100
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    paddingHorizontal: 40,
                                  }}
                                >
                                  <TextInput
                                    style={{
                                      backgroundColor: "white",
                                      borderColor: "white",
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      paddingHorizontal: 10,
                                      color: "black",
                                      height: 50,
                                      fontSize: 17,
                                      fontFamily: "KanitLight",
                                    }}
                                    value={details}
                                    onChangeText={handleTextChange}
                                    placeholder="Enter any details here..."
                                    placeholderTextColor="#5A5A5A"
                                  />
                                </View>
                              </View>
                            ) : (
                              <View>
                                <View>
                                  <View>
                                    <Text
                                      style={{ color: "white", fontSize: 27 }}
                                    >
                                      {format(date, "MM/dd/yyyy")}
                                    </Text>
                                    <Pressable
                                      onPress={showDatepicker}
                                      style={{
                                        marginTop: 5,
                                        paddingHorizontal: 50,
                                      }}
                                    >
                                      <Text style={styles.button}>
                                        Select Date
                                      </Text>
                                    </Pressable>
                                  </View>
                                  <View
                                    style={{
                                      marginBottom: 30,
                                    }}
                                  >
                                    <Text
                                      style={{ color: "white", fontSize: 27 }}
                                    >
                                      {/* {new Date(time).toLocaleTimeString()} */}
                                      {moment(time).format("h:mm A")}
                                    </Text>
                                    <Pressable
                                      onPress={showTimepicker}
                                      style={{ marginTop: 5 }}
                                    >
                                      <Text style={styles.button}>
                                        Select Time
                                      </Text>
                                    </Pressable>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    marginBottom: 5,
                                    flexDirection: "row-reverse",
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontFamily: "KanitLight",
                                    }}
                                  >
                                    {details.length}/100
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    paddingHorizontal: 40,
                                  }}
                                >
                                  <TextInput
                                    style={{
                                      backgroundColor: "white",
                                      borderColor: "white",
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      paddingHorizontal: 10,
                                      color: "black",
                                      height: 50,
                                      fontSize: 17,
                                      fontFamily: "KanitLight",
                                    }}
                                    value={details}
                                    onChangeText={handleTextChange}
                                    placeholder="Enter any details here..."
                                    placeholderTextColor="#5A5A5A"
                                  />
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    ) : (
                      <View>
                        {sportValue == "" ||
                        surfaceValue == "" ||
                        facilityValue == null ? null : (
                          <View>
                            {Platform.OS === "ios" ? (
                              <View>
                                <View style={{ marginBottom: 10 }}>
                                  <Text
                                    style={{
                                      color: "white",
                                      fontSize: 23,
                                      fontFamily: "KanitReg",
                                      textAlign: "center",
                                    }}
                                  >
                                    Choose the date and time:
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <RNDateTimePicker
                                    mode="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    display="spinner"
                                    textColor="white"
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                  />
                                  <RNDateTimePicker
                                    mode="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    display="spinner"
                                    textColor="white"
                                  />
                                </View>
                                <View
                                  style={{
                                    marginBottom: 5,
                                    flexDirection: "row-reverse",
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontFamily: "KanitLight",
                                    }}
                                  >
                                    {details.length}/100
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    paddingHorizontal: 40,
                                  }}
                                >
                                  <TextInput
                                    style={{
                                      backgroundColor: "white",
                                      borderColor: "white",
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      paddingHorizontal: 10,
                                      color: "black",
                                      height: 50,
                                      fontSize: 17,
                                      fontFamily: "KanitLight",
                                    }}
                                    value={details}
                                    onChangeText={handleTextChange}
                                    placeholder="Enter any details here..."
                                    placeholderTextColor="#5A5A5A"
                                  />
                                </View>
                              </View>
                            ) : (
                              <View>
                                <View>
                                  <View>
                                    <Text
                                      style={{ color: "white", fontSize: 27 }}
                                    >
                                      {format(date, "MM/dd/yyyy")}
                                    </Text>
                                    <Pressable
                                      onPress={showDatepicker}
                                      style={{ marginTop: 5 }}
                                    >
                                      <Text style={styles.button}>
                                        Select Date
                                      </Text>
                                    </Pressable>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "column",
                                    }}
                                  >
                                    <Text
                                      style={{ color: "white", fontSize: 27 }}
                                    >
                                      {moment(time).format("h:mm A")}
                                    </Text>
                                    <View
                                      style={{
                                        marginTop: 5,
                                        paddingHorizontal: 50,
                                      }}
                                    >
                                      <Pressable onPress={showTimepicker}>
                                        <Text style={styles.button}>
                                          Select Time
                                        </Text>
                                      </Pressable>
                                    </View>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    marginBottom: 5,
                                    flexDirection: "row-reverse",
                                    paddingHorizontal: 50,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "white",
                                      fontFamily: "KanitLight",
                                    }}
                                  >
                                    {details.length}/100
                                  </Text>
                                </View>
                                <View style={{ paddingHorizontal: 40 }}>
                                  <TextInput
                                    style={{
                                      backgroundColor: "white",
                                      borderColor: "white",
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      paddingHorizontal: 10,
                                      color: "black",
                                      height: 50,
                                      fontSize: 17,
                                      fontFamily: "KanitLight",
                                    }}
                                    value={details}
                                    onChangeText={handleTextChange}
                                    placeholder="Enter any details here..."
                                    placeholderTextColor="#5A5A5A"
                                  />
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    {!locationChosen && !locationCurrent ? null : (
                      <View>
                        {Platform.OS === "ios" ? (
                          <View>
                            <View style={{ marginBottom: 10 }}>
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: 23,
                                  fontFamily: "KanitReg",
                                  textAlign: "center",
                                }}
                              >
                                Choose the date and time:
                              </Text>
                            </View>
                            <View
                              style={{
                                paddingHorizontal: 50,
                              }}
                            >
                              <RNDateTimePicker
                                mode="date"
                                value={date}
                                onChange={handleDateChange}
                                display="spinner"
                                textColor="white"
                                textStyle={{
                                  fontSize: 22,
                                }}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                              />
                              <RNDateTimePicker
                                mode="time"
                                value={time}
                                onChange={handleTimeChange}
                                display="spinner"
                                textColor="white"
                              />
                            </View>
                            <View
                              style={{
                                marginBottom: 5,
                                flexDirection: "row-reverse",
                                paddingHorizontal: 50,
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontFamily: "KanitLight",
                                }}
                              >
                                {details.length}/100
                              </Text>
                            </View>
                            <View style={{ paddingHorizontal: 40 }}>
                              <TextInput
                                style={{
                                  backgroundColor: "white",
                                  borderColor: "white",
                                  borderWidth: 1,
                                  borderRadius: 6,
                                  paddingHorizontal: 10,
                                  color: "black",
                                  height: 50,
                                  fontSize: 17,
                                  fontFamily: "KanitLight",
                                }}
                                value={details}
                                onChangeText={handleTextChange}
                                placeholder="Enter any details here..."
                                placeholderTextColor="#5A5A5A"
                              />
                            </View>
                          </View>
                        ) : (
                          <View>
                            <View>
                              <View
                                style={{
                                  paddingHorizontal: 75,
                                  marginBottom: 15,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 27,
                                    textAlign: "center",
                                    fontFamily: "KanitReg",
                                  }}
                                >
                                  {format(date, "MM/dd/yyyy")}
                                </Text>
                                <Pressable
                                  onPress={showDatepicker}
                                  style={{ marginTop: 5 }}
                                >
                                  <Text style={styles.button}>Select Date</Text>
                                </Pressable>
                              </View>
                              <View>
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 27,
                                    textAlign: "center",
                                    fontFamily: "KanitReg",
                                  }}
                                >
                                  {/* {new Date(time).toLocaleTimeString()} */}
                                  {moment(time).format("h:mm A")}
                                </Text>
                                <View
                                  style={{
                                    marginTop: 5,
                                    paddingHorizontal: 75,
                                    marginBottom: 15,
                                  }}
                                >
                                  <Pressable onPress={showTimepicker}>
                                    <Text style={styles.button}>
                                      Select Time
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                marginBottom: 5,
                                flexDirection: "row-reverse",
                                paddingHorizontal: 50,
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontFamily: "KanitLight",
                                }}
                              >
                                {details.length}/100
                              </Text>
                            </View>
                            <View style={{ paddingHorizontal: 40 }}>
                              <TextInput
                                style={{
                                  backgroundColor: "white",
                                  borderColor: "white",
                                  borderWidth: 1,
                                  borderRadius: 6,
                                  paddingHorizontal: 10,
                                  color: "black",
                                  height: 50,
                                  fontSize: 17,
                                  fontFamily: "KanitLight",
                                }}
                                value={details}
                                onChangeText={handleTextChange}
                                placeholder="Enter any details here..."
                                placeholderTextColor="#5A5A5A"
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View>
                {isLocal ? (
                  <View>
                    {facilityValue == 2 ? (
                      <View>
                        {sportValue == "" ||
                        surfaceValue == "" ||
                        (!locationChosen && !locationCurrent) ? null : (
                          <View
                            style={{
                              paddingHorizontal: 100,
                              marginTop: 30,
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                addGame();
                                setLocationCurrent(false);
                                setLocationChosen(false);
                              }}
                              style={{
                                backgroundColor: "#032b43",
                                paddingHorizontal: 10,
                                paddingVertical: 10,
                                borderRadius: 5,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 22,
                                  color: "white",
                                  textAlign: "center",
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Post
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View>
                        {sportValue == "" ||
                        surfaceValue == "" ||
                        facilityValue == null ? null : (
                          <View
                            style={{
                              paddingHorizontal: 100,
                              marginTop: 30,
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                addGame();
                                setLocationCurrent(false);
                                setLocationChosen(false);
                              }}
                              style={{
                                backgroundColor: "#032b43",
                                paddingHorizontal: 10,
                                paddingVertical: 10,
                                borderRadius: 5,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 22,
                                  color: "white",
                                  textAlign: "center",
                                  fontFamily: "KanitReg",
                                }}
                              >
                                Post
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    {sportValue == "" ||
                    surfaceValue == "" ||
                    (!locationChosen && !locationCurrent) ? null : (
                      <View
                        style={{
                          paddingHorizontal: 100,
                          marginTop: 30,
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            addGame();
                            setLocationCurrent(false);
                            setLocationChosen(false);
                          }}
                          style={{
                            backgroundColor: "#032b43",
                            paddingHorizontal: 10,
                            paddingVertical: 10,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 22,
                              color: "white",
                              textAlign: "center",
                              fontFamily: "KanitReg",
                            }}
                          >
                            Post
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
            <View style={{ paddingHorizontal: 125, marginVertical: 20 }}>
              <Pressable
                onPress={() => {
                  onCloseModal();
                }}
                style={{
                  backgroundColor: "#d00000",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 23,
                    color: "white",
                    textAlign: "center",
                    fontFamily: "KanitReg",
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PostGame;

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#256D1B",
    color: "#FFFFFF",
    ...Platform.select({
      ios: {
        paddingTop: 30,
      },
      android: {
        paddingTop: 30,
      },
    }),
  },
  container: {
    flex: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignContent: "center",
    color: "#FFFFFF",
  },
  button: {
    fontSize: 20,
    color: "white",
    backgroundColor: "#032b43",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    textAlign: "center",
    fontFamily: "KanitReg",
  },
  picker: {
    color: "white",
    ...Platform.select({
      android: {
        marginBottom: 30,
      },
    }),
  },
});
