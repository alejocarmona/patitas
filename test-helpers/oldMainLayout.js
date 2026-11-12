// Layout antiguo con el bug (verificación de regresión; solo lo carga OLD_LAYOUT=1).
const React = require('react');
const { Tabs } = require('expo-router');

exports.default = function OldMainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="cartilla" />
      <Tabs.Screen name="tips" />
      <Tabs.Screen name="directorio" />
      <Tabs.Screen name="perfil" options={{ href: null }} />
      <Tabs.Screen name="add-vacuna" options={{ href: null }} />
      <Tabs.Screen name="add-peso" options={{ href: null }} />
      <Tabs.Screen name="add-medicina" options={{ href: null }} />
      <Tabs.Screen name="edit-pet" options={{ href: null }} />
    </Tabs>
  );
};
