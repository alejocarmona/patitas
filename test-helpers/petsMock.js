// Simulaciones de usePets y useAllPetsCartilla para las pruebas de pantallas (una sola mascota).
exports.petsHook = (pet) => ({ pet, pets: pet ? [pet] : [], selectPet: () => {}, canAdd: true });
exports.allPetsCartillaEmpty = () => ({ useAllPetsCartilla: () => ({ data: {}, ready: true }) });
