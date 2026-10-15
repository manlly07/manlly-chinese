import { ArrowLeft, Check, ChevronLeft, ChevronRight, Mic, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/learning/EmptyState";
import { FavoriteButton } from "@/components/learning/FavoriteButton";
import { HanziText } from "@/components/learning/HanziText";
import { PinyinText } from "@/components/learning/PinyinText";
import { SpeakButton } from "@/components/learning/SpeakButton";
import { WordCard } from "@/components/learning/WordCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useVocab } from "@/hooks/use-vocab";
import { hanChars } from "@/lib/content";
import { POS_LABELS, TOPIC_LABELS } from "@/lib/labels";
import { sandhiSyllables } from "@/lib/pinyin";
import { cardStatus } from "@/lib/srs";
import { useProgress } from "@/store/progress";
import { useSettings } from "@/store/settings";
import { CharBreakdown } from "./components/CharBreakdown";

export default function WordDetailPage() {
  const { wordId = "" } = useParams();
  const id = decodeURIComponent(wordId);
  const navigate = useNavigate();
  const { words, loading } = useVocab();
  const card = useProgress((s) => s.cards[id]);
  const addCards = useProgress((s) => s.addCards);
  const showHanViet = useSettings((s) => s.showHanViet);
  const [showActual, setShowActual] = useState(false);

  const index = words.findIndex((w) => w.id === id);
  const word = words[index];

  const related = useMemo(() => {
    if (!word) return [];
    const chars = new Set(hanChars(word.hanzi));
    return words.filter((w) => w.id !== word.id && hanChars(w.hanzi).some((c) => chars.has(c))).slice(0, 6);
  }, [word, words]);

  useEffect(() => {
    setShowActual(false);
    window.scrollTo({ top: 0 });
  }, [id]);

  if (loading) return <Skeleton className="h-80 rounded-lg" />;
  if (!word)
    return (
      <EmptyState title="Không tìm thấy từ này" mood="sleepy" action={<Button asChild><Link to="/vocab">Về danh sách từ</Link></Button>} />
    );

  const syl = word.pinyin.split(/\s+/);
  const actual = sandhiSyllables(syl, hanChars(word.hanzi)).join(" ");
  const status = cardStatus(card);
  const prev = words[index - 1];
  const next = words[index + 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft /> Quay lại
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" disabled={!prev} aria-label="Từ trước" onClick={() => prev && navigate(`/vocab/${encodeURIComponent(prev.id)}`, { replace: true })}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" disabled={!next} aria-label="Từ sau" onClick={() => next && navigate(`/vocab/${encodeURIComponent(next.id)}`, { replace: true })}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-candy-pink via-candy-lilac to-candy-sky p-6 text-center md:p-8">
          <Badge variant="secondary" className="mb-3">
            HSK {word.hsk2}
          </Badge>
          <div>
            <HanziText variant="card">{word.hanzi}</HanziText>
          </div>
          <div className="mt-3 text-2xl">
            <PinyinText pinyin={showActual ? actual : word.pinyin} className="font-extrabold" />
          </div>
          {actual !== word.pinyin && (
            <button type="button" onClick={() => setShowActual((v) => !v)} className="mt-1 text-xs font-bold text-foreground/70 underline-offset-2 hover:underline">
              {showActual ? "Xem pinyin gốc" : "Xem cách đọc thực tế (biến điệu)"}
            </button>
          )}
          {showHanViet && word.hanViet && <p className="mt-2 text-sm font-black uppercase tracking-widest text-foreground/70">{word.hanViet}</p>}
        </div>
        <CardContent className="space-y-4 p-5 md:p-6">
          <div>
            <p className="text-xl font-extrabold">{word.meaning.join("; ")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {word.pos.map((p) => (
                <Badge key={p} variant="outline">
                  {POS_LABELS[p]}
                </Badge>
              ))}
              {word.topics.map((t) => (
                <Link key={t} to={`/vocab?topic=${t}`}>
                  <Badge variant="secondary">
                    {TOPIC_LABELS[t]?.emoji} {TOPIC_LABELS[t]?.label ?? t}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <SpeakButton text={word.hanzi} size="default" variant="secondary" label="Nghe" />
            <Button variant="outline" asChild>
              <Link to={`/pronunciation?tab=speak&w=${encodeURIComponent(word.id)}`}>
                <Mic /> Luyện nói
              </Link>
            </Button>
            {status === "new" ? (
              <Button
                onClick={() => {
                  addCards([word.id]);
                  toast.success("Đã thêm vào ôn tập", { description: "Từ này sẽ xuất hiện trong lượt ôn tiếp theo." });
                }}
              >
                <Plus /> Thêm vào ôn tập
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <Check /> {status === "mature" ? "Đã thuộc" : "Đang ôn tập"}
              </Button>
            )}
            <FavoriteButton id={word.id} className="border-2 border-input" />
          </div>
        </CardContent>
      </Card>

      {word.examples.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Câu ví dụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {word.examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
                <div className="min-w-0 flex-1">
                  <HanziText variant="inline" className="font-bold">
                    {ex.zh}
                  </HanziText>
                  <p className="font-pinyin text-sm font-semibold text-muted-foreground">{ex.py}</p>
                  <p className="font-semibold">{ex.vi}</p>
                </div>
                <SpeakButton text={ex.zh} label="Nghe câu" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-black">Chữ Hán trong từ</h2>
        <CharBreakdown word={word} />
      </section>

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-black">Từ liên quan</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {related.map((w) => (
              <WordCard key={w.id} word={w} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
