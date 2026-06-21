# Kasam Intelligence Engine V1

## Amaç
Kasam öneri motoru kullanıcının kişisel kasasına ve ortak kasalardan gelen gerçek etkisine bakar. İlk sürümde hesapları LLM yapmaz; bütün finansal kararlar test edilebilir kural motoruyla üretilir.

## Çalışma Mantığı
1. Kullanıcının ay içindeki gelir, gider, beklenen gelir ve yaklaşan ödeme etkisi hesaplanır.
2. Ortak kasalardan kullanıcının kişisel kasasına düşen net etki ayrılır.
3. Aktif hedef varsa günlük hedef temposu hesaplanır.
4. Son giderin hedefi kaç gün ileri götürdüğü hesaplanır.
5. En yüksek gider kaleminden küçük bir kısma önerisiyle hedefin kaç gün öne alınabileceği hesaplanır.
6. Sonuçlar öncelik ve güven puanına göre sıralanır.

## Üretilen Öneriler
- Hedef gecikmesi: "Bu harcama hedefi yaklaşık X gün geciktirir."
- Hedefi öne alma: "Şu kalemde Y TL kısmak hedefi yaklaşık X gün öne çeker."
- Nakit akışı: "Yaklaşan ödeme beklenen gelirden fazla."
- Ortak kasa etkisi: "Bu ortak kasa kişisel kasana şu kadar yazdı."
- Gider baskısı: "Bu ay gider önde, en yüksek baskı şu kalemde."

## AI Sınırı
LLM ileride sadece metni sadeleştirmek veya kullanıcıya daha doğal anlatmak için kullanılabilir. Bakiye, hedef günü, split, kur ve nakit akışı hesabı LLM'e bırakılmaz.

## Dosyalar
- `src/lib/insights.ts`: kural motoru
- `src/__tests__/insights.test.ts`: hesap testleri
- `src/components/KasamCommercialApp.tsx`: kompakt ana ekran öneri kartı
