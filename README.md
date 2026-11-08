# Reliquary

![Image Banner](https://raw.githubusercontent.com/devneet-id/.github/refs/heads/main/design/anwarachilles/reliquary/v1-banner.png)

**Forged through Rune. Kept by its people.**

A reliquary keeps no relic — it only remembers where each one rests, and the seal it bore when it was listed.

Reliquary is the **Federated Relic Registry** for [Rune](https://github.com/devneet-id/rune).

A **relic** (`.rune`) is a sealed snapshot of a runite — its code, its echoes and its shards in a single file — much like a Docker image: take it anywhere, and it comes back to life as it was sealed.

Like Docker Hub, a reliquary records where relics rest and the seal (sha256) of each version. Unlike Docker Hub, there is **no central registry**: the repo *is* the registry — its own `relic.json` and `nexus.json`. Reliquaries are **federated by fork** — fork a reliquary and you have a registry of your own, still linked to the one you forked. Others fork yours, and so on: one nexus leads to the next.

Each owner maintains their own reliquary, with Rune (PHP) at their side — by running its casts.

**[Explore Rune ↗](https://github.com/devneet-id/rune)**
**[Explore Exura ↗](https://github.com/devneet-id/exura)**

---

## How It Works

Every reliquary is the same repo — a registry of its own — with the same runites and two records:

| Record       | Kept by                                    | Holds                                              |
| ------------ | ------------------------------------------ | -------------------------------------------------- |
| `relic.json` | [`relic`](#relic)                          | the relics of this reliquary's owner               |
| `nexus.json` | [`nexus`](#nexus)                          | the links to its forks — only the way to them      |

```
devneet-id/reliquary
├── relic.json   devneet-id/*
└── nexus.json   → demo/reliquary ─┬─ relic.json   demo/*
                                    └─ nexus.json   → zed/reliquary ─ …
```

If you know Docker, you already know the shape of it:

| Docker                   | Reliquary                                                       |
| ------------------------ | --------------------------------------------------------------- |
| image                    | relic (`.rune`), a sealed snapshot of a runite                  |
| `docker build`           | `php cast reliquary --runite-relic`                             |
| tag · digest             | version · seal (sha256)                                         |
| `docker push`            | push the `.rune` to its repo, then `php relic register`         |
| `docker pull` + `run`    | `php cast reliquary --relic-runite=<vendor>/<repo>`             |
| Docker Hub               | `devneet-id/reliquary` — and every fork, each a registry itself |

* **No central registry.** `devneet-id/reliquary` is only the first reliquary; it maps its forks, it does not hold them.
* **Code from devneet, data from you.** A fork takes new code with *Sync fork*; its records belong to its owner.
* **Relics stay home.** A `.rune` rests in its own repo; a reliquary only records the link and its seal (sha256).
* **Your reliquary, your care.** `devneet-id/reliquary` does not review the relics of other reliquaries.

---

## Requirements

* PHP 8.1+ with `curl` (or `allow_url_fopen`)
* Composer
* A GitHub account

---

## Begin Your Reliquary

1. **Fork** [`devneet-id/reliquary`](https://github.com/devneet-id/reliquary) and clone your fork.
2. Install Rune:
   ```bash
   composer install
   ```
3. Your fork still holds the records of its parent. Make them yours — the name is read from `git remote origin`, whatever your folder is called:
   ```bash
   php relic initiate
   php nexus initiate
   ```
4. Register your relics:
   ```bash
   php relic register
   ```

No `git add`, no `git push`: every cast that writes a record commits **that record only** and pushes it for you — `feat: initiate relic <date time>`, `feat: update relic <date time>`, `feat: update nexus <date time>`. Add `--local` to any of them to only save it on your computer.

Your reliquary is now a registry of its own, linked to its parent: the next `php nexus update` there maps it.

### Your own page

Your fork shows the page of its parent until you make your own. Its source is not in the repo — it is sealed in `cast.rune`, the relic of the `cast` runite. Open it, and `src/` is back:

```bash
php cast reliquary --relic-runite   # cast.rune → cast + src/
php cast start                      # build, serve at http://127.0.0.1:8000, rebuild on every change
```

Shape `src/` as you like, then seal it and push your page:

```bash
php cast build
php cast reliquary --runite-relic   # cast + src/ → cast.rune
git add index.html cast.rune && git commit -m "feat: my page" && git push
```

Your page is yours: `hall sync` never touches `index.html` or `cast.rune`.

### Keep in step with your parent

Your parent keeps improving its runites — and keeps registering its own relics. Take the runites, keep what is yours:

```bash
php hall sync
```

`hall sync` fetches the parent and takes its runites (`relic`, `nexus`, `hall`, `cast`, …), keeps your records (`relic.json`, `nexus.json`) and your page (`index.html`, `cast.rune`) as they are, and pushes. **Do not use the *Sync fork* button on GitHub**: it does not know your records are yours, and it stops at a conflict in `relic.json`.

> **First time?** A fork made before `hall` existed takes it once by hand:
> ```bash
> git fetch https://github.com/devneet-id/reliquary.git main
> git checkout FETCH_HEAD -- hall .gitattributes
> git commit -m "chore: take hall"
> php hall sync
> ```

---

## Maintaining Your Reliquary

A reliquary is kept alive by its owner. Run its casts whenever something changes:

| When                                  | Cast                   |
| ------------------------------------- | ---------------------- |
| Your parent changed                   | `php hall sync`        |
| You publish a new relic               | `php relic register`   |
| A relic has a new tag, or `main` moved | `php relic upgrade`    |
| Someone forked your reliquary         | `php nexus update`     |
| You want to trust a reliquary         | `php nexus inspect`    |
| Before you push                       | `php hall analyze`     |
| You want to see the whole federation  | `php hall chain`       |
| Your records changed                  | `php cast build`       |

Each of these casts commits and pushes what it changed — your registry is what you push. Only `php cast build` leaves `index.html` for you to commit.

---

## Registered Commands

Every command asks what it needs. Every question can also be answered with a spell, so commands run unattended too (e.g. in GitHub Actions).

### relic

| Command                  | Spells                                       | Description                                                                 |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `php relic initiate`     | `--user=<username>` `--yes` `--local`        | Start a clean `relic.json` as `<username>/<project folder>` (the folder name = your repo name).                |
| `php relic register`     | `--repo=<repo>/<runite>` `--tag=` `--note=` `--local` | Register a relic, e.g. `exuracss/cast` → `cast.rune`. No tag → `main` as `0.1.0`. Commits & pushes `relic.json`. |
| `php relic upgrade`      | `--repo=<repo>` `--tag=` `--local`           | Add a new version. No tag → `main` as the next patch (`0.1.0` → `0.1.1`). Commits & pushes `relic.json`. |

### nexus

| Command                  | Spells                                       | Description                                                                 |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `php nexus initiate`     | `--user=<username>` `--local`                | Start a clean `nexus.json` as `<username>/<project folder>`.                |
| `php nexus update`       | `--local`                                    | Map every fork of this reliquary into `nexus.json`.                         |
| `php nexus inspect`      | `--repo=<owner>/<repo>`                      | Pick one reliquary on the chain (forks of forks too) and check its seals.   |

### hall

| Command                  | Spells                                       | Description                                                                 |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `php hall sync`          | `--from=<owner>/<repo>` `--local`            | Take the runites of the parent reliquary, keep your records & page, push.  |
| `php hall analyze`       | `--repo=<repo>`                              | Check this reliquary: its records, its name against `git remote origin`, every seal. |
| `php hall chain`         | `--from=<owner>/<repo>`                      | The whole chain from `devneet-id/reliquary`, nexus by nexus, with its relics. |

### website

| Command                  | Spells                                       | Description                                                                 |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `php cast build`         | —                                            | Bundle `src/` into `index.html`, the page of this reliquary.                |
| `php cast serve`         | —                                            | Serve this reliquary at `http://127.0.0.1:8000`.                            |
| `php cast watch`         | —                                            | Rebuild `index.html` whenever `src/` changes.                               |
| `php cast start`         | —                                            | Build, then serve & watch in their own processes.                           |
| `php exura fetch`        | `--version=1.1.0` `--part=css\|js\|php\|all` | Fetch Exura into `src/exura/`.                                              |

`GITHUB_TOKEN` (environment variable) is sent to the GitHub API when it is set: 60 requests/hour without it, 5,000 with it. Only `nexus update` and versions taken from `main` use the API; everything else reads raw files.

### The page

`index.html` reads `relic.json` and `nexus.json` next to it each time it opens — push your records and the page follows, no rebuild needed. **GitHub Pages** serves them as they are: *Settings → Pages → Deploy from a branch → `main` / root*, and your reliquary lives at `https://<you>.github.io/<repo>/`.

A browser does not let a page read files from `file://`, so locally run `php cast start` (or `php cast serve`) instead of opening `index.html` directly.

---

## Making a Relic

A relic is sealed from a runite, the way an image is built from a Dockerfile. In the repo of your runite:

```bash
php cast reliquary --runite-relic   # cast → cast.rune, the snapshot
git add cast.rune && git commit -m "feat: relic" && git tag 1.0.0 && git push --tags
```

Then, in your reliquary — it is recorded and pushed at once:

```bash
php relic register --repo=<repo>/cast --tag=1.0.0
```

Anyone can now bring it back to life, in any runite (Rune 1.20+):

```bash
php cast reliquary --relic-runite=<vendor>/<repo>
```

---

## The Laws of the Reliquary

1. **A name is its repo.** A relic is named `<owner>/<repo>`, and a reliquary only lists its owner's own repos — nobody can take another name.
2. **A version never changes.** The same version with another seal is refused; a change is a new version.
3. **The seal is sha256** of the `.rune` when it was listed. `nexus inspect` shows any seal that broke.
4. **A version from `main` is pinned to its commit.** When `main` moves on, older versions stay whole.
5. **A fork that has not initiated is silent.** It still holds its parent's records; those names are ignored.
6. **Your records and your page are yours.** `hall sync` takes the runites of your parent, never its records or its page.

---

## Records

`relic.json`

```json
{
  "main": "devneet-id/reliquary",
  "list": {
    "devneet-id/exuracss": {
      "repo": "https://github.com/devneet-id/exuracss",
      "runite": "cast",
      "note": "…",
      "tags": {
        "1.1.0": { "url": "https://raw.githubusercontent.com/devneet-id/exuracss/1.1.0/cast.rune", "sha256": "…", "rune": "1.20.110" },
        "1.1.1": { "url": "https://raw.githubusercontent.com/devneet-id/exuracss/<commit>/cast.rune", "sha256": "…", "rune": "1.20.110", "ref": "main@1a2b3c4" }
      }
    }
  }
}
```

`nexus.json`

```json
{
  "main": "devneet-id/reliquary",
  "list": {
    "demo/reliquary": {
      "owner": "demo",
      "branch": "main",
      "relic": "https://raw.githubusercontent.com/demo/reliquary/main/relic.json",
      "nexus": "https://raw.githubusercontent.com/demo/reliquary/main/nexus.json"
    }
  }
}
```

---

## The Federation of Fides

*Fides* is trust; *foedus*, the pact at the root of *federation*, shares its root.
Every vendor keeps its own reliquary, and the seals keep the trust between them.

---

## References

* [Rune](https://github.com/devneet-id/rune) — Application foundation and tooling.
* [Exura](https://github.com/devneet-id/exura) — Unified framework ecosystem.

---

**Built to create. Kept to endure.**

**DEVNEET ©**
