import React from "react";
import {View, Text} from 'react-native'
import tw from 'twrnc'

export default function SettingsScreen(){
    return (
        <View style={tw`flex-1 mt-5`}>
          <Text>You are at the settings page</Text>
        </View>
      );
}
