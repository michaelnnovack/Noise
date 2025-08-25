import { SoundCategory } from '@/types';

export const SOUND_CATEGORIES: SoundCategory[] = [
  {
    name: 'Whisper',
    range: [0, 30],
    color: 'bg-green-500',
    examples: ['Library, soft whisper']
  },
  {
    name: 'Quiet',
    range: [30, 50],
    color: 'bg-green-400',
    examples: ['Quiet home, light rain']
  },
  {
    name: 'Normal',
    range: [50, 70],
    color: 'bg-yellow-400',
    examples: ['Normal conversation, office']
  },
  {
    name: 'Loud',
    range: [70, 90],
    color: 'bg-orange-500',
    examples: ['Traffic, vacuum cleaner']
  },
  {
    name: 'Very Loud',
    range: [90, 110],
    color: 'bg-red-500',
    examples: ['Motorcycle, power tools']
  },
  {
    name: 'Dangerous',
    range: [110, 200],
    color: 'bg-red-700',
    examples: ['Rock concert, jet engine']
  }
];

export const DEFAULT_WARNING_THRESHOLD = 85;

export const getCategoryForDecibel = (decibel: number): SoundCategory => {
  return SOUND_CATEGORIES.find(
    category => decibel >= category.range[0] && decibel < category.range[1]
  ) || SOUND_CATEGORIES[SOUND_CATEGORIES.length - 1];
};