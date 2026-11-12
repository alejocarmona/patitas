// Mock compartido de expo-notifications para Jest.
// state.permission lo cambia cada test; requestResult es lo que "responde" el diálogo del sistema.
const state = {
  permission: { granted: true, status: 'granted', canAskAgain: true },
  requestResult: { granted: true, status: 'granted', canAskAgain: true },
  nextId: 1,
  lastResponse: undefined,
};

module.exports = {
  __state: state,
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(async () => state.permission),
  requestPermissionsAsync: jest.fn(async () => {
    state.permission = state.requestResult;
    return state.permission;
  }),
  scheduleNotificationAsync: jest.fn(async () => `notif-${state.nextId++}`),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
  useLastNotificationResponse: jest.fn(() => state.lastResponse),
};
