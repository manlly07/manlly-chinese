---
name: chinese-content-conventions
description: Quy ước tiếng Trung cho dự án — pinyin, dấu thanh, biến điệu, màu thanh, Hán Việt, giản thể, đọc TTS. Dùng mỗi khi viết, sửa hoặc hiển thị bất kỳ nội dung tiếng Trung nào (từ vựng, câu ví dụ, bài học, UI hiển thị pinyin).
---

# Quy ước nội dung tiếng Trung

## Chữ viết
- Chỉ dùng **giản thể** (学 không phải 學). Dấu câu Trung toàn khổ: `，。？！：；“”`.
- Không chèn dấu cách giữa các chữ Hán.

## Pinyin
- Luôn dùng **dấu thanh** (nǐ hǎo), không dùng số (ni3 hao3) trong nội dung hiển thị.
- Trong dữ liệu từ vựng (`pinyin` của word): **các âm tiết cách nhau 1 dấu cách** — `"xué xí"` — để tô màu từng âm tiết.
- Trong câu ví dụ (`py`): viết theo từ (xuéxí), viết hoa đầu câu & tên riêng, giữ dấu câu Latin: `"Wǒ zài xuéxí Hànyǔ."`
- Vị trí dấu: a/e nhận dấu trước; trong "ou" dấu lên o; còn lại dấu lên nguyên âm cuối (guì, liù).
- ü: viết `ü` sau n/l (nǚ, lǜ); sau j/q/x/y viết `u` (qù, yuè).
- Dấu cách âm `'` trước âm tiết bắt đầu bằng a/o/e khi đứng giữa từ: Xī'ān, tiān'ānmén.
- Thanh nhẹ: không dấu (māma, xuésheng, shénme).
- **Ghi thanh gốc, không ghi thanh biến điệu** trong dữ liệu: 你好 = "nǐ hǎo" (đọc thực là ní hǎo). 一/不 ghi yī/bù.
  Việc hiển thị biến điệu (nếu có) do UI/lib xử lý, kèm ghi chú "đọc thực tế".

## Quy tắc biến điệu (để dạy & để lib tính)
1. 3 + 3 → 2 + 3 (你好 ní hǎo).
2. 不 bù + thanh 4 → bú (不是 bú shì).
3. 一 yī: + thanh 4 → yí (一个 yí ge); + thanh 1/2/3 → yì (一天 yì tiān); đếm số/cuối từ giữ yī.

## Màu thanh điệu (token Tailwind)
| Thanh | Token | Ý nghĩa |
|---|---|---|
| 1 ˉ | `text-tone-1` (đỏ) | ngang cao |
| 2 ˊ | `text-tone-2` (xanh lá) | đi lên |
| 3 ˇ | `text-tone-3` (xanh dương) | xuống rồi lên |
| 4 ˋ | `text-tone-4` (tím) | đi xuống mạnh |
| nhẹ | `text-tone-5` (xám) | ngắn, nhẹ |
Màu là phụ trợ — dấu thanh luôn phải hiển thị.

## Hán Việt
- Ghi âm Hán Việt **chữ thường, cách nhau dấu cách, theo thứ tự chữ**: 学习 → "học tập", 中国 → "trung quốc".
- Chỉ ghi khi chắc chắn. Chữ có nhiều âm → chọn âm đúng nghĩa trong từ (行 hàng/hành).
- Từ thuần Trung/khẩu ngữ không có âm tương ứng hợp lý (吗, 呢, 的) → để `""`.
- Không nhầm Hán Việt với nghĩa: 东西 dōngxi = "đông tây" (HV), nghĩa = "đồ vật".

## Nghĩa tiếng Việt
- Ngắn gọn, nghĩa phổ biến nhất trước; mảng `meaning` tối đa ~3 nghĩa cho thẻ.
- Lượng từ ghi "(lượng từ) cái, chiếc…" và có ví dụ đi kèm danh từ.
- Câu dịch ví dụ: tự nhiên kiểu người Việt nói, không dịch word-by-word.

## Đọc TTS
- Gửi **chữ Hán**, không gửi pinyin cho `speechSynthesis` (đọc pinyin sẽ ra giọng Latin).
- Để đọc một âm tiết với thanh cụ thể, dùng chữ ví dụ có sẵn trong `pinyin.json` (mā→妈, má→麻, mǎ→马, mà→骂).
- Chữ đa âm (行, 长, 了, 得) đọc riêng lẻ có thể sai → ưu tiên đọc cả từ/câu chứa nó.

## Kiểm tra trước khi xong
- [ ] Giản thể, dấu câu Trung đúng
- [ ] Pinyin có dấu, đúng vị trí, số âm tiết = số chữ (trừ 儿化 như 一点儿 yìdiǎnr)
- [ ] Hán Việt khớp số chữ hoặc để trống
- [ ] `node scripts/validate-content.mjs` pass
