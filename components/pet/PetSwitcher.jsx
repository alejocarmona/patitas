import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAvatar } from '../../constants/avatars';
import { fonts, theme } from '../../constants/theme';

// Fila de mascotas para cambiar la seleccionada (va sobre el encabezado naranja de Inicio).
// Solo se muestra con 2 o más mascotas; con una, Inicio queda igual que siempre.
export default function PetSwitcher({ pets, selectedId, onSelect, onAdd, canAdd }) {
  if (!pets || pets.length < 2) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingTop: 16 }}
      testID="pet-switcher"
    >
      {pets.map((p) => {
        const active = p.id === selectedId;
        return (
          <Pressable
            key={p.id}
            onPress={() => !active && onSelect(p.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={active ? `${p.name}, seleccionada` : `Ver a ${p.name}`}
            testID={`pet-chip-${p.id}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              minHeight: 44,
              paddingVertical: 6,
              paddingLeft: 6,
              paddingRight: 14,
              borderRadius: 22,
              backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Image source={getAvatar(p.avatarId).source} style={{ width: 32, height: 32, borderRadius: 16 }} />
            <Text
              numberOfLines={1}
              style={{ maxWidth: 120, fontSize: 14, fontFamily: fonts.bold, color: active ? theme.text : '#fff' }}
            >
              {p.name}
            </Text>
          </Pressable>
        );
      })}
      {canAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Agregar mascota"
          testID="pet-chip-add"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      ) : null}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}
