# just fooling around

Personal blog and recipe collection of Filipe De Sousa, hosted on GitHub Pages at [desousa.com.pt](https://desousa.com.pt).

- Built with [Jekyll](https://jekyllrb.com) using the [minima](https://github.com/jekyll/minima) theme.
- Recipes are written in [Cooklang](https://cooklang.org) and converted with the [`jekyll-cooklang-converter`](https://github.com/BraeTroutman/jekyll-cooklang-converter) plugin.
- Deployed to GitHub Pages automatically by the workflow in `.github/workflows/deploy.yml` on every push to `master`.

## Local development

```bash
bundle install
bundle exec jekyll serve
```

Then visit http://localhost:4000.

## Adding a recipe

Create a `.cook` file in `_recipes/` with front matter for the title (and optionally an `intro` and `note`):

```text
---
layout: recipe
title: My Recipe
intro: |
  Optional intro, supports markdown.
---

Put the #kettle{} on, add @tea leaves{2%tsp}, wait ~{3%minutes}.
```
