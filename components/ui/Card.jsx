import { View } from 'react-native';
import { theme } from '../../constants/theme';

export default function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: theme.border,
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
