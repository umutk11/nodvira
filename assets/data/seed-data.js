(function (global) {
  "use strict";

  const posts = [
    {
      title: "Dijital Dönüşüm Yol Haritası Nasıl Oluşturulur?",
      slug: "dijital-donusum-yol-haritasi",
      excerpt: "İş hedeflerini, teknik öncelikleri ve ölçülebilir çıktıları ortak bir dönüşüm planında birleştirmeye yönelik örnek içerik.",
      content: `## Örnek içerik

Bu yazı, frontend tasarımının değerlendirilmesi için hazırlanmış mock içeriktir. Gerçek müşteri, proje veya kurum bilgisi içermez.

## Yol haritasının temel bileşenleri

Mevcut durum, hedefler, bağımlılıklar, öncelikler ve başarı ölçütleri ortak bir çerçevede ele alınır. Çalışma kısa vadeli kazanımları, orta vadeli iyileştirmeleri ve uzun vadeli dönüşüm adımlarını görünür kılar.

## Uygulama yaklaşımı

Her adım için sorumluluk, beklenen çıktı ve doğrulama yöntemi tanımlanır. Böylece teknoloji yatırımları yalnızca ürün listesi olarak değil, yönetilebilir bir gelişim programı olarak değerlendirilir.`,
      category: "transformation",
      image: null,
      status: "published",
      publishedAt: "2026-08-12",
    },
    {
      title: "Kurumsal Web Projelerinde Sağlam Teknik Temel",
      slug: "kurumsal-web-projelerinde-teknik-temel",
      excerpt: "Performans, erişilebilirlik ve sürdürülebilir bileşen yapısını birlikte ele alan örnek web içeriği.",
      content: `## Örnek içerik

Bu metin yalnızca arayüz incelemesi için hazırlanmıştır. Kurumsal bir web projesinde bilgi mimarisi, içerik modeli ve teknik uygulama birlikte planlanır.

## Tasarım ve geliştirme

Responsive davranış, erişilebilir etkileşimler ve tekrar kullanılabilir bileşenler projenin bakım maliyetini doğrudan etkiler. Performans hedefleri de geliştirme başlamadan önce tanımlanmalıdır.`,
      category: "web",
      image: null,
      status: "published",
      publishedAt: "2026-07-28",
    },
    {
      title: "İş Süreçleri Otomasyonuna Nereden Başlanır?",
      slug: "is-surecleri-otomasyonuna-nereden-baslanir",
      excerpt: "Tekrarlayan işleri ve veri akışını özel yazılım yaklaşımıyla değerlendiren örnek teknik yazı.",
      content: `## Örnek içerik

Otomasyon çalışması, yalnızca manuel bir adımı dijitalleştirmekle başlamaz. Sürecin girdileri, karar noktaları, istisnaları ve sorumluları birlikte incelenir.

## Önceliklendirme

Yüksek tekrar sayısı, hata riski ve ölçülebilir zaman kaybı bulunan süreçler ilk adaylar olarak değerlendirilir.`,
      category: "software",
      image: null,
      status: "published",
      publishedAt: "2026-07-10",
    },
    {
      title: "Network Performansı ve Güvenliği Birlikte Tasarlamak",
      slug: "network-performansi-ve-guvenligi",
      excerpt: "Kurumsal ağlarda görünürlük, segmentasyon ve kapasite planlamasını ele alan mock içerik.",
      content: `## Örnek içerik

Ağ performansı ve güvenlik birbirinden bağımsız değerlendirilmemelidir. Trafik görünürlüğü, segmentasyon ve kapasite verileri ortak mimari kararlarını destekler.

## Ölçülebilir yaklaşım

Gecikme, paket kaybı, yoğunluk ve erişim politikaları düzenli olarak izlenerek iyileştirme alanları belirlenir.`,
      category: "network",
      image: null,
      status: "published",
      publishedAt: "2026-06-19",
    },
    {
      title: "Sistem Sürekliliği İçin Temel Kontrol Noktaları",
      slug: "sistem-surekliligi-kontrol-noktalari",
      excerpt: "Yedekleme, izleme ve geri dönüş hedeflerini özetleyen örnek sistem içeriği.",
      content: `## Örnek içerik

Sistem sürekliliği yalnızca yedek alınmasıyla sağlanmaz. Kritik servisler, bağımlılıklar, geri dönüş süresi ve doğrulama testleri birlikte planlanır.

## Kontrol yaklaşımı

İzleme kapsamı, sorumluluklar ve geri yükleme tatbikatları belirli aralıklarla gözden geçirilir.`,
      category: "system",
      image: null,
      status: "published",
      publishedAt: "2026-05-30",
    },
    {
      title: "Teknoloji Mevcut Durum Analizi Nasıl Yapılır?",
      slug: "teknoloji-mevcut-durum-analizi",
      excerpt: "Altyapı, uygulama ve operasyon katmanlarını ortak değerlendirme çerçevesinde ele alan mock danışmanlık yazısı.",
      content: `## Örnek içerik

Mevcut durum analizi; teknoloji envanterini, iş bağımlılıklarını, operasyonel riskleri ve gelişim ihtiyaçlarını görünür hale getirir.

## Beklenen çıktı

Çalışma sonunda öncelikler, hızlı kazanımlar ve daha uzun vadeli yatırım başlıkları anlaşılır bir yol haritasına dönüştürülür.`,
      category: "consulting",
      image: null,
      status: "published",
      publishedAt: "2026-05-08",
    },
  ];

  global.StaticBlogPosts = Object.freeze(posts.map((post) => Object.freeze(post)));
})(window);

