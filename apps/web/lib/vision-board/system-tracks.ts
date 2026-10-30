export interface SystemTrack {
  id: string;
  url: string;
}

// Faixas ambiente royalty-free, em loop, hospedadas como arquivos estáticos
// (apps/web/public/audio/system/) — label/descrição vêm do i18n
// (visionBoard.audioPicker.tracks.<id>), não hardcoded aqui.
export const SYSTEM_TRACKS: SystemTrack[] = [
  { id: 'calm-depth', url: '/audio/system/calm-depth.mp3' },
  { id: 'focus', url: '/audio/system/focus.mp3' },
  { id: 'sunrise', url: '/audio/system/sunrise.mp3' },
  { id: 'ocean', url: '/audio/system/ocean.mp3' },
];
