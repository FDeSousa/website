---
layout: page
title: recipes
permalink: /recipes/
---

Recipes written in Cooklang. Plain text that'll still parse in 30 years.

<ul class="post-list">
  {% for recipe in site.recipes %}
    <li>
      <h3 class="listing-title">
        <a class="post-link" href="{{ recipe.url | relative_url }}">{{ recipe.title | escape }}</a>
      </h3>
      {% assign preview = recipe.preview | default: recipe.intro %}
      {% if preview %}<p>{{ preview | strip_html | truncate: 140 }}</p>{% endif %}
    </li>
  {% endfor %}
</ul>
