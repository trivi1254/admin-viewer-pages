const GRADIENTS = [
  'from-blue-600/30 to-indigo-800/30',
  'from-violet-600/30 to-purple-800/30',
  'from-amber-600/30 to-orange-800/30',
  'from-green-600/30 to-emerald-800/30',
  'from-cyan-600/30 to-teal-800/30',
  'from-rose-600/30 to-pink-800/30',
  'from-slate-600/30 to-gray-800/30',
];

export function productGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}
