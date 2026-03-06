import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        // Remove a barra de cima
        headerShown: false, 
        // Define o fundo bege para não aparecer flashes brancos
        contentStyle: { backgroundColor: '#FDF5E6' } 
      }}
    >
      {/* Aqui garantimos que o index e o cadastro sejam as rotas principais */}
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
    </Stack>
  );
}