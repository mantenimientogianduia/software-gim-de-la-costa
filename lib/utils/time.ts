export function formatMs(ms: number, showMs: boolean = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  let result = '';
  if (hours > 0) {
    result += `${pad(hours)}:`;
  }
  result += `${pad(minutes)}:${pad(seconds)}`;

  if (showMs) {
    result += `.${pad(centiseconds)}`;
  }

  return result;
}
