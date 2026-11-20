/**
 * Interface texts for RU / EN / AZ.
 * Every visible string of the site is here (project texts live in projects.js).
 * Texts in [square brackets] are placeholders: replace them with your own words.
 */
module.exports = {
  ru: {
    langName: 'Русский',
    locale: 'ru_RU',
    nav: { home: 'Главная', works: 'Работы', about: 'Обо мне', services: 'Услуги', contact: 'Контакт', menu: 'Меню', close: 'Закрыть', skip: 'Перейти к содержимому', lang: 'Язык' },
    role: 'Фриланс-дизайнер',
    disciplines: ['Графический дизайн', 'Веб-дизайн', 'UI/UX', 'Брендинг', 'Digital art'],
    status: { on: 'Открыта для новых проектов', off: 'Сейчас в работе, бронь на следующий месяц' },

    meta: {
      home: { title: 'Фриланс-дизайнер: веб, UI/UX, брендинг', desc: 'Портфолио фриланс-дизайнера: сайты, интерфейсы, айдентика и digital-графика. Избранные работы, услуги и контакты.' },
      works: { title: 'Работы', desc: 'Избранные проекты: веб-дизайн, UI/UX, графический дизайн и digital art.' },
      about: { title: 'Обо мне', desc: 'Подход к работе, навыки и инструменты.' },
      services: { title: 'Услуги', desc: 'Графический и веб-дизайн, UI/UX, брендинг, digital-дизайн и 3D-визуализация.' },
      contact: { title: 'Контакт', desc: 'Напишите на почту или в Telegram, чтобы обсудить проект.' },
      notFound: { title: 'Страница не найдена', desc: 'Такой страницы нет.' }
    },

    hero: {
      index: 'Портфолио',
      lead: 'Проектирую сайты, интерфейсы и визуальные системы, у которых есть <em>характер</em>, и довожу их до работающего результата.',
      ctaWorks: 'Смотреть работы',
      ctaContact: 'Написать мне',
      scroll: 'Листайте',
      hint: 'Наведите на имя'
    },

    home: {
      worksTitle: 'Избранные <em>работы</em>',
      worksSub: 'Несколько проектов, в которых видно, как я думаю: от идеи до готового продукта.',
      allWorks: 'Все работы',
      aboutKicker: 'Подход',
      aboutText: 'Дизайн для меня начинается с вопроса «зачем?», а заканчивается тем, что работает у живых людей на живых экранах.',
      aboutLink: 'Подробнее обо мне',
      servicesTitle: 'Чем могу <em>помочь</em>',
      servicesLink: 'Все услуги',
      statement: ['Создаю', '#nocturne/m-home', 'сайты и интерфейсы,', '#vinyl-covers/single', 'визуальные системы', '#case-carousel/s05', 'и графику, которую', 'хочется рассматривать.'],
      worksHint: 'Листайте — работы едут вбок'
    },

    works: {
      title: 'Работы',
      intro: 'Сайты, интерфейсы, графика и визуальные системы. Каждый проект открывается как отдельный кейс.',
      all: 'Все',
      count: ['проект', 'проекта', 'проектов'],
      view: 'Открыть',
      empty: 'В этой категории пока нет проектов.',
      yoursTitle: 'Здесь может быть ваш проект',
      yoursText: 'Расскажите о задаче, и я предложу, как её решить.',
      yoursCta: 'Обсудить проект'
    },

    categories: {
      'graphic': 'Графический дизайн',
      'web': 'Веб-дизайн',
      'uiux': 'UI/UX',
      'branding': 'Брендинг',
      'identity': 'Айдентика',
      '3d': '3D / Интерьер',
      'digital-art': 'Digital art'
    },

    project: {
      type: 'Тип проекта',
      role: 'Роль',
      tools: 'Инструменты',
      year: 'Год',
      overview: 'О проекте',
      task: 'Задача',
      process: 'Процесс',
      result: 'Результат',
      next: 'Следующий проект',
      back: 'Все работы',
      open: 'Открыть живой сайт',
      scrollHint: 'Прокрутите внутри',
      gallery: 'Материалы',
      of: 'из'
    },

    about: {
      title: 'Обо <em>мне</em>',
      photo: 'Место для фотографии',
      photoHint: 'Портрет или рабочий процесс, 4:5',
      intro: '[Коротко о себе: кто вы, откуда, чем занимаетесь. Два-три предложения простым языком.]',
      introMore: '[Здесь можно рассказать, как вы пришли в дизайн и что вам интересно сейчас. Пишите от первого лица.]',
      approachTitle: 'Как я <em>работаю</em>',
      approach: [
        ['Сначала смысл', 'Перед тем как рисовать, выясняю, для кого продукт и что он должен изменить. Форма появляется из ответа.'],
        ['Система, а не набор экранов', 'Собираю цвета, шрифты и компоненты в правила, по которым проект можно развивать без меня.'],
        ['Деталь решает', 'Отступ, подпись, состояние кнопки: из таких мелочей складывается ощущение качества.'],
        ['До результата', 'Довожу работу до готовых файлов, прототипа или сайта, а не до красивой картинки в презентации.']
      ],
      skillsTitle: 'Навыки',
      skills: ['Визуальная концепция', 'Типографика', 'Дизайн-системы', 'Прототипирование', 'Адаптивная вёрстка', 'Анимация интерфейсов', 'Арт-дирекшн', 'Подготовка к печати'],
      toolsTitle: 'Инструменты',
      directionsTitle: 'Направления',
      cta: 'Хотите поработать вместе?'
    },

    services: {
      title: 'Услуги',
      intro: 'Беру проекты целиком или отдельные задачи. Стоимость и сроки обсуждаем после короткого разговора о задаче.',
      deliverables: 'Что вы получите',
      ask: 'Обсудить',
      list: {
        graphic: { name: 'Графический дизайн', desc: 'Печатные и digital-носители, которые выглядят как часть одной системы.', items: ['Постеры и афиши', 'Презентации', 'Соцсети и карусели', 'Полиграфия и упаковка'] },
        web: { name: 'Веб-дизайн', desc: 'Сайты, у которых есть характер, и которые при этом удобно читать, листать и покупать.', items: ['Лендинги и многостраничные сайты', 'Адаптив для всех экранов', 'Анимации и микровзаимодействия', 'Вёрстка или передача в разработку'] },
        uiux: { name: 'UI/UX-дизайн', desc: 'Интерфейсы, в которых путь пользователя продуман раньше, чем цвет кнопок.', items: ['Пользовательские сценарии', 'Прототипы', 'Дизайн-система и UI-kit', 'Макеты всех состояний'] },
        branding: { name: 'Брендинг и айдентика', desc: 'Визуальный язык бренда: от логотипа до правил, по которым его используют.', items: ['Логотип и знак', 'Цвет и типографика', 'Фирменные носители', 'Брендбук'] },
        digital: { name: 'Digital-дизайн', desc: 'Графика для экранов: генеративные визуалы, баннеры, обложки, визуалы для запусков.', items: ['Генеративная графика', 'Обложки и баннеры', 'Визуалы для соцсетей', 'Motion-фрагменты'] },
        '3d': { name: '3D-визуализация', desc: 'Визуализация интерьеров и предметов, чтобы увидеть идею до того, как её построят.', items: ['Интерьерные сцены', 'Предметная визуализация', 'Подбор материалов и света', 'Финальные рендеры'] }
      },
      processTitle: 'Как проходит <em>работа</em>',
      process: [
        ['Знакомство', 'Короткий созвон или переписка: задача, сроки, ожидания.'],
        ['Концепция', 'Предлагаю направление: референсы, первые эскизы, логику.'],
        ['Дизайн', 'Развиваю выбранное направление, показываю промежуточные этапы.'],
        ['Передача', 'Готовые файлы, макеты или сайт и рекомендации по использованию.']
      ]
    },

    contact: {
      kicker: 'Контакт',
      title: 'Давайте сделаем<br>что-то <em>заметное</em>',
      sub: 'Опишите задачу в паре предложений. Отвечаю в течение рабочего дня.',
      email: 'Почта',
      telegram: 'Telegram',
      copy: 'Копировать',
      copied: 'Скопировано',
      copyFail: 'Не удалось скопировать — выделите текст вручную',
      write: 'Написать письмо',
      openTg: 'Открыть Telegram',
      formTitle: 'Соберите письмо за минуту',
      formWhat: 'Что нужно',
      formAbout: 'Пара слов о проекте',
      formPlaceholder: 'Например: нужен сайт для студии керамики, есть логотип, хочется запуститься весной',
      formName: 'Как к вам обращаться',
      formSend: 'Открыть письмо',
      formNote: 'Кнопка откроет ваше почтовое приложение с готовым письмом. Ничего не отправляется без вас.',
      formError: 'Напишите хотя бы пару слов о проекте',
      formSubject: 'Проект',
      formHello: 'Здравствуйте!',
      badge: 'Напишите мне • Обсудим проект • '
    },

    footer: { top: 'Наверх', rights: 'Все права защищены', made: 'Дизайн и код — автор сайта' },
    notFound: { title: 'Такой страницы нет', text: 'Возможно, ссылка устарела. Начните с работ или главной.', home: 'На главную' },
    a11y: { prev: 'Назад', next: 'Вперёд', filter: 'Фильтр по категориям' }
  },

  en: {
    langName: 'English',
    locale: 'en_US',
    nav: { home: 'Home', works: 'Works', about: 'About', services: 'Services', contact: 'Contact', menu: 'Menu', close: 'Close', skip: 'Skip to content', lang: 'Language' },
    role: 'Freelance designer',
    disciplines: ['Graphic design', 'Web design', 'UI/UX', 'Branding', 'Digital art'],
    status: { on: 'Available for new projects', off: 'Booked — taking projects from next month' },

    meta: {
      home: { title: 'Freelance designer: web, UI/UX, branding', desc: 'Portfolio of a freelance designer: websites, interfaces, identities and digital graphics. Selected works, services and contacts.' },
      works: { title: 'Works', desc: 'Selected projects in web design, UI/UX, graphic design and digital art.' },
      about: { title: 'About', desc: 'Approach, skills and tools.' },
      services: { title: 'Services', desc: 'Graphic and web design, UI/UX, branding, digital design and 3D visualization.' },
      contact: { title: 'Contact', desc: 'Write by email or Telegram to discuss your project.' },
      notFound: { title: 'Page not found', desc: 'This page does not exist.' }
    },

    hero: {
      index: 'Portfolio',
      lead: 'I design websites, interfaces and visual systems with <em>character</em>, and take them all the way to a working result.',
      ctaWorks: 'See the work',
      ctaContact: 'Get in touch',
      scroll: 'Scroll',
      hint: 'Hover the name'
    },

    home: {
      worksTitle: 'Selected <em>works</em>',
      worksSub: 'A few projects that show how I think, from the first idea to a finished product.',
      allWorks: 'All works',
      aboutKicker: 'Approach',
      aboutText: 'For me, design starts with the question “why?” and ends with something that works for real people on real screens.',
      aboutLink: 'More about me',
      servicesTitle: 'How I can <em>help</em>',
      servicesLink: 'All services',
      statement: ['I make', '#nocturne/m-home', 'websites and interfaces,', '#vinyl-covers/single', 'visual systems', '#case-carousel/s05', 'and graphics people', 'want to look at.'],
      worksHint: 'Keep scrolling — the work slides sideways'
    },

    works: {
      title: 'Works',
      intro: 'Websites, interfaces, graphics and visual systems. Each project opens as a full case study.',
      all: 'All',
      count: ['project', 'projects', 'projects'],
      view: 'View',
      empty: 'No projects in this category yet.',
      yoursTitle: 'Your project could be here',
      yoursText: 'Tell me about the task and I’ll suggest how to approach it.',
      yoursCta: 'Discuss a project'
    },

    categories: {
      'graphic': 'Graphic design',
      'web': 'Web design',
      'uiux': 'UI/UX',
      'branding': 'Branding',
      'identity': 'Visual identity',
      '3d': '3D / Interior',
      'digital-art': 'Digital art'
    },

    project: {
      type: 'Project type',
      role: 'Role',
      tools: 'Tools',
      year: 'Year',
      overview: 'Overview',
      task: 'The brief',
      process: 'Process',
      result: 'Result',
      next: 'Next project',
      back: 'All works',
      open: 'Open the live site',
      scrollHint: 'Scroll inside',
      gallery: 'Materials',
      of: 'of'
    },

    about: {
      title: 'About <em>me</em>',
      photo: 'Photo goes here',
      photoHint: 'Portrait or work in progress, 4:5',
      intro: '[A short intro: who you are, where you’re based, what you do. Two or three plain sentences.]',
      introMore: '[Here you can tell how you came to design and what interests you right now. Write in the first person.]',
      approachTitle: 'How I <em>work</em>',
      approach: [
        ['Meaning first', 'Before drawing anything, I find out who the product is for and what it should change. The form comes out of that answer.'],
        ['A system, not a set of screens', 'Colours, type and components become rules, so the project can grow without me.'],
        ['Details decide', 'A margin, a caption, a button state: quality is made of these small things.'],
        ['All the way to the result', 'I deliver final files, a prototype or a live site, not just a nice picture in a deck.']
      ],
      skillsTitle: 'Skills',
      skills: ['Visual concept', 'Typography', 'Design systems', 'Prototyping', 'Responsive front-end', 'Interface motion', 'Art direction', 'Print production'],
      toolsTitle: 'Tools',
      directionsTitle: 'Disciplines',
      cta: 'Want to work together?'
    },

    services: {
      title: 'Services',
      intro: 'I take on whole projects or separate tasks. We agree on price and timing after a short conversation about the brief.',
      deliverables: 'What you get',
      ask: 'Discuss',
      list: {
        graphic: { name: 'Graphic design', desc: 'Print and digital pieces that look like parts of one system.', items: ['Posters', 'Presentations', 'Social media and carousels', 'Print and packaging'] },
        web: { name: 'Web design', desc: 'Websites with character that are still easy to read, browse and buy from.', items: ['Landing pages and multi-page sites', 'Responsive for every screen', 'Motion and micro-interactions', 'Front-end build or developer handoff'] },
        uiux: { name: 'UI/UX design', desc: 'Interfaces where the user’s path is designed before the button colours.', items: ['User flows', 'Prototypes', 'Design system and UI kit', 'Every screen state'] },
        branding: { name: 'Branding & visual identity', desc: 'A brand’s visual language, from the logo to the rules for using it.', items: ['Logo and mark', 'Colour and typography', 'Brand applications', 'Brand guidelines'] },
        digital: { name: 'Digital design', desc: 'Graphics for screens: generative visuals, banners, covers, launch visuals.', items: ['Generative graphics', 'Covers and banners', 'Social media visuals', 'Motion snippets'] },
        '3d': { name: '3D visualization', desc: 'Interiors and objects visualized, so you can see the idea before it is built.', items: ['Interior scenes', 'Product visualization', 'Materials and lighting', 'Final renders'] }
      },
      processTitle: 'How we <em>work</em>',
      process: [
        ['Intro', 'A short call or chat: the task, timing and expectations.'],
        ['Concept', 'I propose a direction: references, first sketches, the logic.'],
        ['Design', 'I develop the chosen direction and share the stages along the way.'],
        ['Handoff', 'Final files, mockups or a live site, plus guidance on using them.']
      ]
    },

    contact: {
      kicker: 'Contact',
      title: 'Let’s make<br>something <em>noticeable</em>',
      sub: 'Describe the task in a couple of sentences. I reply within one working day.',
      email: 'Email',
      telegram: 'Telegram',
      copy: 'Copy',
      copied: 'Copied',
      copyFail: 'Couldn’t copy — please select the text manually',
      write: 'Write an email',
      openTg: 'Open Telegram',
      formTitle: 'Put your email together in a minute',
      formWhat: 'What you need',
      formAbout: 'A few words about the project',
      formPlaceholder: 'For example: a website for a ceramics studio, we have a logo and want to launch in spring',
      formName: 'Your name',
      formSend: 'Open the email',
      formNote: 'The button opens your email app with the message ready. Nothing is sent without you.',
      formError: 'Please add a few words about the project',
      formSubject: 'Project',
      formHello: 'Hello!',
      badge: 'Write to me • Let’s talk • '
    },

    footer: { top: 'Back to top', rights: 'All rights reserved', made: 'Design and code by the site’s author' },
    notFound: { title: 'This page doesn’t exist', text: 'The link may be outdated. Start with the works or the home page.', home: 'Home page' },
    a11y: { prev: 'Previous', next: 'Next', filter: 'Filter by category' }
  },

  az: {
    langName: 'Azərbaycanca',
    locale: 'az_AZ',
    nav: { home: 'Ana səhifə', works: 'İşlər', about: 'Haqqımda', services: 'Xidmətlər', contact: 'Əlaqə', menu: 'Menyu', close: 'Bağla', skip: 'Məzmuna keç', lang: 'Dil' },
    role: 'Frilans dizayner',
    disciplines: ['Qrafik dizayn', 'Veb dizayn', 'UI/UX', 'Brendinq', 'Rəqəmsal incəsənət'],
    status: { on: 'Yeni layihələr üçün açığam', off: 'Hazırda məşğulam, növbəti ay üçün yer var' },

    meta: {
      home: { title: 'Frilans dizayner: veb, UI/UX, brendinq', desc: 'Frilans dizaynerin portfoliosu: saytlar, interfeyslər, korporativ üslub və rəqəmsal qrafika. Seçilmiş işlər, xidmətlər və əlaqə.' },
      works: { title: 'İşlər', desc: 'Seçilmiş layihələr: veb dizayn, UI/UX, qrafik dizayn və rəqəmsal incəsənət.' },
      about: { title: 'Haqqımda', desc: 'İş yanaşması, bacarıqlar və alətlər.' },
      services: { title: 'Xidmətlər', desc: 'Qrafik və veb dizayn, UI/UX, brendinq, rəqəmsal dizayn və 3D vizuallaşdırma.' },
      contact: { title: 'Əlaqə', desc: 'Layihəni müzakirə etmək üçün e-poçt və ya Telegram ilə yazın.' },
      notFound: { title: 'Səhifə tapılmadı', desc: 'Belə səhifə yoxdur.' }
    },

    hero: {
      index: 'Portfolio',
      lead: '<em>Xarakteri</em> olan saytlar, interfeyslər və vizual sistemlər hazırlayıram və onları işlək nəticəyə qədər çatdırıram.',
      ctaWorks: 'İşlərə bax',
      ctaContact: 'Mənə yaz',
      scroll: 'Aşağı sürüşdür',
      hint: 'Kursoru adın üzərinə gətir'
    },

    home: {
      worksTitle: 'Seçilmiş <em>işlər</em>',
      worksSub: 'Necə düşündüyümü göstərən bir neçə layihə: ideyadan hazır məhsula qədər.',
      allWorks: 'Bütün işlər',
      aboutKicker: 'Yanaşma',
      aboutText: 'Mənim üçün dizayn “nə üçün?” sualı ilə başlayır və real insanların real ekranlarında işləyən nəticə ilə bitir.',
      aboutLink: 'Haqqımda ətraflı',
      servicesTitle: 'Necə <em>kömək</em> edə bilərəm',
      servicesLink: 'Bütün xidmətlər',
      statement: ['Mən', '#nocturne/m-home', 'saytlar və interfeyslər,', '#vinyl-covers/single', 'vizual sistemlər', '#case-carousel/s05', 'və baxmaq istədiyiniz', 'qrafika yaradıram.'],
      worksHint: 'Sürüşdürün — işlər yana hərəkət edir'
    },

    works: {
      title: 'İşlər',
      intro: 'Saytlar, interfeyslər, qrafika və vizual sistemlər. Hər layihə ayrıca keys kimi açılır.',
      all: 'Hamısı',
      count: ['layihə', 'layihə', 'layihə'],
      view: 'Aç',
      empty: 'Bu kateqoriyada hələ layihə yoxdur.',
      yoursTitle: 'Burada sizin layihəniz ola bilər',
      yoursText: 'Tapşırıq haqqında danışın, həll yolunu təklif edim.',
      yoursCta: 'Layihəni müzakirə et'
    },

    categories: {
      'graphic': 'Qrafik dizayn',
      'web': 'Veb dizayn',
      'uiux': 'UI/UX',
      'branding': 'Brendinq',
      'identity': 'Korporativ üslub',
      '3d': '3D / İnteryer',
      'digital-art': 'Rəqəmsal incəsənət'
    },

    project: {
      type: 'Layihə növü',
      role: 'Rol',
      tools: 'Alətlər',
      year: 'İl',
      overview: 'Layihə haqqında',
      task: 'Tapşırıq',
      process: 'Proses',
      result: 'Nəticə',
      next: 'Növbəti layihə',
      back: 'Bütün işlər',
      open: 'Canlı saytı aç',
      scrollHint: 'İçəridə sürüşdür',
      gallery: 'Materiallar',
      of: '/'
    },

    about: {
      title: '<em>Haqqımda</em>',
      photo: 'Foto üçün yer',
      photoHint: 'Portret və ya iş prosesi, 4:5',
      intro: '[Qısaca özünüz haqqında: kimsiniz, haradansınız, nə ilə məşğulsunuz. İki-üç sadə cümlə.]',
      introMore: '[Burada dizayna necə gəldiyinizi və hazırda sizi nəyin maraqlandırdığını yaza bilərsiniz. Birinci şəxsdən yazın.]',
      approachTitle: 'Necə <em>işləyirəm</em>',
      approach: [
        ['Əvvəlcə məna', 'Çəkməyə başlamazdan əvvəl məhsulun kim üçün olduğunu və nəyi dəyişməli olduğunu öyrənirəm. Forma bu cavabdan yaranır.'],
        ['Ekranlar toplusu yox, sistem', 'Rəngləri, şriftləri və komponentləri qaydalara çevirirəm ki, layihə mənsiz də inkişaf edə bilsin.'],
        ['Detal həll edir', 'Boşluq, imza, düymənin vəziyyəti: keyfiyyət hissi belə xırdalıqlardan yaranır.'],
        ['Nəticəyə qədər', 'İşi təqdimatdakı gözəl şəkilə yox, hazır fayllara, prototipə və ya sayta qədər çatdırıram.']
      ],
      skillsTitle: 'Bacarıqlar',
      skills: ['Vizual konsepsiya', 'Tipoqrafiya', 'Dizayn sistemləri', 'Prototipləmə', 'Adaptiv frontend', 'İnterfeys animasiyası', 'Art-direkşn', 'Çapa hazırlıq'],
      toolsTitle: 'Alətlər',
      directionsTitle: 'İstiqamətlər',
      cta: 'Birlikdə işləmək istəyirsiniz?'
    },

    services: {
      title: 'Xidmətlər',
      intro: 'Layihəni tam və ya ayrı-ayrı tapşırıqları götürürəm. Qiymət və müddəti tapşırıq barədə qısa söhbətdən sonra razılaşdırırıq.',
      deliverables: 'Nə alacaqsınız',
      ask: 'Müzakirə et',
      list: {
        graphic: { name: 'Qrafik dizayn', desc: 'Vahid sistemin hissəsi kimi görünən çap və rəqəmsal materiallar.', items: ['Posterlər və afişalar', 'Təqdimatlar', 'Sosial şəbəkə və karusellər', 'Poliqrafiya və qablaşdırma'] },
        web: { name: 'Veb dizayn', desc: 'Xarakteri olan, eyni zamanda oxumaq, gəzmək və alış-veriş etmək rahat olan saytlar.', items: ['Lendinqlər və çoxsəhifəli saytlar', 'Bütün ekranlar üçün adaptiv', 'Animasiya və mikro-qarşılıqlı əlaqə', 'Frontend və ya proqramçıya təhvil'] },
        uiux: { name: 'UI/UX dizayn', desc: 'İstifadəçinin yolu düymələrin rəngindən əvvəl düşünülmüş interfeyslər.', items: ['İstifadəçi ssenariləri', 'Prototiplər', 'Dizayn sistemi və UI kit', 'Bütün vəziyyətlərin maketləri'] },
        branding: { name: 'Brendinq və korporativ üslub', desc: 'Brendin vizual dili: loqodan onun istifadə qaydalarına qədər.', items: ['Loqo və nişan', 'Rəng və tipoqrafiya', 'Korporativ materiallar', 'Brendbuk'] },
        digital: { name: 'Rəqəmsal dizayn', desc: 'Ekranlar üçün qrafika: generativ vizuallar, bannerlər, üz qabıqları, təqdimat vizualları.', items: ['Generativ qrafika', 'Üz qabıqları və bannerlər', 'Sosial şəbəkə vizualları', 'Qısa motion fraqmentlər'] },
        '3d': { name: '3D vizuallaşdırma', desc: 'İnteryer və əşyaların vizuallaşdırılması: ideyanı tikilməzdən əvvəl görmək üçün.', items: ['İnteryer səhnələri', 'Əşya vizuallaşdırması', 'Material və işıq seçimi', 'Final renderlər'] }
      },
      processTitle: 'İş necə <em>gedir</em>',
      process: [
        ['Tanışlıq', 'Qısa zəng və ya yazışma: tapşırıq, müddət, gözləntilər.'],
        ['Konsepsiya', 'İstiqamət təklif edirəm: referanslar, ilk eskizlər, məntiq.'],
        ['Dizayn', 'Seçilmiş istiqaməti inkişaf etdirir, ara mərhələləri göstərirəm.'],
        ['Təhvil', 'Hazır fayllar, maketlər və ya sayt, üstəlik istifadə tövsiyələri.']
      ]
    },

    contact: {
      kicker: 'Əlaqə',
      title: 'Gəlin birlikdə<br><em>diqqətçəkən</em> bir şey edək',
      sub: 'Tapşırığı bir-iki cümlə ilə təsvir edin. İş günü ərzində cavab verirəm.',
      email: 'E-poçt',
      telegram: 'Telegram',
      copy: 'Kopyala',
      copied: 'Kopyalandı',
      copyFail: 'Kopyalamaq alınmadı — mətni əl ilə seçin',
      write: 'Məktub yaz',
      openTg: 'Telegram-ı aç',
      formTitle: 'Məktubu bir dəqiqəyə hazırlayın',
      formWhat: 'Nə lazımdır',
      formAbout: 'Layihə haqqında bir neçə söz',
      formPlaceholder: 'Məsələn: keramika studiyası üçün sayt lazımdır, loqo var, yazda başlamaq istəyirik',
      formName: 'Sizə necə müraciət edim',
      formSend: 'Məktubu aç',
      formNote: 'Düymə poçt proqramınızı hazır məktubla açacaq. Sizsiz heç nə göndərilmir.',
      formError: 'Layihə haqqında heç olmasa bir neçə söz yazın',
      formSubject: 'Layihə',
      formHello: 'Salam!',
      badge: 'Mənə yazın • Danışaq • '
    },

    footer: { top: 'Yuxarı', rights: 'Bütün hüquqlar qorunur', made: 'Dizayn və kod — saytın müəllifi' },
    notFound: { title: 'Belə səhifə yoxdur', text: 'Keçid köhnəlmiş ola bilər. İşlərdən və ya ana səhifədən başlayın.', home: 'Ana səhifə' },
    a11y: { prev: 'Geri', next: 'İrəli', filter: 'Kateqoriyaya görə filtr' }
  }
};
