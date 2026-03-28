/** Client-side download options; mapped to snake_case for the API / YoutubeDL allowlist. */
export type DownloadOptionsState = {
  formatPreset: 'best' | 'best_1080' | 'best_720' | 'best_480' | 'audio' | 'custom';
  formatCustom: string;
  noplaylist: boolean;
  playlistItems: string;
  mergeOutputFormat: '' | 'mp4' | 'mkv' | 'webm' | 'mov';
  preferFreeFormats: boolean;
  restrictFilenames: boolean;
  writesubtitles: boolean;
  writeautomaticsub: boolean;
  subtitleslangs: string;
  embedsubtitles: boolean;
  writethumbnail: boolean;
  embedthumbnail: boolean;
  writeinfojson: boolean;
  writedescription: boolean;
  noSponsorblock: boolean;
  sponsorblockRemove: string;
  sponsorblockMark: string;
  sponsorblockChapterTitle: string;
  extractAudio: boolean;
  audioCodec: string;
  audioQuality: string;
  proxy: string;
  socketTimeout: string;
  retries: string;
  fragmentRetries: string;
  concurrentFragments: string;
  geoBypass: boolean;
  geoBypassCountry: string;
};

export const defaultDownloadOptions = (): DownloadOptionsState => ({
  formatPreset: 'best',
  formatCustom: '',
  noplaylist: false,
  playlistItems: '',
  mergeOutputFormat: '',
  preferFreeFormats: false,
  restrictFilenames: false,
  writesubtitles: false,
  writeautomaticsub: false,
  subtitleslangs: 'en.*',
  embedsubtitles: false,
  writethumbnail: false,
  embedthumbnail: false,
  writeinfojson: false,
  writedescription: false,
  noSponsorblock: false,
  sponsorblockRemove: '',
  sponsorblockMark: '',
  sponsorblockChapterTitle: '',
  extractAudio: false,
  audioCodec: 'mp3',
  audioQuality: '192',
  proxy: '',
  socketTimeout: '',
  retries: '',
  fragmentRetries: '',
  concurrentFragments: '',
  geoBypass: false,
  geoBypassCountry: '',
});

export function downloadOptionsToApiPayload(o: DownloadOptionsState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    format_preset: o.formatPreset,
    noplaylist: o.noplaylist,
    writesubtitles: o.writesubtitles,
    writeautomaticsub: o.writeautomaticsub,
    embedsubtitles: o.embedsubtitles,
    writethumbnail: o.writethumbnail,
    embedthumbnail: o.embedthumbnail,
    writeinfojson: o.writeinfojson,
    writedescription: o.writedescription,
    no_sponsorblock: o.noSponsorblock,
    extract_audio: o.extractAudio,
    prefer_free_formats: o.preferFreeFormats,
    restrictfilenames: o.restrictFilenames,
    geo_bypass: o.geoBypass,
  };

  if (o.formatCustom.trim()) {
    payload.format_custom = o.formatCustom.trim();
  }
  if (o.playlistItems.trim()) {
    payload.playlist_items = o.playlistItems.trim();
  }
  if (o.mergeOutputFormat) {
    payload.merge_output_format = o.mergeOutputFormat;
  }
  if (o.subtitleslangs.trim()) {
    payload.subtitleslangs = o.subtitleslangs.trim();
  }
  if (o.sponsorblockRemove.trim()) {
    payload.sponsorblock_remove = o.sponsorblockRemove.trim();
  }
  if (o.sponsorblockMark.trim()) {
    payload.sponsorblock_mark = o.sponsorblockMark.trim();
  }
  if (o.sponsorblockChapterTitle.trim()) {
    payload.sponsorblock_chapter_title = o.sponsorblockChapterTitle.trim();
  }
  if (o.extractAudio) {
    payload.audio_codec = o.audioCodec;
    payload.audio_quality = o.audioQuality;
  }
  if (o.proxy.trim()) {
    payload.proxy = o.proxy.trim();
  }
  if (o.socketTimeout.trim()) {
    const n = Number(o.socketTimeout);
    if (!Number.isNaN(n)) {
      payload.socket_timeout = n;
    }
  }
  if (o.retries.trim()) {
    const n = Number(o.retries);
    if (!Number.isNaN(n)) {
      payload.retries = n;
    }
  }
  if (o.fragmentRetries.trim()) {
    const n = Number(o.fragmentRetries);
    if (!Number.isNaN(n)) {
      payload.fragment_retries = n;
    }
  }
  if (o.concurrentFragments.trim()) {
    const n = Number(o.concurrentFragments);
    if (!Number.isNaN(n)) {
      payload.concurrent_fragment_downloads = n;
    }
  }
  if (o.geoBypassCountry.trim()) {
    payload.geo_bypass_country = o.geoBypassCountry.trim().toUpperCase();
  }

  return payload;
}
