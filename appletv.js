/*!
 * Lampa "Apple TV" theme plugin.
 * Restyles Lampa toward tvOS: lifted posters with specular sheen, white-pill
 * focus everywhere, frosted floating panels, full-bleed details hero, clean
 * shelves, tvOS-style search keyboard and a minimal black splash.
 *
 * Performance notes (TV GPUs are weak):
 *  - backdrop-filter only on panels that exist while open (menu, settings, modal);
 *  - no CSS filters on full-screen layers; dimming is done with alpha masks;
 *  - only transform/opacity are animated (shadows switch instantly).
 *
 * Pure CSS overlay plus one tiny text tweak — remove the plugin to get stock Lampa back.
 */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  var B = 'body.appletv--style ';
  var SAFE = '4.2em'; /* ~90px @1920 — tvOS side safe area */
  /* panels: solid-ish fill always; the blur is added only while the panel is open (see OPEN_BLUR) —
   an off-screen element with backdrop-filter still costs a full blur pass every frame */
  var PANEL = 'background:rgba(34,34,38,.82)!important;border:0!important;box-shadow:0 2em 4em rgba(0,0,0,.5);';
  var BLUR = '-webkit-backdrop-filter:blur(30px) saturate(1.6);backdrop-filter:blur(30px) saturate(1.6);background:rgba(34,34,38,.6)!important;';
  var FOCUS = 'background:#fff!important;color:#000!important;box-shadow:0 .6em 1.4em rgba(0,0,0,.45);';
  var T = 'transition:transform .3s ' + EASE + ',opacity .25s;';

  function svg(markup) { return 'url("data:image/svg+xml,' + encodeURIComponent(markup) + '")'; }

  var css = [
    /* ---------- base ---------- */
    'body.appletv--style{font-family:"Inter",-apple-system,"SF Pro Display",Roboto,sans-serif!important;background:#000!important;-webkit-font-smoothing:antialiased;letter-spacing:-0.01em}',
    B + '.background{opacity:.42!important}',
    B + '.background__fade{background:#000}',
    'body.appletv--style::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;' +
      'background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 55%,rgba(0,0,0,.8) 100%)}',

    /* ---------- header: invisible until focus enters it (tvOS tab-bar behaviour) ---------- */
    B + '.head{background:none!important;border:0!important;box-shadow:none!important}',
    B + '.head__body{padding:1.1em ' + SAFE + ' .5em!important}',
    B + '.head__time,' + B + '.head__split,' + B + '.head__title,' + B + '.head__logo-icon,' + B + '.head__markers,' +
      B + '.head .m-reload-screen,' + B + '.head .open--broadcast,' + B + '.notice--icon.active::after{display:none!important}',
    B + '.head__actions{margin-left:auto;' + T + '}',
    B + '.head:not(:has(.focus)) .head__actions{opacity:0;transform:translateY(-.6em)}',
    B + '.head__action{width:2.7em!important;height:2.7em!important;background:rgba(255,255,255,.16)!important;margin-left:.9em!important;' + T + '}',
    B + '.head__action.focus,' + B + '.head__action.hover{' + FOCUS + 'transform:scale(1.12)}',

    /* ---------- side menu: floating frosted sidebar over dimmed content ---------- */
    B + '.wrap__left{' + PANEL + 'position:fixed!important;z-index:20!important;border-radius:1.8em;margin-top:3em!important;padding-top:.6em!important;height:calc(100vh - 6em)!important;max-height:none!important;display:flex!important;flex-direction:column;overflow:hidden}',
    B + '.wrap__left > .scroll{height:auto!important;flex:1 1 0;min-height:0;-webkit-mask-image:linear-gradient(#000 calc(100% - 1.2em),transparent);mask-image:linear-gradient(#000 calc(100% - 1.2em),transparent);padding-bottom:1em}',
    'body.appletv--style.menu--open .wrap__left{transform:translate3d(16.2em,0,0)!important;' + BLUR + '}',
    'body.appletv--style.settings--open .settings__content,body.appletv--style.selectbox--open .selectbox__content{' + BLUR + 'transform:translate3d(calc(-100% - 2.8em),0,0)!important}',
    'body.appletv--style.menu--open:not(.light--version) .wrap__content{transform:none!important;opacity:.45;transition:opacity .3s}',
    B + '.menu__list{padding:0 .7em!important}',
    B + '.menu__item{border-radius:1em!important;padding:.55em 1.1em!important;' + T + '}',
    B + '.menu__item.focus,' + B + '.menu__item.hover,' + B + '.menu__item.traverse{' + FOCUS + '}',
    B + '.menu__text{font-weight:500!important;font-size:1.25em!important;margin-top:0!important;line-height:1.25!important}',
    B + '.menu__ico{opacity:.85}',
    B + '.menu__ico > img{filter:grayscale(1) brightness(1.8)!important}',
    B + '.menu__item.focus .menu__ico > img{filter:grayscale(1) brightness(0)!important}',
    B + '.menu__split{border-color:rgba(255,255,255,.1)!important}',

    /* ---------- shelves ---------- */
    B + '.items-line{padding-bottom:3.9em!important}',
    B + '.items-line--type-default .card__title,' + B + '.items-line--type-default .card__age{position:absolute;left:0;right:0;pointer-events:none}',
    B + '.items-line--type-default .card__title{top:100%}',
    B + '.items-line--type-default .card__age{display:none!important}',
    B + '.items-line--type-default .card__title{-webkit-line-clamp:1!important;line-clamp:1!important;max-height:1.3em!important;white-space:nowrap;text-overflow:ellipsis}',
    B + '.items-line__head{padding-left:' + SAFE + '!important;padding-right:' + SAFE + '!important;margin-bottom:2.2em!important}',
    B + '.items-line__body .scroll__content{padding-left:' + SAFE + '!important;padding-right:' + SAFE + '!important}',
    B + '.items-line__title{font-weight:600!important;font-size:1.75em!important;letter-spacing:-0.025em}',
    B + '.items-line__more{background:none!important;color:rgba(255,255,255,.55)!important;padding:.3em .6em!important;font-weight:500!important;' + T + '}',
    B + '.items-line__more::after{content:" \\203A";font-size:1.25em;margin-left:.15em}',
    B + '.items-line__more.focus{' + FOCUS + 'border-radius:2em!important;padding:.3em .9em!important;transform:scale(1.06)}',
    B + '.items-line--type-default .scroll__body > .card + .card{margin-left:1.8em!important}',

    /* ---------- home hero (tvOS top shelf): focused title over its own backdrop ---------- */
    /* hero art: one fixed image, faded into black toward the bottom and the left */
    B + '.atv-hero__art{position:fixed;top:0;left:0;width:100vw;height:72vh;object-fit:cover;z-index:0;pointer-events:none;opacity:0;transition:opacity .5s;' +
      '-webkit-mask-image:linear-gradient(180deg,#000 40%,transparent 100%);mask-image:linear-gradient(180deg,#000 40%,transparent 100%)}',
    B + '.atv-hero__art.is-on{opacity:1}',
    B + '.atv-hero__shade{position:fixed;top:0;left:0;width:100vw;height:72vh;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,.2) 42%,rgba(0,0,0,0) 62%)}',
    'body.appletv--style.atv-home::before{background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.85) 66%,#000 100%)}',
    B + '.atv-hero{position:absolute;top:0;left:0;right:0;height:calc(37vh - 3.2em);z-index:2;pointer-events:none;display:flex;flex-direction:column;justify-content:flex-end;padding:0 ' + SAFE + ' 1.2em;box-sizing:border-box;transition:opacity .25s}',
    'body.appletv--style.atv-home .activity--active .activity__body{position:relative}',
    'body.appletv--style.atv-home .activity--active .activity__body > div:not([class*=atv-hero]){padding-top:calc(37vh - 3.2em)!important}',
    'body.appletv--style.atv-home .activity--active .activity__body > div:not([class*=atv-hero]){position:relative;z-index:1}',
    'body.appletv--style.atv-home .activity--active .activity__body > div:not([class*=atv-hero]) > .scroll{height:calc(63vh - 1em)!important;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 2.2em);mask-image:linear-gradient(180deg,transparent 0,#000 2.2em)}',
    'body.appletv--style:not(.atv-home) .atv-hero,body.appletv--style:not(.atv-home) .atv-hero__art,body.appletv--style:not(.atv-home) .atv-hero__shade{display:none}',
    B + '.atv-hero.is-swapping{opacity:0}',
    B + '.atv-hero__meta{font-size:1.05em;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.4em;letter-spacing:.01em}',
    B + '.atv-hero__title{font-size:3.4em;font-weight:700;letter-spacing:-0.035em;line-height:1.08;max-width:70%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 .1em .8em rgba(0,0,0,.4)}',
    B + '.atv-hero__text{font-size:1.15em;line-height:1.45;color:rgba(255,255,255,.78);max-width:40em;margin-top:.6em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',

    /* ---------- posters: clean art, lift + specular sheen ---------- */
    B + '.card__view{border-radius:.9em;transform-origin:50% 60%;transition:transform .4s ' + EASE + '}',
    B + '.card__img{border-radius:.9em!important}',
    B + '.card.focus .card__view,' + B + '.card.hover .card__view{transform:scale(1.08);box-shadow:0 1.3em 2.4em rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);z-index:3}',
    B + '.card .card__view::after{content:"";position:absolute;top:0!important;left:0!important;right:0!important;bottom:0!important;border:0!important;border-radius:.9em!important;z-index:2!important;pointer-events:none;opacity:0;' +
      'background:linear-gradient(160deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.03) 30%,rgba(255,255,255,0) 45%);transition:opacity .4s}',
    B + '.card.focus .card__view::after,' + B + '.card.hover .card__view::after{opacity:1}',
    B + '.card__title{font-size:1.1em!important;font-weight:500;color:#fff;opacity:0;transform:translateY(-.2em);' + T + '}',
    B + '.card__age{color:rgba(255,255,255,.5);opacity:0;' + T + '}',
    B + '.card.focus .card__title,' + B + '.card.focus .card__age{opacity:1;transform:translateY(.6em)}',
    B + '.card__type,' + B + '.card__quality,' + B + '.card__vote,' + B + '.content-label{display:none!important}',
    B + '.card__marker,' + B + '.card__icons-inner{background:rgba(0,0,0,.6)!important}',

    /* ---------- details: full-bleed hero, title block bottom-left ---------- */
    /* the art fades into the black base via an alpha mask = free scrim, no filters */
    B + '.full-start__background{position:fixed!important;top:0!important;left:0!important;width:100vw!important;max-width:100vw!important;height:100vh!important;object-fit:cover;z-index:-2!important;' +
      '-webkit-mask-image:linear-gradient(28deg,transparent 8%,rgba(0,0,0,.22) 30%,rgba(0,0,0,.72) 55%,rgba(0,0,0,.9) 75%)!important;' +
      'mask-image:linear-gradient(28deg,transparent 8%,rgba(0,0,0,.22) 30%,rgba(0,0,0,.72) 55%,rgba(0,0,0,.9) 75%)!important}',
    B + '.full-start__background.loaded{opacity:1!important}',
    B + '.full-start__background.dim{opacity:.35!important}',
    B + '.full-start-new{padding-left:' + SAFE + '!important;padding-right:' + SAFE + '!important;padding-bottom:7em!important}',
    B + '.full-start-new__body{min-height:calc(100vh - 11.5em);align-items:flex-end!important}',
    B + '.full-start-new__left,' + B + '.full-start-new__reactions,' + B + '.full-start__status{display:none!important}',
    B + '.full-start-new__right{max-width:62%}',
    B + '.full-start-new__head{color:rgba(255,255,255,.65)!important;font-weight:500}',
    B + '.full-start-new__title{font-weight:700!important;font-size:4.2em!important;letter-spacing:-0.035em;line-height:1.1!important;-webkit-line-clamp:2!important;line-clamp:2!important;max-height:2.3em;text-shadow:0 .1em .8em rgba(0,0,0,.45)}',
    B + '.full-start-new__tagline{font-weight:500;font-size:1.4em!important;color:rgba(255,255,255,.7)}',
    /* metadata: IMDb rating only, quiet age badge */
    B + '.full-start-new__rate-line{margin-bottom:.8em!important;flex-wrap:wrap}',
    B + '.full-start__rate:not(.rate--imdb){display:none!important}',
    B + '.full-start__rate{background:none!important;padding:0!important;margin-right:1em!important;font-size:1em!important}',
    B + '.full-start__rate{display:flex!important;align-items:center;flex-direction:row-reverse}',
    B + '.full-start__rate > div{color:#fff!important;font-weight:600!important;font-size:1.15em}',
    B + '.full-start__rate > div:not(:first-child){font-size:.7em!important;color:#000!important;background:rgba(255,255,255,.85);border-radius:.3em;padding:.1em .35em;font-weight:700!important;letter-spacing:.02em;margin-right:.45em}',
    B + '.full-start__pg{background:none!important;border:1.5px solid rgba(255,255,255,.5)!important;color:rgba(255,255,255,.8)!important;border-radius:.3em!important;padding:.05em .4em!important;font-weight:600!important;font-size:.85em!important}',
    B + '.full-start-new__details{color:rgba(255,255,255,.65)!important;font-weight:500;margin-bottom:1.6em!important}',
    B + '.full-start-new__split{opacity:.5}',
    /* buttons: primary actions first, playback sources as a quieter second row */
    B + '.full-start-new__buttons{flex-wrap:wrap;gap:.8em .2em;align-items:center}',
    B + '.full-start-new__buttons .button--play,' + B + '.full-start-new__buttons .button--book,' + B + '.full-start-new__buttons .button--reaction,' +
      B + '.full-start-new__buttons .button--subscribe,' + B + '.full-start-new__buttons .button--comment{order:-2}',
    B + '.full-start__button{background:rgba(255,255,255,.16)!important;border-radius:2em!important;height:3.3em;min-width:3.3em;padding:0 .95em!important;justify-content:center;font-weight:600;font-size:1.15em!important;color:#fff!important;' + T + '}',
    B + '.full-start__button:not([class*="button--"]),' + B + '.full-start__button.button--options{opacity:.8}',
    B + '.full-start__button:not(.button--play):not(.focus) span{display:none!important}',
    B + '.full-start__button:not(.button--play):not(.focus) > svg,' + B + '.full-start__button:not(.button--play):not(.focus) > img{margin:0!important}',
    B + '.full-start__button svg,' + B + '.full-start__button img{width:1.35em!important;height:1.35em!important;object-fit:contain;filter:grayscale(1) brightness(1.8)}',
    B + '.full-start__button.button--play{padding:0 1.8em!important;background:rgba(255,255,255,.26)!important;min-width:9em}',
    B + '.full-start__button.button--play span{display:block!important;margin-left:.5em}',
    B + '.full-start__button > span,' + B + '.simple-button > span{margin-top:0!important;line-height:1.25!important}',
    B + '.full-start__button.focus,' + B + '.full-start__button.hover{' + FOCUS + 'opacity:1;transform:scale(1.08)}',
    B + '.full-start__button.focus svg,' + B + '.full-start__button.focus img{filter:grayscale(1) brightness(0)}',
    B + '.full-descr__text{color:rgba(255,255,255,.8);line-height:1.5}',
    B + '.atv-synopsis{color:rgba(255,255,255,.75);font-size:1.15em;line-height:1.45;max-width:38em;margin:-.6em 0 1.5em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',

    /* ---------- generic buttons ---------- */
    B + '.simple-button{background:rgba(255,255,255,.12);border-radius:.8em;' + T + '}',
    B + '.simple-button.focus{' + FOCUS + 'transform:scale(1.06)}',

    /* ---------- settings / pickers: floating frosted sheet, chevrons ---------- */
    B + '.settings__layer{background:rgba(0,0,0,.5)!important}',
    B + '.settings__content,' + B + '.selectbox__content{' + PANEL + 'overflow:hidden!important;border-radius:1.8em;top:2.8em!important;bottom:2.8em!important;height:auto!important}',
    B + '.selectbox__content{flex-direction:column!important}',
    B + '.settings__head,' + B + '.selectbox__head{padding-bottom:.4em!important}',
    /* Lampa sizes the list for a full-height panel; the panel is inset, so let flex size it or the last row is clipped */
    B + '.settings__body > .scroll,' + B + '.selectbox__body > .scroll{height:100%!important;max-height:100%!important}',
    B + '.settings__body,' + B + '.selectbox__body{height:auto!important;flex:1 1 0!important;min-height:0!important;overflow:hidden!important;-webkit-mask-image:linear-gradient(transparent,#000 2em,#000 calc(100% - 1.2em),transparent);mask-image:linear-gradient(transparent,#000 2em,#000 calc(100% - 1.2em),transparent)}',
    B + '.settings__title,' + B + '.selectbox__title{font-weight:600!important;letter-spacing:-0.02em}',
    B + '.settings-folder,' + B + '.settings-param,' + B + '.selectbox-item{border-radius:1em;margin:.15em 1.1em .15em .9em;width:auto!important;box-sizing:border-box;' + T + '}',
    B + '.settings-folder{position:relative}',
    B + '.settings-folder__icon{flex:0 0 1.9em!important;width:1.9em!important;display:flex;justify-content:center}',
    B + '.settings__body > .scroll{-webkit-mask-image:linear-gradient(#000 86%,transparent);mask-image:linear-gradient(#000 86%,transparent)}',
    B + '.settings-folder::after{content:"\\203A";position:absolute;right:1em;top:50%;transform:translateY(-52%);font-size:1.6em;opacity:.35}',
    B + '.settings-folder__icon img,' + B + '.settings-folder__icon svg{filter:grayscale(1) brightness(1.6);opacity:.85}',
    B + '.settings-folder.focus,' + B + '.settings-param.focus,' + B + '.selectbox-item.focus{' + FOCUS + '}',
    /* rows: centre label text (Lampa's -0.1/-0.2em label nudges assume Roboto metrics) */
    B + '.menu__item,' + B + '.settings-folder,' + B + '.settings-param,' + B + '.simple-button{align-items:center!important}',
    B + '.settings-folder__name,' + B + '.settings-param__name,' + B + '.settings-param__value,' + B + '.selectbox-item__title,' + B + '.selectbox-item__subtitle{line-height:1.25!important}',
    B + '.settings-folder.focus::after{opacity:.5;color:#000}',
    B + '.settings-folder.focus .settings-folder__icon img{filter:grayscale(1) invert(1);opacity:1}',
    B + '.settings-folder.focus .settings-folder__icon svg{filter:grayscale(1) brightness(0);opacity:1}',
    B + '.settings-param.focus .settings-param__descr,' + B + '.settings-param.focus .settings-param__value,' + B + '.selectbox-item.focus .selectbox-item__subtitle{color:rgba(0,0,0,.6)!important}',

    /* ---------- source lists (online plugins, torrents): tvOS glass rows, no focus ring ---------- */
    B + '.online.selector' + ',' + B + '.online-prestige.selector' + ',' + B + '.online_modss.selector' + ',' + B + '.torrent-item.selector' + '{border-radius:1em!important;background:rgba(255,255,255,.06)!important;border:0!important;outline:0!important;box-shadow:none!important;' + T + '}',
    B + '.online.selector.focus' + ',' + B + '.online-prestige.selector.focus' + ',' + B + '.online_modss.selector.focus' + ',' + B + '.torrent-item.selector.focus' + '{background:rgba(255,255,255,.24)!important;transform:scale(1.02);box-shadow:0 .8em 1.8em rgba(0,0,0,.45)!important}',
    B + '.online.selector.focus::after' + ',' + B + '.online-prestige.selector.focus::after' + ',' + B + '.online_modss.selector.focus::after' + ',' + B + '.torrent-item.selector.focus::after' + ',' + B + '.online.selector.focus::before' + ',' + B + '.online-prestige.selector.focus::before' + ',' + B + '.online_modss.selector.focus::before' + ',' + B + '.torrent-item.selector.focus::before' + '{display:none!important}',

    /* ---------- search: tvOS keyboard ---------- */
    B + '.search__body{padding:2.8em ' + SAFE + ' 0!important}',
    B + '.search__results-offset,' + B + '.search .search__empty,' + B + '.search .empty__descr{font-size:1.35em!important;color:rgba(255,255,255,.6)!important}',
    B + '.search__keypad{padding:0!important}',
    B + '.search__input{font-weight:600!important;font-size:1.7em!important;letter-spacing:-0.02em;line-height:2.1em;margin-bottom:.5em;' +
      'background:rgba(255,255,255,.1) ' + svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>') + ' no-repeat .6em 50%/.85em!important;' +
      'border:0!important;border-radius:.6em!important;padding:0 .6em 0 1.9em!important}',
    B + '.search__input:not(.filled){color:rgba(255,255,255,.5)!important;font-weight:500!important}',
    B + '.hg-button{background:transparent!important;border-radius:.6em!important;font-weight:500;color:rgba(255,255,255,.9);' + T + '}',
    B + '.hg-button.focus,' + B + '.simple-keyboard .hg-button:hover{' + FOCUS + 'transform:scale(1.1);z-index:2;position:relative}',
    B + '.hg-button.focus svg *{stroke:#000!important;fill:#000!important}',
    B + '.simple-keyboard .hg-row{justify-content:center!important;gap:.25em}',
    B + '.simple-keyboard .hg-row .hg-button{flex:0 0 calc((100% - 2.75em) / 12)!important;max-width:calc((100% - 2.75em) / 12)!important;margin:0!important}',
    B + '.simple-keyboard .hg-row .hg-button-SPACE{flex-basis:calc((100% - 2.75em) / 6)!important;max-width:calc((100% - 2.75em) / 6)!important}',
    B + '.simple-keyboard-mic{border-radius:.6em!important}',
    B + '.simple-keyboard-mic.focus{' + FOCUS + '}',
    B + '.search .scroll--horizontal{margin-top:1.1em;-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}',
    B + '.search-history-key{background:rgba(255,255,255,.1)!important;border-radius:2em!important;font-weight:500;font-size:.85em!important;color:rgba(255,255,255,.75)!important;display:inline-flex!important;align-items:center!important;line-height:1!important;padding-top:.7em!important;padding-bottom:.7em!important;' + T + '}',
    B + '.search-history-key > div{padding:0 .5em!important;line-height:1.2!important}',
    B + '.search-history-key svg{margin-top:0!important;align-self:center}',
    B + '.search-history-key.focus{' + FOCUS + 'transform:scale(1.06)}',
    /* sources as one segmented control */
    B + '.search .scroll__body:has(> .search-source){display:inline-flex!important;width:auto!important;background:rgba(255,255,255,.1);border-radius:2em;padding:.25em}',
    B + '.search-source{background:transparent!important;border-radius:2em!important;margin:0!important;font-weight:500;opacity:1;color:rgba(255,255,255,.75)!important;padding:.4em 1.1em!important;' + T + '}',
    B + '.search-source.active{background:rgba(255,255,255,.22)!important;color:#fff!important;border-radius:2em!important}',
    B + '.search-looking{text-align:left!important;margin:1.6em 0 0!important;padding:0!important;width:auto!important;display:block!important}',
    B + '.search-looking__text{font-size:1.4em!important;color:rgba(255,255,255,.55)!important;font-weight:500}',
    B + '.search-source.focus{' + FOCUS + 'opacity:1;transform:scale(1.06)}',
    B + '.search-source__count{display:none!important}',
    B + '.simple-keyboard-input{font-family:"Inter",sans-serif!important}',

    /* ---------- modal ---------- */
    B + '.modal__content{' + PANEL + 'border-radius:1.6em!important}',

    /* ---------- splash: black stage, single breathing mark, no text ---------- */
    '@keyframes atv-breathe{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(1)}50%{opacity:.95;transform:translate(-50%,-50%) scale(1.035)}}',
    B + '.welcome{background:#000!important}',
    B + '.welcome::after{content:"";position:absolute;left:50%;top:50%;width:7em;height:7em;background:no-repeat center/contain ' +
      svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="white"><circle cx="50" cy="50" r="44" stroke-width="5"/><circle cx="50" cy="50" r="28" stroke-width="5"/><circle cx="50" cy="50" r="11" fill="white" stroke="none"/></svg>') +
      ';animation:atv-breathe 3.4s ease-in-out infinite}',
    'body.appletv--style > div:has(> .lp-step){display:none!important}'
  ].join('\n');

  /* details: "a | b" -> "a · b" and a 3-line synopsis in the hero */
  function dotSeparators() {
    var right = document.querySelector('.full-start-new__right');
    var descr = document.querySelector('.full-descr__text');
    if (right && descr && !right.querySelector('.atv-synopsis')) {
      var p = document.createElement('div');
      p.className = 'atv-synopsis';
      p.textContent = descr.textContent.trim();
      var anchor = right.querySelector('.full-start-new__buttons');
      if (anchor && p.textContent) right.insertBefore(p, anchor);
    }
    var els = document.querySelectorAll('.full-start-new__details span, .full-start-new__head span');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent;
      if (t.indexOf(' | ') > -1) els[i].textContent = t.split(' | ').join(' · ');
    }
    var head = document.querySelector('.full-start-new__head');
    if (head && /, | \| /.test(head.textContent) && !head.getAttribute('data-atv')) {
      head.setAttribute('data-atv', '1');
      head.textContent = head.textContent.split(' | ').join(' · ').split(', ').join(' · ');
    }
  }

  /* ---------- home hero: follows the focused poster (cheap: text only, Lampa already paints the backdrop) ---------- */
  var heroTimer, artTimer;
  function isHome() {
    try { return Lampa.Activity.active().component === 'main'; } catch (e) { return false; }
  }
  function heroFor(card) {
    var act = document.querySelector('.activity--active');
    var body = act && act.querySelector('.activity__body');
    if (!body) return null;
    var hero = body.querySelector(':scope > .atv-hero');
    if (!hero) {
      hero = document.createElement('div');
      hero.className = 'atv-hero';
      hero.innerHTML = '<div class="atv-hero__meta"></div><div class="atv-hero__title"></div><div class="atv-hero__text"></div>';
      var art = document.createElement('img'); art.className = 'atv-hero__art'; art.alt = '';
      var shade = document.createElement('div'); shade.className = 'atv-hero__shade';
      body.insertBefore(hero, body.firstChild);
      body.insertBefore(shade, body.firstChild);
      body.insertBefore(art, body.firstChild);
    }
    return hero;
  }
  function updateHero(card) {
    var d = card && card.card_data;
    if (!d) return;
    var hero = heroFor(card);
    if (!hero) return;
    var title = d.title || d.name || '';
    if (hero.getAttribute('data-id') == String(d.id)) return;
    hero.setAttribute('data-id', d.id);
    hero.classList.add('is-swapping');
    clearTimeout(heroTimer);
    heroTimer = setTimeout(function () {
      var year = (d.release_date || d.first_air_date || '').slice(0, 4);
      var kind = d.name && !d.title ? 'Сериал' : 'Фильм';
      hero.querySelector('.atv-hero__meta').textContent = [kind, year].filter(Boolean).join(' · ');
      hero.querySelector('.atv-hero__title').textContent = title;
      hero.querySelector('.atv-hero__text').textContent = d.overview || '';
      hero.classList.remove('is-swapping');
    }, 180);
    /* backdrop: wait until focus settles so fast scrolling doesn't fetch every image */
    clearTimeout(artTimer);
    var art = hero.parentNode.querySelector(':scope > .atv-hero__art');
    art.classList.remove('is-on');
    if (!d.backdrop_path) return;
    artTimer = setTimeout(function () {
      var src = Lampa.TMDB.image('t/p/w1280' + d.backdrop_path);
      art.onload = function () { if (hero.getAttribute('data-id') == String(d.id)) art.classList.add('is-on'); };
      art.src = src;
    }, 1000);
  }
  function syncHomeClass() { document.body.classList.toggle('atv-home', isHome()); }

  /* re-running the script (hot reload) just swaps the stylesheet */
  if (window.__appletv_theme) {
    var old = document.getElementById('appletv-theme');
    if (old) old.textContent = css;
    return;
  }
  window.__appletv_theme = true;

  function inject() {
    if (document.getElementById('appletv-theme')) return;
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=cyrillic';
    document.head.appendChild(font);

    var style = document.createElement('style');
    style.id = 'appletv-theme';
    style.textContent = css;
    document.head.appendChild(style);
    document.body.classList.add('appletv--style');
  }

  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);

  if (window.Lampa && Lampa.Listener) {
    /* startup timing probe (ms since page start) — read by the dev tools */
    window.__atv_loaded = Math.round(performance.now());
    Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') window.__atv_ready = Math.round(performance.now()); });
    Lampa.Listener.follow('full', function () { setTimeout(dotSeparators, 50); setTimeout(dotSeparators, 600); });
    Lampa.Listener.follow('activity', function () { setTimeout(syncHomeClass, 50); });
    /* Lampa dispatches non-bubbling native 'hover:focus' events — listen in the capture phase */
    document.addEventListener('hover:focus', function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('card')) return;
      syncHomeClass();
      if (isHome()) updateHero(t);
    }, true);
  }

})();
