# Kasam Rapor Senaryo Çıktıları

Test tarihi: 2026-06-10

## Bireysel kullanıcı + ortak bütçe payı

| Dönem | Giren | Çıkan | Net | Önceki net | Fark | Hareket sayısı |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| day | 300 TL | 620 TL | -320 TL | -800 TL | 480 TL | 3 |
| week | 300 TL | 13.420 TL | -13.120 TL | 33.500 TL | -46.620 TL | 5 |
| month | 35.300 TL | 14.920 TL | 20.380 TL | 19.800 TL | 580 TL | 7 |
| all | 68.300 TL | 28.120 TL | 40.180 TL | 0 TL | 40.180 TL | 10 |

## Günlük detay satırları

- 2026-06-10 / Kahve / expense: 120 TL
- 2026-06-10 / Ortak market / expense: 500 TL (ortak hareket toplamı 1.000 TL)
- 2026-06-10 / Ortak katkı / income: 300 TL (ortak hareket toplamı 600 TL)

## Diğer ortak kullanıcı günlük etkisi

- Giren: 300 TL
- Çıkan: 500 TL
- Net: -200 TL

## Kontrol notları

- Günlük raporda 1.000 TL ortak market giderinin kişisel etkisi 500 TL olarak görünüyor.
- Günlük raporda 600 TL ortak katkının kişisel etkisi 300 TL olarak görünüyor.
- Haftalık ve aylık raporlar aynı kişisel etki mantığını topluyor.
- Para formatı noktalı Türkçe formatta: 1.000 TL, 35.000 TL, 14.920 TL.
- Tema testi manuel koyu modu `data-theme=dark` olarak uyguladı.
