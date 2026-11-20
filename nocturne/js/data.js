/* NOCTURNE — local catalogue data (replace with API later: same shape) */
N.data = (() => {
  const genres = [
    { id: 'jazz', name: 'Джаз', en: 'Jazz', blurb: 'Дым, контрабас и записи, сделанные за одну ночь.' },
    { id: 'post-punk', name: 'Постпанк', en: 'Post-Punk', blurb: 'Холодные гитары, бетон и честная тревога.' },
    { id: 'alt-rock', name: 'Альтернативный рок', en: 'Alt Rock', blurb: 'Гаражи, колледж-радио и шум как способ говорить.' },
    { id: 'electronic', name: 'Электроника', en: 'Electronic', blurb: 'Машины, которые научились дышать.' },
    { id: 'hip-hop', name: 'Хип-хоп', en: 'Hip-Hop', blurb: 'Сэмплы, бит и улица, записанная на плёнку.' },
    { id: 'experimental', name: 'Эксперимент', en: 'Experimental', blurb: 'Музыка, которая не просит разрешения.' },
    { id: 'classical', name: 'Классика', en: 'Classical', blurb: 'Ноктюрны, хоралы и тишина между ними.' }
  ];

  const artists = [
    ['ilse-marrow', 'Ilse Marrow Quartet', 'Копенгаген', 'jazz', 'Квартет пианистки Ильзе Марроу записывался ночами в подвальном клубе у гавани Нюхавн.'],
    ['velvet-hours', 'The Velvet Hours', 'Чикаго', 'jazz', 'Современный ансамбль, играющий «нуарный» джаз — медленно, тихо и очень близко к микрофону.'],
    ['okonkwo-trio', 'Okonkwo Trio', 'Лагос / Лондон', 'jazz', 'Трио, соединившее хайлайф, спиритуал-джаз и лондонскую эмиграцию семидесятых.'],
    ['concrete-saints', 'Concrete Saints', 'Манчестер', 'post-punk', 'Группа, звучавшая как пустой склад в три часа ночи. Распалась после второго альбома.'],
    ['glass-ward', 'Glass Ward', 'Берлин', 'post-punk', 'Берлинский дуэт: драм-машина, баритон-гитара и голос, будто из соседней комнаты.'],
    ['pale-ministry', 'Pale Ministry', 'Лидс', 'post-punk', 'Готический постпанк середины восьмидесятых, записанный в бывшей церкви.'],
    ['low-tide-choir', 'Low Tide Choir', 'Сиэтл', 'alt-rock', 'Тихие куплеты, оглушительные припевы. Любимцы колледж-радио девяностых.'],
    ['marlowe-static', 'Marlowe & The Static', 'Дублин', 'alt-rock', 'Шумовая поп-группа из Дублина, вернувшаяся спустя тридцать лет.'],
    ['oslo-drift', 'Oslo Drift', 'Осло', 'electronic', 'Минималистичное техно, сочинённое во время полярной ночи.'],
    ['kiri-nakamura', 'Kiri Nakamura', 'Токио', 'electronic', 'Продюсер, записывающий городской шум Токио и превращающий его в хрупкий эмбиент.'],
    ['signal-noise', 'Signal/Noise', 'Детройт', 'electronic', 'Анонимный проект из Детройта: белые этикетки, ручные номера, ни одного интервью.'],
    ['mc-varnish', 'MC Varnish', 'Бруклин', 'hip-hop', 'Андеграундный MC, чьи пластинки девяностых до сих пор ищут диггеры по всему миру.'],
    ['blackletter', 'Blackletter', 'Лондон', 'hip-hop', 'Лондонский дуэт: плотный текст, джазовые сэмплы и типографская эстетика.'],
    ['dusk-theory', 'Dusk Theory', 'Лос-Анджелес', 'hip-hop', 'Лоу-фай-хип-хоп с живыми клавишными и шумом кассетной деки.'],
    ['hollow-organ', 'Hollow Organ', 'Рейкьявик', 'experimental', 'Звуковые ландшафты, записанные в лавовых пещерах и пустых церквях.'],
    ['vera-kessler', 'Vera Kessler', 'Вена', 'experimental', 'Композитор, работающая с плёночными петлями и тишиной комнат.'],
    ['ensemble-nordlys', 'Ensemble Nordlys', 'Берген', 'classical', 'Камерный ансамбль старинной и современной хоровой музыки.'],
    ['anton-levko', 'Anton Levko', 'Санкт-Петербург', 'classical', 'Пианист, записывавший ноктюрны в пустом зале Капеллы белыми ночами.']
  ].map(([id, name, city, genre, bio]) => ({ id, name, city, genre, bio }));

  // cover palettes: [background, foreground, accent]
  const P = [
    ['#0e0e0e', '#ece6dc', '#8e1b27'], ['#8e1b27', '#ece6dc', '#0e0e0e'], ['#ece6dc', '#111111', '#8e1b27'],
    ['#1c2230', '#d9cfbf', '#c8553d'], ['#2b2b2b', '#e8e1d5', '#b08d57'], ['#d8c7a8', '#1a1a1a', '#5b1a1f'],
    ['#14261f', '#e3dccd', '#c9a24a'], ['#3a1d2b', '#f0e6da', '#e07a5f'], ['#101820', '#9fb3c8', '#ece6dc'],
    ['#5b1a1f', '#e9dcc8', '#d4a373'], ['#e4dfd6', '#2a2a2a', '#3c6e71'], ['#1a1a1a', '#c9c2b6', '#7a1420']
  ];

  const T = (id, title, artist, genre, year, label, format, media, sleeve, price, stock, added, pop, style, pal, cols, edition, desc) =>
    ({ id, title, artist, genre, year, label, format, media, sleeve, price, stock, added, pop, cover: { style, pal: P[pal] }, collections: cols, edition, desc });

  const products = [
    T('smoke-over-nyhavn', 'Smoke Over Nyhavn', 'ilse-marrow', 'jazz', 1962, 'Blue Fjord Records', 'LP', 'NM', 'VG+', 4900, 2, '2026-11-14', 88, 'orbit', 0, ['dark-jazz', 'staff-picks'], 'Оригинальный датский пресс', 'Шесть длинных пьес, записанных за одну ночь после закрытия клуба. Фортепиано звучит так, будто играет само для себя, а щётки по малому барабану напоминают дождь по стеклу. Пластинка в отличном состоянии — лёгкий фоновый шорох только на вводных канавках.'),
    T('after-the-last-tram', 'After the Last Tram', 'ilse-marrow', 'jazz', 1965, 'Blue Fjord Records', 'LP', 'VG+', 'VG+', 3600, 1, '2026-08-02', 61, 'split', 4, ['dark-jazz', 'forgotten-records'], 'Оригинальный пресс', 'Последний альбом квартета перед распадом. Более нервный и рваный, с длинным соло контрабаса на второй стороне. Конверт с аккуратной подписью прежнего владельца.'),
    T('nocturnes-for-a-closed-club', 'Nocturnes for a Closed Club', 'velvet-hours', 'jazz', 2019, 'Midnight Ledger', '2LP', 'M', 'M', 5200, 6, '2026-10-28', 92, 'type', 11, ['dark-jazz', 'staff-picks'], '180 г, разворотный конверт', 'Современная классика «тёмного» джаза: медленная труба, дисторшн-контрабас и вибрафон с длинным хвостом реверберации. Альбом, ради которого стоит выключить свет.'),
    T('blue-room-sessions', 'Blue Room Sessions', 'velvet-hours', 'jazz', 2023, 'Midnight Ledger', 'LP', 'M', 'M', 3900, 0, '2026-06-10', 74, 'grid', 3, ['dark-jazz'], 'Тираж 500 экз., синий винил', 'Живая сессия в студии с одним микрофоном. Лимитированный тираж на синем виниле разошёлся за неделю — оставьте заявку, мы ищем ещё копии.'),
    T('harmattan', 'Harmattan', 'okonkwo-trio', 'jazz', 1976, 'Ashanti Sound', 'LP', 'VG+', 'VG', 6800, 1, '2026-11-02', 70, 'sun', 9, ['forgotten-records'], 'Оригинальный нигерийский пресс', 'Редкий первый пресс: гипнотические ритмы хайлайфа, модальное фортепиано и саксофон, который как будто поёт. Конверт со следами времени, винил звучит удивительно чисто.'),
    T('lagos-in-rain', 'Lagos in Rain', 'okonkwo-trio', 'jazz', 1979, 'Ashanti Sound', 'LP', 'VG', 'VG', 4200, 2, '2026-07-15', 55, 'halftone', 6, ['forgotten-records', 'dark-jazz'], 'Британский пресс', 'Записан в Лондоне, но звучит как сезон дождей в Лагосе. Медленный, влажный, очень тёплый спиритуал-джаз.'),
    T('cold-architecture', 'Cold Architecture', 'concrete-saints', 'post-punk', 1981, 'Factory Line', 'LP', 'VG+', 'VG+', 5400, 2, '2026-09-21', 95, 'block', 2, ['post-punk-essentials', 'staff-picks'], 'Первый пресс, вкладыш с текстами', 'Дебют, который определил звучание целого города: сухие барабаны, бас ведёт мелодию, гитара режет пространство. Если бы бетон умел петь, он звучал бы так.'),
    T('signal-lost', 'Signal Lost', 'concrete-saints', 'post-punk', 1983, 'Factory Line', '12" EP', 'NM', 'VG+', 2900, 4, '2026-11-10', 68, 'stripes', 0, ['post-punk-essentials'], '45 об/мин', 'Макси-сингл с удлинённой версией заглавного трека и двумя би-сайдами, которых нет на альбомах.'),
    T('ward-seven', 'Ward Seven', 'glass-ward', 'post-punk', 2021, 'Kaltwelle', 'LP', 'M', 'M', 3400, 8, '2026-10-05', 81, 'grid', 8, ['post-punk-essentials'], 'Прозрачный винил', 'Драм-машина, баритон-гитара и голос, будто записанный в больничном коридоре. Новое поколение холодной волны.'),
    T('beton-und-licht', 'Beton und Licht', 'glass-ward', 'post-punk', 2024, 'Kaltwelle', 'LP', 'M', 'M', 3600, 5, '2026-11-17', 77, 'split', 10, ['post-punk-essentials'], '180 г, матовый конверт', 'Самый светлый альбом Glass Ward — в той мере, в какой постпанк вообще может быть светлым. Синтезаторы, хлопки и неожиданно танцевальный ритм.'),
    T('hymns-for-empty-halls', 'Hymns for Empty Halls', 'pale-ministry', 'post-punk', 1984, 'Grey Parish', 'LP', 'VG+', 'VG', 4700, 1, '2026-05-20', 64, 'type', 7, ['post-punk-essentials', 'forgotten-records'], 'Оригинальный пресс', 'Записан в бывшей церкви с естественной реверберацией. Гулкие барабаны, орган и вокал, похожий на проповедь для пустых скамей.'),
    T('the-tower-sleeps', 'The Tower Sleeps', 'pale-ministry', 'post-punk', 1986, 'Grey Parish', 'LP', 'NM', 'NM', 5100, 1, '2026-09-01', 59, 'moon', 1, ['post-punk-essentials'], 'Первый пресс', 'Последний и самый мрачный альбом группы. Экземпляр почти не играли — редкая удача для пластинки этого года.'),
    T('undertow', 'Undertow', 'low-tide-choir', 'alt-rock', 1994, 'Sub Harbor', 'LP', 'NM', 'VG+', 4400, 3, '2026-10-12', 86, 'wave', 3, ['underground-90s', 'staff-picks'], 'Оригинальный пресс США', 'Тихо-громко-тихо: альбом, на котором выросло колледж-радио. Песни о приливах, маяках и о том, как трудно уехать из маленького города.'),
    T('ferry-lights', 'Ferry Lights', 'low-tide-choir', 'alt-rock', 1997, 'Sub Harbor', '2LP', 'VG+', 'VG+', 5900, 1, '2026-11-06', 72, 'mesh', 5, ['underground-90s'], 'Двойной альбом, разворот', 'Разросшийся, амбициозный двойник со струнными и восьмиминутными кодами. Недооценённый в своё время — сегодня культовый.'),
    T('static-saints', 'Static Saints', 'marlowe-static', 'alt-rock', 1992, 'Liffey Noise', 'LP', 'VG+', 'VG', 3800, 2, '2026-04-11', 66, 'stripes', 7, ['underground-90s', 'forgotten-records'], 'Ирландский пресс', 'Стена фидбэка и под ней — очень нежные поп-мелодии. Конверт потёрт по краям, винил играет чисто.'),
    T('halfway-to-harbour', 'Halfway to Harbour', 'marlowe-static', 'alt-rock', 2022, 'Liffey Noise', 'LP', 'M', 'M', 3200, 7, '2026-10-30', 58, 'ribbon', 10, [], 'Бордовый винил', 'Возвращение спустя тридцать лет: тот же шум, но больше воздуха и меньше спешки.'),
    T('polar-night-tapes', 'Polar Night Tapes', 'oslo-drift', 'electronic', 2018, 'Nordlicht Audio', '2LP', 'M', 'M', 4600, 4, '2026-11-12', 90, 'moon', 8, ['electronic-minimalism', 'staff-picks'], '2×180 г, 45 об/мин', 'Восемь треков, сочинённых за шестьдесят дней без солнца. Глубокий бас, хрустящие хай-хэты и очень много пустого пространства.'),
    T('quiet-machines', 'Quiet Machines', 'oslo-drift', 'electronic', 2015, 'Nordlicht Audio', 'LP', 'NM', 'NM', 3900, 2, '2026-07-03', 73, 'mesh', 11, ['electronic-minimalism'], 'Первый пресс', 'Дебют Oslo Drift: техно, которое не требует танцевать, но и не мешает.'),
    T('tokyo-4am', 'Tokyo 4AM', 'kiri-nakamura', 'electronic', 2020, 'Shibuya Mono', 'LP', 'M', 'M', 4100, 3, '2026-11-18', 94, 'sun', 7, ['electronic-minimalism', 'staff-picks'], 'Японский пресс, оби', 'Шум последней электрички, гул торговых автоматов, дождь на неоне — и поверх всего хрупкие синтезаторные мелодии. Японское издание с оби.'),
    T('paper-lanterns', 'Paper Lanterns', 'kiri-nakamura', 'electronic', 2016, 'Shibuya Mono', '12" EP', 'NM', 'NM', 2400, 5, '2026-08-22', 62, 'halftone', 2, ['electronic-minimalism'], '45 об/мин', 'Четыре коротких пьесы для бумажных фонариков и драм-машины.'),
    T('motor-city-ghosts', 'Motor City Ghosts', 'signal-noise', 'electronic', 1995, 'Rust Belt Tone', '12" EP', 'VG+', 'VG', 3300, 2, '2026-09-14', 79, 'block', 0, ['underground-90s', 'electronic-minimalism'], 'White label, номер от руки', 'Белая этикетка, номер, проставленный маркером, и три трека чистого детройтского техно. Настоящий артефакт.'),
    T('transmission-zero', 'Transmission Zero', 'signal-noise', 'electronic', 1998, 'Rust Belt Tone', 'LP', 'VG+', 'VG+', 4500, 1, '2026-06-30', 69, 'typogrid', 4, ['underground-90s'], 'Оригинальный пресс', 'Единственный полноформатный альбом проекта. Холодный, механический и неожиданно меланхоличный.'),
    T('lacquer', 'Lacquer', 'mc-varnish', 'hip-hop', 1996, 'Borough Wax', 'LP', 'VG+', 'VG+', 5600, 1, '2026-10-20', 91, 'type', 1, ['underground-90s', 'staff-picks'], 'Оригинальный пресс', 'Пыльные джазовые сэмплы, тяжёлый бум-бэп и тексты, которые цитируют до сих пор. Одна из самых разыскиваемых пластинок андеграунда девяностых.'),
    T('brownstone-elegies', 'Brownstone Elegies', 'mc-varnish', 'hip-hop', 1999, 'Borough Wax', '2LP', 'NM', 'VG+', 6200, 1, '2026-11-15', 83, 'split', 5, ['underground-90s'], 'Двойной, с инструменталами', 'Второй альбом со всеми инструментальными версиями на второй пластинке — мечта диджея.'),
    T('serif', 'Serif', 'blackletter', 'hip-hop', 2021, 'Gothic Press Audio', 'LP', 'M', 'M', 3500, 6, '2026-11-08', 76, 'typogrid', 2, [], 'Тиснёный конверт', 'Альбом о шрифтах, печатных станках и словах, которые остаются. Конверт с тиснением — чистая типографика.'),
    T('ink-and-concrete', 'Ink & Concrete', 'blackletter', 'hip-hop', 2017, 'Gothic Press Audio', 'LP', 'NM', 'NM', 3300, 2, '2026-03-15', 60, 'ribbon', 11, [], 'Первый пресс', 'Дебют лондонского дуэта: грайм-энергия, джазовые аккорды и очень плотный текст.'),
    T('golden-hour-tapes', 'Golden Hour Tapes', 'dusk-theory', 'hip-hop', 2024, 'Westside Analog', 'LP', 'M', 'M', 3700, 9, '2026-11-19', 85, 'mesh', 9, [], 'Оранжевый винил', 'Лоу-фай-биты, записанные на закате: родес-пиано, шум плёнки и медленный свинг.'),
    T('smog-lullabies', 'Smog Lullabies', 'dusk-theory', 'hip-hop', 2019, 'Westside Analog', '7"', 'NM', 'NM', 1500, 10, '2026-09-08', 57, 'mesh', 3, [], '7" сингл', 'Две колыбельные для города, который никогда не спит. Короткий, но очень цельный сингл.'),
    T('basalt', 'Basalt', 'hollow-organ', 'experimental', 2014, 'Eldfjall', 'LP', 'NM', 'NM', 4300, 2, '2026-10-01', 63, 'moon', 6, ['forgotten-records'], 'Тираж 300 экз.', 'Запись, сделанная в лавовой пещере: орган, гул земли и капли воды. Слушать громко и в темноте.'),
    T('field-recordings-from-a-dead-radio', 'Field Recordings from a Dead Radio', 'hollow-organ', 'experimental', 2010, 'Eldfjall', 'LP', 'VG+', 'VG+', 3900, 1, '2026-05-02', 52, 'stripes', 8, ['forgotten-records', 'electronic-minimalism'], 'Самиздат', 'Коротковолновые эфиры, пойманные на сломанный приёмник и сложенные в сорокаминутную сюиту.'),
    T('tape-loops-for-insomniacs', 'Tape Loops for Insomniacs', 'vera-kessler', 'experimental', 2022, 'Wiener Rauschen', 'LP', 'M', 'M', 3800, 4, '2026-11-04', 80, 'wave', 0, ['electronic-minimalism', 'staff-picks'], '180 г', 'Плёночные петли, которые медленно разрушаются с каждым повтором. Самая красивая пластинка о бессоннице, что мы слышали.'),
    T('room-tone', 'Room Tone', 'vera-kessler', 'experimental', 2017, 'Wiener Rauschen', '12" EP', 'NM', 'NM', 2600, 3, '2026-08-12', 54, 'halftone', 4, [], '45 об/мин', 'Звук пустых венских комнат, усиленный в сто раз. Минимализм на грани тишины.'),
    T('aurora-cycles', 'Aurora Cycles', 'ensemble-nordlys', 'classical', 2020, 'Fjordhus Klassik', '2LP', 'M', 'M', 5800, 3, '2026-10-24', 67, 'ribbon', 8, [], 'Разворотный конверт, буклет', 'Хоровой цикл о северном сиянии для двенадцати голосов и струнного квартета.'),
    T('winter-chorales', 'Winter Chorales', 'ensemble-nordlys', 'classical', 1988, 'Fjordhus Klassik', 'LP', 'VG+', 'VG+', 3100, 1, '2026-02-10', 48, 'moon', 10, ['forgotten-records'], 'Оригинальный пресс', 'Старинные норвежские хоралы в записи из деревянной церкви. Тёплый аналоговый звук восьмидесятых.'),
    T('white-nights-nocturnes', 'White Nights Nocturnes', 'anton-levko', 'classical', 1974, 'Neva Records', 'LP', 'VG+', 'VG', 4800, 1, '2026-11-11', 71, 'type', 5, ['forgotten-records', 'staff-picks'], 'Оригинальный пресс', 'Ноктюрны, записанные в пустом зале белой ночью. Медленно, сдержанно, с огромным количеством воздуха. Тот самый альбом, в честь которого назван наш магазин.'),
    T('preludes-in-grey', 'Preludes in Grey', 'anton-levko', 'classical', 1978, 'Neva Records', 'LP', 'NM', 'VG+', 4400, 2, '2026-09-28', 65, 'split', 11, [], 'Оригинальный пресс', 'Двадцать четыре прелюдии — двадцать четыре оттенка серого неба над Невой.')
  ];

  const collections = [
    { id: 'dark-jazz', no: '01', name: 'Dark Jazz', tagline: 'Джаз для пустых улиц после полуночи', curator: 'Мира, закупки', color: '#1c2230', accent: '#8e1b27',
      text: 'Медленные темпы, приглушённая труба и записи, сделанные будто бы в последний час перед закрытием клуба. Подборка для тех, кто слушает джаз не фоном, а в темноте и полной тишине.' },
    { id: 'underground-90s', no: '02', name: 'Underground 90s', tagline: 'Белые этикетки, кассетный шум и колледж-радио', curator: 'Даня, хип-хоп и техно', color: '#3a1d2b', accent: '#c9a24a',
      text: 'Десятилетие, когда музыка делалась в подвалах и распространялась из рук в руки. Андеграундный хип-хоп, детройтское техно и альтернатива, которую крутили только студенческие станции.' },
    { id: 'post-punk-essentials', no: '03', name: 'Post-Punk Essentials', tagline: 'Холодная волна от Манчестера до Берлина', curator: 'Лёва, основатель', color: '#161616', accent: '#ece6dc',
      text: 'Основа нашей полки и нашего вкуса. От первых прессов начала восьмидесятых до новых групп, которые подхватили эту холодную, нервную и бесконечно честную музыку.' },
    { id: 'forgotten-records', no: '04', name: 'Forgotten Records', tagline: 'Пластинки, которые история пропустила', curator: 'Мира и Лёва', color: '#2b2418', accent: '#d4a373',
      text: 'Тиражи по триста копий, распавшиеся группы, лейблы, о которых нет статей. Мы находим их на барахолках, в архивах и личных коллекциях — и даём им вторую жизнь.' },
    { id: 'electronic-minimalism', no: '05', name: 'Electronic Minimalism', tagline: 'Меньше нот — больше пространства', curator: 'Даня, хип-хоп и техно', color: '#101820', accent: '#9fb3c8',
      text: 'Электроника, в которой важна каждая пауза. Полярное техно, токийский эмбиент и плёночные петли, медленно растворяющиеся в шуме.' },
    { id: 'staff-picks', no: '06', name: 'Staff Picks', tagline: 'То, что мы слушаем в магазине после закрытия', curator: 'Вся команда NOCTURNE', color: '#5b1a1f', accent: '#ece6dc',
      text: 'Личные фавориты команды. Пластинки, которые мы ставим, когда гаснет свет в зале и остаёмся только мы и проигрыватель.' }
  ];

  const conditions = {
    M: { name: 'Mint', short: 'M', text: 'Новая, запечатанная или ни разу не проигранная.' },
    NM: { name: 'Near Mint', short: 'NM', text: 'Почти идеальна: без видимых следов использования.' },
    'VG+': { name: 'Very Good Plus', short: 'VG+', text: 'Лёгкие следы, не влияющие на звук.' },
    VG: { name: 'Very Good', short: 'VG', text: 'Заметные следы, лёгкий шорох в тихих местах.' }
  };
  const conditionOrder = ['M', 'NM', 'VG+', 'VG'];
  const formats = ['LP', '2LP', '12" EP', '7"'];

  // deterministic tracklists
  const words = ['Night', 'Glass', 'Harbour', 'Static', 'Velvet', 'Ash', 'Neon', 'Ghost', 'Winter', 'Signal', 'Paper', 'Smoke', 'Concrete', 'Low', 'Light', 'Rain', 'Echo', 'Dust', 'Hollow', 'Silver', 'Blue', 'Last', 'Empty', 'Slow', 'Distant', 'Frozen', 'Tape', 'Room', 'Tower', 'Moth', 'Ferry', 'Lantern'];
  const nouns = ['Hours', 'Waltz', 'Theme', 'Lines', 'Song', 'Station', 'Prayer', 'Window', 'Bridge', 'Choir', 'Loop', 'Machine', 'Shore', 'Street', 'Mirror', 'Elegy', 'Pulse', 'Garden', 'Coda', 'Nocturne'];
  const tracklist = p => {
    const r = N.utils.rng(p.id);
    const count = p.format === '7"' ? 2 : p.format === '12" EP' ? 4 : p.format === '2LP' ? 12 : 8;
    const list = [];
    for (let i = 0; i < count; i++) {
      const name = i === 0 ? p.title : `${words[Math.floor(r() * words.length)]} ${nouns[Math.floor(r() * nouns.length)]}`;
      const sec = 150 + Math.floor(r() * (p.genre === 'experimental' || p.genre === 'classical' ? 480 : 260));
      const sides = count <= 2 ? ['A', 'B'] : count <= 8 ? ['A', 'B'] : ['A', 'B', 'C', 'D'];
      const side = sides[Math.floor(i / Math.ceil(count / sides.length))];
      list.push({ side, no: i + 1, name, time: `${Math.floor(sec / 60)}:${N.utils.pad(sec % 60)}` });
    }
    return list;
  };

  const catNo = p => `${p.label.split(' ').map(w => w[0]).join('').toUpperCase()}-${(N.utils.hash(p.id) % 9000) + 1000}`;

  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const artistById = Object.fromEntries(artists.map(a => [a.id, a]));
  const genreById = Object.fromEntries(genres.map(g => [g.id, g]));
  const collectionById = Object.fromEntries(collections.map(c => [c.id, c]));

  // derived helpers
  products.forEach(p => { p.artistName = artistById[p.artist].name; p.genreName = genreById[p.genre].name; });

  const editorial = {
    kicker: 'Редакционная подборка · №47',
    title: 'Пять пластинок для города, который не спит',
    author: 'Лёва Ордин',
    lead: 'Есть музыка для утра и для дороги. А есть та, что появляется только после двух ночи, когда улицы пустеют, а фонари становятся главными героями. Мы собрали пять записей, которые лучше всего звучат именно тогда.',
    quote: 'Ночь — единственное время, когда пластинку слушают целиком, не перескакивая.',
    picks: [
      ['tokyo-4am', 'Шум последней электрички как метроном.'],
      ['nocturnes-for-a-closed-club', 'Труба, которая говорит шёпотом.'],
      ['cold-architecture', 'Для прогулки вдоль промзоны.'],
      ['tape-loops-for-insomniacs', 'Когда уснуть уже не получится.'],
      ['white-nights-nocturnes', 'Финал: светает, но ещё рано.']
    ]
  };

  return { genres, artists, products, collections, conditions, conditionOrder, formats, tracklist, catNo, byId, artistById, genreById, collectionById, editorial };
})();
