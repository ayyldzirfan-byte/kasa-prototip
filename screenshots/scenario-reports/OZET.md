# Kasam Test Özeti
Tarih: 13.06.2026

## Senaryo Sonuçları
| Senaryo | Kullanıcı sayısı | Süre | Toplam hareket | Oyun sayısı | Durum |
|---|---:|---|---:|---:|---|
| Türk Aile Bütçesi | 4 | 2026-04-01 - 2026-06-30 | 56 | 2 | PASS |
| Üniversite Ev Arkadaşları | 2 | 2026-04-01 - 2026-06-30 | 35 | 2 | PASS |
| Çalışan Ev Arkadaşları | 3 | 2026-04-01 - 2026-06-30 | 41 | 2 | PASS |
| Yeni Evli İkisi de Çalışıyor | 2 | 2026-04-01 - 2026-06-30 | 42 | 2 | PASS |
| Yeni Evli Tek Gelir | 2 | 2026-04-01 - 2026-06-30 | 26 | 2 | PASS |
| İki Kadın Arkadaş Tatil Hedefi | 2 | 2026-03-01 - 2026-06-30 | 15 | 2 | PASS |
| Lise Öğrencisi PlayStation Hedefi | 1 | 2026-03-01 - 2026-06-30 | 30 | 2 | PASS |
| Araç Değişimi Tasarrufu | 1 | 2025-07-01 - 2026-06-30 | 56 | 2 | PASS |

## Genel PASS/FAIL
Toplam test: 58
Geçen: 58
Başarısız: 0

## Öne Çıkan Bulgular
- Ortak kasalarda paylaştırma oranları test verisine açık şekilde yazıldı.
- Tek gelirli aile ve araç hedefi senaryolarında hedef tutarı ile gerçekçi birikim farkı özellikle görünür bırakıldı.
- Tahmin oyunu verileri tamamlanmış akış olarak işlendi; tek kullanıcılı kasalarda oyun kaydı kendi kendine test formatında tutuldu.

## Beta İçin Notlar
- Beta kullanıcısına kişisel kasa yansıması, ortak kasa payı ve oyun bildirim mantığı aynı veriyle gösterilebilir.
- Ekstre, hedef, hesaplaşma, planlı ödeme ve koç kartları tüm test setinde en az bir kez temsil ediliyor.
- Canlı çoklu cihaz Supabase davranışı ayrıca gerçek hesaplarla doğrulanmalı; bu paket uygulama içi seed ve rapor doğrulamasıdır.

## Global Kontroller
- PASS - 8 senaryo üretildi
- PASS - testScenario=all aktif kullanıcı Mehmet
- PASS - Kasa kodları tekil
- PASS - Tüm senaryolarda en az 2 oyun var
- PASS - Hedef özelliği kullanıldı
- PASS - Tepki özelliği kullanıldı
- PASS - Ekstre özelliği kullanıldı
- PASS - Hesaplaşma özelliği kullanıldı
- PASS - Planlı ödeme özelliği kullanıldı
- PASS - Koç/insight özelliği kullanıldı