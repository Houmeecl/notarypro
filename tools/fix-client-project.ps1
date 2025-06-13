# 1. Corrige vite.config.js/ts: agrega los alias si faltan
$viteConfigJs = "vite.config.js"
$viteConfigTs = "vite.config.ts"
$viteConfig = if (Test-Path $viteConfigTs) { $viteConfigTs } else { $viteConfigJs }

if (!(Test-Path $viteConfig)) {
  Write-Host "No se encontró vite.config.js ni vite.config.ts. Saliendo..." -ForegroundColor Red
  exit 1
}

$content = Get-Content $viteConfig -Raw
if ($content -notmatch "@assets" -or $content -notmatch "resolve") {
  Write-Host "Agregando alias a $viteConfig..."
  $aliasBlock = @"
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
      '@assets': require('path').resolve(__dirname, 'src/assets'),
    },
  },
"@
  $content = $content -replace "(plugins: \[.*\],)", "`$1`r`n$aliasBlock"
  Set-Content $viteConfig $content
}

# 2. Crea carpetas y archivos básicos que faltan
$assetsDir = "src/assets"
if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory $assetsDir | Out-Null }

# Ejemplo: crea logo falso si falta
$logo = "$assetsDir/logo12582620.png"
if (!(Test-Path $logo)) {
  $png = [Convert]::FromBase64String(
    "iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAIAAAD9lDaoAAAAA3NCSVQICAjb4U/gAAAAGXRFWHRTb2Z0d2Fy
    ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlwSFlzAAALEwAACxMBAJqcGAAABjVJREFUeNrs3TEKwjAQRdFf
    9v9vW8tFXQyL6WZK8jQn9zZJvTNgJAAAAAAAAAAAAAOD3vB6V5K8HknwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw
    XkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXwXkXw" -replace "`r`n", "")
  [IO.File]::WriteAllBytes($logo, $png)
}

# 3. Corrige Tailwind: agrega el color border si falta
$tailwindCfg = "tailwind.config.js"
if (Test-Path $tailwindCfg) {
  $twContent = Get-Content $tailwindCfg -Raw
  if ($twContent -notmatch "colors:\s*{[^}]*border") {
    Write-Host "Agregando color border a $tailwindCfg..."
    $twContent = $twContent -replace "(extend:\s*{)", "`$1`r`n      colors: { border: '#e5e7eb' },"
    Set-Content $tailwindCfg $twContent
  }
}

# 4. Limpia cache y dist
Remove-Item -Recurse -Force node_modules/.vite, dist -ErrorAction SilentlyContinue

# 5. Instala dependencias y build
npm install
npm run build