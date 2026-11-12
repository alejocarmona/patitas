import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: {
    // 2026-11-11 a las 23:30 hora local: con toISOString() caería en otro día (UTC)
    open: jest.fn(({ onChange }) => onChange({ type: 'set' }, new Date(2026, 10, 11, 23, 30))),
  },
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Feather: ({ name }) => <Text>{`icon-${name}`}</Text> };
});

const DateField = require('../components/ui/DateField').default;
const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');

describe('DateField (calendario nativo)', () => {
  test('al elegir en el calendario entrega YYYY-MM-DD en fecha local', async () => {
    const onChangeText = jest.fn();
    await render(<DateField label="Nacimiento" value="" onChangeText={onChangeText} />);
    await fireEvent.press(screen.getByLabelText('Nacimiento'));
    expect(DateTimePickerAndroid.open).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('2026-11-11');
  });

  test('cancelar el calendario no cambia el valor', async () => {
    DateTimePickerAndroid.open.mockImplementationOnce(({ onChange }) => onChange({ type: 'dismissed' }));
    const onChangeText = jest.fn();
    await render(<DateField label="Nacimiento" value="2022-05-14" onChangeText={onChangeText} />);
    await fireEvent.press(screen.getByLabelText('Nacimiento'));
    expect(onChangeText).not.toHaveBeenCalled();
  });

  test('muestra la fecha legible y el calendario abre en el valor actual', async () => {
    await render(<DateField label="Nacimiento" value="2022-05-14" onChangeText={() => {}} />);
    expect(screen.getByText('14 May 2022')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Nacimiento'));
    const arg = DateTimePickerAndroid.open.mock.calls.at(-1)[0];
    expect(arg.value.getFullYear()).toBe(2022);
    expect(arg.value.getMonth()).toBe(4);
    expect(arg.value.getDate()).toBe(14);
  });
});
