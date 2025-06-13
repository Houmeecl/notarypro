export function generateQRCodeSVG(url: string): string {
  // Devuelve un SVG de placeholder simple (no genera QR real)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#eee"/>
    <text x="10" y="64" font-size="16" fill="#888">QR Demo</text>
    <text x="10" y="90" font-size="8" fill="#aaa">${url}</text>
  </svg>`;
}