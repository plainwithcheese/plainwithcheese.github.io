---
layout: default
title: Follow
permalink: /feed/
catalog: "Follow"
---
{%- comment -%}
  /feed/, the Follow page: where the top strip's FOLLOW link goes. A plain
  page saying what the feed is, with its address and a copy control
  ("[copy link]", assets/js/copy-link.js; hidden without JavaScript). Feed
  readers still find feed.xml through the autodiscovery link in every page's
  head ({% feed_meta %}). The first line's "RSS feed" links to
  aboutfeeds.com, an outside explainer.
{%- endcomment -%}
<article class="archive feed-page">
  <header class="archive__title-block">
    <h1 class="archive__title">{{ page.title }}</h1>
  </header>
  <p class="feed-page__what">This site has an <a href="https://aboutfeeds.com/" rel="noopener">RSS feed</a>. Add the link below to your reader to receive new dishes as they’re served from the kitchen, with no email or account needed.</p>
  <p class="feed-page__address">
    <span class="feed-page__url">{{ '/feed.xml' | absolute_url }}</span>
    <span class="feed-page__copy" data-needs-js hidden><button type="button" class="post-tool copy-btn bracket-link" data-copy="{{ '/feed.xml' | relative_url }}" aria-label="{{ site.data.diner.copy_link.feed_label }}"><span class="copy-btn__idle">{% include bracket-text.html text=site.data.diner.copy_link.text %}</span><span class="copy-btn__done" hidden>{% include bracket-text.html text=site.data.diner.copy_link.copied %}</span><span class="copy-btn__fail" hidden>{% include bracket-text.html text=site.data.diner.copy_link.failed %}</span></button><span class="visually-hidden" role="status"></span></span>
  </p>
  <p class="feed-page__note">Feed readers get every dish whole, without the site’s <span class="cw__ref">[content notes]</span> included.<br>Posts with a content warning gate on the site open with a one-line heads-up in the feed.</p>
</article>
<script src="{{ '/assets/js/copy-link.js' | relative_url }}"></script>
