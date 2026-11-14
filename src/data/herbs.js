export const herbs = [
  { id: 'persil-plat', short: 'PPL', name: 'Persil plat', color: '#efcddd', ink: '#653449' },
  { id: 'persil-frise', short: 'PFR', name: 'Persil frisé', color: '#bcdcf4', ink: '#234968' },
  { id: 'basilic', short: 'BAS', name: 'Basilic', color: '#cbe1bd', ink: '#284329' },
  { id: 'basilic-thai', short: 'BTH', name: 'Basilic Thaï', color: '#f5aa80', ink: '#552c1b' },
  { id: 'aneth', short: 'ANE', name: 'Aneth', color: '#f3e4aa', ink: '#5b451b' },
  { id: 'ciboulette', short: 'CIB', name: 'Ciboulette', color: '#e4d9ee', ink: '#513b62' },
  { id: 'menthe', short: 'MEN', name: 'Menthe', color: '#c4ede4', ink: '#17473f' },
  { id: 'coriandre', short: 'COR', name: 'Coriandre', color: '#e0efa1', ink: '#3b4722' },
  { id: 'thym', short: 'THY', name: 'Thym', color: '#efd9cb', ink: '#603d2a' },
  { id: 'thym-citron', short: 'TCI', name: 'Thym Citron', color: '#ebca62', ink: '#554110' },
  { id: 'cerfeuil', short: 'CER', name: 'Cerfeuil', color: '#7ecdb9', ink: '#153f34' },
  { id: 'estragon', short: 'EST', name: 'Estragon', color: '#b99cef', ink: '#422765' },
  { id: 'laurier', short: 'LAU', name: 'Laurier', color: '#9eb0d2', ink: '#243650' },
  { id: 'origan', short: 'ORI', name: 'Origan', color: '#78c1ee', ink: '#143b56' },
  { id: 'romarin', short: 'ROM', name: 'Romarin', color: '#cccad9', ink: '#3f3c54' },
  { id: 'sauge', short: 'SAU', name: 'Sauge', color: '#b9b2a3', ink: '#363126' },
  { id: 'mix-herbes-grill', short: 'MIX', name: 'Mix Herbes Grill', color: '#f08d9b', ink: '#55242e' },
];

export const herbById = Object.fromEntries(herbs.map((herb) => [herb.id, herb]));

export function herbStyle(herb) {
  return { '--herb-color': herb.color, '--herb-ink': herb.ink };
}
