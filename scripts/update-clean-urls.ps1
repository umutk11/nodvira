$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$htmlFiles = @(
  "index.html",
  "hizmetler.html",
  "web-tasarim.html",
  "yazilim-cozumleri.html",
  "network.html",
  "sistem-cozumleri.html",
  "cozumler.html",
  "projeler.html",
  "referans-detay.html",
  "hakkimda.html",
  "blog.html",
  "blog-detay.html",
  "sss.html",
  "iletisim.html",
  "kvkk-aydinlatma-metni.html",
  "gizlilik-politikasi.html",
  "cerez-politikasi.html"
)

$simpleRoutes = [ordered]@{
  "index.html" = "/"
  "hizmetler.html" = "/hizmetlerimiz"
  "web-tasarim.html" = "/hizmetlerimiz/web-cozumleri"
  "yazilim-cozumleri.html" = "/hizmetlerimiz/yazilim-cozumleri"
  "network.html" = "/hizmetlerimiz/network-cozumleri"
  "sistem-cozumleri.html" = "/hizmetlerimiz/sistem-cozumleri"
  "cozumler.html" = "/hizmetlerimiz/teknoloji-danismanligi"
  "projeler.html" = "/referanslarimiz"
  "hakkimda.html" = "/hakkimizda"
  "blog.html" = "/blog"
  "sss.html" = "/sss"
  "iletisim.html" = "/iletisim"
  "kvkk-aydinlatma-metni.html" = "/kvkk-aydinlatma-metni"
  "gizlilik-politikasi.html" = "/gizlilik-politikasi"
  "cerez-politikasi.html" = "/cerez-politikasi"
}

$caseRoutes = [ordered]@{
  "web" = "/referanslarimiz/kurumsal-web-platformu"
  "software" = "/referanslarimiz/soguk-zincir-istisna-yonetimi"
  "network" = "/referanslarimiz/ag-standardizasyonu"
  "system" = "/referanslarimiz/sistem-modernizasyonu"
  "consulting" = "/referanslarimiz/teknoloji-yol-haritasi"
}

foreach ($fileName in $htmlFiles) {
  $filePath = Join-Path $projectRoot $fileName
  $content = [System.IO.File]::ReadAllText($filePath)

  foreach ($entry in $caseRoutes.GetEnumerator()) {
    $content = $content.Replace("referans-detay.html?project=$($entry.Key)", $entry.Value)
  }
  $content = [regex]::Replace($content, 'blog-detay\.html\?slug=([^"''#&\s<]+)', '/blog/$1')
  foreach ($entry in $simpleRoutes.GetEnumerator()) {
    $content = $content.Replace($entry.Key, $entry.Value)
  }

  $content = $content.Replace('href="favicon.ico"', 'href="/favicon.ico"')
  $content = $content.Replace('href="assets/', 'href="/assets/')
  $content = $content.Replace('src="assets/', 'src="/assets/')
    $content = [regex]::Replace($content, '/assets/styles\.css\?v=[^"'']+', '/assets/styles.css?v=20260916-servicephotos01')
    $content = [regex]::Replace($content, '/assets/page-data\.js\?v=[^"'']+', '/assets/page-data.js?v=20260916-consultingfounder01')
  $content = [regex]::Replace($content, '/assets/site\.js\?v=[^"'']+', '/assets/site.js?v=20260902-projectphotos01')
  $content = [regex]::Replace($content, '/assets/public/blog-renderer\.js(?:\?v=[^"'']+)?', '/assets/public/blog-renderer.js?v=20260902-featured01')
  $content = [regex]::Replace($content, '/assets/public/project-renderer\.js(?:\?v=[^"'']+)?', '/assets/public/project-renderer.js?v=20260902-mediahover01')
  if ($content -notmatch '/assets/public/project-renderer\.js') {
    $content = [regex]::Replace(
      $content,
      '(<script src="/assets/public/blog-renderer\.js(?:\?v=[^"]+)?" defer>\s*</script>)',
      '$1<script src="/assets/public/project-renderer.js" defer></script>',
      [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
  }
  [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
}

$pages = [ordered]@{}
foreach ($fileName in ($htmlFiles | Sort-Object)) {
  $filePath = Join-Path $projectRoot $fileName
  $content = [System.IO.File]::ReadAllText($filePath)
  $bodyPage = [regex]::Match($content, '<body[^>]*data-page="([^"]+)"', 'IgnoreCase').Groups[1].Value
  $title = [System.Net.WebUtility]::HtmlDecode([regex]::Match($content, '<title>(.*?)</title>', 'IgnoreCase, Singleline').Groups[1].Value.Trim())
  $description = [System.Net.WebUtility]::HtmlDecode([regex]::Match($content, '<meta\s+name="description"\s+content="([^"]*)"', 'IgnoreCase').Groups[1].Value)
  $main = [regex]::Match($content, '<main\s+class="site-main"[^>]*>.*?</main>', 'IgnoreCase, Singleline').Value
  if (-not $main) { throw "Ana içerik bulunamadı: $fileName" }
  $pages[$fileName] = [ordered]@{
    page = $bodyPage
    title = $title
    description = $description
    main = $main
  }
}

$json = $pages | ConvertTo-Json -Depth 6 -Compress
$pageDataPath = Join-Path $projectRoot "assets\page-data.js"
[System.IO.File]::WriteAllText($pageDataPath, "window.sitePages = $json;`n", [System.Text.UTF8Encoding]::new($false))

Write-Output "Temiz URL bağlantıları güncellendi ve assets/page-data.js yeniden üretildi."
