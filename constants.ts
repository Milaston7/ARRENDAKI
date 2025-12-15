
export const PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cubango", 
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", 
  "Icolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul", 
  "Malanje", "Moxico", "Cassai-Zambeze", "Namibe", "Uíge", "Zaire"
];

export const PROPERTY_TYPES = [
  "Apartamento", "Vivenda", "Prédio Urbano", "Escritório", "Loja", "Terreno", "Prédio Rústico"
];

export const AMENITIES = [
  "Gerador Próprio", "Água da Rede", "Tanque de Água", 
  "Estacionamento", "Segurança 24h", "Internet Fibra", 
  "Ar Condicionado", "Cozinha Montada"
];

export const MUNICIPALITIES_MOCK: Record<string, string[]> = {
  "Luanda": ["Belas", "Cacuaco", "Cazenga", "Luanda", "Kilamba Kiaxi", "Talatona", "Viana"],
  "Benguela": ["Lobito", "Benguela", "Baía Farta", "Catumbela"],
  "Huambo": ["Huambo", "Caála", "Bailundo"],
  // Add generics for others for MVP
  "Default": ["Centro", "Periferia", "Zona Norte", "Zona Sul"]
};

export const LISTING_FEE = 3000; // AOA
export const TRANSACTION_FEE_PERCENT = 2.5;
