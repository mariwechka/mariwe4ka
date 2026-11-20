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
 *   chapter, lead, facts, cols, table, palette, specimens, image, pair, scroll, phones, strip, grid-note, quote, text
 * categories: keys from config.workCategories (sites, presentations).
 * published: false keeps a project as a draft.
 */
const L = (ru, en, az) => ({ ru, en, az });

const all = [
  {
    slug: 'nocturne',
    title: 'NOCTURNE',
    year: 2026,
    categories: ['sites'],
    tools: ['Figma', 'HTML', 'CSS', 'JavaScript'],
    cover: 'nocturne/hero',
    card: { size: 'xl', tone: '#8e1b27' },
    theme: { mode: 'dark', bg: '#0b0b0b', fg: '#ece6dc', accent: '#c0343f', soft: '#1a1a1a' },
    hero: 'image',
    // the project's own typefaces, used by the specimens block
    fonts: 'Unbounded:wght@900&family=Cormorant+Garamond:ital,wght@1,400&family=Inter+Tight:wght@400',
    summary: L(
      'Кейс: интернет-магазин виниловых пластинок, который читается как независимый музыкальный журнал и работает как полноценный магазин.',
      'Case study: an online vinyl record store that reads like an independent music magazine and works as a full-featured shop.',
      'Keys: müstəqil musiqi jurnalı kimi oxunan və tam funksional mağaza kimi işləyən vinil val onlayn mağazası.'
    ),
    type: L('Сайт, интернет-магазин', 'Website, e-commerce', 'Sayt, onlayn mağaza'),
    role: L('UX/UI-дизайн, арт-дирекшн, фронтенд', 'UX/UI design, art direction, front-end', 'UX/UI dizayn, art-direkşn, frontend'),
    blocks: [
      { type: 'chapter', no: '01', title: L('Задача', 'The brief', 'Tapşırıq') },
      { type: 'lead', text: L(
        'NOCTURNE продаёт винил коллекционерам и людям, для которых музыка — часть культуры, а не фон. В брифе было два требования, которые обычно тянут в разные стороны: атмосфера независимого журнала и удобство настоящего магазина.',
        'NOCTURNE sells vinyl to collectors and to people for whom music is culture, not background. The brief had two demands that usually pull in opposite directions: the mood of an independent magazine and the convenience of a real shop.',
        'NOCTURNE vinili kolleksiyaçılara və musiqini fon yox, mədəniyyət sayan insanlara satır. Tapşırıqda adətən bir-birinə zidd olan iki tələb var idi: müstəqil jurnal atmosferi və real mağazanın rahatlığı.'
      ) },
      { type: 'cols', items: [
        [L('Узнаваемый образ', 'A recognisable look', 'Tanınan obraz'), L('Без одинаковых карточек и стандартных блоков — клиент заранее отверг шаблонные магазины.', 'No identical cards or stock blocks — the client had already rejected templated stores.', 'Eyni kartlar və standart bloklar olmadan — müştəri şablon mağazaları əvvəlcədən rədd etmişdi.')],
        [L('Удобный каталог', 'An easy catalogue', 'Rahat kataloq'), L('Фильтры, сортировка, поиск и два вида просмотра.', 'Filters, sorting, search and two ways to browse.', 'Filtrlər, sıralama, axtarış və iki baxış rejimi.')],
        [L('Полный путь покупки', 'The full purchase path', 'Tam alış yolu'), L('Корзина, избранное, оформление заказа. Бэкенда не было — всё работает на локальных данных.', 'Cart, favourites, checkout. There was no backend, so everything runs on local data.', 'Səbət, seçilmişlər, sifariş. Backend yox idi, hər şey lokal məlumatlarla işləyir.')]
      ] },
      { type: 'facts', items: [
        ['11', L('экранов, от главной до номера заказа', 'screens, from home to order number', 'ekran: ana səhifədən sifariş nömrəsinə qədər')],
        ['36', L('релизов в демо-каталоге', 'releases in the demo catalogue', 'demo kataloqda reliz')],
        ['≈70 KB', L('весь сайт в сжатом виде', 'the whole site, compressed', 'bütün sayt, sıxılmış halda')],
        ['0', L('внешних библиотек', 'external libraries', 'xarici kitabxana')]
      ] },

      { type: 'chapter', no: '02', title: L('Аудитория', 'Audience', 'Auditoriya') },
      { type: 'table', head: [L('Кто', 'Who', 'Kim'), L('Что ищет', 'What they look for', 'Nə axtarır'), L('Ответ в интерфейсе', 'How the interface answers', 'İnterfeysin cavabı')], rows: [
        [L('Коллекционер', 'Collector', 'Kolleksiyaçı'), L('Конкретный пресс, состояние диска и конверта, год', 'A specific pressing, disc and sleeve condition, year', 'Konkret pres, disk və üzlüyün vəziyyəti, il'), L('Два грейда Goldmine со шкалой, издание и каталожный номер, фильтр по состоянию', 'Two Goldmine grades with a scale, edition and catalogue number, a condition filter', 'Şkala ilə iki Goldmine qiyməti, nəşr və kataloq nömrəsi, vəziyyətə görə filtr')],
        [L('Меломан 18–40', 'Music lover, 18–40', 'Musiqisevər, 18–40'), L('Открыть новое, понять, почему пластинка важна', 'To discover something new and see why a record matters', 'Yeni bir şey kəşf etmək, valın niyə vacib olduğunu anlamaq'), L('Кураторские коллекции, редакционные подборки, «похожие альбомы»', 'Curated collections, editorial picks, “similar albums”', 'Kurator kolleksiyaları, redaksiya seçimləri, “oxşar albomlar”')],
        [L('Покупатель с телефона', 'Mobile shopper', 'Telefondan alıcı'), L('Быстро найти и купить', 'To find and buy quickly', 'Tez tapmaq və almaq'), L('Нижняя панель, фильтры в выдвижной панели, закреплённая кнопка покупки', 'Bottom tab bar, filters in a sheet, sticky buy button', 'Aşağı panel, açılan paneldə filtrlər, sabit alış düyməsi')]
      ] },

      { type: 'chapter', no: '03', title: L('Идея', 'Idea', 'İdeya') },
      { type: 'text', title: L('Журнал × магазин', 'Magazine × shop', 'Jurnal × mağaza'), body: L(
        'Сайт свёрстан как выпуск журнала: у главной есть номер и дата, разделы пронумерованы, тексты набраны с буквицами и цитатами. Под этим слоем — строгая механика магазина: цена, наличие и кнопка покупки всегда на одном месте.',
        'The site is laid out like a magazine issue: the home page has an issue number and date, sections are numbered, texts use drop caps and pull quotes. Underneath sits strict shop mechanics: price, stock and the buy button are always in the same place.',
        'Sayt jurnal nömrəsi kimi tərtib olunub: ana səhifənin nömrəsi və tarixi var, bölmələr nömrələnib, mətnlərdə böyük baş hərflər və sitatlar var. Bu qatın altında ciddi mağaza mexanikası var: qiymət, stok və alış düyməsi həmişə eyni yerdədir.'
      ) },
      { type: 'cols', items: [
        [L('Редакция', 'Editorial', 'Redaksiya'), L('Крупный гротеск и курсивный serif, асимметричные сетки, текст поверх изображения.', 'Big grotesque with italic serif, asymmetric grids, type over images.', 'Böyük qrotesk və kursiv serif, asimmetrik torlar, təsvir üzərində mətn.')],
        [L('Аналог', 'Analogue', 'Analoq'), L('Пластинка — сквозной элемент: выезжает из конверта, крутится, становится шторкой перехода.', 'The record runs through everything: it slides out, spins and becomes the page curtain.', 'Val keçid elementidir: üzlükdən çıxır, fırlanır, səhifə pərdəsinə çevrilir.')],
        [L('Функция', 'Function', 'Funksiya'), L('Фильтры сохраняются в ссылке, у каждого состояния — пустого, «продано», ошибки — свой дизайн.', 'Filters live in the URL; every state — empty, sold out, error — is designed.', 'Filtrlər linkdə saxlanılır; hər vəziyyətin — boş, “satılıb”, xəta — öz dizaynı var.')]
      ] },

      { type: 'chapter', no: '04', title: L('Визуальная система', 'Visual system', 'Vizual sistem') },
      { type: 'palette', colors: [
        ['#0a0a0a', L('Чёрный', 'Black', 'Qara'), L('фон', 'background', 'fon')],
        ['#151515', L('Графит', 'Graphite', 'Qrafit'), L('панели', 'panels', 'panellər')],
        ['#262626', L('Графит 3', 'Graphite 3', 'Qrafit 3'), L('линии', 'lines', 'xətlər')],
        ['#ece6dc', 'Off-white', L('текст', 'text', 'mətn')],
        ['#8e1b27', L('Бордо', 'Burgundy', 'Bordo'), L('акцент', 'accent', 'aksent')]
      ] },
      { type: 'specimens', items: [
        ['Unbounded 900', L('заголовки', 'headings', 'başlıqlar'), 'Cold Architecture', 'sp-display'],
        ['Cormorant Garamond Italic', L('исполнители, цитаты', 'artists, quotes', 'ifaçılar, sitatlar'), 'Smoke Over Nyhavn', 'sp-serif'],
        ['Inter Tight', L('интерфейс', 'interface', 'interfeys'), L('Добавить в корзину', 'Add to cart', 'Səbətə əlavə et'), 'sp-sans'],
        ['JetBrains Mono', L('метаданные, грейды', 'metadata, grades', 'metaməlumat, qiymətlər'), 'LP · 1962 · NM / VG+', 'sp-mono']
      ] },
      { type: 'grid-note', img: 'vinyl-covers/grid', title: L('36 обложек, нарисованных кодом', '36 covers drawn by code', 'Kodla çəkilmiş 36 üz qabığı'), body: L(
        'Фотографий не было, а стоковые картинки сразу превратили бы проект в шаблон. Каждая обложка строится из идентификатора релиза: 13 стилей, 12 палитр. На б/у конвертах проступает кольцо от диска — чем ниже грейд, тем заметнее.',
        'There were no photos, and stock images would have made it look templated. Every sleeve is built from the release ID: 13 styles, 12 palettes. Used sleeves show ring wear — the lower the grade, the more visible.',
        'Foto yox idi, stok şəkillər isə layihəni şablona çevirərdi. Hər üz qabığı relizin identifikatorundan qurulur: 13 üslub, 12 palitra. İşlənmiş üzlüklərdə valın izi görünür — qiymət nə qədər aşağıdırsa, bir o qədər nəzərə çarpır.'
      ) },

      { type: 'chapter', no: '05', title: L('Экраны', 'Screens', 'Ekranlar') },
      { type: 'scroll', img: 'nocturne/home', caption: L('Главная целиком: семь разделов — новинки, избранное, жанры, коллекция недели, редакция, история, рассылка.', 'The full home page: seven sections — new arrivals, featured, genres, collection of the week, editorial, story, newsletter.', 'Ana səhifə tam halda: yeddi bölmə — yeniliklər, seçilmişlər, janrlar, həftənin kolleksiyası, redaksiya, tarix, bülleten.') },
      { type: 'pair', imgs: ['nocturne/genres', 'nocturne/weekly'], caption: L('Жанры с превью обложек под курсором и коллекция недели со своим цветом.', 'Genres with cover previews under the cursor, and the collection of the week in its own colour.', 'Kursorun altında üz qabığı önizləməsi olan janrlar və öz rəngi olan həftənin kolleksiyası.') },
      { type: 'pair', imgs: ['nocturne/catalog', 'nocturne/list'], caption: L('Каталог: шесть фильтров, пять сортировок, сетка со смещённой колонкой и список-реестр.', 'Catalogue: six filters, five sorts, a grid with an offset column and a ledger list.', 'Kataloq: altı filtr, beş sıralama, sürüşdürülmüş sütunlu tor və siyahı.') },
      { type: 'image', img: 'nocturne/pdp', wide: true, caption: L('Страница релиза: пластинка выезжает из конверта, кнопка «Звук иглы» включает шипение прямо в браузере.', 'Release page: the record slides out of its sleeve, and “needle sound” plays crackle right in the browser.', 'Reliz səhifəsi: val üzlükdən çıxır, “iynə səsi” düyməsi xışıltını birbaşa brauzerdə səsləndirir.') },
      { type: 'pair', imgs: ['nocturne/pdp2', 'nocturne/collection'], caption: L('Характеристики, два грейда и треклист; страница коллекции с покупкой всей подборки.', 'Specs, two grades and the tracklist; a collection page where you can buy the whole set.', 'Xüsusiyyətlər, iki qiymət və trek siyahısı; bütün seçimi almaq mümkün olan kolleksiya səhifəsi.') },
      { type: 'pair', imgs: ['nocturne/mega', 'nocturne/quick'], caption: L('Мега-меню каталога и быстрый просмотр товара.', 'Catalogue mega menu and product quick view.', 'Kataloqun meqa-menyusu və məhsula cəld baxış.') },

      { type: 'chapter', no: '06', title: L('Мобильная версия', 'Mobile', 'Mobil versiya') },
      { type: 'phones', imgs: ['nocturne/m-home', 'nocturne/m-catalog', 'nocturne/m-filters', 'nocturne/m-pdp'], caption: L('Не уменьшенная копия: нижняя панель навигации, меню на весь экран, фильтры в выдвижной панели, закреплённая кнопка покупки.', 'Not a scaled-down copy: bottom tab bar, full-screen menu, filters in a sheet, sticky buy button.', 'Kiçildilmiş surət deyil: aşağı naviqasiya paneli, tam ekran menyu, açılan paneldə filtrlər, sabit alış düyməsi.') },

      { type: 'chapter', no: '07', title: L('Движение', 'Motion', 'Hərəkət') },
      { type: 'table', head: [L('Момент', 'Moment', 'An'), L('Время', 'Timing', 'Müddət'), L('Что происходит', 'What happens', 'Nə baş verir')], mono: 1, rows: [
        [L('Заставка', 'Intro', 'Giriş'), '1.3 s', L('Счётчик 000→100, буквы поднимаются по одной', 'A 000→100 counter, letters rise one by one', '000→100 sayğac, hərflər bir-bir qalxır')],
        [L('Переход', 'Page change', 'Keçid'), '0.4 + 0.6 s', L('Бордовая шторка с названием раздела', 'A burgundy curtain with the section name', 'Bölmə adı olan bordo pərdə')],
        [L('Карточка', 'Card', 'Kart'), '0.8 s', L('Конверт сдвигается, пластинка выезжает и проворачивается', 'The sleeve shifts, the record slides out and turns', 'Üzlük sürüşür, val çıxır və fırlanır')],
        [L('В корзину', 'Add to cart', 'Səbətə'), '0.7 s', L('Пластинка летит по дуге к иконке корзины', 'A record flies in an arc to the cart icon', 'Val qövs üzrə səbət ikonuna uçur')]
      ] },

      { type: 'chapter', no: '08', title: L('Результат', 'Result', 'Nəticə') },
      { type: 'text', title: L('Готов к бэкенду', 'Ready for a backend', 'Backend-ə hazır'), body: L(
        'Полный путь покупки работает: фильтры, корзина с учётом остатков, избранное, поиск, оформление заказа. Всё собрано на чистом HTML, CSS и JavaScript без библиотек; данные, состояние и интерфейс разделены, поэтому подключение API затрагивает один слой.',
        'The full purchase path works: filters, a stock-aware cart, favourites, search and checkout. It is built with plain HTML, CSS and JavaScript, no libraries; data, state and UI are separated, so connecting an API touches a single layer.',
        'Tam alış yolu işləyir: filtrlər, qalığı nəzərə alan səbət, seçilmişlər, axtarış, sifariş. Hər şey kitabxanasız təmiz HTML, CSS və JavaScript ilə qurulub; məlumat, vəziyyət və interfeys ayrılıb, ona görə API qoşmaq yalnız bir qata toxunur.'
      ) },
      { type: 'quote', text: L('Магазин, в котором хочется остаться.', 'A store you want to stay in.', 'Qalmaq istədiyiniz mağaza.') }
    ]
  },

  /* ---- drafts: not published (set published: true to show) ---- */
  {
    slug: 'vinyl-covers',
    published: false,
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
    published: false,
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

module.exports = all.filter(p => p.published !== false);
