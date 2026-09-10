(function (global) {
  "use strict";

  const posts = [
    {
      title: "Kurumsal Ağlarda Performans ve Güvenlik Dengesi",
      slug: "kurumsal-aglarda-performans-ve-guvenlik-dengesi",
      excerpt: "Ağ altyapısını büyütürken performans ve güvenliği birlikte ele almanın temel noktaları.",
      content: `## Denge neden yalnızca daha güçlü cihazlarla kurulmaz?

Kurumsal ağlarda performans ve güvenlik çoğu zaman birbirine rakip iki hedef gibi ele alınır. Güvenlik ekibi daha fazla kontrol, kayıt ve ayrıştırma isterken operasyon ekibi düşük gecikme, yüksek erişilebilirlik ve kolay yönetim bekler. Oysa doğru mimaride bu iki hedef birbirini zayıflatmaz. Görünürlük olmadan performans sorununun kaynağı bulunamaz; kapasitesi ve veri akışı anlaşılmayan bir ağda da güvenlik politikası doğru yere uygulanamaz.

Sorun genellikle teknoloji eksikliğinden önce tasarım eksikliğidir. Yıllar içinde eklenen switch'ler, geçici VLAN'lar, doğrudan internete çıkan cihazlar, unutulmuş VPN hesapları ve farklı ekiplerce yönetilen kablosuz ağlar ortak bir işletim modeline bağlanmadığında ağ büyür fakat olgunlaşmaz. Yeni bir firewall veya daha hızlı uplink kısa süreli rahatlama sağlar; temel bağımlılıklar görünür değilse aynı darboğaz başka bir noktada yeniden ortaya çıkar.

Bu nedenle çalışma cihaz seçimiyle değil, hizmet haritasıyla başlamalıdır. Hangi uygulama hangi kullanıcıya hizmet ediyor, hangi veri merkezine veya bulut servisine bağlanıyor, kabul edilebilir gecikme ne, kesinti hangi iş sürecini durduruyor ve hangi erişim gerçekten gerekli? Bu sorular yanıtlandığında performans ve güvenlik aynı veri akışı üzerinde birlikte tasarlanabilir.

## Önce ölçülebilir bir ağ tabanı oluşturun

Bir ağın “yavaş” olduğunu söylemek teknik bir bulgu değildir. Kullanıcının hissettiği sorun DNS çözümlemesinden kablosuz sinyal kalitesine, WAN doygunluğundan uygulama sunucusuna kadar birçok katmanda oluşabilir. Değerlendirme sırasında en az aşağıdaki göstergeler birlikte izlenmelidir:

- Uplink ve WAN hatlarında ortalama kullanımın yanında yoğun saatlerdeki yüzde 95 değerleri
- Arayüz hataları, paket kaybı, yeniden iletim ve kuyruk düşürme oranları
- Gecikme ve jitter değerlerinin uygulama türüne göre dağılımı
- Kablosuz ağda kanal kullanımı, sinyal-gürültü oranı, istemci yoğunluğu ve roaming davranışı
- DNS, DHCP, kimlik doğrulama ve uzak erişim servislerinin yanıt süreleri
- Uygulama akışlarının kaynak, hedef, protokol ve veri hacmi bilgileri

Tek bir günlük ölçüm yeterli değildir. Aylık kapanış, yedekleme penceresi, toplu veri aktarımı veya çevrim içi toplantı yoğunluğu gibi dönemsel davranışlar en az bir iş döngüsü boyunca gözlenmelidir. Ölçüm noktaları yalnızca merkez cihazlara konursa şube, kablosuz istemci veya bulut tarafındaki kayıplar görünmez kalabilir. Bu nedenle SNMP telemetrisi, akış kayıtları, sistem günlükleri ve seçilmiş uçtan uca sentetik testler aynı zaman çizgisinde değerlendirildiğinde anlam kazanır.

## Segmentasyonu organizasyon şemasına göre değil riske göre tasarlayın

VLAN oluşturmak tek başına segmentasyon değildir. İki ağ arasında varsayılan olarak geniş erişim bulunuyorsa yalnızca yayın alanları ayrılmış olur. Etkili segmentasyon; kullanıcı, cihaz, uygulama ve yönetim düzlemleri arasındaki gerekli akışları açıkça tanımlar ve gereksiz yanal hareketi sınırlar.

Örneğin muhasebe kullanıcıları, misafir cihazları, IP kameralar, yazıcılar, sunucu yönetim arabirimleri ve yedekleme trafiği aynı güven seviyesinde değildir. Her grubun hangi kaynaklara, hangi portlardan ve hangi kimlikle erişeceği belirlenmelidir. CISA'nın fidye yazılımı rehberi de ağ segmentasyonunu saldırganın yanal hareketini sınırlayan temel önlemlerden biri olarak ele alır. Buradaki amaç ağı olabildiğince fazla parçaya bölmek değil, ihlal edildiğinde oluşacak etkiyi yönetilebilir bölgelere ayırmaktır.

NIST'in sıfır güven yaklaşımı ise ağ içinde bulunmayı tek başına güven nedeni saymaz. Erişim kararı kullanıcı kimliği, cihaz durumu, istenen kaynak ve bağlam üzerinden verilmelidir. Bu yaklaşım “firewall artık gereksiz” anlamına gelmez; ağ kontrolünü kimlik, uç nokta güvenliği ve uygulama politikalarıyla tamamlar.

Pratik bir politika matrisi şu alanları içerebilir:

- Kaynak kullanıcı veya cihaz grubu
- Hedef uygulama ya da servis
- Gerekli protokol ve port
- Kimlik doğrulama yöntemi
- Kayıt ve alarm gereksinimi
- Erişimin iş sahibi ve teknik sahibi
- Politikanın gözden geçirilme tarihi

Bu matris olmadan oluşturulan kurallar zamanla “geçici olarak açılmış” ancak hiç kapatılmamış erişimlere dönüşür.

## Güvenlik kontrollerinin performans maliyetini görünür kılın

TLS inceleme, saldırı önleme, uygulama kontrolü ve ayrıntılı günlükleme işlemci, bellek ve depolama tüketir. Firewall kapasitesi yalnızca üreticinin paket işleme değerine göre seçilmemelidir. Gerçek kapasite hesabında etkinleştirilecek güvenlik profilleri, eşzamanlı oturum sayısı, şifreli trafik oranı, küçük paket davranışı, VPN kullanıcıları ve büyüme payı dikkate alınmalıdır.

Benzer şekilde her trafiğe aynı önceliği vermek de performans değildir. QoS politikası ses ve görüntü gibi gecikmeye duyarlı trafiği korurken yedekleme veya yazılım dağıtımının tüm hattı tüketmesini engelleyebilir. Ancak yanlış sınıflandırma kritik olmayan trafiği önceliklendirerek sorunu büyütebilir. Politika uygulanmadan önce akışlar ölçülmeli, iş birimleriyle kritik uygulamalar doğrulanmalı ve kuyruk davranışı yük altında test edilmelidir.

Şifreli trafik incelemesinde mahremiyet ve mevzuat sınırları da ayrıca ele alınmalıdır. Finans, sağlık veya kişisel iletişim gibi kategoriler için istisna politikaları; sertifika dağıtımı ve istemci uyumluluğuyla birlikte belgelenmelidir.

## Kablosuz ağı yalnızca kapsama projesi olarak görmeyin

Bir alanın sinyal alması, o alanda yeterli kablosuz hizmet olduğu anlamına gelmez. Erişim noktası sayısı; metrekareden önce eşzamanlı istemci, uygulama türü, kanal genişliği, parazit ve bina malzemesine göre belirlenmelidir. Çok yüksek yayın gücü istemcinin erişim noktasını duymasını sağlar fakat düşük güçlü istemci aynı kalitede yanıt veremeyebilir. Sonuç, ekranda tam çekim görünmesine rağmen kararsız bağlantıdır.

Kurumsal kablosuz tasarımda misafir ve çalışan erişimi ayrılmalı, kurumsal kimlik doğrulama tercih edilmeli, eski şifreleme yöntemleri kaldırılmalı ve erişim noktalarının yönetim düzlemi kullanıcı trafiğinden ayrıştırılmalıdır. Roaming gerektiren depo, çağrı merkezi veya sağlık ortamlarında geçiş davranışı gerçek cihazlarla test edilmelidir.

## Değişiklikleri geri dönüş planıyla uygulayın

Ağ değişiklikleri genellikle merkezi bir bileşene dokunduğu için küçük bir hata geniş etki oluşturabilir. Üretim geçişinden önce yapılandırma yedeği, bağımlılık listesi, kabul testleri, sorumlu kişiler ve geri dönüş koşulları hazırlanmalıdır. “Sorun olursa eski ayara döneriz” bir geri dönüş planı değildir; hangi sinyalde, kim tarafından, kaç dakika içinde ve hangi sırayla dönüleceği açık olmalıdır.

Aşamalı uygulama riski azaltır. Önce düşük riskli bir kullanıcı grubu veya şube seçilir, performans ve güvenlik kayıtları karşılaştırılır, ardından kapsam genişletilir. Değişiklik sonrası yalnızca internetin açılması değil; DNS, kimlik doğrulama, kritik uygulamalar, VPN, yazdırma, ses ve izleme akışları ayrı ayrı doğrulanmalıdır.

## İşletilebilirlik son tasarım kriteridir

İyi ağ mimarisi yalnızca kurulum gününde çalışan değil, altı ay sonra başka bir uzmanın anlayabildiği yapıdır. Güncel topoloji, IP planı, cihaz envanteri, erişim politikası, yazılım sürümleri, konfigürasyon yedekleri ve alarm sorumlulukları ortak bir kayıt altında tutulmalıdır. Kritik cihazlarda saat senkronizasyonu ve merkezi günlükleme yoksa olay anında kayıtları ilişkilendirmek zorlaşır.

Takip edilecek göstergeler teknik metriklerle sınırlı kalmamalıdır. Kritik uygulama erişilebilirliği, kullanıcı başına destek kaydı, değişiklik kaynaklı olay sayısı ve çözüm süresi ağ yatırımının iş etkisini daha iyi gösterir. Böylece kapasite artırımı veya güvenlik yatırımı sezgiyle değil, kanıtla planlanır.

## Kısa kontrol listesi

- Kritik uygulamalar ve veri akışları güncel olarak haritalandı mı?
- Yoğun saat kapasitesi, gecikme, kayıp ve kablosuz kalite ölçülüyor mu?
- Kullanıcı, cihaz, sunucu, misafir ve yönetim ağları risklerine göre ayrıldı mı?
- Ağlar arası erişim varsayılan açıklık yerine gerekli akışlarla sınırlandı mı?
- Güvenlik servisleri açıkken gerçek firewall kapasitesi test edildi mi?
- Kritik trafik için ölçüme dayalı QoS politikası var mı?
- Değişikliklerin kabul ve geri dönüş adımları belgeli mi?
- Topoloji, envanter, konfigürasyon yedekleri ve alarm sahipleri güncel mi?

Performans ile güvenlik arasındaki doğru denge sabit bir ayar değildir. Yeni uygulamalar, uzaktan çalışma, bulut servisleri ve tehditler değiştikçe politika ve kapasite de gözden geçirilmelidir. Ölçülebilir, segmentlere ayrılmış ve işletilebilir bir ağ bu değişimi kontrol altında tutar.

## Kaynaklar ve ileri okuma

- [NIST SP 800-207 — Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
- [CISA StopRansomware Guide](https://www.cisa.gov/stopransomware/ransomware-guide)`,
      category: "network",
      image: "/assets/images/blog/network-performance-security.webp",
      status: "published",
    },
    {
      title: "Sistem Sürekliliği İçin Temel Kontrol Listesi",
      slug: "sistem-surekliligi-icin-temel-kontrol-listesi",
      excerpt: "Kesintileri azaltmak için izleme, yedekleme ve bakım süreçlerinde dikkat edilmesi gerekenler.",
      content: `## Süreklilik, yüksek erişilebilirlikten daha geniş bir konudur

Bir sunucunun çalışıyor görünmesi, iş hizmetinin sürdürülebilir olduğu anlamına gelmez. Kullanıcı kimlik doğrulaması, DNS, ağ bağlantısı, veri tabanı, depolama, sertifikalar veya üçüncü taraf bir servis devre dışı kaldığında uygulama ayakta olsa bile iş süreci durabilir. Sistem sürekliliği bu nedenle tek bir cihazın yedekliliği değil; hizmeti oluşturan tüm bağımlılıkların kabul edilebilir sürede geri getirilebilmesidir.

Sağlıklı bir süreklilik programı üç soruya net cevap verir: Hangi hizmetler gerçekten kritik, ne kadar veri kaybı kabul edilebilir ve kesinti ne kadar sürebilir? Bu sorular yanıtlanmadan alınan yedekleme ürünü veya ek sunucu, işletmenin gerçek ihtiyacını karşılamayabilir.

NIST'in bilgi sistemleri için acil durum planlama rehberi, iş etki analizini kurtarma stratejisinin temel girdisi olarak ele alır. Çünkü her sistem aynı öneme sahip değildir ve aynı maliyetle korunmamalıdır. Finansal kapanışı etkileyen ERP veri tabanı ile ayda bir kullanılan arşiv uygulamasının hedefleri farklıdır.

## 1. Hizmet ve bağımlılık envanterini çıkarın

Envanter yalnızca sunucu adı ve IP adresinden oluşmamalıdır. Her iş hizmeti için uygulama, veri tabanı, kimlik, ağ, depolama, sertifika, lisans, dış servis ve sorumlu ekip bağlantıları birlikte kaydedilmelidir. Bir e-ticaret hizmeti örneğinde web katmanı çalışırken ödeme sağlayıcısı veya stok entegrasyonu devre dışıysa “hizmet çalışıyor” ölçümü yanıltıcıdır.

Her kayıt en az şu bilgileri içermelidir:

- İş hizmetinin ve teknik bileşenin sahibi
- Çalıştığı ortam ve konum
- Veri sınıfı ve iş kritiklik seviyesi
- Yukarı ve aşağı yönlü bağımlılıklar
- Bakım penceresi ve destek sözleşmesi
- İzleme yöntemi ve alarm sorumlusu
- Kurtarma sırası ve doğrulama adımı

Otomatik keşif araçları başlangıcı hızlandırabilir fakat iş bağlamını tek başına çıkaramaz. Teknik envanter, süreç sahipleriyle doğrulanmadığında kullanılmayan bir sistem kritik; kritik bir dosya paylaşımı ise önemsiz görünebilir.

## 2. RTO ve RPO hedeflerini iş diliyle belirleyin

RTO, bir hizmetin kesinti sonrasında hedeflenen geri dönüş süresidir. RPO ise geri dönüşte kabul edilebilecek veri kaybı penceresini tanımlar. “Hiç veri kaybı olmasın ve sistem hiç durmasın” teknik olarak anlaşılır bir istek olsa da maliyet, mimari ve operasyon açısından ölçülebilir değildir.

Hedefler iş etkisine göre belirlenmelidir. Sipariş sisteminin dört saat durması kaç işlemi, hangi müşterileri ve ne kadar geliri etkiler? Son on beş dakikalık verinin kaybı yeniden üretilebilir mi? Manuel çalışma yöntemi kaç saat sürdürülebilir? Bu soruların cevabı teknoloji yatırımını doğrudan şekillendirir.

RTO ile gerçek kurtarma süresi aynı şey değildir. Hedefin karşılanıp karşılanmadığı yalnızca testle anlaşılır. Benzer şekilde on beş dakikalık RPO hedefi varsa günlük yedek yeterli değildir; veri tabanı günlüğü, replikasyon veya daha sık anlık görüntü gibi yöntemler gerekebilir.

## 3. Yedeklemeyi bir iş olarak değil, geri dönüş sistemi olarak tasarlayın

Başarılı yedekleme kaydı, başarılı kurtarma kanıtı değildir. Bozuk veri, eksik uygulama bağımlılığı, unutulmuş şifreleme anahtarı veya erişilemeyen yedek hesabı geri dönüşü engelleyebilir. Yedek politikasında veri kapsamı, sıklık, saklama, değişmezlik, şifreleme ve test birlikte tanımlanmalıdır.

Pratikte 3-2-1-1-0 yaklaşımı yararlı bir kontrol çerçevesidir: verinin en az üç kopyası, iki farklı ortam, bir farklı konum, bir çevrim dışı veya değiştirilemez kopya ve doğrulama sonunda sıfır hata hedefi. Bu bir ürün özelliğinden çok dayanıklılık prensibidir. Bulut üzerindeki verinin yine aynı yönetici hesabına bağlı başka bir bulut klasörüne kopyalanması, kimlik hesabı ele geçirildiğinde yeterli ayrışma sağlamayabilir.

Yedek servis hesapları günlük kullanıcı hesaplarından ayrılmalı, güçlü kimlik doğrulama kullanılmalı ve silme yetkileri sınırlandırılmalıdır. Yedek depolarına yapılan olağan dışı silme, saklama politikası değişikliği veya başarısız iş artışı alarm üretmelidir.

Kurtarma testleri farklı seviyelerde planlanabilir:

- Aylık dosya ve nesne geri yükleme testi
- Üç aylık uygulama veya veri tabanı kurtarma testi
- Altı aylık izole ortamda uçtan uca hizmet testi
- Yıllık masa başı felaket senaryosu ve iletişim tatbikatı

Test sonucunda geçen süre, bulunan eksikler ve güncellenen prosedür kaydedilmelidir.

## 4. İzlemeyi bileşenden hizmet seviyesine taşıyın

CPU, bellek ve disk değerleri gereklidir fakat kullanıcı deneyimini tek başına anlatmaz. İzleme üç katmanda kurulmalıdır: altyapı sağlığı, uygulama davranışı ve uçtan uca iş işlemi. Örneğin web sunucusu yüzde 20 CPU ile çalışırken oturum açma servisi hata veriyor olabilir.

Kritik hizmetler için sentetik kontroller gerçek kullanıcı adımlarını taklit edebilir: DNS çöz, HTTPS bağlantısı kur, oturum aç, örnek sorgu çalıştır ve beklenen yanıtı doğrula. Bu kontroller yalnızca “port açık mı?” testinden daha değerlidir.

Alarm kalitesi de önemlidir. Her eşik ihlalinde bildirim üreten sistem kısa sürede alarm yorgunluğu oluşturur. Alarmın açıklaması etkilenen hizmeti, olası nedeni, önceliği, sorumluyu ve ilk kontrol adımını içermelidir. Uyarılar olay yönetim akışına bağlanmalı; kritik alarmlar mesai dışı sorumluluğu da netleştirmelidir.

## 5. Güncelleme ve bakım işini kontrollü hale getirin

Yama yönetimi yalnızca güvenlik güncellemesi kurmak değildir. Varlıkların destek durumu, kritik açıklar, uygulama uyumluluğu, bakım penceresi ve geri dönüş yöntemi birlikte yönetilir. İnternete açık veya kimlik altyapısında rol alan sistemler risklerine göre önceliklendirilmelidir.

Değişiklik önce temsilî test ortamında denenmeli, ardından düşük riskli grupla aşamalı uygulanmalıdır. Sanal makine anlık görüntüsü her zaman tam geri dönüş planı değildir; veri tabanı işlemleri veya harici bağımlılıklar değiştiyse tutarlı geri dönüş ayrıca tasarlanmalıdır.

Bakım planı aşağıdakileri kapsamalıdır:

- İşletim sistemi, hypervisor, firmware ve uygulama sürümleri
- Destek sonu yaklaşan ürünler
- Sertifika ve lisans bitiş tarihleri
- Kapasite eğilimleri ve depolama büyümesi
- Güvenlik açığı ve yapılandırma sapması takibi
- Bakım sonrası işlevsel kabul testleri

## 6. Kimlik ve yönetim düzlemini ayrı koruyun

Birçok kesintinin etkisi, yönetim hesapları veya merkezi kimlik servisi erişilemediğinde büyür. Ayrıcalıklı hesaplar günlük kullanım hesaplarından ayrılmalı, çok faktörlü kimlik doğrulama uygulanmalı ve acil durum hesapları kontrollü biçimde saklanmalıdır. Yönetim arabirimlerine kullanıcı ağından doğrudan erişim yerine güvenli yönetim ağı veya onaylı geçiş noktası kullanılmalıdır.

Kimlik servislerinin de kendi süreklilik planı olmalıdır. Tek bir domain controller, tek DNS noktası veya yalnızca çevrim içi parola kasası kurtarma sırasında kilitlenmeye yol açabilir. Acil durum iletişim listesi ve kritik prosedürler yalnızca üretim sisteminde tutulmamalıdır.

## 7. Kapasite ve tek hata noktalarını düzenli değerlendirin

Yedekli görünen mimariler ortak bağımlılık nedeniyle birlikte kesilebilir. İki sanal sunucu aynı fiziksel hostta, çift güç kaynağı aynı prize, iki internet hattı aynı bina girişine veya iki servis aynı kimlik sağlayıcısına bağlı olabilir. Tasarım incelemesinde cihaz sayısından çok hata alanları değerlendirilmelidir.

Kapasite planı yalnızca disk doluluk alarmı değildir. İşlemci, bellek, IOPS, ağ, lisans, yedekleme penceresi ve veri tabanı büyümesi eğilim olarak izlenmelidir. Mevsimsel yoğunluk ve planlanan iş büyümesi tahmine eklenmelidir. Kritik kaynak için kapasite eşiğine gelmeden tedarik ve genişleme süresi hesaba katılmalıdır.

## 8. Olay, felaket ve iş sürekliliği planlarını birbirine bağlayın

Bir güvenlik olayı ile donanım arızası aynı teknik sistemi etkileyebilir fakat müdahale şekli farklıdır. Fidye yazılımı şüphesinde sistemi hızla yeniden başlatmak delili yok edebilir veya saldırının yayılmasını kolaylaştırabilir. Bu nedenle olay müdahale, felaket kurtarma ve iş sürekliliği planları ortak karar noktaları içermelidir.

Her kritik hizmet için kısa ve uygulanabilir bir runbook hazırlanmalıdır: alarm nasıl doğrulanır, ilk izolasyon ne, kime haber verilir, hangi yedekten hangi sırayla dönülür, veri tutarlılığı nasıl kontrol edilir ve hizmeti kim kabul eder? Uzun bir doküman yerine olay sırasında izlenebilen net adımlar daha değerlidir.

Tatbikatlar yalnızca teknik ekiple yapılmamalıdır. İş birimi, yönetim, iletişim, hukuk ve tedarikçi rolleri senaryoya göre dahil edilmelidir. Tatbikat sonrası bulunan her eksik için sorumlu ve tarih atanmalıdır.

## 9. Sürekliliği ölçün ve iyileştirin

Programın etkinliği birkaç temel göstergeyle izlenebilir:

- Kritik hizmetlerde gerçekleşen erişilebilirlik
- Ortalama tespit ve geri dönüş süresi
- Hedef RTO ve RPO'yu karşılayan test oranı
- Başarısız veya uyarılı yedek işlerinin oranı
- Süresi geçmiş kritik yamalar
- Güncel olmayan runbook ve envanter kayıtları
- Tekrarlayan olayların ve değişiklik kaynaklı kesintilerin sayısı

Bu göstergeler cezalandırma için değil, zayıf halkaları görünür kılmak için kullanılmalıdır. Her olay ve testten sonra plan güncellenmezse süreklilik dokümanı kısa sürede mevcut ortamdan kopar.

## Uygulanabilir kontrol listesi

- Kritik iş hizmetleri ve teknik bağımlılıkları kayıtlı mı?
- Her hizmet için iş tarafından onaylanmış RTO ve RPO var mı?
- Yedek kopyalardan en az biri üretim kimlik alanından ayrılmış mı?
- Geri yükleme testleri takvimli ve sonuçları ölçülüyor mu?
- İzleme, kullanıcı açısından kritik işlemi doğruluyor mu?
- Alarm sahipleri ve mesai dışı iletişim yolu belirli mi?
- Yama, sertifika, lisans ve destek sonu tarihleri takip ediliyor mu?
- Yönetim hesapları ve arayüzleri ayrı korunuyor mu?
- Ortak bağımlılıklar ve tek hata noktaları belgelendi mi?
- Olay ve kurtarma runbook'ları tatbikatlarla doğrulanıyor mu?

Sistem sürekliliği tek seferlik proje değildir. İş hizmetleri, ekipler ve tehditler değiştikçe hedefler, yedekler ve prosedürler de değişir. En değerli çıktı kusursuzluk iddiası değil; kesinti anında ne yapılacağını bilen, düzenli test edilen ve ölçülebilir biçimde gelişen bir işletim modelidir.

## Kaynaklar ve ileri okuma

- [NIST SP 800-34 Rev. 1 — Contingency Planning Guide](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final)
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [CISA StopRansomware Guide](https://www.cisa.gov/stopransomware/ransomware-guide)`,
      category: "system",
      image: "/assets/images/blog/system-continuity.webp",
      status: "published",
    },
    {
      title: "İyi Bir Kurumsal Web Sitesinin Temelleri",
      slug: "iyi-bir-kurumsal-web-sitesinin-temelleri",
      excerpt: "Hız, erişilebilirlik ve kullanıcı deneyimini aynı tasarım sistemi içinde buluşturmak.",
      content: `## Kurumsal web sitesi bir broşür değil, çalışan bir sistemdir

Kurumsal web sitesi çoğu zaman yalnızca markanın dijital yüzü olarak tanımlanır. Bu tanım eksiktir. Site; potansiyel müşterinin hizmeti anlamasını, doğru uzmanlığa ulaşmasını, güven oluşturmasını ve iletişim başlatmasını sağlayan bir iş sistemidir. Aynı zamanda pazarlama ekibinin içerik ürettiği, arama motorlarının taradığı, analitik verinin toplandığı ve teknik ekibin sürdürdüğü ortak bir platformdur.

İyi görünen fakat yavaş açılan, mobilde görevleri uzatan, erişilebilir olmayan veya editörün yeni sayfa oluşturamadığı bir site kurumsal ihtiyacı karşılamaz. Başarı görsel kalite, içerik mimarisi, performans, erişilebilirlik, güvenlik ve işletilebilirlik birlikte ele alındığında ortaya çıkar.

## Tasarımdan önce kullanıcı görevlerini tanımlayın

İlk adım renk veya ana sayfa kompozisyonu değildir. Ziyaretçinin siteye hangi amaçla geldiği belirlenmelidir. Bir B2B hizmet sitesinde temel görevler şunlar olabilir:

- Belirli bir hizmetin kapsamını ve çözdüğü problemi anlamak
- Sektöre uygun deneyim veya referans görmek
- Teknik yaklaşımı ve teslim modelini değerlendirmek
- İlgili uzmanlığa veya iletişim kanalına ulaşmak
- Mevcut müşteri olarak destek veya dokümana erişmek

Bu görevler kullanıcı görüşmeleri, satış ekibinin sık aldığı sorular, arama verileri ve mevcut analitik kayıtlarla doğrulanabilir. Bilgi mimarisi organizasyon şemasını birebir yansıtmak yerine ziyaretçinin karar yolunu desteklemelidir. Şirket içinde ayrı departmanlar tarafından yürütülen iki hizmet, kullanıcı açısından aynı problemin parçalarıysa aralarında güçlü bağlantı kurulmalıdır.

Her sayfanın tek bir amacı ve ölçülebilir bir sonraki adımı olmalıdır. “Daha fazla bilgi” gibi bağlamsız çağrılar yerine “Network keşif görüşmesi planlayın” veya “İlgili referansı inceleyin” gibi açık yönlendirmeler tercih edilmelidir.

## İçerik modelini sayfa tasarımından ayırın

Kurumsal sitelerde bakım sorununun önemli bir nedeni her sayfanın özel olarak tasarlanmasıdır. İlk yayında etkileyici görünen bu yaklaşım, birkaç ay sonra farklı başlık boyutları, tutarsız kartlar ve kopyalanmış içerikler üretir.

Hizmet, sektör, referans, ekip üyesi ve blog yazısı gibi içerik türleri ayrı modellenmelidir. Her türün zorunlu alanları, ilişkileri ve yayın kuralları tanımlanır. Örneğin hizmet içeriğinde problem tanımı, kapsam, süreç, ilgili referans ve iletişim aksiyonu bulunması zorunlu olabilir. Böylece editör tasarım kararını her sayfada yeniden vermez; onaylanmış bileşenlerle tutarlı içerik üretir.

Tasarım sistemi yalnızca buton ve renk kütüphanesi değildir. Bileşenin hangi içerik için, hangi varyasyonlarla ve hangi erişilebilirlik davranışıyla kullanılacağını da tanımlar. Başlık hiyerarşisi, boşluk ölçeği, form durumları, odak görünümü ve responsive davranış ortak kurallara bağlanmalıdır.

## Performansı gerçek kullanıcı deneyimi üzerinden yönetin

Hız değerlendirmesi tek bir masaüstü test skoruna indirgenmemelidir. Core Web Vitals, gerçek deneyimin üç önemli yönünü ölçer: LCP ana içeriğin algılanan yüklenme hızını, INP etkileşimlere verilen yanıtı, CLS ise beklenmeyen yerleşim kaymalarını izler. Güncel “iyi” eşikleri LCP için 2,5 saniye veya altı, INP için 200 milisaniye veya altı ve CLS için 0,1 veya altıdır; değerlendirme genellikle ziyaretlerin yüzde 75'lik dilimi üzerinden yapılır.

Bu değerler hedef değil, taban kabul edilmelidir. İyileştirme için önce darboğazın katmanı bulunur:

- Yüksek TTFB: sunucu, önbellek, veri tabanı veya coğrafi uzaklık
- Yüksek LCP: büyük ana görsel, geç yüklenen font veya render engelleyen kaynak
- Yüksek INP: uzun JavaScript görevleri, ağır üçüncü taraf betikleri veya karmaşık DOM güncellemeleri
- Yüksek CLS: boyutu belirtilmeyen görseller, sonradan eklenen banner veya font değişimi

Görseller uygun boyutta ve modern formatta sunulmalı, ekran dışı kaynaklar gecikmeli yüklenmeli, kritik font ve stiller kontrollü kullanılmalıdır. Üçüncü taraf sohbet, analiz ve pazarlama betikleri düzenli olarak gözden geçirilmelidir. Laboratuvar testleri geliştirme sırasında yararlıdır; gerçek kullanıcı ölçümü ise farklı cihaz ve bağlantılardaki sonucu gösterir.

## Erişilebilirliği son kontrol değil tasarım girdisi yapın

W3C, güncel çalışmalar için WCAG 2.2 kullanımını önerir. Erişilebilirlik yalnızca yasal uyum konusu değil, daha geniş ve daha kullanılabilir bir deneyimin temelidir. Semantik HTML, doğru başlık sırası, klavye erişimi, görünür odak durumu, yeterli renk kontrastı ve açıklayıcı form etiketleri birçok kullanıcı için doğrudan kalite farkı yaratır.

Otomatik araçlar renk kontrastı veya eksik etiket gibi sorunları bulabilir fakat tamamını yakalayamaz. Klavyeyle gerçek görev testi, ekran okuyucu ile temel akışların kontrolü ve büyütülmüş metinde responsive davranışın incelenmesi gerekir. Hata mesajı yalnızca renkle anlatılmamalı; alanla ilişkilendirilen açık bir metin sunulmalıdır.

Animasyonlarda hareket azaltma tercihine saygı gösterilmeli, otomatik başlayan hareketli içerikler kontrol edilebilir olmalı ve hover ile görünen bilgi klavye veya dokunmatik kullanımda da erişilebilir kalmalıdır.

## Güvenliği yayın sonrasına bırakmayın

Kurumsal web güvenliği yalnızca SSL sertifikası değildir. Formlar, yönetim paneli, dosya yükleme, üçüncü taraf entegrasyonlar ve içerik yönetim sistemi ayrı saldırı yüzeyleri oluşturur. OWASP ASVS gibi standartlar doğrulama gereksinimlerini geliştirme ve tedarik süreçlerinde somutlaştırmak için kullanılabilir.

Temel kontroller şunları kapsar:

- Sunucu tarafında giriş doğrulama ve güvenli çıktı kodlama
- Yönetim hesaplarında güçlü kimlik doğrulama ve en az ayrıcalık
- Güvenlik güncellemeleri ve bağımlılık takibi
- Güvenli oturum, çerez ve başlık ayarları
- Formlarda oran sınırlama, spam ve kötüye kullanım kontrolleri
- Gizli anahtarların kaynak koddan ayrılması
- Merkezi hata kaydı, izleme ve olay müdahale yolu

Kişisel veri toplayan her alanın amacı ve saklama süresi açık olmalıdır. “İleride lazım olabilir” düşüncesiyle gereksiz veri toplamak hem güvenlik etkisini hem yönetişim yükünü artırır.

## SEO'yu içerik ve geçiş mimarisiyle birlikte ele alın

Teknik SEO bir eklenti kurmakla tamamlanmaz. Taranabilir bağlantılar, benzersiz başlık ve açıklamalar, doğru canonical kullanımı, yapılandırılmış veri, sitemap ve anlamlı HTTP durum kodları temel bileşenlerdir. Aynı konuya cevap veren çok sayıda zayıf sayfa oluşturmak yerine net içerik sahipliği kurulmalıdır.

Mevcut site yenileniyorsa URL envanteri ve yönlendirme matrisi yayın öncesinde hazırlanmalıdır. Google, kalıcı taşımalar için sunucu tarafı 301 veya 308 yönlendirmelerini; eski URL'lerin alakasız biçimde ana sayfaya gönderilmemesini önerir. İç bağlantılar yeni adreslere güncellenmeli, yönlendirme zincirleri azaltılmalı ve geçiş Search Console ile izlenmelidir.

Yayın günü robots veya noindex ayarlarının üretime taşınması, canonical adreslerinin test ortamını göstermesi ve eski URL'lerin 404 vermesi sık karşılaşılan hatalardır. Teknik kontrol listesi bu nedenle tasarım kabulünden ayrı yürütülmelidir.

## Ölçüm planını yayından önce kurun

Sayfa görüntüleme sayısı tek başına karar üretmez. Ölçüm, kullanıcı görevleriyle eşleştirilmelidir. Hizmet sayfasından referansa geçiş, form başlatma, doğrulama hatası, başarılı gönderim, telefon veya e-posta tıklaması gibi olaylar ortak isimlendirmeyle tanımlanabilir.

Her KPI için sahip, veri kaynağı ve karar karşılığı belirlenmelidir. Form dönüşümü düştüğünde hangi ekip inceleyecek? Arama yapan ziyaretçi sonuç bulamıyorsa içerik mi navigasyon mu değişecek? Ölçümün eyleme dönüşmediği durumda daha fazla veri yalnızca rapor yükü oluşturur.

Gizlilik tercihi ve çerez yönetimi kullanılan analitik araçlarla uyumlu tasarlanmalıdır. Pazarlama etiketleri performans bütçesine ve veri politikasına dahil edilmelidir.

## Yayın, projenin bitişi değil işletim başlangıcıdır

Kurumsal sitenin teknik ve editoryal sahipleri belirlenmelidir. Kırık bağlantı, form teslimatı, performans, güvenlik güncellemesi, sertifika süresi ve arama görünürlüğü düzenli izlenmelidir. İçeriklerin gözden geçirme tarihi ve sahibi olursa eski hizmet tanımları ile ayrılan çalışan profilleri yıllarca yayında kalmaz.

İyi bir yayın sonrası plan şu ritmi içerebilir:

- Haftalık form ve kritik hata kontrolü
- Aylık performans, arama ve dönüşüm değerlendirmesi
- Üç aylık içerik güncelliği ve erişilebilirlik örneklemesi
- Düzenli bağımlılık, platform ve güvenlik güncellemeleri
- Büyük değişiklikler öncesinde regresyon ve yönlendirme testi

## Son kontrol listesi

- Kullanıcı görevleri ve sayfa amaçları açık mı?
- İçerik türleri ve bileşen kuralları tanımlı mı?
- Mobil görevler gerçek cihazlarda test edildi mi?
- LCP, INP ve CLS hem laboratuvar hem saha verisiyle izleniyor mu?
- Klavye, odak, kontrast ve form hataları kontrol edildi mi?
- Yönetim, form ve entegrasyon güvenliği test edildi mi?
- Eski ve yeni URL'ler için yönlendirme matrisi hazır mı?
- Analitik olaylar iş hedeflerine bağlı mı?
- Yayın sonrası içerik ve teknik bakım sahipleri belli mi?

Başarılı kurumsal web sitesi, tasarım tesliminden sonra da gelişebilen sistemdir. Kullanıcıyı doğru bilgiye hızlı ulaştırır, editörün işini kolaylaştırır, ölçülebilir sonuç üretir ve teknik borcu kontrol altında tutar.

## Kaynaklar ve ileri okuma

- [web.dev — Core Web Vitals eşikleri](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [W3C — Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [OWASP — Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [Google Search Central — Site taşıma rehberi](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)`,
      category: "web",
      image: "/assets/images/blog/corporate-web-foundations.webp",
      status: "published",
    },
    {
      title: "İş Süreçleri Otomasyonuna Nereden Başlanır?",
      slug: "is-surecleri-otomasyonuna-nereden-baslanir",
      excerpt: "Tekrarlayan işleri ve veri akışını özel yazılım yaklaşımıyla değerlendirmenin temel adımları.",
      content: `## Otomasyon, mevcut hatayı daha hızlı tekrarlamamalı

İş süreçleri otomasyonu denildiğinde ilk akla gelen ekranlar arasında veri taşıyan robotlar veya otomatik e-postalardır. Oysa başarılı otomasyon bir araç seçiminden önce süreç tasarımı çalışmasıdır. Gereksiz onayları, belirsiz sorumlulukları ve hatalı veri girişini olduğu gibi yazılıma aktarmak süreci iyileştirmez; yalnızca problemi daha hızlı ve daha görünmez hale getirir.

Doğru başlangıç sorusu “Hangi aracı kullanalım?” değil, “Bu iş neden yapılıyor, hangi değeri üretiyor ve nerede bekliyor?” olmalıdır. Sürecin amacı, başlangıç ve bitiş koşulları, girdileri, çıktıları, karar kuralları ve istisnaları anlaşılmadan yapılan otomasyon kırılgan olur.

## Süreci anlatıldığı gibi değil, gerçekten çalıştığı gibi görün

Prosedür dokümanı ile günlük operasyon çoğu zaman aynı değildir. Çalışanlar eksik veriyi tamamlamak için kişisel tablolar tutabilir, onay geciktiğinde mesajlaşma uygulamasından ilerleyebilir veya sistemler arasındaki uyuşmazlığı manuel olarak düzeltebilir. Bunlar “istisna” gibi görünse de bazen gerçek sürecin önemli bölümünü oluşturur.

Analiz için üç veri kaynağı birlikte kullanılmalıdır:

- Süreç sahibi ve uygulayıcılarla görüşmeler
- Gerçek vakaların adım adım gözlemi
- Sistem günlükleri, zaman damgaları ve işlem kayıtları

Süreç madenciliği, sistemlerdeki olay verilerinden gerçek akışları, bekleme noktalarını ve farklı süreç varyantlarını görünür kılabilir. Microsoft'un süreç madenciliği rehberinde de olay verilerinin süreç haritası, kök neden ve KPI analizi için kullanılması vurgulanır. Ancak veri kalitesi düşükse harita da eksik olur; vaka kimliği, aktivite adı ve zaman bilgisi tutarlı olmalıdır.

Basit bir süreç envanteri şu alanları içerir:

- Sürecin tetikleyicisi ve tamamlanma koşulu
- Aylık işlem hacmi ve dönemsel yoğunluk
- Her adımın sorumlusu ve kullandığı sistem
- Ortalama işlem ve bekleme süreleri
- Yeniden işleme, hata ve iptal oranları
- Kullanılan veri ve hassasiyet seviyesi
- İstisna türleri ve karar yetkisi
- Mevcut performans göstergeleri

## Doğru otomasyon adayını puanlayın

Sık tekrarlanan her iş iyi otomasyon adayı değildir. Süreç sık değişiyor, giriş verisi standart değil veya kararlar yoğun uzman yorumuna dayanıyorsa önce standardizasyon gerekebilir. Adayları ortak ölçütlerle puanlamak, yalnızca en görünür talebe yatırım yapılmasını engeller.

Yüksek potansiyelli süreçler genellikle şu özelliklere sahiptir:

- Yüksek hacimli ve düzenli tekrar
- Açık, istikrarlı iş kuralları
- Yapılandırılmış ve erişilebilir veri
- Ölçülebilir manuel süre veya hata maliyeti
- Sınırlı sayıda yönetilebilir istisna
- Net süreç sahibi
- Otomasyon sonrası doğrulanabilir çıktı

Risk de puana dahil edilmelidir. Yanlış bordro kaydı, hatalı ödeme veya yetkisiz müşteri verisi aktarımı üreten otomasyonun etkisi, birkaç dakikalık zaman kazancından çok daha büyüktür. Finansal, hukuki veya güvenlik etkisi yüksek adımlarda insan onayı korunabilir.

## Süreci otomasyondan önce sadeleştirin

Bir formdan alınan veriyi üç farklı tabloya yazıp sonra ana sisteme aktarmak yerine veri bir kez, doğru kaynaktan alınabilir mi? İki yönetici aynı bilgiyi onaylıyorsa iki onay gerçekten farklı riskleri mi kontrol ediyor? Rapor zaten sistemde üretilebiliyorsa çalışan neden dışa aktarım yapıyor?

Sadeleştirme sırasında adımlar dört gruba ayrılabilir:

- Değer üreten ve korunacak adımlar
- Yasal veya kontrol amacıyla gerekli adımlar
- Birleştirilebilecek ya da standardize edilecek adımlar
- Tamamen kaldırılabilecek adımlar

Bu çalışma otomasyon kapsamını küçültür ve bakım maliyetini azaltır. En iyi otomasyon bazen bir entegrasyon değil, gereksiz veri girişinin kaldırılmasıdır.

## API, iş akışı motoru ve RPA arasında doğru sınırı kurun

Sistem API sunuyorsa yapılandırılmış entegrasyon genellikle ekran otomasyonundan daha dayanıklıdır. API; veri sözleşmesini, hata kodunu, kimlik doğrulamayı ve işlem durumunu daha açık yönetir. RPA ise API bulunmayan eski uygulamalarda veya geçiş döneminde değerli olabilir; fakat ekran konumu, metin veya kullanıcı arayüzü değişikliklerinden etkilenir.

Teknik yaklaşım üç katmanda düşünülebilir:

- Sistemler arası veri ve işlem için API veya mesajlaşma
- Uzun süren, çok adımlı işler için iş akışı orkestrasyonu
- İnsan ekran davranışının zorunlu olduğu sınırlı adımlar için RPA

Dosya paylaşımı veya e-posta eki üzerinden entegrasyon gerekiyorsa dosya adı, şema, karakter kodlaması, tekrar işleme ve arşiv kuralları açıkça tanımlanmalıdır. “Klasöre düşen her dosyayı işle” yaklaşımı eksik veya iki kez gelen veride sorun çıkarır.

## Güvenilirlik için idempotency ve durum yönetimi tasarlayın

Otomasyonlar ağ kesintisi, zaman aşımı veya hizmet hatası yaşayabilir. Bir işlem tekrar denendiğinde ikinci kez fatura, sipariş veya kullanıcı oluşturmaması gerekir. Aynı isteğin birden fazla uygulanmasını önleyen idempotency anahtarları veya benzersiz işlem kimlikleri bu nedenle önemlidir.

Her vaka için durum modeli belirlenmelidir: alındı, doğrulandı, işleniyor, insan onayı bekliyor, tamamlandı, yeniden denenecek veya manuel inceleme gerekiyor. Yalnızca “başarılı/başarısız” kaydı operasyon ekibine yeterli bağlam vermez.

Hata yönetimi en az üç türü ayırmalıdır:

- Geçici teknik hata: kontrollü aralıklarla yeniden denenebilir
- Kalıcı veri hatası: düzeltme için iş kuyruğuna alınır
- İş kuralı istisnası: yetkili kişinin kararına yönlendirilir

Sonsuz yeniden deneme hem sistem yükünü hem veri riskini artırır. Deneme sayısı, bekleme stratejisi ve sonrasında oluşacak görev açık olmalıdır.

## İnsan onayını bilinçli biçimde konumlandırın

İnsan döngüde olduğunda otomasyon başarısız sayılmaz. Belirsiz, yüksek riskli veya istisnai kararları uzmana bırakmak çoğu süreçte doğru tasarımdır. Ancak onay adımı yalnızca “emin olmak için” eklenirse yeni darboğaz yaratır.

Onay ekranı karar için gereken bağlamı tek yerde göstermelidir: kaynak veri, önceki adımlar, risk işaretleri, önerilen karar ve zaman sınırı. Onaylayan kişinin ayrıca üç sistemden bilgi toplaması gerekiyorsa süreç otomatik görünse de manuel yük devam eder.

Yetki devri, tatil durumu ve zaman aşımı senaryosu tanımlanmalıdır. Kimse yanıt vermezse işlem kaybolmamalı; yedek sorumluya veya istisna kuyruğuna yönlenmelidir.

## Güvenlik ve veri yönetişimini akışa gömün

Otomasyon hesabına “çalışsın diye” geniş yönetici yetkisi vermek önemli bir risktir. Her akış için ayrı servis kimliği, en az ayrıcalık, güvenli sır yönetimi ve düzenli erişim gözden geçirmesi uygulanmalıdır. Parolalar akış tanımına, tabloya veya kod içine yazılmamalıdır.

Kayıtlarda kişisel veya hassas verinin tamamını tutmak yerine hata ayıklama için gereken minimum alanlar seçilmelidir. Günlüklerin saklama süresi, kimlerin erişebileceği ve maskeleme kuralları belirlenmelidir. Üretim verisi test ortamına taşınacaksa anonimleştirme veya sentetik veri kullanılmalıdır.

Otomasyon değişiklikleri sürümlenmeli, geliştirme-test-üretim ortamları ayrılmalı ve yayın yetkisi kontrol edilmelidir. Kritik akışlarda tek kişinin hem geliştiren hem onaylayan olması yerine uygun görev ayrılığı kurulabilir.

## Küçük bir pilotla teknik ve operasyonel varsayımları test edin

İlk pilot, en büyük sürecin tamamı olmak zorunda değildir. Başarıyı ölçmeye yetecek, uçtan uca değer üreten fakat risk alanı sınırlı bir dilim seçilmelidir. Örneğin faturanın tamamen otomatik ödenmesi yerine gelen belgenin sınıflandırılması, doğrulanması ve onaya hazır kayıt oluşturması pilot olabilir.

Pilot öncesinde taban değerleri kaydedin:

- Vaka başına aktif çalışma süresi
- Uçtan uca tamamlanma süresi
- Hata ve yeniden işleme oranı
- Bekleyen vaka sayısı
- Kullanıcı başına işlem kapasitesi
- Müşteri veya çalışan geri bildirimi

Pilot sonrasında yalnızca kaç saat kazanıldığına bakmayın. Hata oranı, istisna yükü, destek ihtiyacı ve kullanıcı güveni de ölçülmelidir. Otomasyon ekibi iş birimiyle birlikte sonucu değerlendirip sonraki kapsamı belirlemelidir.

## Üretimde görünürlük ve sahiplik kurun

Bir akışın çalışıp çalışmadığını yalnızca şikâyet geldiğinde öğrenmek sürdürülebilir değildir. Teknik ve iş metrikleri ortak panelde izlenebilir:

- Başlatılan, tamamlanan ve başarısız vaka sayısı
- İşlem ve kuyruk bekleme süreleri
- Yeniden deneme ve manuel müdahale oranı
- Sistem veya hata türüne göre dağılım
- Zamanında tamamlanma oranı
- Otomasyonun sağladığı net süre ve maliyet etkisi

Her akışın iş sahibi, teknik sahibi ve destek yolu belli olmalıdır. Bağlı sistem değiştiğinde kim haber verecek? Yeni veri alanı geldiğinde kim test edecek? Sertifika süresi dolmadan kim yenileyecek? Bu soruların cevabı yoksa otomasyon kişiye bağımlı hale gelir.

## Aşamalı başlangıç planı

- Süreç listesini ve sahiplerini çıkarın.
- Hacim, süre, hata, risk ve veri olgunluğunu puanlayın.
- En uygun adayda gerçek akışı gözlemleyin.
- Gereksiz adımları kaldırıp kuralları standartlaştırın.
- API, orkestrasyon, RPA ve insan onayı sınırlarını belirleyin.
- Durum, hata, tekrar deneme ve idempotency tasarımını yapın.
- Güvenlik, günlükleme ve veri saklama kurallarını tanımlayın.
- Ölçülebilir bir pilot yayınlayın.
- Sonuçları taban değerlerle karşılaştırın.
- İşletim sahibi ve gelişim kuyruğuyla kapsamı büyütün.

İyi otomasyon çalışanı süreçten dışlamaz; tekrarlı yükü azaltıp karar kalitesini yükseltir. Başlangıç noktası teknoloji değil, kanıtlanmış süreç problemi olduğunda otomasyonun değeri ve sürdürülebilirliği birlikte artar.

## Kaynaklar ve ileri okuma

- [Microsoft Learn — Process mining overview](https://learn.microsoft.com/en-us/power-automate/process-mining-overview)
- [Microsoft Learn — Task mining ile otomasyon fırsatlarını belirleme](https://learn.microsoft.com/en-us/power-automate/task-mining-tutorial)`,
      category: "software",
      image: "/assets/images/blog/business-process-automation.webp",
      status: "published",
    },
    {
      title: "Dijital Dönüşüm Yol Haritası Nasıl Oluşturulur?",
      slug: "dijital-donusum-yol-haritasi",
      excerpt: "Teknoloji yatırımlarını gerçek ihtiyaçlar ve uygulanabilir önceliklerle planlamak.",
      content: `## Yol haritası bir satın alma listesi değildir

Dijital dönüşüm yol haritası bazen yeni ERP, CRM, bulut veya yapay zekâ projelerinin tarih sıralı listesi olarak hazırlanır. Bu yaklaşım teknoloji faaliyetini gösterir fakat iş sonucunu garanti etmez. Gerçek yol haritası; kurumun ulaşmak istediği sonucu, mevcut engelleri, gerekli yetkinlikleri, bağımlılıkları ve yatırım kararlarını ortak bir çerçevede birleştirir.

Başlangıç noktası “hangi teknolojiye geçmeliyiz?” değil, “hangi iş sonucunu neden değiştirmeliyiz?” sorusudur. Sipariş hazırlama süresini azaltmak, yeni şubeyi daha hızlı devreye almak, stok doğruluğunu artırmak veya güvenlik riskini düşürmek gibi ölçülebilir hedefler teknoloji seçimini yönlendirir.

Microsoft Cloud Adoption Framework gibi kurumsal çerçeveler de stratejinin iş hedefleri ve ölçülebilir sonuçlarla başlamasını; planın insan, süreç, teknoloji, yönetişim ve operasyon sorumluluklarını birlikte ele almasını önerir. Bu yaklaşım yalnızca bulut projeleri için değil, daha geniş dönüşüm programları için de yararlı bir düşünme biçimidir.

## 1. Dönüşüm gerekçesini somutlaştırın

“Daha dijital olmak” ölçülebilir bir hedef değildir. Dönüşüm gerekçesi mevcut iş problemi, beklenen sonuç ve başarı göstergesiyle yazılmalıdır. Örneğin:

- Bayi siparişlerinin yüzde 70'inin e-posta ve tabloyla ilerlemesi nedeniyle sipariş doğrulama süresini iki günden dört saate indirmek
- Yeni çalışan hesabı açma sürecindeki manuel adımları azaltarak ilk gün hazır olma oranını yüzde 60'tan yüzde 95'e çıkarmak
- Kritik sistemlerde geri dönüş süresini sekiz saatten iki saate düşürmek
- Web üzerinden gelen taleplerin hizmet ve kaynak bilgisiyle CRM'e aktarılmasını sağlayarak niteliksiz yönlendirmeyi azaltmak

Her hedefin iş sahibi bulunmalı ve başlangıç değeri ölçülmelidir. Taban veri yoksa dönüşüm sonrasında iyileşmeyi kanıtlamak zorlaşır. Ölçüm mümkün değilse ilk fazın çıktısı doğru veri üretmek olabilir.

## 2. Mevcut durumu yalnızca uygulama envanteriyle sınırlamayın

Mevcut durum analizi altı boyutta yapılabilir: iş süreçleri, uygulamalar, veri, altyapı, güvenlik ve işletim modeli. Bir uygulamanın adı ve sürümü önemlidir; fakat kim tarafından, hangi amaçla kullanıldığı, hangi veriyi ürettiği, hangi sistemlere bağımlı olduğu ve sorun anında kimin müdahale ettiği daha değerlidir.

Analiz sırasında şu kanıtlar toplanabilir:

- Süreç haritaları, işlem hacmi, bekleme ve hata oranları
- Uygulama ve lisans envanteri, kullanım oranları ve destek durumu
- Veri sahipleri, kritik veri setleri, kalite sorunları ve entegrasyon akışları
- Sunucu, ağ, bulut ve uç nokta mimarisi
- Erişim, yedekleme, izleme, olay ve değişiklik kayıtları
- Ekip rolleri, tedarikçi bağımlılıkları ve karar mekanizmaları
- Maliyetler, sözleşme tarihleri ve devam eden projeler

Görüşmeler algıyı, teknik kayıtlar gerçeği gösterir. İkisi birlikte kullanılmalıdır. “Sistem sık sık yavaşlıyor” ifadesi izleme verisiyle; “onaylar gecikiyor” ifadesi işlem zaman damgalarıyla doğrulanabilir.

## 3. Hedef işletim modelini tanımlayın

Dönüşüm yalnızca yeni platformun teknik mimarisi değildir. Yeni yapıda kim ürün sahibi olacak, kim güvenlik politikasını belirleyecek, kim veriyi yönetecek, kim destek verecek ve değişiklikler nasıl önceliklendirilecek? Bu sorular hedef işletim modelinin parçasıdır.

Merkezi model tutarlı politika ve kontrol sağlar fakat tek ekibi darboğaza dönüştürebilir. Tamamen dağıtık model hızı artırabilir fakat standart ve güvenlik farkları oluşturabilir. Birçok kurumda ortak platform ve güvenlik sınırlarını merkezi ekibin, iş yükü ve ürün kararlarını alan ekiplerin yönettiği paylaşımlı model dengeli olabilir.

RACI tablosu tek başına yeterli değildir. Her kritik karar için giriş bilgisi, onay yetkisi, uygulayıcı ve takip göstergesi tanımlanmalıdır. Özellikle bulut maliyeti, ayrıcalıklı erişim, veri sahipliği, tedarikçi yönetimi ve olay müdahalesinde sorumluluk boşluğu bırakılmamalıdır.

## 4. Veri temelini ayrı bir çalışma hattı olarak ele alın

Yeni uygulama, mevcut veri sorunlarını otomatik olarak çözmez. Aynı müşterinin üç sistemde farklı kodla tutulması, adreslerin standart olmaması veya ürün ana verisinin sahipsiz olması entegrasyon ve raporlama projelerini doğrudan etkiler.

Yol haritası kritik veri alanları için şu kararları içermelidir:

- Yetkili kayıt sistemi hangisi?
- Veri sahibi ve kalite sorumlusu kim?
- Zorunlu alanlar ve doğrulama kuralları neler?
- Sistemler arasında hangi sıklıkta ve hangi yöntemle taşınacak?
- Hassasiyet, saklama ve erişim politikası nasıl uygulanacak?
- Kalite hangi göstergelerle ölçülecek?

Analitik veya yapay zekâ girişimleri güvenilir veri temeli olmadan ölçeklenmez. Bu nedenle veri temizliği, ana veri yönetimi ve entegrasyon standartları görünmeyen ön koşullar olarak değil, değer üreten somut çalışma paketleri olarak planlanmalıdır.

## 5. Hedef mimariyi prensiplerle yönetin

Hedef mimari tek bir büyük diyagram değil, kararları tutarlı hale getiren prensipler bütünüdür. Örneğin “API varsa dosya aktarımı yerine API kullan”, “kimlik merkezi olarak yönetilir”, “kritik işlemler gözlemlenebilir olmalıdır”, “kişisel veri minimum düzeyde tutulur” veya “yeni hizmetler geri dönüş planı olmadan üretime alınmaz” gibi prensipler teknoloji seçimlerine sınır koyar.

Her iş yükü için aynı modernizasyon yöntemi doğru değildir. Bazı sistemler olduğu gibi korunabilir, bazıları başka ortama taşınabilir, bazıları yeniden yapılandırılabilir, ürünle değiştirilebilir veya tamamen kapatılabilir. Karar; iş değeri, teknik borç, veri bağımlılığı, risk, maliyet ve ekip yetkinliğiyle birlikte verilmelidir.

Entegrasyon mimarisi yol haritasının kritik parçasıdır. Noktadan noktaya çok sayıda bağlantı kısa vadede hızlı görünür fakat bir sistem değiştiğinde zincirleme maliyet üretir. Ortak veri sözleşmeleri, API yönetimi, mesajlaşma ve hata izleme yaklaşımı hedef yapıda tanımlanmalıdır.

## 6. Güvenlik ve dayanıklılığı programın içine yerleştirin

Güvenlik son fazdaki kontrol listesi olmamalıdır. NIST Cybersecurity Framework 2.0, yönetişim, varlıkları tanıma, koruma, tespit, müdahale ve kurtarmayı birlikte ele alan yaşam döngüsü sunar. Dönüşüm yol haritası bu alanların hepsinde hedef sonuçları içermelidir.

Örneğin yeni müşteri portalı yalnızca fonksiyon listesiyle planlanmaz. Kimlik doğrulama, rol modeli, veri sınıflandırması, günlükleme, güvenlik testi, yedekleme, RTO/RPO, olay sorumluluğu ve üçüncü taraf bağımlılıkları teslim kriterlerine dahil edilir.

Güvenlik işleri ayrı ve görünmeyen “altyapı maddeleri” olarak kalırsa iş öncelikleri karşısında sürekli ertelenebilir. Her güvenlik kontrolü koruduğu iş hizmeti ve azalttığı riskle ilişkilendirilmelidir.

## 7. Girişimleri değer, risk ve uygulanabilirlikle puanlayın

Tüm ihtiyaçları aynı anda başlatmak kaynakları böler ve bağımlılıkları yönetilemez hale getirir. Ortak bir puanlama modeli karar şeffaflığı sağlar. Her girişim için aşağıdaki boyutlar değerlendirilebilir:

- Beklenen gelir, maliyet, hız veya deneyim etkisi
- Güvenlik, uyum ve süreklilik riski
- Etkilenen kullanıcı ve işlem hacmi
- Teknik ve organizasyonel uygulanabilirlik
- Veri ve entegrasyon hazır oluşu
- Diğer projelerin bu işe bağımlılığı
- Tahmini toplam sahip olma maliyeti
- Ekip kapasitesi ve değişim yükü

Puan matematiksel kesinlik iddiası taşımaz; varsayımları görünür yapar. Yüksek değerli fakat veri temeli hazır olmayan bir girişim için önce veri hazırlığı planlanabilir. Düşük değerli ve destek sonuna gelmiş bir sistem ise modernize edilmek yerine kapatılabilir.

## 8. Yol haritasını ufuklara bölün

Tek bir üç yıllık Gantt şeması değişime dayanıklı değildir. Yol haritası yakın, orta ve uzun vadeli ufuklarla yönetilebilir.

### 0–3 ay: görünürlük ve risk azaltma

- Kritik hizmet, veri ve bağımlılık envanteri
- Ölçüm tabanı ve karar göstergeleri
- Acil güvenlik, yedekleme ve destek sonu riskleri
- Hızlı süreç sadeleştirmeleri
- Yönetişim ve sahiplik kararları

### 3–12 ay: temel platformlar ve öncelikli ürünler

- Kimlik, entegrasyon, veri ve izleme standartları
- En yüksek değerli süreç veya müşteri deneyimi projeleri
- Kontrollü bulut veya altyapı modernizasyonu
- Ekip yetkinliği ve operasyon süreçleri
- İlk ürün odaklı çalışma modeli

### 12 ay ve sonrası: ölçekleme ve optimizasyon

- Başarılı çözümlerin diğer ekip ve bölgelere yayılması
- Veri analitiği ve ileri otomasyon
- Eski sistemlerin kademeli kapatılması
- Maliyet, performans ve dayanıklılık optimizasyonu
- Yol haritasının yeni iş hedefleriyle yenilenmesi

Her ufuk ölçülebilir çıkış koşullarına sahip olmalıdır. “CRM tamamlandı” yerine “satış ekibinin yüzde 90'ı fırsatları tek sistemde yönetiyor ve haftalık manuel rapor kaldırıldı” daha anlamlıdır.

## 9. Bağımlılıkları ve geçiş durumlarını açıkça gösterin

Projeler yalnızca tarih ve bütçeyle birbirine bağlanmaz. Yeni raporlama sistemi ana veri temizliğine, müşteri portalı kimlik altyapısına, otomasyon standart API'ye bağlı olabilir. Bu ilişkiler yol haritasında görünür değilse ekipler hazır olmayan temelin üzerinde çalışmaya başlar.

Geçiş döneminde eski ve yeni sistemlerin ne kadar süre birlikte çalışacağı, verinin hangi yönde senkronize edileceği ve hangi noktada eski kaydın kapanacağı belirlenmelidir. Çift veri girişi uzun sürerse kullanıcılar yeni sisteme güvenmez ve iki farklı gerçek oluşur.

Her büyük geçiş için pilot kapsam, kabul ölçütü, geri dönüş planı, iletişim ve destek hazırlığı yazılmalıdır. Teknik yayının kullanıcı benimsemesiyle aynı gün tamamlanmadığı kabul edilmelidir.

## 10. Finansal modeli yalnızca lisans bedeliyle kurmayın

Toplam sahip olma maliyeti; lisans, altyapı, entegrasyon, veri geçişi, geliştirme, güvenlik, eğitim, destek ve kapatma maliyetlerini içerir. Bulut servislerinde tüketim artışı, veri çıkışı, günlükleme ve yedekleme gibi kalemler tahmine eklenmelidir.

Beklenen fayda da açık varsayımlara dayanmalıdır. Otomasyonun yılda bin saat kazandıracağı düşünülüyorsa işlem hacmi, mevcut süre, istisna oranı ve benimseme hedefi belirtilmelidir. Fayda sahipliği yalnızca BT ekibine bırakılmamalı; ilgili iş birimi sonucu takip etmelidir.

Yatırım kararları aşamalı verilebilir. Keşif sonunda varsayım doğrulanmazsa proje durdurulabilir; pilot başarılıysa sonraki fon açılabilir. Bu yaklaşım büyük ve geri döndürülemez taahhütleri azaltır.

## 11. Değişim ve yetkinlik planını teknik planla eşitleyin

Yeni sistem kullanıcıların karar, sorumluluk veya performans ölçümünü değiştiriyorsa yalnızca eğitim yeterli değildir. Etkilenen roller, kazanımlar, kaygılar ve yeni çalışma biçimi erken aşamada tanımlanmalıdır. Süreç sahipleri tasarıma katılmalı ve pilot kullanıcılar gerçek vakalarla test yapmalıdır.

Ekip yetkinliği de hedef mimarinin sınırıdır. Kurumun işletecek uzmanı olmadığı karmaşık bir platform sürdürülebilir olmayabilir. Eğitim, işe alım, dış destek ve dokümantasyon planı teknoloji takvimiyle birlikte ilerlemelidir.

Benimseme göstergeleri giriş sayısından daha anlamlı olmalıdır: yeni sistemde tamamlanan işlem oranı, eski kanala dönüş, yardım talebi, işlem süresi ve veri kalitesi birlikte izlenebilir.

## 12. Yol haritasını yaşayan bir karar sistemi olarak yönetin

Yol haritası yılda bir sunulan statik belge değil, düzenli karar ritmidir. Aylık veya üç aylık değerlendirmelerde iş sonuçları, riskler, bağımlılıklar, kapasite ve maliyet gözden geçirilir. Tamamlanan girişimlerin gerçek faydası ölçülür; yeni bilgiye göre öncelikler değiştirilebilir.

Her girişim için en az şu bilgiler güncel tutulmalıdır:

- İş hedefi ve sahibi
- Başlangıç ve hedef KPI
- Kapsam ve kapsam dışı alanlar
- Bağımlılıklar ve varsayımlar
- Mimari ve güvenlik kararları
- Maliyet ve kaynak ihtiyacı
- Kilometre taşları ve çıkış kriterleri
- Riskler ve karar geçmişi

Bu kayıt yönetimin “ne kadar tamamlandı?” sorusunun yanında “hangi değeri ürettik ve sıradaki en doğru yatırım ne?” sorusuna da cevap verir.

## Uygulanabilir yol haritası kontrolü

- Dönüşüm hedefleri ölçülebilir iş sonuçlarına bağlı mı?
- Mevcut durum süreç, uygulama, veri, altyapı, güvenlik ve ekip boyutlarını kapsıyor mu?
- Hedef işletim modelinde karar ve operasyon sahipleri belli mi?
- Veri sahipliği ve entegrasyon prensipleri tanımlandı mı?
- Güvenlik ve süreklilik her girişimin teslim kriterinde mi?
- Girişimler ortak değer, risk ve uygulanabilirlik modeliyle sıralandı mı?
- Bağımlılıklar ve geçiş dönemleri görünür mü?
- Toplam maliyet ve beklenen fayda varsayımları yazılı mı?
- Yetkinlik ve kullanıcı benimsemesi teknik takvimle birlikte mi?
- Yol haritasının düzenli gözden geçirme ritmi var mı?

İyi yol haritası her şeyi önceden bildiğini iddia etmez. En önemli varsayımları erken test eder, yatırımı kanıta göre aşamalandırır ve teknoloji kararlarını ölçülebilir iş sonuçlarına bağlar.

## Kaynaklar ve ileri okuma

- [Microsoft Cloud Adoption Framework](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/)
- [Microsoft Learn — Cloud adoption planını belgelemek](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/document-cloud-adoption-plan)
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20)`,
      category: "transformation",
      image: "/assets/images/blog/digital-transformation-roadmap.webp",
      status: "published",
    },
    {
      title: "Teknoloji Danışmanlığında Mevcut Durum Analizi",
      slug: "teknoloji-danismanliginda-mevcut-durum-analizi",
      excerpt: "Altyapı, süreç ve karar noktalarını birlikte değerlendirmenin sağladığı netlik.",
      content: `## Mevcut durum analizi neden proje öncesi en değerli çalışmalardan biridir?

Teknoloji yatırımlarındaki önemli hataların bir bölümü çözüm aşamasında değil, problemin yanlış tanımlandığı başlangıç aşamasında oluşur. Kurum yeni bir yazılım, firewall, sunucu veya bulut ortamı talep edebilir; ancak asıl sorun süreç sahipliğinin belirsizliği, ölçüm eksikliği, veri kalitesi veya yıllar içinde oluşmuş bağımlılıklar olabilir.

Mevcut durum analizi, ortamın kusur listesini çıkarmak değildir. İş hedeflerini destekleyen ve engelleyen unsurları kanıtlarla görünür hale getirir; hedef durum ile bugünkü yapı arasındaki farkı önceliklendirir. İyi analiz sonunda yönetim hangi riski neden ele alacağını, teknik ekip hangi bağımlılığın önce çözülmesi gerektiğini ve iş birimi hangi değişimin kendi sürecini etkileyeceğini anlayabilmelidir.

## Analizin kapsamını iş sorusuyla sınırlandırın

“Tüm teknolojimizi inceleyelim” ifadesi ölçüsüz bir çalışma doğurabilir. Önce karar sorusu tanımlanmalıdır. Örneğin yeni lokasyonların açılış süresini azaltmak, ERP kesintilerinin kaynağını bulmak, buluta geçiş için uygun iş yüklerini belirlemek veya müşteri verisinin nerelerde tutulduğunu anlamak farklı kapsamlar gerektirir.

Kapsam belgesi şu bilgileri içermelidir:

- Analizin cevaplayacağı karar soruları
- Dahil edilen iş birimleri, lokasyonlar ve sistemler
- İncelenecek dönem ve kullanılacak veri kaynakları
- Görüşülecek roller ve teknik erişim gereksinimleri
- Üretilecek çıktılar
- Bilinen sınırlamalar ve kapsam dışı alanlar

Bu sınır, önemli bir bulgunun görmezden gelinmesi anlamına gelmez. Kapsam dışındaki kritik risk ayrı not edilir ve uygun takip çalışmasına dönüştürülür.

## Görüşme, kayıt ve gözlemi birlikte kullanın

Tek bir veri türü mevcut durumu doğru anlatmaz. Yönetici görüşmeleri hedefleri ve risk algısını; uygulayıcı görüşmeleri günlük istisnaları; sistem kayıtları ise gerçekleşen davranışı gösterir. Bu üç kaynak karşılaştırıldığında algı ile gerçek arasındaki farklar bulunabilir.

Örneğin süreç sahibi sipariş onayının aynı gün tamamlandığını düşünebilir. Zaman damgaları, vakaların yüzde 30'unun eksik müşteri kodu nedeniyle ertesi güne kaldığını gösterebilir. Teknik ekip yedeklerin her gece başarılı olduğunu belirtebilir; geri yükleme testi kritik verinin son yedek kapsamında olmadığını ortaya çıkarabilir.

Toplanabilecek kanıtlar şunlardır:

- Politika, prosedür, sözleşme ve mimari dokümanları
- Varlık, lisans ve kullanıcı envanterleri
- İzleme, güvenlik, destek ve değişiklik kayıtları
- Yedekleme ve kurtarma test sonuçları
- Süreç zaman damgaları ve işlem hacimleri
- Maliyet ve kapasite verileri
- Yapılandırma örnekleri ve kontrollü teknik testler

Kanıtın tarihi ve kaynağı kaydedilmelidir. Üç yıl önce hazırlanmış ağ diyagramı mevcut durumun kanıtı sayılmamalıdır.

## Altı değerlendirme alanını birlikte ele alın

### İş süreçleri

Sürecin amacı, sahibi, hacmi, bekleme noktaları, manuel adımları ve başarı ölçütleri incelenir. Teknoloji bir süreç problemini mi çözüyor, yoksa belirsiz süreci mi gizliyor? İstisnaların sıklığı ve karar yetkisi özellikle önemlidir.

### Uygulamalar

Uygulamanın işlevi, kullanıcısı, sahibi, sürümü, destek durumu, özelleştirmeleri, entegrasyonları ve maliyeti kaydedilir. Aynı işi yapan birden fazla araç, kullanılmayan lisanslar ve desteği sona ermiş bileşenler görünür hale gelir.

### Veri

Kritik veri setleri, kayıt sistemleri, sahiplik, kalite, sınıflandırma, erişim ve saklama kuralları incelenir. Veri akış diyagramı, bilginin kurum içi ve dışı sistemler arasında nasıl hareket ettiğini gösterir. Excel dosyaları ve e-posta ekleri de bu haritaya dahildir.

### Altyapı ve entegrasyon

Sunucu, ağ, uç nokta, bulut, kimlik, depolama ve bağlantı bağımlılıkları değerlendirilir. Kapasite, destek sonu, yedeklilik ve tek hata noktaları ölçülür. Entegrasyonlarda veri sözleşmesi, hata yönetimi ve izlenebilirlik aranır.

### Güvenlik ve süreklilik

Kimlik, ayrıcalıklı erişim, zafiyet, günlükleme, yedekleme, olay müdahale ve kurtarma yetenekleri iş riskiyle ilişkilendirilir. NIST Cybersecurity Framework 2.0'ın Govern, Identify, Protect, Detect, Respond ve Recover işlevleri kapsamı dengelemek için yararlı bir referans çerçevesi sunar.

### İnsan ve işletim modeli

Rol, yetkinlik, tedarikçi bağımlılığı, karar mekanizması, destek ve değişiklik süreçleri incelenir. Teknik olarak doğru bir hedef yapı, kurumun işletecek kapasitesi yoksa sürdürülebilir değildir.

## Varlık listesinden bağımlılık haritasına geçin

Yüzlerce satırlık envanter, hangi bileşenin iş hizmetini durduracağını tek başına göstermez. Kritik hizmetler için bağımlılık haritası oluşturulmalıdır. Kullanıcıdan işleme doğru yol izlenir: cihaz, ağ, kimlik, uygulama, veri tabanı, depolama, entegrasyon ve dış servisler.

Harita üzerinde şu noktalar işaretlenebilir:

- Tek hata noktaları
- Belirsiz veya sahipsiz bağlantılar
- Destek sonuna yaklaşan bileşenler
- Hassas veri geçişleri
- Manuel müdahale gerektiren adımlar
- İzlenmeyen servisler
- Aynı anda değişmemesi gereken bağımlılıklar

Bu görünüm yatırım sırasını değiştirir. Kullanıcının gördüğü uygulamayı yenilemeden önce onu taşıyan eski kimlik veya entegrasyon katmanını güçlendirmek gerekebilir.

## Olgunluğu puanlarken sahte kesinlikten kaçının

Olgunluk değerlendirmesi ortak dil sağlar fakat tek bir toplam skor gerçeği gizleyebilir. Bir kurumun ağ güvenliği güçlü, veri sahipliği zayıf; yedekleme teknolojisi gelişmiş, kurtarma disiplini düşük olabilir. Alan bazlı puanlar kanıt ve iş etkisiyle birlikte gösterilmelidir.

Basit dört seviye kullanılabilir:

- Reaktif: uygulama kişilere bağlı ve olay sonrası hareket ediliyor
- Tanımlı: temel süreç ve sorumluluklar belgeli
- Yönetilen: uygulama düzenli ölçülüyor ve kontrol ediliyor
- Optimize edilen: sonuçlar sürekli iyileştirme kararına dönüşüyor

Seviye hedefi her alan için aynı olmak zorunda değildir. Düşük etkili dahili araçta “tanımlı” seviye yeterli olabilirken ödeme, kimlik veya sağlık verisi işleyen sistemde daha güçlü kontrol gerekir.

## Bulguları risk, değer ve bağımlılıkla önceliklendirin

Analiz raporu yüz maddelik düz bir eksik listesi olmamalıdır. Her bulgu için etkilenen iş hizmeti, kanıt, olası sonuç, mevcut kontrol ve önerilen aksiyon yazılmalıdır. Ardından bulgular ortak modelle sıralanır.

Önceliklendirme boyutları şunlar olabilir:

- İş ve müşteri etkisi
- Güvenlik veya uyum riski
- Gerçekleşme olasılığı
- Aciliyet ve destek sonu tarihi
- Diğer çalışmaların bağımlılığı
- Çözüm eforu ve maliyeti
- Hızlı risk azaltma potansiyeli

Yüksek riskli fakat uzun sürecek bir modernizasyon için beklerken uygulanabilecek geçici kontroller ayrıca belirtilmelidir. Örneğin eski sistem hemen değiştirilemiyorsa ağ ayrıştırması, erişim daraltma ve ek izleme riski azaltabilir.

## Çıktıyı farklı karar seviyelerine göre tasarlayın

Yönetim özeti, teknik raporun kısaltılmış hali olmamalıdır. Yönetim; iş etkisini, ana riskleri, yatırım seçeneklerini ve karar gerektiren noktaları görmelidir. Teknik ekip ise kanıt, bağımlılık, mimari öneri ve uygulama ayrıntısına ihtiyaç duyar.

Sağlam bir analiz paketi şu çıktıları içerebilir:

- Yönetim özeti ve karar gündemi
- Mevcut durum ve bağımlılık haritası
- Risk ve teknik borç kaydı
- Varlık, veri ve entegrasyon envanteri
- Hedef prensipler ve seçenek karşılaştırması
- 30, 90 ve 365 günlük öncelik planı
- Tahmini efor, bağımlılık ve sorumlular
- Ölçüm tabanı ve başarı göstergeleri

Her öneri “ne yapılmalı?” kadar “neden şimdi?”, “yapılmazsa ne olur?” ve “tamamlandığını nasıl anlarız?” sorularına cevap vermelidir.

## Sık yapılan analiz hataları

- Yalnızca araç ve cihaz listesine odaklanmak
- Tek bir yönetici veya tedarikçi görüşünü gerçek kabul etmek
- Güncel olmayan dokümanları doğrulamadan kullanmak
- Bulguları iş etkisi olmadan teknik jargonla sunmak
- Her alan için gereğinden yüksek olgunluk hedeflemek
- Maliyet ve ekip kapasitesini öneriden ayırmak
- Hızlı kazanımları temel bağımlılıkların önüne koymak
- Analizden sonra sahip ve takip ritmi tanımlamamak

## Analiz sonrası ilk 90 gün

İlk ayda kritik erişim, yedekleme, görünürlük ve destek sonu riskleri için acil kontroller uygulanabilir. Aynı dönemde envanter sahipleri ve karar mekanizması netleştirilir. İkinci ayda hedef mimari prensipleri, veri ve entegrasyon standartları ile öncelikli pilot kapsamı hazırlanır. Üçüncü ayda pilot başlatılır, ölçüm paneli kurulur ve daha uzun vadeli yatırım kararları kanıtlarla güncellenir.

Mevcut durum analizi bir rapor teslimiyle değer üretmez. Değeri, kararları sıraladığında, sorumluluğu netleştirdiğinde ve ilerlemeyi ölçülebilir hale getirdiğinde ortaya çıkar. En iyi analiz kurumun tüm problemlerini bir anda çözmez; hangi problemi önce ve hangi gerekçeyle çözmesi gerektiğini açıklar.

## Kaynaklar ve ileri okuma

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20)
- [Microsoft Learn — Cloud adoption planını belgelemek](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/document-cloud-adoption-plan)`,
      category: "consulting",
      image: "/assets/images/blog/technology-current-state-analysis.webp",
      status: "published",
    },
  ];

  const publicationDates = ["2026-08-12", "2026-07-28", "2026-07-10", "2026-06-19", "2026-05-30", "2026-05-08"];
  global.StaticBlogPosts = Object.freeze(posts.map((post, index) => Object.freeze({
    ...post,
    publishedAt: publicationDates[index] || "2026-05-01",
  })));
})(window);
