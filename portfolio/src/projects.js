/**
 * Projects. To add a new work:
 *  1. Put images in assets/img/works/<slug>/ as <name>-<width>.webp (run `python3 tools/images.py <slug> <files…>`)
 *     The script also registers them in src/images.json.
 *  2. Copy one object below, change slug, texts and blocks.
 *  3. Run `node build.js`.
 *
 * Text fields are objects { ru, en, az }.
 * card.size: 'xl' | 'l' | 'm' | 'tall' controls the size of the card in the grid.
 * theme: colours of the project page. mode 'dark' or 'light'.
 * blocks: the composition of the case page; mix them freely:
 *   lead, facts, image, pair, scroll, phones, strip, grid-note, quote, text, palette
 */
const L = (ru, en, az) => ({ ru, en, az });

module.exports = [
  {
    slug: 'nocturne',
    title: 'NOCTURNE',
    year: 2026,
    categories: ['web', 'uiux'],
    tools: ['Figma', 'HTML', 'CSS', 'JavaScript'],
    cover: 'nocturne/hero',
    card: { size: 'xl', tone: '#8e1b27' },
    theme: { mode: 'dark', bg: '#0b0b0b', fg: '#ece6dc', accent: '#b02a36', soft: '#1a1a1a' },
    hero: 'image',
    summary: L(
      'Интернет-магазин виниловых пластинок, который читается как независимый музыкальный журнал.',
      'An online vinyl record store that reads like an independent music magazine.',
      'Müstəqil musiqi jurnalı kimi oxunan vinil val onlayn mağazası.'
    ),
    type: L('Интернет-магазин, концепт', 'E-commerce, concept', 'Onlayn mağaza, konsept'),
    role: L('UX/UI-дизайн, арт-дирекшн, фронтенд', 'UX/UI design, art direction, front-end', 'UX/UI dizayn, art-direkşn, frontend'),
    blocks: [
      { type: 'lead', text: L(
        'Магазин для коллекционеров и людей, для которых музыка — часть культуры, а не фон. Задача была соединить атмосферу журнала и удобство настоящего магазина.',
        'A store for collectors and for people who treat music as culture rather than background. The brief was to combine the mood of a magazine with the convenience of a real shop.',
        'Kolleksiyaçılar və musiqini fon yox, mədəniyyətin bir hissəsi sayan insanlar üçün mağaza. Tapşırıq jurnal atmosferini real mağazanın rahatlığı ilə birləşdirmək idi.'
      ) },
      { type: 'facts', items: [
        ['11', L('экранов, от главной до номера заказа', 'screens, from home to order number', 'ekran: ana səhifədən sifariş nömrəsinə qədər')],
        ['36', L('релизов в демо-каталоге', 'releases in the demo catalogue', 'demo kataloqda reliz')],
        ['≈70 KB', L('весь сайт в сжатом виде', 'the whole site, compressed', 'bütün sayt, sıxılmış halda')],
        ['0', L('внешних библиотек', 'external libraries', 'xarici kitabxana')]
      ] },
      { type: 'scroll', img: 'nocturne/home', caption: L('Главная страница целиком: семь разделов, ни одного шаблонного.', 'The full home page: seven sections, none of them templated.', 'Ana səhifə tam halda: yeddi bölmə, heç biri şablon deyil.') },
      { type: 'text', title: L('Идея', 'Idea', 'İdeya'), body: L(
        'Сайт свёрстан как выпуск журнала: у главной есть номер, разделы пронумерованы, тексты набраны с буквицами и цитатами. Пластинка — сквозной элемент: она выезжает из конверта, крутится, превращается в шторку перехода между разделами.',
        'The site is laid out like a magazine issue: the home page has an issue number, sections are numbered, texts use drop caps and pull quotes. The record runs through everything: it slides out of the sleeve, spins and becomes the curtain between pages.',
        'Sayt jurnal nömrəsi kimi tərtib olunub: ana səhifənin nömrəsi var, bölmələr nömrələnib, mətnlərdə böyük baş hərflər və sitatlar var. Val keçid elementidir: üzlükdən çıxır, fırlanır və bölmələr arasında pərdəyə çevrilir.'
      ) },
      { type: 'pair', imgs: ['nocturne/catalog', 'nocturne/list'], caption: L('Каталог: сетка со смещённой колонкой и список-реестр для поиска по параметрам.', 'Catalogue: a grid with an offset column and a ledger list for searching by parameters.', 'Kataloq: sürüşdürülmüş sütunlu tor və parametrlərə görə axtarış üçün siyahı.') },
      { type: 'image', img: 'nocturne/pdp', wide: true, caption: L('Страница релиза: пластинка выезжает из конверта, а кнопка «Звук иглы» включает шипение прямо в браузере.', 'Release page: the record slides out of its sleeve, and the “needle sound” button plays crackle right in the browser.', 'Reliz səhifəsi: val üzlükdən çıxır, “iynə səsi” düyməsi isə xışıltını birbaşa brauzerdə səsləndirir.') },
      { type: 'phones', imgs: ['nocturne/m-home', 'nocturne/m-catalog', 'nocturne/m-filters', 'nocturne/m-pdp'], caption: L('Мобильная версия со своей логикой: нижняя панель, фильтры в выдвижной панели, закреплённая кнопка покупки.', 'A mobile version with its own logic: bottom tab bar, filters in a sheet, sticky buy button.', 'Öz məntiqi olan mobil versiya: aşağı panel, açılan paneldə filtrlər, sabit alış düyməsi.') },
      { type: 'pair', imgs: ['nocturne/mega', 'nocturne/quick'], caption: L('Мега-меню каталога и быстрый просмотр товара.', 'Catalogue mega menu and product quick view.', 'Kataloqun meqa-menyusu və məhsula cəld baxış.') },
      { type: 'text', title: L('Результат', 'Result', 'Nəticə'), body: L(
        'Полный путь покупки работает: фильтры, корзина с учётом остатков, избранное, поиск, оформление заказа. Всё собрано на чистом HTML, CSS и JavaScript и готово к подключению бэкенда.',
        'The full purchase path works: filters, a stock-aware cart, favourites, search and checkout. Everything is built with plain HTML, CSS and JavaScript and is ready to connect to a backend.',
        'Tam alış yolu işləyir: filtrlər, qalığı nəzərə alan səbət, seçilmişlər, axtarış, sifarişin rəsmiləşdirilməsi. Hər şey təmiz HTML, CSS və JavaScript ilə qurulub və backend-ə qoşulmağa hazırdır.'
      ) }
    ]
  },

  {
    slug: 'vinyl-covers',
    title: 'Vinyl Covers',
    year: 2026,
    categories: ['digital-art', 'graphic'],
    tools: ['JavaScript', 'SVG', 'Figma'],
    cover: 'vinyl-covers/fan',
    card: { size: 'tall', tone: '#1c2230' },
    theme: { mode: 'light', bg: '#e9e5dc', fg: '#151515', accent: '#1c2230', soft: '#dcd6ca' },
    hero: 'type',
    summary: L(
      'Генеративная система обложек: 36 уникальных обложек из 13 стилей, нарисованных кодом.',
      'A generative cover system: 36 unique sleeves in 13 styles, drawn by code.',
      'Generativ üz qabığı sistemi: 13 üslubda kodla çəkilmiş 36 unikal üz qabığı.'
    ),
    type: L('Генеративная графика', 'Generative graphics', 'Generativ qrafika'),
    role: L('Концепция, графика, код', 'Concept, graphics, code', 'Konsepsiya, qrafika, kod'),
    blocks: [
      { type: 'lead', text: L(
        'Демо-каталогу магазина NOCTURNE нужны были обложки. Стоковые картинки сразу превратили бы проект в шаблон, поэтому каждая обложка строится из идентификатора релиза.',
        'The NOCTURNE demo catalogue needed cover art. Stock images would have made it look like a template at once, so every sleeve is built from the release ID.',
        'NOCTURNE mağazasının demo kataloquna üz qabıqları lazım idi. Stok şəkillər layihəni dərhal şablona çevirərdi, ona görə hər üz qabığı relizin identifikatorundan qurulur.'
      ) },
      { type: 'image', img: 'vinyl-covers/grid', wide: true, caption: L('Все 36 обложек каталога.', 'All 36 sleeves of the catalogue.', 'Kataloqun bütün 36 üz qabığı.') },
      { type: 'facts', items: [
        ['13', L('стилей: орбиты, растр, ленты, фазы луны, типографика', 'styles: orbits, halftone, ribbons, moon phases, type', 'üslub: orbitlər, rastr, lentlər, ay fazaları, tipoqrafiya')],
        ['12', L('палитр', 'palettes', 'palitra')],
        ['0 KB', L('растровых файлов: всё в SVG', 'of bitmap files: it’s all SVG', 'rastr fayl: hər şey SVG-dədir')]
      ] },
      { type: 'grid-note', img: 'vinyl-covers/single', title: L('Состояние как графика', 'Condition as graphics', 'Vəziyyət qrafika kimi'), body: L(
        'Одна и та же обложка всегда выглядит одинаково: генератор детерминирован. На б/у конвертах проступает кольцо от диска, и чем ниже грейд по шкале Goldmine, тем оно заметнее. Данные становятся видны глазами.',
        'The same sleeve always looks the same: the generator is deterministic. Used sleeves show ring wear, and the lower the Goldmine grade, the more visible it is. The data becomes visible.',
        'Eyni üz qabığı həmişə eyni görünür: generator deterministikdir. İşlənmiş üzlüklərdə valın izi görünür və Goldmine şkalası üzrə qiymət nə qədər aşağıdırsa, iz bir o qədər nəzərə çarpır. Məlumat gözlə görünən olur.'
      ) },
      { type: 'quote', text: L('Ограничение «без фотографий» стало главным визуальным приёмом проекта.', 'The “no photos” constraint became the project’s main visual device.', '“Fotosuz” məhdudiyyəti layihənin əsas vizual üsuluna çevrildi.') }
    ]
  },

  {
    slug: 'case-carousel',
    title: 'NOCTURNE Carousel',
    year: 2026,
    categories: ['graphic'],
    tools: ['Figma', 'HTML/CSS'],
    cover: 'case-carousel/s01',
    card: { size: 'm', tone: '#5b1018' },
    theme: { mode: 'dark', bg: '#5b1018', fg: '#f1e9dd', accent: '#f1e9dd', soft: '#4a0d14' },
    hero: 'split',
    summary: L(
      'Карусель из 11 слайдов, которая рассказывает кейс NOCTURNE в формате Instagram.',
      'An 11-slide carousel that tells the NOCTURNE case in Instagram format.',
      'NOCTURNE keysini Instagram formatında danışan 11 slaydlı karusel.'
    ),
    type: L('Графика для соцсетей', 'Social media graphics', 'Sosial şəbəkə qrafikası'),
    role: L('Сторителлинг, вёрстка, графика', 'Storytelling, layout, graphics', 'Hekayə, tərtibat, qrafika'),
    blocks: [
      { type: 'lead', text: L(
        'Кейс сайта нужно было пересказать для ленты: 11 слайдов 4:5, которые читаются с телефона и ведут от задачи к призыву написать.',
        'The website case had to be retold for the feed: 11 slides at 4:5 that read well on a phone and lead from the brief to a call to get in touch.',
        'Saytın keysini lent üçün yenidən danışmaq lazım idi: telefonda rahat oxunan və tapşırıqdan əlaqəyə çağırışa aparan 4:5 formatında 11 slayd.'
      ) },
      { type: 'strip', imgs: ['case-carousel/s01', 'case-carousel/s02', 'case-carousel/s03', 'case-carousel/s04', 'case-carousel/s05', 'case-carousel/s06', 'case-carousel/s07', 'case-carousel/s08', 'case-carousel/s09', 'case-carousel/s10', 'case-carousel/s11'], caption: L('Все слайды по порядку. Листайте ленту.', 'All slides in order. Scroll the strip.', 'Bütün slaydlar ardıcıllıqla. Lenti sürüşdürün.') },
      { type: 'text', title: L('Структура', 'Structure', 'Struktur'), body: L(
        'Обложка с крючком, затем задача, идея, визуальная система, главные экраны, мобильная версия, цифры и бордовый финал с призывом. У каждого слайда одна мысль и одна картинка.',
        'A cover with a hook, then the brief, the idea, the visual system, key screens, mobile, numbers and a burgundy finale with a call to action. Each slide carries one thought and one image.',
        'Cəlbedici üz qabığı, sonra tapşırıq, ideya, vizual sistem, əsas ekranlar, mobil versiya, rəqəmlər və çağırışla bordo final. Hər slaydda bir fikir və bir şəkil var.'
      ) },
      { type: 'pair', imgs: ['case-carousel/s05', 'case-carousel/s11'], caption: L('Слайд с генеративными обложками и финальный слайд.', 'The generative covers slide and the final slide.', 'Generativ üz qabıqları slaydı və final slayd.') }
    ]
  }
];
