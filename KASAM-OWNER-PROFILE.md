# Kasam — Proje Sahibi Profili
Son güncelleme: 2026-06-14 — Kural sistemi ve simülasyon hazırlığı

## Tasarım Tercihleri

### Bunu yap
- Ekranları sade tut; aynı bilgiyi ikinci kez sorma veya ikinci kez gösterme.
- Ana işlevleri önce çalışır hale getir: hareket kaydı, ortak kasaya yansıma, bildirim, oyun gizliliği, bakiye.
- WhatsApp benzeri medya seçici kullan: emoji, GIF ve sticker tek kompakt alanda açılmalı.
- Tab bar her zaman görünür olmalı; ikonların altında açıklama yazmalı.
- Profil ve kasa resimleri tıklanınca büyümeli.
- Fiş ve rapor ekranları premium, temiz, okunabilir ve ayrı sayfa hissi vermeli.

### Bunu yapma
- Sarı zemin üzerine beyaz yazı kullanma.
- Kullanıcıdan zaten hareket formunda alınan bilgiyi tahmin oyunu alanında tekrar isteme.
- Örnek kullanıcı adlarını, örnek harcama başlıklarını veya sohbet içi şakaları uygulamanın sabit içeriğine koyma.
- “Bulut senkron”, “Oturum”, “Onay modu” gibi kullanıcıya değer katmayan teknik ifadeleri görünür metin yapma.
- Ortak kasa problemini sadece görsel testle geçti sayma; çok kullanıcı simülasyonu olmadan doğrulanmış kabul etme.
- Kayıt butonuna tekrar basılabilecek, kullanıcının kayıt durumunu anlayamadığı akış bırakma.
- Ana ekranda uzun paylaşım dökümü gösterme; kullanıcı kendi kasasına yansıyan net sonucu görmeli.

## Dil ve Ton Tercihleri

### Bunu yap
- Kısa, doğrudan, günlük Türkçe kullan.
- Finansal metinlerde netlik öncelikli olsun: Gelir, Gider, Beklenen gelir, Yaklaşan ödeme.
- Kullanıcıya test sonucu verirken PASS/FAIL ve gerçek beklenen değerleri yaz.

### Bunu yapma
- “Mükemmel”, “Harika”, “Tabii ki” gibi yapay destek dili kullanma.
- Uzun plan metinlerini kullanıcı istemedikçe yazma.
- “Oldu” deme; hangi testin geçtiğini söyle.
- Vercel production deploy'unu local test koşucusuna çevirme; deploy sadece paket üretmeli, kalite kanıtı ayrı raporlanmalı.

## Özellik Öncelikleri

### Önce bunlar
- Ortak kasaya eklenen hareketin tüm ilgili kullanıcılara görünmesi.
- Ortak hareketin her kullanıcının kişisel kasasına doğru payla yansıması.
- Bildirimlerin diğer kullanıcılara düşmesi.
- Sürpriz/tahmin oyunu bitmeden detayların gizli kalması.
- Açık hareket kaydının tek kez oluşması ve hareket listesinde görünmesi.
- Ortak kasa ve bildirim için gerçek cloud/realtime davranışının simulator veya çok oturumlu testle kanıtlanması.

### Sonraya bunlar
- Ekstre analizi.
- AI finansal koç.
- Ödeme entegrasyonu.
- Gelişmiş sticker/GIF paketleri.

### Gereksiz bulunanlar
- Ekranı kalabalıklaştıran tekrar alanları.
- App içinde sabit örnek senaryo isimleri.
- Profil sayfasında tahmin cevabı tarzı gibi ana değişkenler.
- Eski prototip kopyaları ve iki farklı uygulama var hissi veren deploy kalıntıları.

## Çalışma Tarzı
- Komut boyutu tercihi: Kapsam kullanıcı tarafından parça parça verilir; `haydee` denene kadar işlem başlatılmaz.
- Onay noktaları: Kullanıcı “haydee” dediğinde beklemeden uygula; ara onay isteme.
- Kontrol yöntemi: Test çıktısı, simülasyon logu ve gerektiğinde ekran görüntüsü.
- “Dur bu olmadı” dediği durumlar: Ekran kalabalığı, sarı/beyaz kontrast, ortak kasa senkronunun çalışmaması, testin gerçek veriye dayanmaması.
- Deploy kontrol yöntemi: Vercel build Ready olmadan canlı sürüm doğrulanmış sayılmaz; build Error ise önce deploy logu ve build komutu kontrol edilir.

## Tekrarlayan Hatalar
- Ortak kasa hareketleri diğer kullanıcılara gitmedi — birden fazla görevde tekrarlandı.
- Bildirimler diğer kullanıcılara düşmedi — birden fazla görevde tekrarlandı.
- Hareket kaydı görsel kilit olmadan birden fazla kez oluşturuldu — kritik kayıt akışı hatası.
- Ana ekran hareket satırlarında paylaşım listesi fazla uzun ve bağlam dışı göründü — kişisel/ortak kasa şablonları ayrılmalı.
- Ortak hareket cloud alanları eksik taşındı — local çalışan komut gerçek cihazlar arası senkronu kanıtlamaz.
- Vercel build'e tüm test kapılarının bağlanması production deploy'u kırdı — local kalite kapısı ile deploy paketi ayrılmalı.
- Simülatör başlangıçta sadece mesaj gönderimini PASS saydı — artık yayılım, bildirim ve kişisel pay değişimi ayrı doğrulanmalı.
- Sarı zemin beyaz yazı kaldı — birden fazla UI düzeltmesinde tekrarlandı.
- Tahmin oyunu detayları yanlış yerde veya fazla alanda gösterildi — birden fazla kez düzeltme istendi.
- Test senaryoları gerçek uygulama state’ine bağlanmadan raporlandı — canlı test ihtiyacı tekrarlandı.
- Türkçe metinlerde anlamı belirsiz veya teknik ifadeler kaldı — tekrarlandı.

## Karar Verme Tarzı
- Hız: Uygulama hızlı ilerlesin ister, ama temel işlevler bozuksa hız kabul edilebilir değildir.
- Detay: Uzun teori değil, çalışır sonuç ve kanıt ister.
- Yeterli kriteri: Gerçekçi çok kullanıcı senaryosunda hareket, bildirim, oyun ve bakiye birlikte doğru çalışır.

## Hiç Sorma, Direkt Yap
- Sarı zemin üzerindeki beyaz yazıyı düzelt.
- `Giren/Çıkan` metinlerini `Gelir/Gider` yap.
- Tab bar kaybolursa sabitle.
- Örnek içerikleri uygulama sabitlerinden çıkar.
- Test modunda auth bypass bozulursa düzelt.
- Ortak kasa değişikliklerinde simülasyon veya çok kullanıcı testi ekle.
- Gercek cloud cok kullanici veya sifre reset kaniti eksikse final sonucu PASS gibi anlatma; eksik kullanici aksiyonunu ayri yaz.

## Emin Değilsen Şunu Sor
- Yeni bir ana ekran yerleşimi finansal akışı değiştirecekse.
- Kullanıcıdan veri girişi sayısını artıracak bir tasarım düşünülüyorsa.
- Ücretli veya üçüncü taraf API bağımlılığı eklenecekse.

## Görev Geçmişi Özeti
| Görev | Tarih | Ana karar | Profil güncellemesi |
|---|---|---|---|
| Kasam MVP | 2026-06 | Kişisel ve ortak bütçe aynı üründe birleşti | Temel değer: kullanıcının kendi kasasına yansıma |
| Supabase geçişi | 2026-06 | Gerçek kullanıcı, ortak kasa ve cloud state gerekli | Sahte local demo yeterli değil |
| Görsel sistem | 2026-06 | Sarı/beyaz kontrast yasak, Lucide ikon sistemi | UI kararları otomatik kurala bağlandı |
| Test senaryoları | 2026-06 | Test verisi canlı uygulama state’ine yüklenmeli | Görsel rapor tek başına yeterli değil |
| Kural sistemi | 2026-06-14 | Lint, profil, bağlam ve simülasyon dosyaları zorunlu | Tekrarlayan hatalar kuralla engellenecek |
| Simulator | 2026-06-14 | Çok kullanıcı hataları iframe simülasyonuyla yakalanacak | Ortak kasa ve bildirim iddiaları simulator kanıtı gerektirir |
| Kritik kayıt ve ortak kasa düzeltmeleri | 2026-06-14 | Kayıt akışı idempotent olmalı, aktör kendi sürprizini bekleyen olarak görmemeli | Kişisel satır sadece kişisel etkiyi, ortak kasa detayı paylaşımı göstermeli |
| Cloud senkron ve simulator doğrulaması | 2026-06-14 | `paidById/splitWith/splitRatio` gibi ortak kasa alanları cloud’a eksiksiz taşınmalı | “Komut çalıştı” yeterli değil; diğer kullanıcıya hareket, bildirim ve pay sonucu kanıtlanmalı |
| Vercel deploy ayrımı | 2026-06-21 | Production build sadece `public` paketini üretir | Local test/lint/cloud doğrulaması deploy build'den ayrı raporlanır |

## Gorev Sonu Kullanici Aksiyonu Tercihi
- Her degisiklikten sonra kullanicinin yapmasi gerekenler ayri yazilmali.
- Kullanici tarafinda is yoksa bu acikca belirtilmeli.
- Kullanici tarafinda panel, telefon, Supabase, Vercel veya mail testi gibi is varsa once "Hazir misin?" diye sorulmali.
- Kullanici "evet" demeden adim adim anlatima gecilmemeli.

## Ek Tasarim Kurali: Ekran Kalabaligi
- Ekran kalabaligi olusturulmayacak.
- Kullanici hareket formunda zaten bilgi girdiyse ayni bilgi oyun, bildirim veya ek ayar alaninda tekrar istenmeyecek.
- Ikincil ayarlar varsayilan ekranda surekli gorunur kalmayacak; ilgili anda acilir, adim adim veya kompakt sekilde gosterilecek.
- Yeni UI eklenirken sadece ilgili parca degil, ayni ekranin tamami 375px mobil genislikte tasma, sikisma, tekrar ve odak kaybi acisindan kontrol edilecek.

## Ek Kontrol Kurali: Gorsel Dogrulama
- Sadece unit test gecti diye "tamamlandi" denmeyecek.
- Playwright calistirilmadan UI gorevi kapatilmayacak.
- PASS yazip ekran goruntusu almadan bitirilmeyecek.
- Ortak kasa ve bildirim icin simulator PASS'i gercek cloud PASS yerine yazilmayacak.
- Gercek cloud testi icin iki ayri test hesabi/env gerekiyorsa bu kullanici aksiyonu olarak ayrica istenecek.
- Tekrarlayan hata: "Yaptim/PASS dedi ama gercekte olmamis" birden fazla kez yasandi; cozum KURAL-025 ve KURAL-028.
- Kontrol yontemi: ekran goruntusu birincil, test ciktisi ikincildir.
- Yeterli kriteri: gozle gorulunce yeterli; sadece test gecince yeterli sayilmaz.

## Ek Urun Tercihi: Yonlendiren Zeka Motoru
- Kullanici, uygulamanin en guclu ticari degerinin yonlendirme ve bilgilendirme oldugunu belirtti.
- Oncelik: "Bu harcama hedefini X gun ileri goturdu" ve "Hedefi X gun one almak icin sunu kis" gibi net, sayisal ve uygulanabilir oneriler.
- Finansal hesaplar AI modeline birakilmayacak; once deterministik kural motoru hesaplayacak, gerekirse AI sadece metni daha dogal anlatacak.
- Oneriler ekran kalabaligi yapmayacak; ana ekranda kompakt kart, detayda rapor/fiş mantigi ile acilacak.
- Ekstre, market fisi, hedef/kumbara ve ortak kasa etkileri bu zeka motorunun veri kaynaklari olarak dusunulecek.

## Ek Kontrol Kurali: Sifre Sifirlama
- "Sifre sifirlama calisiyor" ifadesi tek sonuc olarak kullanilmayacak.
- Supabase API kabul etti mi ve mail gelen kutusuna dustu mu ayri raporlanacak.
- API testi otomatik yapilir; inbox/spam teslimi kullanici aksiyonu olarak ayrica istenir.

## Ek Kontrol Kurali: Final Canli Dogrulama
- Nihai basari iddiasi icin `npm run test:final-live` veya `npm run test:final-live:prompt` raporu aranacak.
- `NEEDS_INPUT` olan cloud veya reset maddeleri kullanici aksiyonu olarak net yazilacak.
- Local/gorsel testler gecse bile cloud cok kullanici veya reset API eksikse "tam basarili" denmeyecek.

## Ek Urun Karari: Ticari Rebuild
- Ticari Kasam bireysel once olacak; ortak kasalar kullanicinin kendi parasina etkisiyle anlatilacak.
- Freemium model tercih edildi.
- Gorsel yon UltraHuman guclu olacak ama finans uygulamasi kadar okunabilir kalacak.
- Tam yeniden yapim istenirken mevcut calisan production PWA bozulmayacak; yeni Next app once izole gelistirilecek.

## Ek Kontrol Kurali: Commercial Cloud Eslemesi
- Ticari rebuild'de UI aciliyor olmasi yeterli degil; Supabase'deki production kolonlari commercial state'e eksiksiz tasinmali.
- Oncelikli risk alanlari: `paid_by_id`, `split_with`, `split_ratio`, doviz kur alanlari, `locked_notification_id`, oyun fazlari, hedef/reaksiyon/settlement/ekstre tablolaridir.
- Yeni commercial cloud degisikligi yapilinca hem mapper hem insert payload hem cloud adapter testi birlikte guncellenecek.
