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
        <a class="post-link" href="{{ project.repo }}">{{ project.title | escape }}</a>
      </h3>
      {% if project.blurb %}<p>{{ project.blurb }}</p>{% endif %}
    </li>
  {% endfor %}
</ul>
