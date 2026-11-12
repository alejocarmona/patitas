import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { usePreventRemove } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ¿Cambió el formulario desde que se cargó? `snapshot` es un string con los valores;
// la base se toma cuando `ready` pasa a true (en edición: al terminar de precargar).
export function useDirty(snapshot, ready = true) {
  const [base, setBase] = useState(null);
  useEffect(() => {
    if (ready && base === null) setBase(snapshot);
  }, [ready, base, snapshot]);
  return base !== null && base !== snapshot;
}

// Avisa "¿Descartar cambios?" al salir con cambios sin guardar (botón Atrás, gesto o Cancelar).
// Tras guardar, llamar `allowLeave()` antes de `router.back()` (además, mientras `dirty` sea false no frena).
export function useDiscardGuard(dirty) {
  return usePreventRemove(dirty, ({ repeat }) => {
    Alert.alert('¿Descartar cambios?', 'Si sales ahora, se pierde lo que escribiste.', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: repeat },
    ]);
  });
}

// Quita el error de un campo en cuanto deja de ser inválido (nunca agrega errores nuevos).
// `validate()` devuelve el mapa de errores actual; `deps`: los valores del formulario.
export function useClearErrorsWhenValid(errors, setErrors, validate, deps) {
  useEffect(() => {
    const keys = Object.keys(errors).filter((k) => errors[k]);
    if (keys.length === 0) return;
    const now = validate();
    const kept = {};
    for (const k of keys) if (now[k]) kept[k] = errors[k];
    if (Object.keys(kept).length !== keys.length) setErrors(kept);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Lleva el scroll al primer campo con error (y lo deja por debajo de la barra de estado).
export function useScrollToError(order) {
  const ref = useRef(null);
  const containerY = useRef(0);
  const ys = useRef({});
  const insets = useSafeAreaInsets();
  return {
    ref,
    onContainerLayout: (e) => {
      containerY.current = e.nativeEvent.layout.y;
    },
    field: (key) => ({
      onLayout: (e) => {
        ys.current[key] = e.nativeEvent.layout.y;
      },
    }),
    scrollToFirst: (errors) => {
      const k = order.find((key) => errors[key]);
      if (k === undefined || ys.current[k] === undefined) return;
      ref.current?.scrollTo?.({ y: Math.max(0, containerY.current + ys.current[k] - insets.top - 24), animated: true });
    },
  };
}
