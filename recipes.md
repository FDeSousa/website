---
layout: page
title: Recipes
permalink: /recipes/
---

<ul class="post-list">
  {% for recipe in site.recipes %}
    <li>
      <h3>
        <a class="post-link" href="{{ recipe.url | relative_url }}">{{ recipe.title | escape }}</a>
      </h3>
      {% if recipe.intro %}<p>{{ recipe.intro | strip_html | truncate: 140 }}</p>{% endif %}
    </li>
  {% endfor %}
</ul>
