// Proveedor de ingreso de un usuario de Firebase Auth: 'password' | 'google' | 'other'.
export function authProviderOf(user) {
  const ids = (user?.providerData ?? []).map((p) => p.providerId);
  if (ids.includes('password')) return 'password';
  if (ids.includes('google.com')) return 'google';
  return 'other';
}
