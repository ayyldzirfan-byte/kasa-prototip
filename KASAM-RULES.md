# Kasam — Kurallar
Son güncelleme: 2026-06-14

Bu dosya Kasam PWA üzerinde yapılacak her değişiklikten önce okunur. Yeni özellik, UI düzeltmesi veya test eklenirken `kasam-lint.cjs` sıfır hata vermelidir.

## KURAL-001: Sarı Zemin Beyaz Yazı Yasak
- Kural: `--color-accent` veya sarı vurgu zemininde `#fff`, `white` veya beyaz metin kullanılmaz. Yazı rengi `var(--color-text-primary)` olur.
- Sebep: Sarı zemin üzerinde beyaz yazı okunmuyor.
- Kontrol: `kasam-lint.cjs` sarı zemin ve beyaz yazı kombinasyonlarını tarar.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-002: Toast Koyu Zemin Beyaz Yazı
- Kural: Toast arka planı `var(--color-text-primary)`, yazı rengi beyaz olur.
- Sebep: Açık/koyu temada bildirim okunabilir kalmalı.
- Kontrol: `.toast` CSS bloğu taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-003: Hardcode Renk Yasak
- Kural: Renkler CSS custom property ile yönetilir. `:root` token tanımı dışında yeni `#hex` renk eklenmez.
- Sebep: Tema tutarlılığı ve açık/koyu mod kontrolü.
- Kontrol: CSS kaynaklarında `:root` dışı `#hex` aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-004: Renk Anlamları Sabit
- Kural: Yeşil sadece gelir/pozitif, kırmızı sadece gider/negatif, sarı sadece bekleyen/dikkat için kullanılır.
- Sebep: Kullanıcı finansal anlamı renkten hızlı okumalı.
- Kontrol: Temel sınıf ve token isimleri taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-005: Font Sistemi
- Kural: Ana font Inter, fiş fontu Roboto Mono. Başka font ailesi eklenmez.
- Sebep: Görsel kimlik sade ve tutarlı kalmalı.
- Kontrol: CSS font-family kullanımları taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-006: Font Boyutları Custom Property
- Kural: Yeni font-size değerleri `--text-xs/sm/base/lg/xl/2xl/3xl` tokenları üzerinden verilir.
- Sebep: Mobil ekranlarda tipografi kontrolü.
- Kontrol: Yeni CSS eklemelerinde doğrudan font-size değeri denetlenir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-007: Para Formatı Türkçe Locale
- Kural: Para formatı `Intl.NumberFormat("tr-TR")` ile üretilir.
- Sebep: `1.000 TL` formatı Türkiye kullanıcı beklentisine uygun.
- Kontrol: `money()` ve para formatlayıcı fonksiyonlar taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-008: Sistem İkonları Lucide
- Kural: Tab bar, buton, aksiyon ve durum ikonları Lucide olur. Emoji sadece kullanıcı içeriğinde kullanılır.
- Sebep: Arayüz ikonları tutarlı görünmeli.
- Kontrol: Tab bar içinde emoji metin aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-009: İkon Boyutları
- Kural: Tab bar 20px, liste 16px, başlık yanı 18px, aksiyon butonu 20px.
- Sebep: Ekran yoğunluğu kontrollü kalmalı.
- Kontrol: CSS token ve sınıfları görsel kontrolde denetlenir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-010: İkon Renkleri Anlamlı
- Kural: Gelir `--color-income`, gider `--color-expense`, bekleyen `--color-pending`, nötr `--color-text-secondary`.
- Sebep: Renk dili finansal anlamla çelişmemeli.
- Kontrol: İkon yardımcı sınıfları taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-011: Türkçe İfadeler Standart
- Kural: `Giren` yerine `Gelir`, `Çıkan` yerine `Gider`, `Beklenen` yerine `Beklenen gelir`, `Yaklaşan` yerine `Yaklaşan ödeme`, `Bulut senkron` yerine sadece ikon kullanılır.
- Sebep: Belirsiz veya eski ifadeler kullanıcıyı yoruyor.
- Kontrol: Uygulama kaynaklarında yasaklı ifadeler aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-012: Yapay Zeka Dili Yasak
- Kural: `Mükemmel!`, `Harika!`, `Tabii ki!`, `İşleminiz gerçekleştirildi` gibi kalıplar kullanılmaz. Kısa, doğrudan, günlük Türkçe kullanılır.
- Sebep: Uygulama dili yapay ve abartılı görünmemeli.
- Kontrol: Yasaklı metin kalıpları aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-013: Boş Durum Metinleri Sabit
- Kural:
  - Hareketler: `Henüz hareket yok. İlk hareketi sen ekle.`
  - Bütçeler: `Bütçe yok. Kendi kasanı oluştur veya birine katıl.`
  - Bildirimler: `Sessizlik...`
  - Takvim: `Bu gün temiz. Harcama yok.`
- Sebep: Boş ekranlar aynı sesle konuşmalı.
- Kontrol: Metinler kaynakta aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-014: Dokunma Alanı Minimum 44x44px
- Kural: Tıklanabilir ana öğeler minimum 44px yüksekliğe sahip olur.
- Sebep: iPhone’da yanlış dokunma riski azalmalı.
- Kontrol: CSS sınıfları ve görsel testte denetlenir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-015: Tab Bar Her Ekranda 5 Sekme
- Kural: Ana ekran, Hareketler, Bütçeler, Takvim, Rapor sekmeleri her zaman görünür. Her sekmede ikon ve Türkçe açıklama bulunur.
- Sebep: Alt navigasyon kaybolunca uygulama yön duygusu bozuluyor.
- Kontrol: `index.html` tab listesi taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-016: Sürpriz Hareket Gizliliği
- Kural: `lockedNotificationId` dolu ve `revealedAt` boşsa tutar, başlık ve tip `??` olarak kalır. Oyun bitmeden açılmaz.
- Sebep: Tahmin oyunu anlamını kaybetmemeli.
- Kontrol: Testlerde `entryConfirmed()` ve görünürlük fonksiyonları denetlenir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-017: Animasyon Sistemi
- Kural: Yeni transition/animation değerleri `--ease-out`, `--ease-spring`, `--duration-fast/normal/slow` tokenlarıyla verilir.
- Sebep: Geçişler aynı karakterde olmalı.
- Kontrol: Yeni CSS eklemelerinde denetlenir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-018: API Key Frontend'e Yazılmaz
- Kural: GIPHY, ANTHROPIC ve gizli Supabase anahtarları JS dosyalarına hardcode edilmez. Public Supabase publishable config ayrı dosyada tutulur.
- Sebep: Gizli anahtarlar istemciye sızmamalı.
- Kontrol: Secret key kalıpları kaynakta aranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-019: Input Sanitizasyon
- Kural: Kullanıcı metinleri sanitize edilir. Negatif tutar engellenir. Metin alanları 200 karakter sınırına uyar. Kullanıcı verisi doğrudan `innerHTML` içine basılmaz.
- Sebep: XSS ve veri bozulması önlenmeli.
- Kontrol: Sanitizasyon yardımcıları ve riskli `innerHTML` kullanımları taranır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-020: RLS Her Tabloda Aktif
- Kural: Yeni Supabase tablosu için RLS enable ve policy zorunludur.
- Sebep: Ortak kasa verisi kullanıcı bazında izole kalmalı.
- Kontrol: SQL migration dosyaları gözden geçirilir.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-021: 3 Aşamalı Oyun Sırası Sabit
- Kural: Oyun sırası 1 → Kim ekledi, 2 → Gelir/gider, 3 → Ne harcaması. Atlanmaz.
- Sebep: Oyun akışı tahmin mantığını korumalı.
- Kontrol: `test-game-v2.cjs` akışı denetler.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-022: Oyun Sonucu Tam Ekran Overlay
- Kural: Doğru/yanlış tepki görseli büyük overlay’de gösterilir; sonuç sesleri çalışır.
- Sebep: Kullanıcının seçtiği medya küçük bildirim görseli olarak kalmamalı.
- Kontrol: Oyun testleri ve görsel smoke test.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-023: Tanışma Skoru
- Kural: Doğru kim tahmini +10, yanlış kim tahmini +2 puan.
- Sebep: Kullanıcıyı tanıma fikri oyun mekanizmasının parçası.
- Kontrol: `test-game-v2.cjs`.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-024: Yeni Özellik Ekleme Süreci
- Kural: Her görevde sırasıyla kurallar, sahip profili, durum raporu ve bağlam dosyası okunur; özellik eklenir; lint ve test çalışır; dokümanlar güncellenir.
- Sebep: Aynı hataların tekrarı azaltılmalı.
- Kontrol: Görev sonu raporu.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-025: Canlı Çok Kullanıcılı İşlev Simülasyonu
- Kural: Ortak kasa, bildirim, tahmin oyunu ve bakiye yansıması değişikliklerinde `kasam-simulator.html` veya test senaryosu URL’leriyle en az iki kullanıcı penceresi üzerinden kontrol yapılır.
- Sebep: Projenin ana riski kullanıcılar arası veri/bildirim akışı.
- Kontrol: Simulator logu veya çok kullanıcı test çıktısı.
- Eklendi: 2026-06-14 — Simülasyon ortamı

## KURAL-026: Türkçe Kaynak Kodlaması Korunur
- Kural: Türkçe metin içeren kaynaklar PowerShell `Set-Content` gibi varsayılan encoding davranışı belirsiz komutlarla toplu yazılmaz. Manuel değişiklikte `apply_patch`, mekanik dönüşümde açık UTF-8 okuma/yazma kullanan Node script tercih edilir.
- Sebep: Türkçe karakter bozulması arayüz metinlerini ve test çıktısını güvenilmez hale getirir.
- Kontrol: Görev sonunda `ş ç ğ ü ö ı İ Ş Ç Ğ Ü Ö` karakterleri için smoke check yapılır; yeni mojibake kod noktaları `U+00C3`, `U+00C4`, `U+00C5` kaynaklarda artmamalıdır.
- Eklendi: 2026-06-14 — Kural sistemi

## KURAL-027: Gerçek Cloud Çok Kullanıcılı Test Zorunlu
- Kural: Ortak kasa, bildirim, tahmin oyunu, kişinin kendi kasasına pay yansıması veya çok kullanıcılı veri akışında `postMessage`, `localStorage`, `hydrate-state` veya iframe state taşıma sonucu tek başına başarı sayılmaz. Bu sonuç sadece `local simulation PASS` olarak etiketlenir. Gerçek PASS için hareket veya bildirim Supabase tablolarına yazılmalı ve aynı kasa koduna bağlı farklı kullanıcı oturumlarında cloud/realtime veri olarak görünmelidir.
- Sebep: Projenin temel amacı farklı telefon/kullanıcı oturumları arasında ortak kasa ve bildirim akışını çalıştırmaktır. Local state taşıma bu hedefi kanıtlamaz.
- Kontrol: Çok kullanıcılı değişikliklerde en az iki ayrı kullanıcı oturumu ile şu tablo davranışları doğrulanır: `kasa_entries` kaydı oluştu, `kasa_notifications` ilgili alıcılara yazıldı, diğer kullanıcı oturumunda bildirim rozeti/listesi göründü, hareket tamamlanınca ortak kasa ve kişisel pay bakiyeleri doğru güncellendi. Test raporu `cloud PASS` veya `cloud FAIL` olarak açıkça ayrılır.
- Eklendi: 2026-06-14 — Gerçek çok kullanıcılı test ayrımı

## KURAL-028: Tekil UI Düzeltmesi Bileşen Ailesine Uygulanır
- Kural: Bir UI hatası düzeltildiğinde sadece görünen tek alan değiştirilmez. Aynı bileşen ailesi, aynı form akışı, aynı buton/badge/input tipi ve komşu layout’lar da taranır. Örneğin sarı zemin beyaz yazı düzeltilirken tarih input’u, medya seçici, alt tab bar, toast, fiş butonu ve aynı ekrandaki diğer input genişlikleri de taşma/kontrast/kayma açısından kontrol edilir.
- Sebep: Tekil düzeltme yeni görsel bozulma üretirse uygulama premium görünmez. Kullanıcı her hatayı tek tek söylemek zorunda kalmamalıdır.
- Kontrol: UI değişikliklerinde en az 375px mobil genişlikte ilgili ekranın tamamı görsel olarak kontrol edilir; inputlar `max-width:100%`, `box-sizing:border-box`, metin kontrastı ve tab bar çakışması denetlenir. Görsel sorun varsa görev bitmiş sayılmaz.
- Eklendi: 2026-06-14 — Premium görünüm ve geniş kapsamlı UI denetimi

## KURAL-029: Premium Görünüm Görsel Sağlamlık Demektir
- Kural: “Premium görünüm” talebi sadece renk, gölge veya font değiştirmek değildir. Ekranda taşan input, kaymış tarih alanı, sıkışmış metin, okunmayan kontrast, alt menüyle çakışan içerik, gereksiz kalabalık ve aynı işlevin tekrar etmesi premium görünümü bozar. Bu sorunlar ilgili ekranın parçası olarak otomatik düzeltilir.
- Sebep: Uygulama temel işlevi çalışsa bile görsel güven vermezse kullanılabilir sayılmaz.
- Kontrol: Her görsel/UI görevinde ilgili akış baştan sona taranır: giriş, form, seçim, kaydetme, sonuç/toast, listeye dönüş. En az bir mobil ekran görüntüsü veya simulator/browser smoke sonucu ile doğrulanır.
- Eklendi: 2026-06-14 — Premium görünüm tanımı

## KURAL-030: Aktör Kendi Sürprizini Bekleyen Olarak Görmez
- Kural: Sürpriz hareketi oluşturan kullanıcı için aktif bekleyen sürpriz sayacı ve tahmin bildirimi gösterilmez. Aktör sadece geçmiş/tamamlanmış bildirim hikayesini görebilir.
- Sebep: Hareketi ekleyen kişi zaten detayı bilir; kendi hareketini tahmin etmesi oyun mantığını bozar.
- Kontrol: Bildirim ve bekleyen sürpriz sayacı testlerinde `notification.actorId !== activeUserId` koşulu doğrulanır.
- Eklendi: 2026-06-14 — Kritik ortak kasa ve bildirim düzeltmeleri

## KURAL-031: Hareket Kaydı Idempotent ve Kilitli Olur
- Kural: Hareket kaydetme başladığında tekrar tıklama engellenir, kullanıcıya kaydediliyor overlay’i gösterilir, ancak form input/select/textarea alanları disable edilmez. Sadece aksiyon butonları geçici kilitlenir.
- Sebep: Disabled inputlar FormData’ya dahil olmaz; bu da boş veya bozuk hareket kaydına sebep olabilir. Tekrar tıklama ise aynı hareketin çok kez eklenmesine yol açar.
- Kontrol: Kayıt sırasında tek submit guard’ı çalışır, FormData eksiksiz okunur, aynı tıklama serisinden tek entry oluşur.
- Eklendi: 2026-06-14 — Kritik ortak kasa ve bildirim düzeltmeleri

## KURAL-032: Kişisel Satır Kişisel Etkiyi, Kasa Detayı Paylaşımı Gösterir
- Kural: Ana ekran ve kişisel hareket listesinde hareket satırı sadece kullanıcının kendi kasasına yansıyan net tutarı gösterir. Uzun paylaşım listesi sadece ortak kasa detay ekranında görünür.
- Sebep: Ana ekran kullanıcının kendi para durumunu hızlı göstermelidir; pay dağılımı burada metin kalabalığı ve kayma üretir.
- Kontrol: Son hareket satırında uzun `Paylaşım:` listesi aranmaz; ortak kasa detayında split metni korunur.
- Eklendi: 2026-06-14 — Kritik ortak kasa ve bildirim düzeltmeleri

## KURAL-033: Native Sticker Paketleri PWA’da Yanıltıcı Şekilde Vaat Edilmez
- Kural: iOS/WhatsApp native sticker paketleri web PWA içinden doğrudan listelenemez. Uygulama bu durumda paste/file fallback sunar ve metin bunu açık söyler.
- Sebep: Tarayıcı sandbox’ı klavye uygulamalarının sticker paketlerine doğrudan erişim vermez.
- Kontrol: Sticker seçicide native sticker listesi varmış gibi davranan metin veya boş vaat yoktur; paste/görsel seç fallback’i bulunur.
- Eklendi: 2026-06-14 — Kritik ortak kasa ve bildirim düzeltmeleri

## KURAL-034: Ortak Hareket Cloud Alanları Eksiksiz Taşınır
- Kural: Ortak kasa hareketleri Supabase’e yazılırken ve okunurken `paidById`, `splitWith`, `splitRatio`, `rateLockedAt`, `autoRevealAt`, `updatedAt`, medya ve proje/profil fotoğraf alanları korunur. Bu alanlardan biri düşerse ortak kasa ve kişisel pay hesabı başarılı sayılmaz.
- Sebep: Local state’te çalışan pay hesabı cloud’a eksik yazılırsa diğer telefonlarda hareket görünmez veya yanlış payla yansır.
- Kontrol: Cloud sync değişikliklerinde `app-cloud.js` mapping ve upsert alanları bu listeyle karşılaştırılır; simulator ortak kasa testi `Ortak hareket tüm kullanıcılara düştü`, `Bildirim alıcılara düştü`, `Kişisel kasa payları güncellendi` sonuçlarını PASS vermelidir.
- Eklendi: 2026-06-14 — Cloud ortak kasa senkron düzeltmesi

## KURAL-035: Kayıt Sonrası Tekil ve Kanıtlı Senkron
- Kural: Hareket kaydı aynı form imzasıyla kısa sürede tekrar çalışırsa ikinci entry üretilmez. Başarılı kayıttan sonra cloud push ve cloud refresh tetiklenir; kullanıcı kayıt sırasında overlay ile bilgilendirilir.
- Sebep: Yavaş ağda kullanıcı kaydedildiğini anlamazsa aynı hareketi defalarca ekleyebilir. Push/refresh tetiklenmezse diğer kullanıcılar hareketi görmez.
- Kontrol: Aynı formdan 8 saniye içinde ikinci submit yeni entry oluşturmaz; kayıt sonrası cloud sync yolu çalışır.
- Eklendi: 2026-06-14 — Kayıt tekrarlama ve senkron düzeltmesi

## Görev Sonu Kural Çıkarma Protokolü
Her görev sonunda şu kontrol yapılır:

1. Aynı hata birden fazla dosyada düzeltildiyse yeni KURAL adayıdır.
2. Kullanıcı aynı tercihi ikinci kez belirttiyse `KASAM-OWNER-PROFILE.md` güncellenir.
3. Yeni bir güvenlik, veri izolasyonu veya çok kullanıcı davranışı eklendiyse `kasam-lint.cjs` veya test dosyası buna göre genişletilir.
4. Yeni kural formatı:
   - `KURAL-[sonraki numara]: [kısa başlık]`
   - `Kural: [ne yapılmalı/yapılmamalı]`
   - `Sebep: [neden]`
   - `Kontrol: [otomatik veya manuel test]`
   - `Eklendi: [tarih] — [görev adı]`
5. Görev sonucu raporunda yeni kural yoksa açıkça `Yeni kural: yok` yazılır.
