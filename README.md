<div align="center">
  <img src="public/textures/banner/base.png" width="64" alt="BannerCraft Logo">
  <h1>BannerCraft</h1>
  <p>A high-fidelity Minecraft Banner Generator with programmatic API support.</p>

<p>
    <a href="https://banner.weikuwu.me"><strong>Live Demo & API Docs</strong></a>
  </p>
</div>

<br />

## Overview

BannerCraft is a modern web application designed for crafting custom Minecraft
banners. It provides an intuitive, highly-responsive frontend editor that
seamlessly syncs with its backend API. Built with Next.js App Router,
BannerCraft fully supports generating shareable URLs, dynamic OpenGraph metadata
previews.

Whether you're testing new banner designs visually or need an API to generate
banner SVGs programmatically for your Discord bot or web project, BannerCraft
handles it seamlessly!

## Features

- 🎨 **Pixel-Perfect Rendering**: Uses official Minecraft 1.21 textures instead
  of procedural canvas drawing to faithfully reproduce authentic in-game
  results.
- ⚡ **Extensive API**: Generate banner SVGs on the fly using either standard
  `GET` requests (URL params) or complex `POST` JSON payloads.
- 🔗 **Social Previews**: Shareable links dynamically rebuild the editor state
  on load, and parse custom OpenGraph `<meta>` tags so previews render
  faithfully on Discord & Twitter!
- ✨ **Fluid UX**: Fully responsive layout featuring smooth
  `@formkit/auto-animate` transitions, intuitive modal pickers, and
  live-updating interactive playground.
- 🌙 **Dark Mode Support**: Seamlessly toggles between dark and light themes
  using `next-themes`.

## Usage

### Frontend Editor

Simply head over to [BannerCraft](https://banner.weikuwu.me), select a base
color, map out your Minecraft layers (up to 10 max), and hit **Copy Link**!

### API Integrations

You can use the API in standard HTML `<img>` tags directly. By default, it returns an `image/svg+xml`.

```html
<img src="https://banner.weikuwu.me/api/bannerCreate?base=white&layers=[{%22shape%22:%22creeper%22,%22color%22:%22black%22}]" alt="Creeper Banner" />
```

**Rasterized Output (PNG/JPG/WEBP):** 
Need to embed the image in social platforms (Discord, Twitter) or applications that don't support raw SVGs? Simply append `&filetype=png` to the URL. The backend will rapidly rasterize your banner into a standard image format using `sharp`! Supported types: `svg` (default), `png`, `jpg`, `webp`.

```html
<img src="https://banner.weikuwu.me/api/bannerCreate?base=white&layers=...&filetype=png" />
```

For large layered banners, bypass URL length restrictions via POST:

```bash
curl -X POST https://banner.weikuwu.me/api/bannerCreate \
  -H "Content-Type: application/json" \
  -d '{
    "base": "red",
    "layers": [
      { "shape": "stripe_bottom", "color": "blue" },
      { "shape": "creeper", "color": "white" }
    ],
    "height": 400
  }'
```

_For more extensive documentation, visit the
[API Docs](https://banner.weikuwu.me/docs)._

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AiverAiva/BannerCraft.git
   cd BannerCraft
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or npm install
   ```

3. **Run the development server:**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to
   launch the client.

## Credits & Acknowledgements

This project was made possible using community-provided resources:

- **[InventivetalentDev/minecraft-assets](https://github.com/InventivetalentDev/minecraft-assets/)**:
  For the extensive repository of Minecraft textures and pattern assets.
- **[Minecraft Wiki (Data Values/Banner)](https://minecraft.fandom.com/wiki/Banner/DV)**:
  For the perfectly accurate internal color coding references used in the
  tinting generation.
