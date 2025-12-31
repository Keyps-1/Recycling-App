import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";

export function HapticTab(props: any) {
  const { onPress, children, accessibilityState } = props;

  return (
    <Pressable
      {...props}
      onPress={(e) => {
        Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      {children}
    </Pressable>
  );
}
