---
layout: default
title: Series
permalink: /series/
# Hidden while there are no series: out of the sitemap
# and out of search results. When the first series is published, delete
# these two lines.
sitemap: false
noindex: true
---
{%- comment -%}
  Every series, with its parts in order. A post's series name links here, to
  the series' anchor (its name, slugified). Posts join a series with
  `series:` and `part:` in front matter.
{%- endcomment -%}
{%- assign series_posts = site.posts | where_exp: "p", "p.series" -%}
{%- assign series_groups = series_posts | group_by: "series" | sort: "name" -%}
<article class="archive series-index">
  <div class="archive__crumb"><a href="{{ '/menu/' | relative_url }}" class="archive__crumb-link">Menu</a> &middot; Series</div>
  <header class="archive__title-block">
    <h1 class="archive__title">Series</h1>
  </header>
  {%- if series_groups.size == 0 %}
  <p class="menu-index__empty">No series yet.</p>
  {%- endif %}
  {%- for grp in series_groups %}
  {%- comment -%} Parts in order, by number (no `sort`; see series-data.html). {%- endcomment %}
  {%- assign g_max = 0 -%}
  {%- for sp in grp.items -%}{%- assign sp_n = sp.part | plus: 0 | floor -%}{%- if sp_n > g_max -%}{%- assign g_max = sp_n -%}{%- endif -%}{%- endfor -%}
  {%- assign parts = "" | split: "" -%}
  {%- for n in (1..g_max) -%}{%- for sp in grp.items -%}{%- assign sp_n = sp.part | plus: 0 -%}{%- if sp_n == n -%}{%- assign parts = parts | push: sp -%}{%- endif -%}{%- endfor -%}{%- endfor %}
  <section class="series-index__group" id="{{ grp.name | slugify }}">
    <h2 class="series-index__name">{{ grp.name }}</h2>
    <p class="archive__count">{{ parts.size }} {% if parts.size == 1 %}part{% else %}parts{% endif %}</p>
    <ol class="series-index__parts">
      {%- for p in parts %}
      <li value="{{ p.part }}"><a href="{{ p.url | relative_url }}">{{ p.title }}</a>{% if p.dek %}<span class="series-index__dek">{{ p.dek }}</span>{% endif %}</li>
      {%- endfor %}
    </ol>
  </section>
  {%- endfor %}
</article>
