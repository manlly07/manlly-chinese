/** Đọc tiếng Trung bằng Web Speech API. Luôn gửi chữ Hán, không gửi pinyin. */

export const isSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

const isChinese = (v: SpeechSynthesisVoice) => /^(zh|cmn)([-_](CN|Hans))?/i.test(v.lang) && !/HK|TW|yue/i.test(v.lang);

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** Danh sách giọng (Chrome nạp giọng bất đồng bộ). */
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([]);
  const now = speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  voicesPromise ??= new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
  return voicesPromise;
}

export async function getChineseVoices(): Promise<SpeechSynthesisVoice[]> {
  return (await getVoices()).filter(isChinese);
}

export async function hasChineseVoice(): Promise<boolean> {
  return (await getChineseVoices()).length > 0;
}

async function pickVoice(voiceURI?: string): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await getChineseVoices();
  return voices.find((v) => v.voiceURI === voiceURI) ?? voices.find((v) => /zh[-_]CN/i.test(v.lang)) ?? voices[0];
}

export interface SpeakOptions {
  rate?: number;
  voiceURI?: string;
  /** cao độ giọng (0.5–2) — dùng để phân biệt người nói trong hội thoại */
  pitch?: number;
}

/** Đọc `text` (chữ Hán). Trả về Promise kết thúc khi đọc xong hoặc bị huỷ. */
export async function speak(text: string, { rate = 0.9, voiceURI, pitch = 1 }: SpeakOptions = {}): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return;
  const voice = await pickVoice(voiceURI);
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? "zh-CN";
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = pitch;
  return new Promise((resolve) => {
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (isSpeechSupported()) speechSynthesis.cancel();
}

/** Hướng dẫn cài giọng tiếng Trung khi máy không có. */
export const VOICE_HELP: { platform: string; steps: string }[] = [
  { platform: "Windows", steps: "Cài đặt → Thời gian và ngôn ngữ → Ngôn ngữ → Thêm ngôn ngữ → 中文(中华人民共和国), chọn cài “Giọng nói”." },
  { platform: "Android", steps: "Cài đặt → Hệ thống → Ngôn ngữ → Đầu ra chuyển văn bản thành giọng nói → Google → Cài đặt dữ liệu giọng nói → Tiếng Trung." },
  { platform: "iPhone/iPad", steps: "Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung (Trung Quốc đại lục)." },
  { platform: "macOS", steps: "Cài đặt hệ thống → Trợ năng → Nội dung được đọc → Giọng hệ thống → Quản lý giọng → Tiếng Trung (Trung Quốc đại lục)." },
];
