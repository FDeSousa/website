---
layout: page
title: projects
permalink: /projects/
---

A few things I've built. More to come.

<ul class="post-list">
  {% for project in site.projects %}
    <li>
      <h3 class="listing-title">
        <a class="post-link" href="{{ project.url | relative_url }}">{{ project.title | escape }}</a>
      </h3>
      {% if project.excerpt %}<p>{{ project.excerpt | strip_html | truncate: 140 }}</p>{% endif %}
    </li>
  {% endfor %}
</ul>
