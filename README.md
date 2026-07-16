# Multi-Terminal Support

Public support and policy pages for the two Multi-Terminal products:

- [Direct support](https://jinjin-programm.github.io/multi-terminal-support/direct/)
- [App Store support](https://jinjin-programm.github.io/multi-terminal-support/appstore/)
- [Public issues](https://github.com/jinjin-programm/multi-terminal-support/issues)

This repository intentionally contains no application source code, credentials,
release artifacts, or private support data.

## Local preview

The site is plain static HTML. From this repository:

```sh
python3 -m http.server 8000 --directory site
```

Then open <http://127.0.0.1:8000/>.

## Validation

```sh
node scripts/check-site.mjs
```

No license file is included. This repository publishes support and policy
content only and does not grant a license to the Multi-Terminal applications.
