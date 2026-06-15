<p align="center">
  <img src="public/icons/icon-512.png" width="116" alt="Trove icon" />
</p>

<h1 align="center">trove</h1>

<p align="center">
  A private gallery for the things worth keeping. Stash images, videos, and<br />
  links into troves of gems, then find any of them in a tap.
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/lebuckman/trove?color=17b3a3&label=version" alt="Version" />
  <img src="https://img.shields.io/badge/platform-web%20(PWA)-0d0c0a" alt="Platform" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-0d0c0a" alt="License" /></a>
</p>

<p align="center">
  <img src="docs/banner.png" width="860" alt="Trove on desktop and mobile" />
</p>

## What it is

Trove is a personal capture gallery, a Pinterest-flavored PWA for the images, videos, and links worth holding onto. Everything you save is a **gem**; gems live in **troves**. Sign in with Google and it's private by default: every row is scoped to its owner, media lives in a private bucket, and the whole thing installs to your home screen.

## Features

- **Troves of gems:** images, videos, and links, with automatic Open Graph previews for links.
- **One searchable home** across every trove. Search by description, tag, link, or title.
- **Tags:** per-gem, with a management page and a filter strip on home and inside troves.
- **A gesture-driven lightbox:** swipe to dismiss, swipe between gems, prev/next arrows, and an inline editable description.
- **Reorder** troves and gems by dragging, and **bulk-select** to move or delete in batches.
- **Private by design:** Google sign-in, per-user isolation through row-level security, media served via short-lived signed URLs.
- **Installable PWA** with a tuned manifest, real icons, and an offline fallback.

## Good to know

- **Install it.** Open Trove in a browser and use _Add to Home Screen_ on iOS or the install icon in a desktop browser for a full-screen, app-like experience.
- **It's a private shelf.** Single-user by design: no sharing, follows, comments, or public links.
- **Link previews need Open Graph.** Most sites expose a preview image and title; a few (such as TikTok) get special handling, and some won't preview at all.

## Contributing

Issues and PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), which covers the stack, running it locally, and the conventions.

## License

All code and content unique to Trove is licensed under MIT. See [LICENSE](LICENSE).
