// Selector de mascotas en Inicio: oculto con una, cambia la seleccionada y el "+" respeta el tope.
import { fireEvent, render, screen } from '@testing-library/react-native';
import PetSwitcher from '../components/pet/PetSwitcher';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const Icon = ({ name }) => <Text>{`icon-${name}`}</Text>;
  return { Feather: Icon, Ionicons: Icon };
});

const pets = [
  { id: 'p1', name: 'Lirya', avatarId: 'gato-2' },
  { id: 'p2', name: 'Toby', avatarId: 'perro-1' },
];

test('con una sola mascota no se muestra (Inicio queda como antes)', async () => {
  await render(<PetSwitcher pets={[pets[0]]} selectedId="p1" onSelect={jest.fn()} onAdd={jest.fn()} canAdd />);
  expect(screen.queryByTestId('pet-switcher')).toBeNull();
});

test('tocar otra mascota la selecciona; tocar la actual no hace nada', async () => {
  const onSelect = jest.fn();
  await render(<PetSwitcher pets={pets} selectedId="p1" onSelect={onSelect} onAdd={jest.fn()} canAdd />);
  await fireEvent.press(screen.getByTestId('pet-chip-p1'));
  expect(onSelect).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('pet-chip-p2'));
  expect(onSelect).toHaveBeenCalledWith('p2');
  expect(screen.getByLabelText('Lirya, seleccionada')).toBeTruthy();
});

test('el botón "+" solo aparece si se puede agregar otra', async () => {
  const onAdd = jest.fn();
  const { rerender } = await render(<PetSwitcher pets={pets} selectedId="p1" onSelect={jest.fn()} onAdd={onAdd} canAdd />);
  await fireEvent.press(screen.getByTestId('pet-chip-add'));
  expect(onAdd).toHaveBeenCalled();
  await rerender(<PetSwitcher pets={pets} selectedId="p1" onSelect={jest.fn()} onAdd={onAdd} canAdd={false} />);
  expect(screen.queryByTestId('pet-chip-add')).toBeNull();
});
