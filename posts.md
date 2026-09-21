---
layout: page
title: posts
permalink: /posts/
pagination:
  enabled: true
  per_page: 10
  permalink: "/page/:num/"
  sort_field: date
  sort_reverse: true
---

<ul class="post-list">
  {%- for post in paginator.posts -%}
  <li>
    <h3 class="listing-title">
      <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
    </h3>
    <p class="post-meta">
      <time>{{ post.date | date: site.minima.date_format | default: "%b %-d, %Y" }}</time>
    </p>
    {%- if post.excerpt -%}
    <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
    {%- endif -%}
  </li>
  {%- endfor -%}
</ul>

{%- if paginator.total_pages > 1 -%}
<div class="pager">
  {%- if paginator.previous_page -%}
  <a href="{{ paginator.previous_page_path | relative_url }}">← newer</a>
  {%- endif -%}
  <span>page {{ paginator.page }} of {{ paginator.total_pages }}</span>
  {%- if paginator.next_page -%}
  <a href="{{ paginator.next_page_path | relative_url }}">older →</a>
  {%- endif -%}
</div>
{%- endif -%}

<p class="rss-subscribe">subscribe <a href="{{ 'feed.xml' | relative_url }}">via rss</a></p>
