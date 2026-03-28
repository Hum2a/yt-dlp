import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { DownloadOptionsState } from '@/lib/downloadOptions';

const selectClass =
  'border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50';

type Props = {
  value: DownloadOptionsState;
  onChange: (next: DownloadOptionsState) => void;
};

function patch<K extends keyof DownloadOptionsState>(
  value: DownloadOptionsState,
  onChange: Props['onChange'],
  key: K,
  v: DownloadOptionsState[K],
) {
  onChange({ ...value, [key]: v });
}

export function DownloadOptionsForm({ value, onChange }: Props) {
  const p = <K extends keyof DownloadOptionsState>(key: K, v: DownloadOptionsState[K]) =>
    patch(value, onChange, key, v);

  return (
    <Accordion type="multiple" className="w-full" defaultValue={['format', 'playlist', 'subs']}>
      <AccordionItem value="format">
        <AccordionTrigger>Format & output</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fmt-preset">Quality preset</Label>
            <select
              id="fmt-preset"
              className={selectClass}
              value={value.formatPreset}
              onChange={(e) => p('formatPreset', e.target.value as DownloadOptionsState['formatPreset'])}
            >
              <option value="best">Best (video + audio)</option>
              <option value="best_1080">Best up to 1080p</option>
              <option value="best_720">Best up to 720p</option>
              <option value="best_480">Best up to 480p</option>
              <option value="audio">Audio only (no remux)</option>
              <option value="custom">Custom format string</option>
            </select>
          </div>
          {value.formatPreset === 'custom' ? (
            <div className="space-y-2">
              <Label htmlFor="fmt-custom">Custom -f string</Label>
              <Input
                id="fmt-custom"
                className="font-mono text-xs"
                placeholder="bv*+ba/b"
                value={value.formatCustom}
                onChange={(e) => p('formatCustom', e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                See the FAQ page for format syntax. Server allowlists options only—output path is always fixed.
              </p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="merge-fmt">Merge container (when video+audio merge)</Label>
            <select
              id="merge-fmt"
              className={selectClass}
              value={value.mergeOutputFormat}
              onChange={(e) => p('mergeOutputFormat', e.target.value as DownloadOptionsState['mergeOutputFormat'])}
            >
              <option value="">(default)</option>
              <option value="mp4">mp4</option>
              <option value="mkv">mkv</option>
              <option value="webm">webm</option>
              <option value="mov">mov</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="pref-free"
                checked={value.preferFreeFormats}
                onCheckedChange={(v) => p('preferFreeFormats', v === true)}
              />
              <Label htmlFor="pref-free" className="font-normal">
                Prefer free formats
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="restrict-fn"
                checked={value.restrictFilenames}
                onCheckedChange={(v) => p('restrictFilenames', v === true)}
              />
              <Label htmlFor="restrict-fn" className="font-normal">
                Restrict filenames
              </Label>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="extract-audio"
                checked={value.extractAudio}
                onCheckedChange={(v) => p('extractAudio', v === true)}
              />
              <Label htmlFor="extract-audio" className="font-normal">
                Extract audio with FFmpeg (after download)
              </Label>
            </div>
            {value.extractAudio ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="audio-codec">Audio codec</Label>
                  <select
                    id="audio-codec"
                    className={selectClass}
                    value={value.audioCodec}
                    onChange={(e) => p('audioCodec', e.target.value)}
                  >
                    <option value="mp3">mp3</option>
                    <option value="m4a">m4a</option>
                    <option value="opus">opus</option>
                    <option value="vorbis">vorbis</option>
                    <option value="wav">wav</option>
                    <option value="flac">flac</option>
                    <option value="alac">alac</option>
                    <option value="aac">aac</option>
                    <option value="best">best</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audio-q">Quality (e.g. kbps for mp3)</Label>
                  <Input
                    id="audio-q"
                    value={value.audioQuality}
                    onChange={(e) => p('audioQuality', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="playlist">
        <AccordionTrigger>Playlist</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="no-pl"
              checked={value.noplaylist}
              onCheckedChange={(v) => p('noplaylist', v === true)}
            />
            <Label htmlFor="no-pl" className="font-normal">
              Download single video only (ignore playlist)
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-items">Playlist items (yt-dlp syntax)</Label>
            <Input
              id="pl-items"
              placeholder="e.g. 1:10,15,18:24"
              value={value.playlistItems}
              onChange={(e) => p('playlistItems', e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="subs">
        <AccordionTrigger>Subtitles</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="wsub"
                checked={value.writesubtitles}
                onCheckedChange={(v) => p('writesubtitles', v === true)}
              />
              <Label htmlFor="wsub" className="font-normal">
                Write subtitles
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="wasub"
                checked={value.writeautomaticsub}
                onCheckedChange={(v) => p('writeautomaticsub', v === true)}
              />
              <Label htmlFor="wasub" className="font-normal">
                Auto captions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="embsub"
                checked={value.embedsubtitles}
                onCheckedChange={(v) => p('embedsubtitles', v === true)}
              />
              <Label htmlFor="embsub" className="font-normal">
                Embed in video
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-lang">Subtitle languages</Label>
            <Input
              id="sub-lang"
              placeholder="en.*,ja"
              value={value.subtitleslangs}
              onChange={(e) => p('subtitleslangs', e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="meta">
        <AccordionTrigger>Thumbnails & metadata</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="wthumb"
                checked={value.writethumbnail}
                onCheckedChange={(v) => p('writethumbnail', v === true)}
              />
              <Label htmlFor="wthumb" className="font-normal">
                Thumbnail file
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="emthumb"
                checked={value.embedthumbnail}
                onCheckedChange={(v) => p('embedthumbnail', v === true)}
              />
              <Label htmlFor="emthumb" className="font-normal">
                Embed thumbnail
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="wjson"
                checked={value.writeinfojson}
                onCheckedChange={(v) => p('writeinfojson', v === true)}
              />
              <Label htmlFor="wjson" className="font-normal">
                info.json
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="wdesc"
                checked={value.writedescription}
                onCheckedChange={(v) => p('writedescription', v === true)}
              />
              <Label htmlFor="wdesc" className="font-normal">
                Description file
              </Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="sponsor">
        <AccordionTrigger>SponsorBlock</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="no-sb"
              checked={value.noSponsorblock}
              onCheckedChange={(v) => p('noSponsorblock', v === true)}
            />
            <Label htmlFor="no-sb" className="font-normal">
              Disable SponsorBlock entirely
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-remove">Remove categories</Label>
            <Textarea
              id="sb-remove"
              className="min-h-[72px] font-mono text-xs"
              placeholder="e.g. default  or  sponsor,intro,outro"
              value={value.sponsorblockRemove}
              onChange={(e) => p('sponsorblockRemove', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-mark">Mark categories (chapters)</Label>
            <Input
              id="sb-mark"
              className="font-mono text-xs"
              placeholder="all,-preview"
              value={value.sponsorblockMark}
              onChange={(e) => p('sponsorblockMark', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-chap">Chapter title template (optional)</Label>
            <Input
              id="sb-chap"
              className="font-mono text-xs"
              value={value.sponsorblockChapterTitle}
              onChange={(e) => p('sponsorblockChapterTitle', e.target.value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="net">
        <AccordionTrigger>Network & geo</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proxy">Proxy URL</Label>
            <Input
              id="proxy"
              type="url"
              placeholder="http://host:port"
              className="font-mono text-xs"
              value={value.proxy}
              onChange={(e) => p('proxy', e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sock-to">Socket timeout (seconds)</Label>
              <Input
                id="sock-to"
                inputMode="numeric"
                value={value.socketTimeout}
                onChange={(e) => p('socketTimeout', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries">Retries</Label>
              <Input
                id="retries"
                inputMode="numeric"
                value={value.retries}
                onChange={(e) => p('retries', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frag-ret">Fragment retries</Label>
              <Input
                id="frag-ret"
                inputMode="numeric"
                value={value.fragmentRetries}
                onChange={(e) => p('fragmentRetries', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conc-frag">Concurrent fragments</Label>
              <Input
                id="conc-frag"
                inputMode="numeric"
                value={value.concurrentFragments}
                onChange={(e) => p('concurrentFragments', e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="geo"
                checked={value.geoBypass}
                onCheckedChange={(v) => p('geoBypass', v === true)}
              />
              <Label htmlFor="geo" className="font-normal">
                Geo bypass
              </Label>
            </div>
            <div className="min-w-[120px] flex-1 space-y-2">
              <Label htmlFor="geo-cc">Country code</Label>
              <Input
                id="geo-cc"
                placeholder="US"
                maxLength={2}
                className="font-mono uppercase"
                value={value.geoBypassCountry}
                onChange={(e) => p('geoBypassCountry', e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
