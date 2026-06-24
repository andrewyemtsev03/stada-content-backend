/*
 * Main interactivity script for the STADA “О компании” page.
 *
 * Handles language switching (Russian ↔ Kazakh), mobile menu
 * toggling, hero carousel initialisation and scroll animations.
 */

function hideStadaPageLoader() {
  document.body.classList.add('stada-page-loaded');
}

if (document.readyState === 'complete') {
  hideStadaPageLoader();
} else {
  window.addEventListener('load', hideStadaPageLoader, { once: true });
}

// Translation dictionary. Each key maps to a Russian and Kazakh version.
const translations = {
  ru: {
    nav_about: 'О компании',
    nav_history: 'История компании',
    nav_news: 'Новости и Медия',
    nav_products: 'Продукты',
    nav_career: 'Карьера',
    hero_kicker: 'STADA Kazakhstan',
    site_name: 'STADA Kazakhstan',
    hero_title1: 'Забота о здоровье',
    hero_sub1: 'Качественные препараты, которым доверяют каждый день.',
    hero_title2: 'Качество без компромиссов',
    hero_sub2: 'Опыт STADA помогает поддерживать здоровье миллионов людей.',
    hero_title3: 'Ближе к пациентам',
    hero_sub3: 'Развиваем доступные решения для семей в Казахстане.',
    hero_metric_years: 'лет опыта',
    hero_metric_countries: 'стран присутствия',
    hero_metric_employees: 'сотрудников по всему миру',
    hero_media_caption: 'Фармацевтическое качество, которому доверяют каждый день',
    hero_caption_office: 'STADA в Казахстане: ближе к пациентам и партнерам',
        hero_caption_scientists: 'Качество и безопасность на каждом этапе производства',
        hero_caption_awards: 'ESG-награды и признание устойчивого развития STADA',
    hero_caption_logo: '130 лет опыта STADA в заботе о здоровье людей',
    about_heading: 'О компании STADA',
    about_par1: 'STADA — ведущий производитель высококачественных фармацевтических препаратов. С более чем 130‑летней историей, уходящей корнями в аптечную практику, мы являемся надежным и заслуживающим доверия партнером.',
    about_par2: 'Компания сосредоточена на трех направлениях: потребительские здравоохранительные продукты, дженерики и специальные препараты. Сегодня STADA присутствует более чем в 100 странах мира и обеспечивает более 11 600 рабочих мест.',
    about_list1: 'Доступность: наши дженерики помогают сделать здравоохранение доступным для всех.',
    about_list2: 'Инновации: мы инвестируем в исследования и разработки для улучшения качества жизни.',
    about_list3: 'Надежность: мы стремимся быть вашим партнером, которому вы можете доверять.',
    stats_sales: '4 059 млн € — объём продаж группы в 2024 году',
    stats_employees: '> 11 600 сотрудников по всему миру',
    stats_countries: '> 100 стран присутствия',
        hero_text1: 'CapVest приобретает контрольный пакет акций STADA у Brain Capital и Cinven',
        hero_text2: 'Путь роста STADA продолжается в 2024 году — значительное увеличение продаж и прибыли — рост опережает рынок.',
        hero_text3: 'В Казахстане велико доверие к врачам, но профилактика остается слабым местом',
        news_section_lead: 'Главные новости, медиа и продуктовые обновления STADA в одном динамичном блоке.',
        news_1_text: 'Сделка открывает новый этап развития группы и усиливает долгосрочную стратегию STADA на международных рынках.',
        news_2_text: 'Компания продолжает показывать устойчивый рост продаж и прибыли, опережая динамику фармацевтического рынка.',
        news_3_text: 'Исследования подчеркивают важность профилактики, доступной информации и доверительного диалога с медицинскими специалистами.',
        news_4_title: 'STADA признана Top Employer Europe 2025',
        news_4_text: 'Признание отражает культуру роста, заботы о сотрудниках и возможности развития для команд STADA.',
        news_5_title: 'Портфель STADA объединяет сильные потребительские бренды и дженерики',
        news_5_text: 'Продуктовая линейка помогает поддерживать здоровье пациентов в разных терапевтических направлениях.',
        news_6_title: 'Enterogermina поддерживает здоровье микрофлоры',
        news_6_text: 'Пробиотическое направление остается важной частью решений STADA для повседневного здоровья.',
        news_7_title: 'Coldrex остается узнаваемым брендом в сезон простуды',
        news_7_text: 'Средства для облегчения симптомов простуды помогают пациентам сохранять привычный ритм жизни.',
        news_8_title: 'Vitrum Immunaktiv в фокусе ежедневной поддержки',
        news_8_text: 'Витаминно-минеральные комплексы дополняют портфель продуктов для заботы о самочувствии.',
        cta_more: 'Подробнее',
    // Gallery
    gallery_heading: 'Галерея',
    // Products section
    products_heading: 'Наши продукты',
    product_enterogermina_name: 'Энтерожермина',
    product_enterogermina_capsules_name: 'Энтерожермина капсулы',
    product_enterogermina_forte_name: 'Энтерожермина Форте',
    product_magneb6kids_name: 'Магне B6 Кидс',
    product_sinulan_duo_name: 'Синулан Дуо',
    product_snup_name: 'Снуп',
    product_edarbi_klo_name: 'Эдарби Кло',
    product_cardiomagnil_name: 'Кардиомагнил',
    product_noshpa_name: 'НО-ШПА',
    product_essentiale_name: 'Эссенциале',
    product_aqualor_name: 'Аквалор',
    product_aqualor_forte_name: 'Аквалор Актив Форте',
    product_aqualor_baby_name: 'Аквалор Беби',
    product_aqualor_gorlo_name: 'Аквалор Горло',
    product_aqualor_soft_name: 'Аквалор Софт',
    product_aqualor_soft_mini_name: 'Аквалор Софт мини',
    product_coldrex_name: 'Колдрекс',
    // Product page titles and descriptions
    product_enterogermina_page_title: 'Энтерожермина',
    product_enterogermina_page_desc: 'Энтерожермина — пробиотик для лечения и профилактики дисбактериоза. Содержит споры Bacillus clausii, которые помогают восстановить кишечную микрофлору.',
    product_enterogermina_capsules_page_title: 'Энтерожермина капсулы',
    product_enterogermina_capsules_page_desc: 'Энтерожермина капсулы — пробиотик со спорами Bacillus clausii для лечения и профилактики дисбактериоза. Формат капсул удобен для взрослых и детей старше 6 лет согласно инструкции.',
    product_enterogermina_forte_page_title: 'Энтерожермина Форте',
    product_enterogermina_forte_page_desc: 'Энтерожермина Форте — пробиотик со спорами Bacillus clausii для лечения и профилактики дисбактериоза. Формат суспензии рассчитан на удобный прием 1 раз в день согласно инструкции.',
    product_magneb6kids_page_title: 'Магне B6 Кидс',
    product_magneb6kids_page_desc: 'Магне B6 Кидс — жевательные таблетки с магнием и витамином B6 для детей с 4 лет. Компоненты помогают поддерживать нормальную работу нервной системы и энергетический обмен.',
    product_sinulan_duo_page_title: 'Синулан Дуо',
    product_sinulan_duo_page_desc: 'Синулан Дуо — комплекс растительных экстрактов для облегчения дыхания при простуде и поддержания здоровья дыхательных путей.',
    product_snup_page_title: 'Снуп',
    product_snup_page_desc: 'Снуп — дозированный назальный спрей с ксилометазолином и морской водой для облегчения носового дыхания при заложенности носа.',
    product_edarbi_klo_page_title: 'Эдарби Кло',
    product_edarbi_klo_page_desc: 'Эдарби Кло — комбинированный препарат на основе азилсартана медоксомила и хлорталидона для снижения артериального давления.',
    product_cardiomagnil_page_title: 'Кардиомагнил',
    product_cardiomagnil_page_desc: 'Кардиомагнил 150 мг — препарат ацетилсалициловой кислоты с магния гидроксидом для профилактики инфаркта и тромбоза по назначению врача.',
    product_noshpa_page_title: 'НО-ШПА',
    product_noshpa_page_desc: 'НО-ШПА 40 мг — таблетки с дротаверина гидрохлоридом для облегчения спазмов гладкой мускулатуры согласно инструкции.',
    product_noshpa_forte_name: 'НО-ШПА Форте',
    product_noshpa_forte_kicker: 'Спазмолитик 80 мг',
    product_noshpa_forte_page_title: 'НО-ШПА Форте',
    product_noshpa_forte_page_desc: 'НО-ШПА Форте 80 мг — таблетки с дротаверина гидрохлоридом для облегчения спазмов гладкой мускулатуры согласно инструкции.',
    product_noshpa_forte_badge_drotaverine: 'Дротаверин 80 мг',
    product_noshpa_forte_badge_spasm: 'Форте формат',
    product_noshpa_forte_badge_pack: '24 таблетки',
    product_noshpa_forte_metric_dose: 'мг дротаверина',
    product_noshpa_forte_metric_pack: 'таблетки в упаковке',
    product_noshpa_forte_metric_component: 'активный компонент',
    product_noshpa_forte_overview_label: 'При спазмах',
    product_noshpa_forte_overview_heading: 'Усиленная дозировка НО-ШПА в формате Форте',
    product_noshpa_forte_overview_intro: 'Одна таблетка содержит 80 мг дротаверина гидрохлорида. Применение должно соответствовать инструкции, дозировке и рекомендациям специалиста.',
    product_noshpa_forte_card_drotaverine_title: 'Дротаверин',
    product_noshpa_forte_card_drotaverine_text: 'Активное вещество препарата, относящееся к миотропным спазмолитикам.',
    product_noshpa_forte_card_dose_title: '80 мг',
    product_noshpa_forte_card_dose_text: 'Дозировка дротаверина гидрохлорида в одной таблетке НО-ШПА Форте.',
    product_noshpa_forte_card_pack_title: '24 таблетки',
    product_noshpa_forte_card_pack_text: 'Упаковка на 24 таблетки для приема по схеме, указанной в инструкции.',
    product_noshpa_forte_card_age_title: 'С 12 лет',
    product_noshpa_forte_card_age_text: 'Возрастные ограничения и режим приема необходимо сверять с инструкцией.',
    product_noshpa_forte_benefit1: 'Содержит дротаверина гидрохлорид 80 мг в каждой таблетке',
    product_noshpa_forte_benefit2: 'Формат Форте рассчитан на прием согласно инструкции',
    product_noshpa_forte_benefit3: 'Применяется при спазмах гладкой мускулатуры в показаниях, перечисленных в инструкции',
    product_noshpa_forte_benefit4: 'Упаковка 24 таблетки подходит для рекомендованной схемы приема',
    product_noshpa_forte_benefit5: 'Перед применением важно учитывать противопоказания и ограничения',
    product_noshpa_forte_formula_label: 'Формула',
    product_noshpa_forte_formula_heading: 'В центре — дротаверин 80 мг, показания и формат Форте',
    product_noshpa_forte_formula_intro: 'Линии от упаковки уходят вниз к карточкам: дозировка, спазмолитическое направление и упаковка на 24 таблетки.',
    product_noshpa_forte_formula_drotaverine_title: 'Дротаверин',
    product_noshpa_forte_formula_drotaverine_text: 'Дротаверина гидрохлорид 80 мг является активным веществом препарата.',
    product_noshpa_forte_formula_spasm_title: 'Спазмолитическое направление',
    product_noshpa_forte_formula_spasm_text: 'Применяется при спазмах гладкой мускулатуры согласно инструкции.',
    product_noshpa_forte_formula_pack_title: '24 таблетки',
    product_noshpa_forte_formula_pack_text: 'Формат упаковки поддерживает прием по рекомендованной схеме.',
    product_noshpa_forte_usage_label: 'Когда применяют',
    product_noshpa_forte_usage_heading: 'При спазмах гладкой мускулатуры по инструкции',
    product_noshpa_forte_usage_biliary_title: 'Желчевыводящие пути',
    product_noshpa_forte_usage_biliary_text: 'В инструкции указаны спазмы гладкой мускулатуры при заболеваниях желчевыводящих путей.',
    product_noshpa_forte_usage_gi_title: 'Желудочно-кишечный тракт',
    product_noshpa_forte_usage_gi_text: 'Может применяться как вспомогательная терапия при спазмах гладкой мускулатуры ЖКТ.',
    product_noshpa_forte_usage_doctor_title: 'Ответственный прием',
    product_noshpa_forte_usage_doctor_text: 'Дозировку, длительность и совместимость с другими препаратами следует сверять с инструкцией и специалистом.',
    product_noshpa_forte_note_title: 'Важно',
    product_noshpa_forte_note_text: 'НО-ШПА Форте применяют согласно инструкции. Перед приемом ознакомьтесь с противопоказаниями, дозировкой и обратитесь к врачу при сомнениях.',
    product_noshpa_forte_buy_intro: 'НО-ШПА Форте 80 мг №24 можно найти у аптечных партнеров STADA в Казахстане.',
    product_essentiale_page_title: 'Эссенциале Форте Н',
    product_essentiale_page_desc: 'Эссенциале Форте Н — капсулы с эссенциальными фосфолипидами для поддержки функций печени согласно инструкции и рекомендациям специалиста.',
    product_aqualor_page_title: 'Аквалор Экстра Форте',
    product_aqualor_page_desc: 'Аквалор Экстра Форте — стерильный раствор морской воды 125 мл для ухода за полостью носа при сильном насморке согласно инструкции.',
    product_aqualor_forte_page_title: 'Аквалор Актив Форте',
    product_aqualor_forte_page_desc: 'Аквалор Актив Форте — спрей морской воды 150 мл с CO2 для ухода и промывания полости носа согласно инструкции.',
    product_aqualor_baby_page_title: 'Аквалор Беби',
    product_aqualor_baby_page_desc: 'Аквалор Беби — капли морской воды 15 мл для ежедневного ухода за носом малыша согласно инструкции.',
    product_aqualor_gorlo_page_title: 'Аквалор Горло спрей',
    product_aqualor_gorlo_page_desc: 'Аквалор Горло спрей — стерильный гипертонический раствор морской воды 50 мл для орошения и промывания горла согласно инструкции.',
    product_aqualor_soft_page_title: 'Аквалор Софт',
    product_aqualor_soft_page_desc: 'Аквалор Софт — стерильный изотонический раствор морской воды 125 мл в формате душ для орошения и промывания полости носа согласно инструкции.',
    product_aqualor_soft_mini_page_title: 'Аквалор Софт мини',
    product_aqualor_soft_mini_page_desc: 'Аквалор Софт мини — стерильный изотонический раствор морской воды 50 мл в формате душ для орошения и промывания полости носа согласно инструкции.',
    product_related_label: 'Похожие товары',
    product_related_heading: 'Другие варианты Аквалор',
    product_related_intro: 'Подберите похожий формат линейки Аквалор по объему, способу распыления и зоне применения.',
        product_back: 'Назад к продуктам',
    // Enterogermina benefits
    product_enterogermina_benefit1: 'Восстанавливает здоровую микрофлору кишечника',
    product_enterogermina_benefit2: 'Содержит споры Bacillus clausii, устойчивые к влиянию антибиотиков',
    product_enterogermina_benefit3: 'Удобная жидкая форма — подходит детям и взрослым',
    product_enterogermina_benefit4: 'Подходит для лечения и профилактики дисбактериоза',
    product_enterogermina_kicker: 'Пробиотик для микрофлоры',
    product_enterogermina_badge_spores: 'Споры Bacillus clausii',
    product_enterogermina_badge_pack: '10 флаконов',
    product_enterogermina_badge_liquid: 'Жидкая форма',
    product_enterogermina_metric_spores: 'споры Bacillus clausii',
    product_enterogermina_metric_pack: 'флаконов в упаковке',
    product_enterogermina_metric_format: 'готовая жидкая форма',
    product_enterogermina_overview_label: 'Поддержка микрофлоры',
    product_enterogermina_overview_heading: 'Формат для восстановления баланса кишечной микрофлоры',
    product_enterogermina_overview_intro: 'Энтерожермина помогает восполнить полезные бактерии при нарушении баланса кишечной микрофлоры и после воздействия неблагоприятных факторов.',
    product_enterogermina_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_card_bacillus_text: 'Пробиотические споры помогают поддерживать нормальный состав кишечной микрофлоры.',
    product_enterogermina_card_spores_title: 'Споровая форма',
    product_enterogermina_card_spores_text: 'Споры устойчивы к кислой среде и помогают доставить Bacillus clausii в кишечник.',
    product_enterogermina_card_pack_title: '10 флаконов',
    product_enterogermina_card_pack_text: 'Упаковка рассчитана на удобный курсовой прием согласно инструкции.',
    product_enterogermina_card_format_title: '5 мл',
    product_enterogermina_card_format_text: 'Флакон легко открыть и принять без дополнительных приготовлений.',
    product_enterogermina_formula_label: 'Формула',
    product_enterogermina_formula_heading: 'В центре — Bacillus clausii и удобная жидкая форма',
    product_enterogermina_formula_intro: 'Компоненты собраны вокруг упаковки, чтобы сразу показать состав, устойчивость спор и удобство приема.',
    product_enterogermina_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_formula_bacillus_text: 'Пробиотические споры помогают поддерживать нормальную кишечную микрофлору.',
    product_enterogermina_formula_spores_title: 'Споровая форма',
    product_enterogermina_formula_spores_text: 'Форма спор помогает бактериям сохранять стабильность до попадания в кишечник.',
    product_enterogermina_formula_pack_title: 'Готовая суспензия',
    product_enterogermina_formula_pack_text: 'Жидкая форма во флаконе: удобно принимать без предварительного приготовления.',
    product_enterogermina_usage_label: 'Когда актуально',
    product_enterogermina_usage_heading: 'Для поддержки кишечной микрофлоры в повседневной заботе',
    product_enterogermina_usage_microflora_title: 'При нарушении баланса',
    product_enterogermina_usage_microflora_text: 'Подходит для восстановления микрофлоры при дисбактериозе согласно инструкции.',
    product_enterogermina_usage_antibiotic_title: 'После антибиотиков',
    product_enterogermina_usage_antibiotic_text: 'Может применяться для поддержки микрофлоры во время или после антибактериальной терапии согласно инструкции.',
    product_enterogermina_usage_family_title: 'Для семьи',
    product_enterogermina_usage_family_text: 'Жидкий формат подходит детям и взрослым при соблюдении рекомендаций по применению.',
    product_enterogermina_note_title: 'Важно помнить',
    product_enterogermina_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом, особенно для детей.',
    product_enterogermina_buy_intro: 'Ищите Энтерожермину у аптечных партнеров STADA в Казахстане.',
    // Enterogermina capsules benefits
    product_enterogermina_capsules_benefit1: 'Помогает восстановить баланс кишечной микрофлоры при дисбактериозе',
    product_enterogermina_capsules_benefit2: 'Содержит споры Bacillus clausii, устойчивые к неблагоприятным факторам среды',
    product_enterogermina_capsules_benefit3: 'Капсульный формат удобно взять с собой и встроить в ежедневный прием',
    product_enterogermina_capsules_benefit4: 'Подходит взрослым и детям старше 6 лет при соблюдении инструкции',
    product_enterogermina_capsules_kicker: 'Пробиотик в капсулах',
    product_enterogermina_capsules_badge_spores: 'Споры Bacillus clausii',
    product_enterogermina_capsules_badge_pack: '12 капсул',
    product_enterogermina_capsules_badge_capsules: 'Капсульная форма',
    product_enterogermina_capsules_metric_spores: 'споры Bacillus clausii',
    product_enterogermina_capsules_metric_pack: 'капсул в упаковке',
    product_enterogermina_capsules_metric_age: 'для детей старше 6 лет',
    product_enterogermina_capsules_overview_label: 'Баланс микрофлоры',
    product_enterogermina_capsules_overview_heading: 'Знакомая пробиотическая поддержка в компактном формате',
    product_enterogermina_capsules_overview_intro: 'Капсулы Энтерожермина сохраняют фокус на Bacillus clausii и подходят для ситуаций, когда нужен аккуратный формат без жидкой формы.',
    product_enterogermina_capsules_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_capsules_card_bacillus_text: 'Пробиотические споры помогают поддерживать нормальный состав кишечной микрофлоры.',
    product_enterogermina_capsules_card_spores_title: 'Споровая форма',
    product_enterogermina_capsules_card_spores_text: 'Споры устойчивы к воздействию кислой среды и помогают доставить Bacillus clausii в кишечник.',
    product_enterogermina_capsules_card_pack_title: '12 капсул',
    product_enterogermina_capsules_card_pack_text: 'Упаковка рассчитана на удобный прием согласно режиму, указанному в инструкции.',
    product_enterogermina_capsules_card_age_title: 'Старше 6 лет',
    product_enterogermina_capsules_card_age_text: 'Капсулы предназначены для взрослых и детей старше 6 лет, которые могут проглотить капсулу.',
    product_enterogermina_capsules_formula_label: 'Формула',
    product_enterogermina_capsules_formula_heading: 'В центре — Bacillus clausii и капсульный формат',
    product_enterogermina_capsules_formula_intro: 'Карточки показывают три ключевых акцента продукта: пробиотические споры, устойчивую форму и упаковку на 12 капсул.',
    product_enterogermina_capsules_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_capsules_formula_bacillus_text: 'Помогает восполнить полезные бактерии при нарушении баланса микрофлоры.',
    product_enterogermina_capsules_formula_spores_title: 'Споры',
    product_enterogermina_capsules_formula_spores_text: 'Споровая форма помогает бактериям сохранять стабильность до попадания в кишечник.',
    product_enterogermina_capsules_formula_pack_title: '12 капсул',
    product_enterogermina_capsules_formula_pack_text: 'Компактная упаковка подходит для курсового приема согласно инструкции.',
    product_enterogermina_capsules_usage_label: 'Когда актуально',
    product_enterogermina_capsules_usage_heading: 'Для поддержки микрофлоры в удобном взрослом формате',
    product_enterogermina_capsules_usage_microflora_title: 'При дисбактериозе',
    product_enterogermina_capsules_usage_microflora_text: 'Может применяться для лечения и профилактики дисбактериоза согласно инструкции.',
    product_enterogermina_capsules_usage_antibiotic_title: 'После антибиотиков',
    product_enterogermina_capsules_usage_antibiotic_text: 'Уместна для поддержки микрофлоры во время или после антибактериальной терапии по рекомендации специалиста.',
    product_enterogermina_capsules_usage_format_title: 'Когда важен формат',
    product_enterogermina_capsules_usage_format_text: 'Капсулы удобно хранить, брать с собой и принимать без дополнительной подготовки.',
    product_enterogermina_capsules_note_title: 'Важно помнить',
    product_enterogermina_capsules_note_text: 'Перед применением ознакомьтесь с инструкцией. Капсулы не рекомендуются детям до 6 лет, если ребенок не может проглотить капсулу.',
    product_enterogermina_capsules_buy_intro: 'Ищите Энтерожермину капсулы у аптечных партнеров STADA в Казахстане.',
    // Enterogermina Forte benefits
    product_enterogermina_forte_benefit1: 'Помогает восстановить баланс кишечной микрофлоры при дисбактериозе',
    product_enterogermina_forte_benefit2: 'Содержит споры Bacillus clausii, устойчивые к неблагоприятным факторам среды',
    product_enterogermina_forte_benefit3: 'Удобный режим приема — 1 раз в день согласно инструкции',
    product_enterogermina_forte_benefit4: 'Формат суспензии во флаконах подходит для курсового применения',
    product_enterogermina_forte_kicker: 'Пробиотик в усиленном формате',
    product_enterogermina_forte_badge_spores: 'Споры Bacillus clausii',
    product_enterogermina_forte_badge_daily: '1 раз в день',
    product_enterogermina_forte_badge_pack: '10 флаконов',
    product_enterogermina_forte_metric_spores: 'споры Bacillus clausii',
    product_enterogermina_forte_metric_daily: 'раз в день',
    product_enterogermina_forte_metric_pack: 'флаконов в упаковке',
    product_enterogermina_forte_overview_label: 'Поддержка микрофлоры',
    product_enterogermina_forte_overview_heading: 'Знакомая пробиотическая поддержка в формате Форте',
    product_enterogermina_forte_overview_intro: 'Энтерожермина Форте сохраняет акцент на Bacillus clausii и выделяет удобный режим применения для восстановления баланса кишечной микрофлоры.',
    product_enterogermina_forte_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_forte_card_bacillus_text: 'Пробиотические споры помогают поддерживать нормальный состав кишечной микрофлоры.',
    product_enterogermina_forte_card_spores_title: 'Споровая форма',
    product_enterogermina_forte_card_spores_text: 'Споры устойчивы к воздействию кислой среды и помогают доставить Bacillus clausii в кишечник.',
    product_enterogermina_forte_card_daily_title: '1 раз в день',
    product_enterogermina_forte_card_daily_text: 'Режим приема помогает встроить продукт в повседневный график согласно инструкции.',
    product_enterogermina_forte_card_pack_title: '10 флаконов',
    product_enterogermina_forte_card_pack_text: 'Упаковка с флаконами суспензии подходит для аккуратного курсового приема.',
    product_enterogermina_forte_formula_label: 'Формула',
    product_enterogermina_forte_formula_heading: 'В центре — Bacillus clausii, суспензия и формат Форте',
    product_enterogermina_forte_formula_intro: 'Блок показывает три ключевых акцента продукта: пробиотические споры, устойчивую форму и готовую суспензию.',
    product_enterogermina_forte_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_forte_formula_bacillus_text: 'Помогает восполнить полезные бактерии при нарушении баланса микрофлоры.',
    product_enterogermina_forte_formula_spores_title: 'Споры',
    product_enterogermina_forte_formula_spores_text: 'Споровая форма помогает бактериям сохранять стабильность до попадания в кишечник.',
    product_enterogermina_forte_formula_pack_title: 'Готовая суспензия',
    product_enterogermina_forte_formula_pack_text: 'Жидкая форма во флаконе: удобно принимать без предварительного приготовления.',
    product_enterogermina_forte_usage_label: 'Когда актуально',
    product_enterogermina_forte_usage_heading: 'Для поддержки кишечной микрофлоры в формате 1 раз в день',
    product_enterogermina_forte_usage_microflora_title: 'При дисбактериозе',
    product_enterogermina_forte_usage_microflora_text: 'Может применяться для лечения и профилактики дисбактериоза согласно инструкции.',
    product_enterogermina_forte_usage_antibiotic_title: 'После антибиотиков',
    product_enterogermina_forte_usage_antibiotic_text: 'Уместна для поддержки микрофлоры во время или после антибактериальной терапии по рекомендации специалиста.',
    product_enterogermina_forte_usage_daily_title: 'Когда важен режим',
    product_enterogermina_forte_usage_daily_text: 'Прием 1 раз в день помогает не усложнять ежедневную схему применения.',
    product_enterogermina_forte_note_title: 'Важно помнить',
    product_enterogermina_forte_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом, особенно при применении у детей.',
    product_enterogermina_forte_buy_intro: 'Ищите Энтерожермину Форте у аптечных партнеров STADA в Казахстане.',
    // Career page translations (added)
    career_heading: 'Карьера в STADA',
    career_par1: 'Работать в STADA — это уникальное путешествие. Мы предлагаем разнообразные и увлекательные роли: от стартовых должностей для выпускников до экспертных позиций. Наши вакансии охватывают широкий спектр навыков и не ограничиваются фармацевтической отраслью — вы также найдёте возможности в области цепочки поставок, маркетинга, финансов, управления проектами и многого другого.',
    career_fact1: 'руководителей — женщины',
    career_fact2: 'сотрудников гордятся нашей целью «Забота о здоровье людей как надёжный партнёр»',
    career_fact3: 'сотрудников по всему миру',
    career_fact4: 'национальности в нашей команде',
    career_fact5: 'фармацевтических компаний по рейтингу Sustainalytics ESG 2023',
    career_button: 'Смотреть вакансии',
    hero_products_label: 'НАШИ ПРОДУКТЫ',
    hero_products_heading: 'Качественные лекарства для лучшей жизни',
    hero_products_description: 'Мы предлагаем широкий ассортимент высококачественных дженериков и продуктов для здоровья потребителей в различных терапевтических областях.',
    button_products: 'Продукты',
    products_browse_catalog: 'Смотреть каталог',
    products_metric_portfolio: 'продуктов в каталоге',
    products_metric_areas: 'терапевтических направлений',
    products_catalog_label: 'Каталог STADA',
    products_catalog_intro: 'Выберите направление или откройте карточку продукта, чтобы узнать больше о составе, преимуществах и местах покупки.',
    products_filter_all: 'Все продукты',
    products_category_cold: 'Простуда и дыхание',
    products_category_immunity: 'Иммунитет',
    products_category_digestive: 'Пищеварение',
    products_category_kids: 'Для детей',
    products_category_cardio: 'Кардио',
    products_category_respiratory: 'Дыхательные пути',
    products_partners_heading: 'Доступны в аптеках и онлайн-сервисах',
    products_partners_intro: 'Продукты STADA можно найти у партнеров в Казахстане: от крупных аптечных сетей до удобных цифровых сервисов.',
    footer_pill: 'STADA Казахстан',
    footer_heading: 'Забота о здоровье начинается с надежной информации',
    footer_lead: 'Перейдите к каталогу продуктов, узнайте больше о компании или откройте карьерные возможности STADA.',
    footer_catalog_cta: 'Открыть каталог',
    footer_career_cta: 'Карьера в STADA',
    footer_brand_text: 'Мы объединяем международный опыт STADA и локальную близость к пациентам, специалистам и партнерам в Казахстане.',
    footer_trust_years: '130+ лет опыта',
    footer_trust_countries: '100+ стран',
    footer_company_title: 'Компания',
    footer_products_title: 'Продукты',
    footer_access_title: 'Доступность',
    footer_global_link: 'STADA Global',
    footer_warning_title: 'Важно',
    footer_warning_text: 'Информация на сайте не заменяет консультацию специалиста. Перед применением лекарственных средств ознакомьтесь с инструкцией.',
    footer_rights: 'Все права защищены.',
    footer_back_top: 'Наверх',
    where_to_buy_heading: 'Где купить',
    benefits_heading: 'Преимущества',
    // The comma below starts the product-specific keys inserted later
    
    // Coldrex page title and description
    product_coldrex_page_title: 'Колдрекс',
    product_coldrex_page_desc: 'Колдрекс — комбинированный препарат для облегчения симптомов простуды и гриппа.',
    // Coldrex benefits
    product_coldrex_benefit1: 'Парацетамол помогает снижать повышенную температуру и облегчать боль',
    product_coldrex_benefit2: 'Фенилэфрин помогает уменьшать заложенность носа и синусов',
    product_coldrex_benefit3: 'Витамин C дополняет формулу и поддерживает организм в сезон простуд',
    product_coldrex_benefit4: 'Горячий формат помогает сделать прием привычным и комфортным',
    product_coldrex_benefit5: 'Комплексное действие направлено на основные симптомы простуды и гриппа',
    product_coldrex_benefit6: 'Применяется согласно инструкции с учетом возраста и противопоказаний',
    product_coldrex_overview_label: 'О продукте',
    product_coldrex_overview_heading: 'Комплексная помощь при симптомах простуды',
    product_coldrex_overview_intro: 'Колдрекс ХотРем объединяет жаропонижающий, противозаложенный и поддерживающий компоненты в формате горячего напитка, чтобы помогать при типичных симптомах простуды и гриппа.',
    product_coldrex_card_format_title: '10 пакетиков',
    product_coldrex_card_format_text: 'Упаковка рассчитана на несколько приемов по схеме, указанной в инструкции.',
    product_coldrex_card_action_title: 'Тройной фокус',
    product_coldrex_card_action_text: 'Формула сфокусирована на температуре, боли, заложенности носа и общем самочувствии.',
    product_coldrex_card_vitamin_title: 'Витамин C',
    product_coldrex_card_vitamin_text: 'Аскорбиновая кислота дополняет формулу в сезон повышенной нагрузки на организм.',
    product_coldrex_card_pack_title: 'Порционный формат',
    product_coldrex_card_pack_text: 'Каждый пакетик удобно использовать для приготовления одной порции горячего напитка.',
    product_coldrex_formula_label: 'Формула',
    product_coldrex_formula_heading: 'Три компонента комплексного действия',
    product_coldrex_formula_intro: 'Формула Колдрекс ХотРем объединяет компоненты для облегчения основных симптомов простуды и поддержки организма.',
    product_coldrex_formula_paracetamol_title: 'Парацетамол',
    product_coldrex_formula_paracetamol_text: 'Помогает снижать повышенную температуру и облегчать головную боль, боль в горле и ломоту.',
    product_coldrex_formula_phenylephrine_title: 'Фенилэфрин',
    product_coldrex_formula_phenylephrine_text: 'Помогает уменьшать заложенность носа и синусов, облегчая дыхание.',
    product_coldrex_formula_vitamin_c_title: 'Витамин C',
    product_coldrex_formula_vitamin_c_text: 'Дополняет формулу и поддерживает организм в сезон простуд.',
    product_coldrex_usage_label: 'Когда особенно актуально',
    product_coldrex_usage_heading: 'При температуре, боли и заложенности',
    product_coldrex_usage_fever_title: 'Температура и ломота',
    product_coldrex_usage_fever_text: 'Актуален, когда простуда сопровождается повышенной температурой, головной болью и ломотой.',
    product_coldrex_usage_congestion_title: 'Заложенность носа',
    product_coldrex_usage_congestion_text: 'Подходит при симптомах заложенности носа и синусов, когда дыхание становится менее свободным.',
    product_coldrex_usage_season_title: 'Сезон простуд',
    product_coldrex_usage_season_text: 'Уместен как симптоматическая поддержка в периоды простуды и гриппа согласно инструкции.',
    product_coldrex_note_title: 'Ответственное применение',
    product_coldrex_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом, особенно при хронических заболеваниях или приеме других средств.',
    product_coldrex_buy_intro: 'Ищите Колдрекс у аптечных партнеров STADA в Казахстане.',
    // Magne B6 Kids
    product_magneb6kids_benefit1: 'Магний и витамин B6 помогают поддерживать нормальную работу нервной системы',
    product_magneb6kids_benefit2: 'Компоненты участвуют в энергетическом обмене и помогают снижать утомляемость',
    product_magneb6kids_benefit3: 'Витамин B6 дополняет действие магния и поддерживает его усвоение',
    product_magneb6kids_benefit4: 'Формула помогает поддерживать нормальную психологическую функцию',
    product_magneb6kids_benefit5: 'Жевательный формат удобен для ежедневного приема детьми согласно инструкции',
    product_magneb6kids_benefit6: 'Подходит детям с 4 лет; дозировку выбирают с учетом возраста',
    product_magneb6kids_kicker: 'Магний + витамин B6',
    product_magneb6kids_badge_age: 'Для детей 4+',
    product_magneb6kids_badge_chewable: 'Жевательные таблетки',
    product_magneb6kids_badge_formula: 'Mg + B6',
    product_magneb6kids_metric_magnesium: 'мг магния',
    product_magneb6kids_metric_vitamin: 'витамин B6',
    product_magneb6kids_metric_age: 'для детей',
    product_magneb6kids_overview_label: 'О продукте',
    product_magneb6kids_overview_heading: 'Поддержка нервной системы в детском ритме',
    product_magneb6kids_overview_intro: 'Магне B6 Кидс объединяет магний и витамин B6 в жевательном формате, который помогает встроить нутриентную поддержку в ежедневный режим ребенка.',
    product_magneb6kids_card_magnesium_title: '70 мг магния',
    product_magneb6kids_card_magnesium_text: 'Магний важен для нормальной работы нервной системы и мышц, а также для ежедневного обмена веществ.',
    product_magneb6kids_card_b6_title: 'Витамин B6',
    product_magneb6kids_card_b6_text: 'Витамин B6 участвует в энергетическом обмене и помогает снижать утомляемость.',
    product_magneb6kids_card_format_title: '30 таблеток',
    product_magneb6kids_card_format_text: 'Жевательная форма помогает сделать прием понятным и привычным для ребенка.',
    product_magneb6kids_card_age_title: 'С 4 лет',
    product_magneb6kids_card_age_text: 'Формат предназначен для детей старше 4 лет; режим приема подбирают по инструкции.',
    product_magneb6kids_formula_label: 'Формула',
    product_magneb6kids_formula_heading: 'Три элемента спокойной поддержки',
    product_magneb6kids_formula_intro: 'Формула строится вокруг магния, витамина B6 и детского жевательного формата, чтобы поддержка была понятной и регулярной.',
    product_magneb6kids_formula_magnesium_title: 'Магний',
    product_magneb6kids_formula_magnesium_text: 'Помогает поддерживать нормальную работу нервной системы и мышц.',
    product_magneb6kids_formula_b6_title: 'Витамин B6',
    product_magneb6kids_formula_b6_text: 'Дополняет магний и участвует в процессах энергетического обмена.',
    product_magneb6kids_formula_format_title: 'Детский формат',
    product_magneb6kids_formula_format_text: 'Жевательные таблетки удобно вписываются в ежедневный режим согласно инструкции.',
    product_magneb6kids_usage_label: 'Когда особенно актуально',
    product_magneb6kids_usage_heading: 'В период учебы, роста и активного ритма',
    product_magneb6kids_usage_school_title: 'Учебная нагрузка',
    product_magneb6kids_usage_school_text: 'Подходит как нутриентная поддержка в периоды, когда ребенку важно сохранять устойчивый ежедневный ритм.',
    product_magneb6kids_usage_activity_title: 'Активные дни',
    product_magneb6kids_usage_activity_text: 'Магний и витамин B6 помогают поддерживать энергетический обмен при насыщенном графике.',
    product_magneb6kids_usage_diet_title: 'Особенности рациона',
    product_magneb6kids_usage_diet_text: 'Может быть уместен, когда рациону нужна дополнительная поддержка магнием и витамином B6.',
    product_magneb6kids_note_title: 'Ответственный прием',
    product_magneb6kids_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом, особенно если у ребенка есть хронические заболевания или он принимает другие средства.',
    product_magneb6kids_buy_intro: 'Ищите Магне B6 Кидс у аптечных партнеров STADA в Казахстане.',
    // Snup benefits
    product_snup_benefit1: 'Ксилометазолин помогает уменьшать отек слизистой оболочки носа и облегчать носовое дыхание',
    product_snup_benefit2: 'Действие обычно начинается в течение 5–10 минут после применения',
    product_snup_benefit3: 'Деконгестантный эффект в среднем сохраняется 6–8 часов после однократного применения',
    product_snup_benefit4: 'Морская вода поддерживает нормальное физиологическое состояние слизистой оболочки носа',
    product_snup_benefit5: 'Формат 0,1% предназначен для взрослых и детей старше 6 лет',
    product_snup_benefit6: 'Курс применения по инструкции не должен превышать 5–7 дней',
    product_snup_kicker: 'Назальный спрей',
    product_snup_badge_spray: 'Дозированный спрей',
    product_snup_badge_seawater: 'Морская вода',
    product_snup_badge_age: 'С 6 лет для 0,1%',
    product_snup_metric_minutes: 'минут до начала действия',
    product_snup_metric_hours: 'часов эффекта в среднем',
    product_snup_metric_doses: 'доз во флаконе',
    product_snup_overview_label: 'О продукте',
    product_snup_overview_heading: 'Дыхание свободнее при заложенности носа',
    product_snup_overview_intro: 'Снуп сочетает местное сосудосуживающее действие ксилометазолина и морскую воду, чтобы помогать уменьшать отек слизистой и облегчать носовое дыхание при рините.',
    product_snup_card_strength_title: '0,1% / 90 мкг',
    product_snup_card_strength_text: 'Формат на упаковке предназначен для взрослых и детей старше 6 лет согласно инструкции.',
    product_snup_card_action_title: 'Ксилометазолин',
    product_snup_card_action_text: 'Деконгестант помогает уменьшать отек и гиперемию слизистой оболочки носа.',
    product_snup_card_seawater_title: 'Морская вода',
    product_snup_card_seawater_text: 'Компонент поддерживает физиологическое состояние слизистой и работу мерцательного эпителия.',
    product_snup_card_course_title: '5–7 дней',
    product_snup_card_course_text: 'Рекомендуемая продолжительность курса не должна превышать 5–7 дней.',
    product_snup_formula_label: 'Формула',
    product_snup_formula_heading: 'Три элемента одной системы',
    product_snup_formula_intro: 'Ксилометазолин, морская вода и дозированный формат работают вместе: помогают облегчать дыхание, поддерживать слизистую и делать применение понятным.',
    product_snup_formula_active_text: 'Помогает сужать сосуды слизистой оболочки носа, уменьшая отек и освобождая носовое дыхание.',
    product_snup_formula_seawater_text: 'Дополняет действие формулы поддержкой физиологического состояния слизистой оболочки носа.',
    product_snup_formula_format_text: 'Дозированный спрей соединяет действие компонентов в привычном местном применении по инструкции.',
    product_snup_usage_label: 'Когда особенно актуально',
    product_snup_usage_heading: 'При насморке, аллергии и заложенности',
    product_snup_usage_cold_title: 'Ринит при ОРЗ',
    product_snup_usage_cold_text: 'Подходит для облегчения носового дыхания при рините на фоне острых респираторных заболеваний.',
    product_snup_usage_allergy_title: 'Аллергический ринит',
    product_snup_usage_allergy_text: 'Может применяться при аллергическом рините и поллинозе согласно инструкции.',
    product_snup_usage_sinus_title: 'Околоносовые пазухи',
    product_snup_usage_sinus_text: 'Используется для улучшения оттока секрета при воспалении околоносовых пазух.',
    product_snup_note_title: 'Важная информация',
    product_snup_note_text: 'Перед применением ознакомьтесь с инструкцией. Не применяйте чаще 3 раз в день и дольше 5–7 дней; для детей выбирайте концентрацию по возрасту.',
    product_snup_buy_intro: 'Ищите Снуп у аптечных партнеров STADA в Казахстане.',
    // Sinulan Duo benefits
    product_sinulan_duo_benefit1: 'Комбинация растительных экстрактов поддерживает верхние и нижние дыхательные пути',
    product_sinulan_duo_benefit2: 'Люцерна способствует иммунной защите и здоровью дыхательных путей',
    product_sinulan_duo_benefit3: 'Цветки бузины поддерживают естественную защиту и здоровье дыхательной системы',
    product_sinulan_duo_benefit4: 'Вербена укрепляет дыхательную систему и природную защиту',
    product_sinulan_duo_benefit5: 'Корень желтолистника улучшает общее состояние организма',
    product_sinulan_duo_benefit6: 'Подходит для взрослых и детей с 6 лет',
    product_sinulan_duo_kicker: 'Растительный комплекс для дыхания',
    product_sinulan_duo_badge_plant: 'Растительные экстракты',
    product_sinulan_duo_badge_breathing: 'Свободное дыхание',
    product_sinulan_duo_badge_age: 'Для детей с 6 лет',
    product_sinulan_duo_metric_complex: 'растительный комплекс',
    product_sinulan_duo_metric_tablets: 'таблеток в упаковке',
    product_sinulan_duo_metric_age: 'детям и взрослым',
    product_sinulan_duo_overview_label: 'Дыхательные пути',
    product_sinulan_duo_overview_heading: 'Поддержка свободного дыхания в растительном формате',
    product_sinulan_duo_overview_intro: 'Синулан Дуо сочетает растительные компоненты для поддержки дыхательных путей и естественной защиты организма.',
    product_sinulan_duo_card_plant_title: 'Растительный комплекс',
    product_sinulan_duo_card_plant_text: 'Комбинация экстрактов помогает поддерживать верхние и нижние дыхательные пути.',
    product_sinulan_duo_card_breathing_title: 'Свободное дыхание',
    product_sinulan_duo_card_breathing_text: 'Формула направлена на поддержку комфортного дыхания в сезон простуды.',
    product_sinulan_duo_card_format_title: '15 таблеток',
    product_sinulan_duo_card_format_text: 'Удобный таблетированный формат для приема согласно инструкции.',
    product_sinulan_duo_card_age_title: 'С 6 лет',
    product_sinulan_duo_card_age_text: 'Подходит взрослым и детям с 6 лет при соблюдении рекомендаций по применению.',
    product_sinulan_duo_formula_label: 'Формула',
    product_sinulan_duo_formula_heading: 'В центре — растительный комплекс и поддержка дыхания',
    product_sinulan_duo_formula_intro: 'Карточки показывают ключевые свойства продукта: растительную основу, дыхательный фокус и применение с 6 лет.',
    product_sinulan_duo_formula_plant_title: 'Растительные экстракты',
    product_sinulan_duo_formula_plant_text: 'Комплекс компонентов помогает поддерживать здоровье дыхательных путей.',
    product_sinulan_duo_formula_breathing_title: 'Свободное дыхание',
    product_sinulan_duo_formula_breathing_text: 'Подходит для поддержки дыхания при простуде и сезонном дискомфорте.',
    product_sinulan_duo_formula_format_title: 'С 6 лет',
    product_sinulan_duo_formula_format_text: 'Подходит детям с 6 лет и взрослым при соблюдении рекомендаций по применению.',
    product_sinulan_duo_usage_label: 'Когда актуально',
    product_sinulan_duo_usage_heading: 'Для поддержки дыхательных путей в сезон простуды',
    product_sinulan_duo_usage_cold_title: 'При простуде',
    product_sinulan_duo_usage_cold_text: 'Может использоваться для поддержки дыхания и общего самочувствия согласно инструкции.',
    product_sinulan_duo_usage_sinus_title: 'При заложенности',
    product_sinulan_duo_usage_sinus_text: 'Растительная формула помогает поддерживать комфорт дыхательных путей.',
    product_sinulan_duo_usage_family_title: 'Для семьи',
    product_sinulan_duo_usage_family_text: 'Подходит взрослым и детям с 6 лет при соблюдении рекомендаций по применению.',
    product_sinulan_duo_note_title: 'Важно помнить',
    product_sinulan_duo_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом при наличии хронических заболеваний.',
    product_sinulan_duo_buy_intro: 'Ищите Синулан Дуо у аптечных партнеров STADA в Казахстане.',
    // Vitrum Immunaktiv
    product_vitrum_immunaktiv_name: 'Витрум Иммунактив',
    product_vitrum_immunaktiv_page_title: 'Витрум Иммунактив',
    product_vitrum_immunaktiv_page_desc: 'Витрум Иммунактив — витаминно-минеральный комплекс из 13 витаминов, 8 минералов и β-глюкана для поддержки иммунитета.',
    product_vitrum_immunaktiv_benefit1: 'Балансированная формула из 13 витаминов, 8 минералов и β-глюкана для поддержки иммунитета',
    product_vitrum_immunaktiv_benefit2: 'Укрепляет иммунитет и обеспечивает здоровое функционирование иммунных клеток',
    product_vitrum_immunaktiv_benefit3: 'Повышает защиту организма от сезонных, вирусных и бактериальных инфекций',
    product_vitrum_immunaktiv_benefit4: 'Сокращает время выздоровления и снижает риск осложнений',
    product_vitrum_immunaktiv_benefit5: 'Ускоряет реабилитацию и уменьшает риск рецидивов после болезни',
    product_vitrum_immunaktiv_benefit6: 'Рекомендовано для взрослых с 18 лет',
    product_vitrum_immunaktiv_kicker: 'Витаминно-минеральный комплекс',
    product_vitrum_immunaktiv_badge_adults: 'Для взрослых 18+',
    product_vitrum_immunaktiv_badge_immune: 'Поддержка иммунитета',
    product_vitrum_immunaktiv_badge_course: 'Для курсового приема',
    product_vitrum_immunaktiv_metric_vitamins: 'витаминов',
    product_vitrum_immunaktiv_metric_minerals: 'минералов',
    product_vitrum_immunaktiv_metric_beta: 'β-глюкан',
    product_vitrum_immunaktiv_overview_label: 'О продукте',
    product_vitrum_immunaktiv_overview_heading: 'Комплексная формула для периода повышенной нагрузки',
    product_vitrum_immunaktiv_overview_intro: 'Витрум Иммунактив объединяет витаминно-минеральную основу и β-глюкан, чтобы поддерживать нормальную работу иммунной системы в сезон простуд, при интенсивном ритме и после болезни.',
    product_vitrum_immunaktiv_card_vitamins_title: '13 витаминов',
    product_vitrum_immunaktiv_card_vitamins_text: 'Помогают восполнять ежедневную потребность организма в важных микронутриентах.',
    product_vitrum_immunaktiv_card_minerals_title: '8 минералов',
    product_vitrum_immunaktiv_card_minerals_text: 'Поддерживают обменные процессы и нормальное функционирование организма.',
    product_vitrum_immunaktiv_card_beta_title: 'β-глюкан',
    product_vitrum_immunaktiv_card_beta_text: 'Компонент, который дополняет формулу для комплексной иммунной поддержки.',
    product_vitrum_immunaktiv_card_adults_title: 'Для взрослых',
    product_vitrum_immunaktiv_card_adults_text: 'Формула предназначена для взрослых с 18 лет.',
    product_vitrum_immunaktiv_formula_label: 'Формула',
    product_vitrum_immunaktiv_formula_heading: 'Три слоя ежедневной поддержки',
    product_vitrum_immunaktiv_formula_intro: 'Состав сфокусирован на нутриентах, которые важны для нормального иммунного ответа, обмена веществ и восстановления ресурсов организма.',
    product_vitrum_immunaktiv_formula_vitamins_title: 'Витамины',
    product_vitrum_immunaktiv_formula_vitamins_text: 'Комплекс витаминов помогает поддерживать энергетический обмен и естественные защитные функции.',
    product_vitrum_immunaktiv_formula_minerals_title: 'Минералы',
    product_vitrum_immunaktiv_formula_minerals_text: 'Минеральная часть формулы дополняет рацион и поддерживает устойчивость организма.',
    product_vitrum_immunaktiv_formula_beta_title: 'β-глюкан',
    product_vitrum_immunaktiv_formula_beta_text: 'β-глюкан усиливает акцент продукта на поддержке иммунной системы.',
    product_vitrum_immunaktiv_usage_label: 'Когда особенно актуально',
    product_vitrum_immunaktiv_usage_heading: 'Для сезона, восстановления и насыщенного ритма',
    product_vitrum_immunaktiv_usage_season_title: 'В сезон простуд',
    product_vitrum_immunaktiv_usage_season_text: 'Подходит как часть ежедневной поддержки в периоды повышенной нагрузки на иммунитет.',
    product_vitrum_immunaktiv_usage_recovery_title: 'После болезни',
    product_vitrum_immunaktiv_usage_recovery_text: 'Помогает восполнять ресурсы организма во время восстановления после перенесенного заболевания.',
    product_vitrum_immunaktiv_usage_daily_title: 'При активном графике',
    product_vitrum_immunaktiv_usage_daily_text: 'Удобный вариант для взрослых, которым важно поддерживать баланс витаминов и минералов.',
    product_vitrum_immunaktiv_note_title: 'Ответственный прием',
    product_vitrum_immunaktiv_note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом, особенно при хронических заболеваниях или одновременном приеме других средств.',
    product_vitrum_immunaktiv_buy_intro: 'Ищите Витрум Иммунактив у аптечных партнеров STADA в Казахстане.',
    // Edarbi Klo benefits
    product_edarbi_klo_benefit1: 'Комбинация азилсартана и хлорталидона для эффективного контроля гипертонии',
    product_edarbi_klo_benefit2: 'Азилсартан блокирует сосудосуживающее действие ангиотензина II и снижает задержку натрия',
    product_edarbi_klo_benefit3: 'Хлорталидон вызывает диурез, увеличивая выведение натрия и хлорида',
    product_edarbi_klo_benefit4: 'Снижают кровяное давление за счет снижения периферического сопротивления по взаимодополняющим механизмам',
    product_edarbi_klo_benefit5: 'Рекомендуется пациентам, которым недостаточно одного препарата для контроля давления',
    product_edarbi_klo_kicker: 'Комбинированный контроль давления',
    product_edarbi_klo_badge_combo: 'Азилсартан + хлорталидон',
    product_edarbi_klo_badge_pressure: 'Контроль АД',
    product_edarbi_klo_badge_pack: '28 таблеток',
    product_edarbi_klo_metric_dose: 'мг активных компонентов',
    product_edarbi_klo_metric_pack: 'таблеток в упаковке',
    product_edarbi_klo_metric_mechanism: 'механизма действия',
    product_edarbi_klo_overview_label: 'Артериальное давление',
    product_edarbi_klo_overview_heading: 'Комбинация для контроля гипертонии',
    product_edarbi_klo_overview_intro: 'Эдарби Кло объединяет азилсартан и хлорталидон для контроля артериального давления по назначению врача.',
    product_edarbi_klo_card_azilsartan_title: 'Азилсартан',
    product_edarbi_klo_card_azilsartan_text: 'Помогает блокировать действие ангиотензина II, связанного с сосудистым тонусом.',
    product_edarbi_klo_card_chlorthalidone_title: 'Хлорталидон',
    product_edarbi_klo_card_chlorthalidone_text: 'Диуретический компонент способствует выведению натрия и жидкости согласно механизму действия.',
    product_edarbi_klo_card_pack_title: '28 таблеток',
    product_edarbi_klo_card_pack_text: 'Формат упаковки для регулярного приема по назначенной врачом схеме.',
    product_edarbi_klo_card_control_title: 'Контроль давления',
    product_edarbi_klo_card_control_text: 'Компоненты дополняют друг друга в терапии артериальной гипертензии.',
    product_edarbi_klo_formula_label: 'Формула',
    product_edarbi_klo_formula_heading: 'В центре — два активных компонента',
    product_edarbi_klo_formula_intro: 'Линии показывают, как азилсартан, хлорталидон и общий контроль давления собираются вокруг упаковки.',
    product_edarbi_klo_formula_azilsartan_title: 'Азилсартан',
    product_edarbi_klo_formula_azilsartan_text: 'Компонент направлен на блокирование рецепторов ангиотензина II.',
    product_edarbi_klo_formula_chlorthalidone_title: 'Хлорталидон',
    product_edarbi_klo_formula_chlorthalidone_text: 'Диуретический компонент помогает уменьшать объем жидкости и нагрузку на сосуды.',
    product_edarbi_klo_formula_control_title: 'Контроль АД',
    product_edarbi_klo_formula_control_text: 'Два механизма действия дополняют друг друга в контроле повышенного давления.',
    product_edarbi_klo_usage_label: 'Когда назначают',
    product_edarbi_klo_usage_heading: 'Для пациентов, которым нужен комбинированный контроль давления',
    product_edarbi_klo_usage_pressure_title: 'Артериальная гипертензия',
    product_edarbi_klo_usage_pressure_text: 'Используется для снижения повышенного артериального давления по назначению врача.',
    product_edarbi_klo_usage_combo_title: 'Когда одного средства недостаточно',
    product_edarbi_klo_usage_combo_text: 'Комбинация компонентов может быть назначена, если монотерапия не обеспечивает нужный контроль.',
    product_edarbi_klo_usage_routine_title: 'Ежедневная схема',
    product_edarbi_klo_usage_routine_text: 'Принимается в режиме, который определяет врач; важно соблюдать рекомендации и контроль давления.',
    product_edarbi_klo_note_title: 'Важно',
    product_edarbi_klo_note_text: 'Эдарби Кло применяют по назначению врача. Перед применением ознакомьтесь с инструкцией и не изменяйте схему терапии самостоятельно.',
    product_edarbi_klo_buy_intro: 'Ищите Эдарби Кло у аптечных партнеров STADA в Казахстане.',
    // Cardiomagnil
    product_cardiomagnil_benefit1: 'Содержит ацетилсалициловую кислоту 150 мг в формате таблеток, покрытых пленочной оболочкой',
    product_cardiomagnil_benefit2: 'Магния гидроксид входит в состав препарата как компонент, связанный с защитой слизистой желудка',
    product_cardiomagnil_benefit3: 'Используется для профилактики инфаркта и тромбоза по назначению врача',
    product_cardiomagnil_benefit4: 'Упаковка 30 таблеток подходит для регулярного курса согласно инструкции',
    product_cardiomagnil_benefit5: 'Важно соблюдать назначенную схему и учитывать противопоказания к ацетилсалициловой кислоте',
    product_cardiomagnil_kicker: 'Антиагрегантная терапия',
    product_cardiomagnil_badge_asa: 'АСК 150 мг',
    product_cardiomagnil_badge_magnesium: 'Магния гидроксид',
    product_cardiomagnil_badge_pack: '30 таблеток',
    product_cardiomagnil_metric_dose: 'мг ацетилсалициловой кислоты',
    product_cardiomagnil_metric_pack: 'таблеток в упаковке',
    product_cardiomagnil_metric_component: 'активный компонент',
    product_cardiomagnil_overview_label: 'Сердечно-сосудистая профилактика',
    product_cardiomagnil_overview_heading: 'Кардиомагнил в формате 150 мг для назначенной врачом профилактики',
    product_cardiomagnil_overview_intro: 'Кардиомагнил объединяет ацетилсалициловую кислоту и магния гидроксид в таблетках, покрытых пленочной оболочкой. Применение требует соблюдения инструкции и рекомендаций специалиста.',
    product_cardiomagnil_card_asa_title: 'Ацетилсалициловая кислота',
    product_cardiomagnil_card_asa_text: 'Активный компонент препарата, используемый в антиагрегантной терапии по назначению врача.',
    product_cardiomagnil_card_magnesium_title: 'Магния гидроксид',
    product_cardiomagnil_card_magnesium_text: 'Компонент состава, который нейтрализует соляную кислоту и обладает обволакивающим свойством.',
    product_cardiomagnil_card_dose_title: '150 мг',
    product_cardiomagnil_card_dose_text: 'Дозировка ацетилсалициловой кислоты, указанная для представленного формата упаковки.',
    product_cardiomagnil_card_pack_title: '30 таблеток',
    product_cardiomagnil_card_pack_text: 'Формат упаковки для приема по схеме, определенной врачом.',
    product_cardiomagnil_formula_label: 'Формула',
    product_cardiomagnil_formula_heading: 'В центре — АСК, магний и регулярный формат',
    product_cardiomagnil_formula_intro: 'Визуальная схема показывает ключевые элементы продукта: ацетилсалициловую кислоту, магния гидроксид и упаковку на 30 таблеток.',
    product_cardiomagnil_formula_asa_title: 'АСК',
    product_cardiomagnil_formula_asa_text: 'Ацетилсалициловая кислота 150 мг является активным веществом препарата.',
    product_cardiomagnil_formula_magnesium_title: 'Магния гидроксид',
    product_cardiomagnil_formula_magnesium_text: 'Входит в состав препарата и связан с антацидным, обволакивающим действием.',
    product_cardiomagnil_formula_pack_title: 'Курс под контролем',
    product_cardiomagnil_formula_pack_text: '30 таблеток в упаковке помогают поддерживать назначенный режим приема.',
    product_cardiomagnil_usage_label: 'Когда назначают',
    product_cardiomagnil_usage_heading: 'Для профилактики инфаркта и тромбоза по рекомендации специалиста',
    product_cardiomagnil_usage_prevention_title: 'Профилактика инфаркта',
    product_cardiomagnil_usage_prevention_text: 'Может применяться в профилактических схемах, если врач оценил показания и риски.',
    product_cardiomagnil_usage_thrombosis_title: 'Профилактика тромбоза',
    product_cardiomagnil_usage_thrombosis_text: 'Антиагрегантная терапия требует регулярности приема и контроля со стороны специалиста.',
    product_cardiomagnil_usage_doctor_title: 'Индивидуальная схема',
    product_cardiomagnil_usage_doctor_text: 'Дозировку, длительность и совместимость с другими препаратами определяет врач.',
    product_cardiomagnil_note_title: 'Важно',
    product_cardiomagnil_note_text: 'Кардиомагнил применяют по назначению врача. Перед применением ознакомьтесь с инструкцией, противопоказаниями и возможными лекарственными взаимодействиями.',
    product_cardiomagnil_buy_intro: 'Ищите Кардиомагнил у аптечных партнеров STADA в Казахстане.',
    // No-Spa
    product_noshpa_benefit1: 'Содержит дротаверина гидрохлорид 40 мг в каждой таблетке',
    product_noshpa_benefit2: 'Применяется при спазмах гладкой мускулатуры согласно инструкции',
    product_noshpa_benefit3: 'Может использоваться как вспомогательная терапия при спазмах желудочно-кишечного тракта',
    product_noshpa_benefit4: 'Формат 24 таблетки подходит для приема по рекомендованной схеме',
    product_noshpa_benefit5: 'Перед применением важно учитывать противопоказания и возрастные ограничения',
    product_noshpa_kicker: 'Спазмолитик',
    product_noshpa_badge_drotaverine: 'Дротаверин 40 мг',
    product_noshpa_badge_spasm: 'При спазмах',
    product_noshpa_badge_pack: '24 таблетки',
    product_noshpa_metric_dose: 'мг дротаверина',
    product_noshpa_metric_pack: 'таблетки в упаковке',
    product_noshpa_metric_component: 'активный компонент',
    product_noshpa_overview_label: 'При спазмах',
    product_noshpa_overview_heading: 'НО-ШПА 40 мг для облегчения спазмов гладкой мускулатуры',
    product_noshpa_overview_intro: 'НО-ШПА содержит дротаверина гидрохлорид и применяется при спазмах гладкой мускулатуры. Прием должен соответствовать инструкции и рекомендациям специалиста.',
    product_noshpa_card_drotaverine_title: 'Дротаверин',
    product_noshpa_card_drotaverine_text: 'Активное вещество препарата, относящееся к миотропным спазмолитикам.',
    product_noshpa_card_dose_title: '40 мг',
    product_noshpa_card_dose_text: 'Дозировка дротаверина гидрохлорида в одной таблетке НО-ШПА.',
    product_noshpa_card_pack_title: '24 таблетки',
    product_noshpa_card_pack_text: 'Упаковка с одним блистером для приема согласно инструкции.',
    product_noshpa_card_age_title: 'С 6 лет',
    product_noshpa_card_age_text: 'Возрастные ограничения и режим приема необходимо сверять с инструкцией.',
    product_noshpa_formula_label: 'Формула',
    product_noshpa_formula_heading: 'В центре — дротаверин, дозировка и удобный формат',
    product_noshpa_formula_intro: 'Схема собирает основные элементы продукта: дротаверин 40 мг, спазмолитическое направление и упаковку на 24 таблетки.',
    product_noshpa_formula_drotaverine_title: 'Дротаверин',
    product_noshpa_formula_drotaverine_text: 'Дротаверина гидрохлорид 40 мг является активным веществом препарата.',
    product_noshpa_formula_spasm_title: 'Спазмолитическое действие',
    product_noshpa_formula_spasm_text: 'Применяется при спазмах гладкой мускулатуры в показаниях, перечисленных в инструкции.',
    product_noshpa_formula_pack_title: '24 таблетки',
    product_noshpa_formula_pack_text: 'Формат упаковки поддерживает прием по рекомендованной схеме.',
    product_noshpa_usage_label: 'Когда применяют',
    product_noshpa_usage_heading: 'При спазмах гладкой мускулатуры по инструкции',
    product_noshpa_usage_biliary_title: 'Желчевыводящие пути',
    product_noshpa_usage_biliary_text: 'В инструкции указаны спазмы гладкой мускулатуры при заболеваниях желчевыводящих путей.',
    product_noshpa_usage_gi_title: 'Желудочно-кишечный тракт',
    product_noshpa_usage_gi_text: 'Может применяться как вспомогательная терапия при спазмах гладкой мускулатуры ЖКТ.',
    product_noshpa_usage_doctor_title: 'Ответственный прием',
    product_noshpa_usage_doctor_text: 'Дозировку, длительность и совместимость с другими препаратами следует сверять с инструкцией и специалистом.',
    product_noshpa_note_title: 'Важно',
    product_noshpa_note_text: 'НО-ШПА применяют согласно инструкции. Перед приемом ознакомьтесь с противопоказаниями, дозировкой и обратитесь к врачу при сомнениях.',
    product_noshpa_buy_intro: 'Ищите НО-ШПА у аптечных партнеров STADA в Казахстане.',
    // Essentiale
    product_essentiale_benefit1: 'Содержит эссенциальные фосфолипиды в формате капсул',
    product_essentiale_benefit2: 'Упаковка 30 капсул подходит для приема по схеме, указанной в инструкции',
    product_essentiale_benefit3: 'Формат продукта связан с заботой о клетках печени',
    product_essentiale_benefit4: 'На упаковке выделены три направления: защита, восстановление и повышение устойчивости клеток печени',
    product_essentiale_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать рекомендации специалиста',
    product_essentiale_kicker: 'Забота о печени',
    product_essentiale_badge_phospholipids: 'Эссенциальные фосфолипиды',
    product_essentiale_badge_liver: 'Для клеток печени',
    product_essentiale_badge_pack: '30 капсул',
    product_essentiale_metric_pack: 'капсул в упаковке',
    product_essentiale_metric_actions: 'направления заботы',
    product_essentiale_metric_component: 'фосфолипиды',
    product_essentiale_overview_label: 'Печень и фосфолипиды',
    product_essentiale_overview_heading: 'Эссенциале Форте Н в формате 30 капсул',
    product_essentiale_overview_intro: 'Страница оформлена вокруг ключевых элементов продукта: эссенциальных фосфолипидов, упаковки на 30 капсул и ответственного приема согласно инструкции.',
    product_essentiale_card_phospholipids_title: 'Эссенциальные фосфолипиды',
    product_essentiale_card_phospholipids_text: 'Компоненты, которые указаны как основа продукта Эссенциале Форте Н.',
    product_essentiale_card_pack_title: '30 капсул',
    product_essentiale_card_pack_text: 'Формат упаковки, показанный на packshot, для приема по инструкции.',
    product_essentiale_card_actions_title: '3 направления',
    product_essentiale_card_actions_text: 'На упаковке отмечены защита, восстановление и повышение устойчивости клеток печени.',
    product_essentiale_card_instruction_title: 'По инструкции',
    product_essentiale_card_instruction_text: 'Режим приема и ограничения необходимо сверять с инструкцией и специалистом.',
    product_essentiale_formula_label: 'Формула',
    product_essentiale_formula_heading: 'В центре — фосфолипиды, печень и компактный формат',
    product_essentiale_formula_intro: 'Схема показывает продукт в спокойном масштабе: упаковка остается в фокусе, но не перекрывает карточки и линии формулы.',
    product_essentiale_formula_phospholipids_title: 'Фосфолипиды',
    product_essentiale_formula_phospholipids_text: 'Эссенциальные фосфолипиды вынесены как главный компонент продукта.',
    product_essentiale_formula_liver_title: 'Забота о печени',
    product_essentiale_formula_liver_text: 'Визуальная логика страницы связана с поддержкой клеток печени согласно информации на упаковке.',
    product_essentiale_formula_pack_title: '30 капсул',
    product_essentiale_formula_pack_text: 'Упаковка в центре подобрана гармоничного размера, чтобы формула читалась легко.',
    product_essentiale_usage_label: 'Когда применяют',
    product_essentiale_usage_heading: 'Для заботы о печени согласно инструкции',
    product_essentiale_usage_liver_title: 'Функции печени',
    product_essentiale_usage_liver_text: 'Применение продукта следует сверять с инструкцией и рекомендациями специалиста.',
    product_essentiale_usage_cells_title: 'Клетки печени',
    product_essentiale_usage_cells_text: 'На упаковке акцент сделан на защите, восстановлении и устойчивости клеток печени.',
    product_essentiale_usage_doctor_title: 'Ответственный прием',
    product_essentiale_usage_doctor_text: 'Дозировку, длительность курса и совместимость с другими препаратами определяет специалист.',
    product_essentiale_note_title: 'Важно',
    product_essentiale_note_text: 'Эссенциале Форте Н применяют согласно инструкции. Перед приемом ознакомьтесь с противопоказаниями и обратитесь к врачу при сомнениях.',
    product_essentiale_buy_intro: 'Ищите Эссенциале у аптечных партнеров STADA в Казахстане.',
    // Aqualor
    product_aqualor_benefit1: 'Содержит стерильный раствор морской воды в формате спрея 125 мл',
    product_aqualor_benefit2: 'На упаковке указан формат для сильного насморка',
    product_aqualor_benefit3: 'Гипертоническая концентрация соли отмечена как 16-27 г/л',
    product_aqualor_benefit4: 'Подходит для ухода и промывания полости носа согласно инструкции',
    product_aqualor_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать индивидуальные особенности',
    product_aqualor_kicker: 'Спрей морской воды',
    product_aqualor_badge_seawater: 'Морская вода',
    product_aqualor_badge_strong: 'Сильный насморк',
    product_aqualor_badge_volume: '125 мл',
    product_aqualor_metric_volume: 'мл в упаковке',
    product_aqualor_metric_concentration: 'г/л концентрация',
    product_aqualor_metric_component: 'раствор морской воды',
    product_aqualor_overview_label: 'Уход за носом',
    product_aqualor_overview_heading: 'Аквалор Экстра Форте для ухода за полостью носа',
    product_aqualor_overview_intro: 'Страница собирает ключевые элементы продукта: стерильный раствор морской воды, формат 125 мл и применение при сильном насморке согласно информации на упаковке.',
    product_aqualor_card_seawater_title: 'Морская вода',
    product_aqualor_card_seawater_text: 'Стерильный раствор морской воды указан как основа продукта.',
    product_aqualor_card_volume_title: '125 мл',
    product_aqualor_card_volume_text: 'Объем упаковки, показанный на packshot, для использования по инструкции.',
    product_aqualor_card_concentration_title: '16-27 г/л',
    product_aqualor_card_concentration_text: 'На упаковке отмечена гипертоническая концентрация солей.',
    product_aqualor_card_instruction_title: 'По инструкции',
    product_aqualor_card_instruction_text: 'Режим применения и ограничения необходимо сверять с инструкцией.',
    product_aqualor_formula_label: 'Формула',
    product_aqualor_formula_heading: 'В центре — морская вода, концентрация и формат спрея',
    product_aqualor_formula_intro: 'Упаковка показана компактно, чтобы формула читалась спокойно и не перекрывала карточки компонентов.',
    product_aqualor_formula_seawater_title: 'Стерильная морская вода',
    product_aqualor_formula_seawater_text: 'Основа продукта — стерильный раствор морской воды.',
    product_aqualor_formula_nose_title: 'Для полости носа',
    product_aqualor_formula_nose_text: 'Формат спрея связан с уходом и промыванием полости носа согласно инструкции.',
    product_aqualor_formula_volume_title: '125 мл',
    product_aqualor_formula_volume_text: 'Объем упаковки выделен как практичный формат продукта.',
    product_aqualor_usage_label: 'Когда применяют',
    product_aqualor_usage_heading: 'Для ухода за носом при сильном насморке согласно инструкции',
    product_aqualor_usage_rhinitis_title: 'Сильный насморк',
    product_aqualor_usage_rhinitis_text: 'На упаковке продукт обозначен для ситуации сильного насморка.',
    product_aqualor_usage_hygiene_title: 'Промывание носа',
    product_aqualor_usage_hygiene_text: 'Использование должно соответствовать инструкции по применению.',
    product_aqualor_usage_doctor_title: 'Ответственный уход',
    product_aqualor_usage_doctor_text: 'При сомнениях, особенностях состояния или длительных симптомах следует обратиться к специалисту.',
    product_aqualor_note_title: 'Важно',
    product_aqualor_note_text: 'Аквалор Экстра Форте применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_buy_intro: 'Ищите Аквалор у аптечных партнеров STADA в Казахстане.',
    // Aqualor Forte
    product_aqualor_forte_benefit1: 'Содержит гипертонический раствор натуральной морской воды в формате душ 150 мл',
    product_aqualor_forte_benefit2: 'На упаковке указан формат для затяжного насморка',
    product_aqualor_forte_benefit3: 'Раствор обогащен CO2; этот акцент вынесен на packshot',
    product_aqualor_forte_benefit4: 'Подходит для ухода и промывания полости носа детям с 2 лет и взрослым согласно инструкции',
    product_aqualor_forte_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать индивидуальные особенности',
    product_aqualor_forte_kicker: 'Спрей морской воды',
    product_aqualor_forte_badge_seawater: 'Морская вода',
    product_aqualor_forte_badge_co2: 'CO2',
    product_aqualor_forte_badge_volume: '150 мл',
    product_aqualor_forte_metric_volume: 'мл в упаковке',
    product_aqualor_forte_metric_age: 'для детей с 2 лет',
    product_aqualor_forte_metric_component: 'обогащение раствора',
    product_aqualor_forte_overview_label: 'Уход за носом',
    product_aqualor_forte_overview_heading: 'Аквалор Актив Форте для ухода и промывания полости носа',
    product_aqualor_forte_overview_intro: 'Страница собирает ключевые элементы продукта: натуральную морскую воду, объем 150 мл, формат душ и акцент CO2, показанный на упаковке.',
    product_aqualor_forte_card_seawater_title: 'Натуральная морская вода',
    product_aqualor_forte_card_seawater_text: 'Гипертонический раствор натуральной морской воды указан как основа продукта.',
    product_aqualor_forte_card_volume_title: '150 мл',
    product_aqualor_forte_card_volume_text: 'Объем упаковки, показанный на packshot, для использования по инструкции.',
    product_aqualor_forte_card_co2_title: 'CO2',
    product_aqualor_forte_card_co2_text: 'На упаковке отмечено обогащение раствора CO2.',
    product_aqualor_forte_card_age_title: '2+',
    product_aqualor_forte_card_age_text: 'На упаковке указан формат для детей с 2 лет и взрослых.',
    product_aqualor_forte_formula_label: 'Формула',
    product_aqualor_forte_formula_heading: 'В центре — морская вода, CO2 и формат душ',
    product_aqualor_forte_formula_intro: 'Упаковка показана в более спокойном размере, чтобы формула оставалась гармоничной и карточки компонентов читались без перекрытий.',
    product_aqualor_forte_formula_seawater_title: 'Морская вода',
    product_aqualor_forte_formula_seawater_text: 'Основа продукта — гипертонический раствор натуральной морской воды.',
    product_aqualor_forte_formula_co2_title: 'Обогащен CO2',
    product_aqualor_forte_formula_co2_text: 'CO2 вынесен как отдельный визуальный акцент на упаковке.',
    product_aqualor_forte_formula_volume_title: '150 мл',
    product_aqualor_forte_formula_volume_text: 'Объем упаковки выделен как практичный формат продукта.',
    product_aqualor_forte_usage_label: 'Когда применяют',
    product_aqualor_forte_usage_heading: 'Для ухода за носом при затяжном насморке согласно инструкции',
    product_aqualor_forte_usage_rhinitis_title: 'Затяжной насморк',
    product_aqualor_forte_usage_rhinitis_text: 'На упаковке продукт обозначен для ситуации затяжного насморка.',
    product_aqualor_forte_usage_hygiene_title: 'Промывание носа',
    product_aqualor_forte_usage_hygiene_text: 'Использование должно соответствовать инструкции по применению.',
    product_aqualor_forte_usage_doctor_title: 'Ответственный уход',
    product_aqualor_forte_usage_doctor_text: 'При сомнениях, особенностях состояния или длительных симптомах следует обратиться к специалисту.',
    product_aqualor_forte_note_title: 'Важно',
    product_aqualor_forte_note_text: 'Аквалор Актив Форте применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_forte_buy_intro: 'Ищите Аквалор Актив Форте у аптечных партнеров STADA в Казахстане.',
    // Aqualor Baby
    product_aqualor_baby_benefit1: 'Содержит раствор морской воды в формате капель 15 мл',
    product_aqualor_baby_benefit2: 'На упаковке указан формат для применения с рождения',
    product_aqualor_baby_benefit3: 'Капли подходят для мягкого ежедневного ухода за носом малыша согласно инструкции',
    product_aqualor_baby_benefit4: 'Компактный объем удобно держать под рукой для регулярного ухода',
    product_aqualor_baby_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать возрастные рекомендации',
    product_aqualor_baby_kicker: 'Капли морской воды',
    product_aqualor_baby_badge_seawater: 'Морская вода',
    product_aqualor_baby_badge_from_birth: 'С рождения',
    product_aqualor_baby_badge_volume: '15 мл',
    product_aqualor_baby_metric_volume: 'мл в упаковке',
    product_aqualor_baby_metric_age: 'для малышей',
    product_aqualor_baby_metric_component: 'раствор морской воды',
    product_aqualor_baby_overview_label: 'Уход за носом малыша',
    product_aqualor_baby_overview_heading: 'Аквалор Беби для мягкого ежедневного ухода',
    product_aqualor_baby_overview_intro: 'Страница собирает ключевые элементы продукта: морскую воду, формат капель, объем 15 мл и применение с рождения согласно информации на упаковке.',
    product_aqualor_baby_card_seawater_title: 'Морская вода',
    product_aqualor_baby_card_seawater_text: 'Раствор морской воды указан как основа продукта.',
    product_aqualor_baby_card_volume_title: '15 мл',
    product_aqualor_baby_card_volume_text: 'Компактный формат капель, показанный на packshot, для ухода по инструкции.',
    product_aqualor_baby_card_age_title: 'С рождения',
    product_aqualor_baby_card_age_text: 'На упаковке указан формат для применения с рождения.',
    product_aqualor_baby_card_instruction_title: 'По инструкции',
    product_aqualor_baby_card_instruction_text: 'Режим применения и ограничения необходимо сверять с инструкцией.',
    product_aqualor_baby_formula_label: 'Формула',
    product_aqualor_baby_formula_heading: 'В центре — морская вода, возрастной формат и капли',
    product_aqualor_baby_formula_intro: 'Упаковка показана гармонично, а линии заведены под карточки снизу, чтобы при движении элементы оставались визуально связанными.',
    product_aqualor_baby_formula_seawater_title: 'Морская вода',
    product_aqualor_baby_formula_seawater_text: 'Основа продукта — раствор морской воды.',
    product_aqualor_baby_formula_age_title: 'С рождения',
    product_aqualor_baby_formula_age_text: 'Возрастной формат вынесен как отдельный акцент на упаковке.',
    product_aqualor_baby_formula_volume_title: '15 мл',
    product_aqualor_baby_formula_volume_text: 'Объем упаковки выделен как компактный формат капель.',
    product_aqualor_baby_usage_label: 'Когда применяют',
    product_aqualor_baby_usage_heading: 'Для ежедневного ухода за носом малыша согласно инструкции',
    product_aqualor_baby_usage_daily_title: 'Ежедневный уход',
    product_aqualor_baby_usage_daily_text: 'Капли можно использовать для бережного ухода за полостью носа согласно инструкции.',
    product_aqualor_baby_usage_hygiene_title: 'Гигиена носа',
    product_aqualor_baby_usage_hygiene_text: 'Использование должно соответствовать инструкции по применению.',
    product_aqualor_baby_usage_doctor_title: 'Ответственный уход',
    product_aqualor_baby_usage_doctor_text: 'Для малышей особенно важно учитывать инструкцию и обращаться к специалисту при сомнениях.',
    product_aqualor_baby_note_title: 'Важно',
    product_aqualor_baby_note_text: 'Аквалор Беби применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_baby_buy_intro: 'Ищите Аквалор Беби у аптечных партнеров STADA в Казахстане.'
,
    product_aqualor_gorlo_benefit1: 'Содержит стерильный гипертонический раствор морской воды',
    product_aqualor_gorlo_benefit2: 'На упаковке указана концентрация соли 19-23 г/л',
    product_aqualor_gorlo_benefit3: 'Формат спрея 50 мл предназначен для орошения и промывания горла согласно инструкции',
    product_aqualor_gorlo_benefit4: 'На упаковке указан возрастной формат для детей с 6 месяцев и взрослых',
    product_aqualor_gorlo_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать индивидуальные ограничения',
    product_aqualor_gorlo_kicker: 'Спрей для горла',
    product_aqualor_gorlo_badge_seawater: 'Морская вода',
    product_aqualor_gorlo_badge_salt: '19-23 г/л',
    product_aqualor_gorlo_badge_volume: '50 мл',
    product_aqualor_gorlo_metric_volume: 'мл в упаковке',
    product_aqualor_gorlo_metric_age: 'с 6 месяцев',
    product_aqualor_gorlo_metric_component: 'раствор морской воды',
    product_aqualor_gorlo_overview_label: 'Уход за горлом',
    product_aqualor_gorlo_overview_heading: 'Аквалор Горло для орошения и промывания горла',
    product_aqualor_gorlo_overview_intro: 'Страница собирает ключевые элементы продукта: стерильный раствор морской воды, гипертоническую концентрацию 19-23 г/л, формат спрея и объем 50 мл.',
    product_aqualor_gorlo_card_seawater_title: 'Морская вода',
    product_aqualor_gorlo_card_seawater_text: 'Стерильный раствор морской воды указан как основа продукта.',
    product_aqualor_gorlo_card_volume_title: '50 мл',
    product_aqualor_gorlo_card_volume_text: 'Компактный формат спрея, показанный на packshot, для применения по инструкции.',
    product_aqualor_gorlo_card_age_title: '6+ месяцев',
    product_aqualor_gorlo_card_age_text: 'На упаковке указан формат для детей с 6 месяцев и взрослых.',
    product_aqualor_gorlo_card_instruction_title: 'По инструкции',
    product_aqualor_gorlo_card_instruction_text: 'Режим применения и ограничения необходимо сверять с инструкцией.',
    product_aqualor_gorlo_formula_label: 'Формула',
    product_aqualor_gorlo_formula_heading: 'В центре — морская вода, концентрация и формат спрея',
    product_aqualor_gorlo_formula_intro: 'Упаковка показана в спокойном размере, а линии заведены под карточки снизу, чтобы связь сохранялась при движении элементов.',
    product_aqualor_gorlo_formula_seawater_title: 'Морская вода',
    product_aqualor_gorlo_formula_seawater_text: 'Основа продукта — стерильный раствор морской воды.',
    product_aqualor_gorlo_formula_age_title: '19-23 г/л',
    product_aqualor_gorlo_formula_age_text: 'Гипертоническая концентрация соли вынесена как отдельный акцент.',
    product_aqualor_gorlo_formula_volume_title: '50 мл',
    product_aqualor_gorlo_formula_volume_text: 'Объем упаковки выделен как компактный формат спрея для горла.',
    product_aqualor_gorlo_usage_label: 'Когда применяют',
    product_aqualor_gorlo_usage_heading: 'Для орошения и промывания горла согласно инструкции',
    product_aqualor_gorlo_usage_daily_title: 'Орошение горла',
    product_aqualor_gorlo_usage_daily_text: 'Спрей можно использовать для орошения горла согласно инструкции.',
    product_aqualor_gorlo_usage_hygiene_title: 'Промывание',
    product_aqualor_gorlo_usage_hygiene_text: 'Применение должно соответствовать инструкции по использованию.',
    product_aqualor_gorlo_usage_doctor_title: 'Ответственный уход',
    product_aqualor_gorlo_usage_doctor_text: 'При воспалении, боли или сомнениях важно учитывать инструкцию и обращаться к специалисту.',
    product_aqualor_gorlo_note_title: 'Важно',
    product_aqualor_gorlo_note_text: 'Аквалор Горло применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_gorlo_buy_intro: 'Ищите Аквалор Горло у аптечных партнеров STADA в Казахстане.'
,
    product_aqualor_soft_benefit1: 'Содержит стерильный изотонический раствор морской воды',
    product_aqualor_soft_benefit2: 'На упаковке и аптечных карточках указана концентрация соли 8-11 г/л',
    product_aqualor_soft_benefit3: 'Формат душ 125 мл предназначен для орошения и промывания полости носа согласно инструкции',
    product_aqualor_soft_benefit4: 'На аптечной карточке указан возрастной формат с 6 месяцев',
    product_aqualor_soft_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать индивидуальные ограничения',
    product_aqualor_soft_kicker: 'Душ для носа',
    product_aqualor_soft_badge_seawater: 'Морская вода',
    product_aqualor_soft_badge_salt: '8-11 г/л',
    product_aqualor_soft_badge_volume: '125 мл',
    product_aqualor_soft_metric_volume: 'мл в упаковке',
    product_aqualor_soft_metric_age: 'с 6 месяцев',
    product_aqualor_soft_metric_component: 'раствор морской воды',
    product_aqualor_soft_overview_label: 'Уход за носом',
    product_aqualor_soft_overview_heading: 'Аквалор Софт для мягкого орошения и промывания носа',
    product_aqualor_soft_overview_intro: 'Страница собирает ключевые элементы продукта: стерильный раствор морской воды, изотоническую концентрацию 8-11 г/л, формат душ и объем 125 мл.',
    product_aqualor_soft_card_seawater_title: 'Морская вода',
    product_aqualor_soft_card_seawater_text: 'Стерильный раствор морской воды указан как основа продукта.',
    product_aqualor_soft_card_volume_title: '125 мл',
    product_aqualor_soft_card_volume_text: 'Формат упаковки 125 мл подходит для регулярного применения по инструкции.',
    product_aqualor_soft_card_age_title: '6+ месяцев',
    product_aqualor_soft_card_age_text: 'Возрастной формат вынесен согласно информации аптечных карточек.',
    product_aqualor_soft_card_instruction_title: 'По инструкции',
    product_aqualor_soft_card_instruction_text: 'Режим применения и ограничения необходимо сверять с инструкцией.',
    product_aqualor_soft_formula_label: 'Формула',
    product_aqualor_soft_formula_heading: 'В центре — морская вода, изотоническая концентрация и формат душ',
    product_aqualor_soft_formula_intro: 'Упаковка показана в спокойном размере, а линии заведены под карточки снизу, чтобы связь сохранялась при левитации.',
    product_aqualor_soft_formula_seawater_title: 'Морская вода',
    product_aqualor_soft_formula_seawater_text: 'Основа продукта — стерильный раствор морской воды.',
    product_aqualor_soft_formula_salt_title: '8-11 г/л',
    product_aqualor_soft_formula_salt_text: 'Изотоническая концентрация соли вынесена как отдельный акцент.',
    product_aqualor_soft_formula_volume_title: '125 мл',
    product_aqualor_soft_formula_volume_text: 'Объем упаковки выделен как формат для орошения и промывания носа.',
    product_aqualor_soft_usage_label: 'Когда применяют',
    product_aqualor_soft_usage_heading: 'Для орошения и промывания полости носа согласно инструкции',
    product_aqualor_soft_usage_daily_title: 'Орошение носа',
    product_aqualor_soft_usage_daily_text: 'Формат душ можно использовать для орошения полости носа согласно инструкции.',
    product_aqualor_soft_usage_hygiene_title: 'Промывание',
    product_aqualor_soft_usage_hygiene_text: 'Применение должно соответствовать инструкции по использованию.',
    product_aqualor_soft_usage_doctor_title: 'Ответственный уход',
    product_aqualor_soft_usage_doctor_text: 'При выраженных симптомах или сомнениях важно учитывать инструкцию и обращаться к специалисту.',
    product_aqualor_soft_note_title: 'Важно',
    product_aqualor_soft_note_text: 'Аквалор Софт применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_soft_buy_intro: 'Аквалор Софт доступен у аптечных партнеров STADA в Казахстане.'
,
    product_aqualor_soft_mini_benefit1: 'Содержит стерильный изотонический раствор морской воды',
    product_aqualor_soft_mini_benefit2: 'На упаковке и аптечных карточках указана концентрация соли 8-11 г/л',
    product_aqualor_soft_mini_benefit3: 'Компактный формат душ 50 мл предназначен для орошения и промывания полости носа согласно инструкции',
    product_aqualor_soft_mini_benefit4: 'На аптечной карточке указан возрастной формат с 6 месяцев',
    product_aqualor_soft_mini_benefit5: 'Перед применением важно ознакомиться с инструкцией и учитывать индивидуальные ограничения',
    product_aqualor_soft_mini_kicker: 'Компактный душ для носа',
    product_aqualor_soft_mini_badge_seawater: 'Морская вода',
    product_aqualor_soft_mini_badge_salt: '8-11 г/л',
    product_aqualor_soft_mini_badge_volume: '50 мл',
    product_aqualor_soft_mini_metric_volume: 'мл в упаковке',
    product_aqualor_soft_mini_metric_age: 'с 6 месяцев',
    product_aqualor_soft_mini_metric_component: 'раствор морской воды',
    product_aqualor_soft_mini_overview_label: 'Уход за носом',
    product_aqualor_soft_mini_overview_heading: 'Аквалор Софт мини для мягкого орошения носа в компактном формате',
    product_aqualor_soft_mini_overview_intro: 'Страница собирает ключевые элементы продукта: стерильный раствор морской воды, изотоническую концентрацию 8-11 г/л, формат душ и объем 50 мл.',
    product_aqualor_soft_mini_card_seawater_title: 'Морская вода',
    product_aqualor_soft_mini_card_seawater_text: 'Стерильный раствор морской воды указан как основа продукта.',
    product_aqualor_soft_mini_card_volume_title: '50 мл',
    product_aqualor_soft_mini_card_volume_text: 'Компактный объем удобно брать с собой и применять по инструкции.',
    product_aqualor_soft_mini_card_age_title: '6+ месяцев',
    product_aqualor_soft_mini_card_age_text: 'Возрастной формат вынесен согласно информации аптечных карточек.',
    product_aqualor_soft_mini_card_instruction_title: 'По инструкции',
    product_aqualor_soft_mini_card_instruction_text: 'Режим применения и ограничения необходимо сверять с инструкцией.',
    product_aqualor_soft_mini_formula_label: 'Формула',
    product_aqualor_soft_mini_formula_heading: 'В центре — морская вода, изотоническая концентрация и мини-формат',
    product_aqualor_soft_mini_formula_intro: 'Упаковка показана в спокойном размере, карточки мягко левитируют, а линии заведены снизу под карточки с запасом для движения.',
    product_aqualor_soft_mini_formula_seawater_title: 'Морская вода',
    product_aqualor_soft_mini_formula_seawater_text: 'Основа продукта — стерильный раствор морской воды.',
    product_aqualor_soft_mini_formula_salt_title: '8-11 г/л',
    product_aqualor_soft_mini_formula_salt_text: 'Изотоническая концентрация соли вынесена как отдельный акцент.',
    product_aqualor_soft_mini_formula_volume_title: '50 мл',
    product_aqualor_soft_mini_formula_volume_text: 'Объем упаковки выделен как компактный формат для орошения и промывания носа.',
    product_aqualor_soft_mini_usage_label: 'Когда применяют',
    product_aqualor_soft_mini_usage_heading: 'Для орошения и промывания полости носа согласно инструкции',
    product_aqualor_soft_mini_usage_daily_title: 'Орошение носа',
    product_aqualor_soft_mini_usage_daily_text: 'Формат душ можно использовать для орошения полости носа согласно инструкции.',
    product_aqualor_soft_mini_usage_hygiene_title: 'Промывание',
    product_aqualor_soft_mini_usage_hygiene_text: 'Применение должно соответствовать инструкции по использованию.',
    product_aqualor_soft_mini_usage_doctor_title: 'Ответственный уход',
    product_aqualor_soft_mini_usage_doctor_text: 'При выраженных симптомах или сомнениях важно учитывать инструкцию и обращаться к специалисту.',
    product_aqualor_soft_mini_note_title: 'Важно',
    product_aqualor_soft_mini_note_text: 'Аквалор Софт мини применяют согласно инструкции. Перед использованием ознакомьтесь со способом применения и ограничениями.',
    product_aqualor_soft_mini_buy_intro: 'Аквалор Софт мини доступен у аптечных партнеров STADA в Казахстане.'
  },
  kz: {
    nav_about: 'Компания туралы',
    nav_history: 'Компания тарихы',
    nav_news: 'Жаңалықтар мен медиа',
    nav_products: 'Өнімдер',
    nav_career: 'Мансап',
    hero_kicker: 'STADA Kazakhstan',
    site_name: 'STADA Kazakhstan',
    hero_title1: 'Денсаулыққа қамқорлық',
    hero_sub1: 'Күн сайын сенім артатын сапалы дәрі-дәрмектер.',
    hero_title2: 'Сапаға адалдық',
    hero_sub2: 'STADA тәжірибесі миллиондаған адамның денсаулығын қолдайды.',
    hero_title3: 'Пациенттерге жақын',
    hero_sub3: 'Қазақстан отбасылары үшін қолжетімді шешімдерді дамытамыз.',
    hero_metric_years: 'жылдық тәжірибе',
    hero_metric_countries: 'елдегі қатысу',
    hero_metric_employees: 'қызметкер әлем бойынша',
    hero_media_caption: 'Күн сайын сенім артатын фармацевтикалық сапа',
    hero_caption_office: 'STADA Қазақстанда: пациенттер мен серіктестерге жақын',
        hero_caption_scientists: 'Өндірістің әр кезеңіндегі сапа мен қауіпсіздік',
        hero_caption_awards: 'STADA тұрақты дамуы үшін ESG марапаттары мен мойындауы',
    hero_caption_logo: 'STADA-ның адамдар денсаулығына қамқорлық жасаудағы 130 жылдық тәжірибесі',
    about_heading: 'STADA компаниясы туралы',
    about_par1: 'STADA – жоғары сапалы фармацевтикалық өнімдердің жетекші өндірушісі. 130 жылдық тарихы бар біздің компания дәріхана тәжірибесінен бастау алып, сенімді серіктес ретінде танылған.',
    about_par2: 'Компанияның қызметі үш бағытқа шоғырланған: тұтынушылық денсаулық өнімдері, дженериктер және арнайы препараттар. Бүгінде STADA 100-ден астам елде қызмет етіп, 11 600-ден астам жұмыс орнын қамтамасыз етеді.',
    about_list1: 'Қолжетімділік: біздің дженериктер денсаулық сақтауды баршаға қолжетімді етеді.',
    about_list2: 'Инновациялар: біз өмір сапасын жақсарту үшін ғылыми зерттеулер мен әзірлемелерге инвестиция саламыз.',
    about_list3: 'Сенімділік: біз сіз сенетін серіктес болуға тырысамыз.',
    stats_sales: '4 059 млн € — 2024 жылғы топтың сатылым көлемі',
    stats_employees: '> 11 600 қызметкер',
    stats_countries: '> 100 елдегі қатысу',
        hero_text1: 'CapVest Brain Capital және Cinven компанияларынан STADA-ның бақылау пакетін сатып алуда',
        hero_text2: 'STADA-ның өсу жолы 2024 жылы жалғасады — сатылым мен пайда айтарлықтай өсуде — өсу нарықтан алда.',
        hero_text3: 'Қазақстанда дәрігерлерге сенім зор, бірақ алдын алу әлсіз тұс болып қалуда',
        news_section_lead: 'STADA жаңалықтары, медиа материалдары және өнім жаңартулары бір заманауи блокта.',
        news_1_text: 'Мәміле топтың дамуына жаңа серпін беріп, STADA-ның халықаралық нарықтардағы ұзақ мерзімді стратегиясын күшейтеді.',
        news_2_text: 'Компания фармацевтикалық нарық қарқынынан озып, сатылым мен пайданың тұрақты өсуін көрсетуді жалғастыруда.',
        news_3_text: 'Зерттеулер алдын алудың, қолжетімді ақпараттың және медицина мамандарымен сенімді диалогтың маңызын көрсетеді.',
        news_4_title: 'STADA Top Employer Europe 2025 ретінде танылды',
        news_4_text: 'Бұл мойындау STADA командалары үшін өсу мәдениетін, қызметкерлерге қамқорлықты және даму мүмкіндіктерін көрсетеді.',
        news_5_title: 'STADA портфелі күшті тұтынушылық брендтер мен дженериктерді біріктіреді',
        news_5_text: 'Өнім желісі әртүрлі терапевтикалық бағыттарда пациенттердің денсаулығын қолдауға көмектеседі.',
        news_6_title: 'Enterogermina микрофлора денсаулығын қолдайды',
        news_6_text: 'Пробиотиктер бағыты STADA-ның күнделікті денсаулыққа арналған шешімдерінің маңызды бөлігі болып қала береді.',
        news_7_title: 'Coldrex суық тию маусымындағы танымал бренд болып қала береді',
        news_7_text: 'Суық тию белгілерін жеңілдетуге арналған өнімдер пациенттерге әдеттегі өмір ырғағын сақтауға көмектеседі.',
        news_8_title: 'Vitrum Immunaktiv күнделікті қолдауға арналған',
        news_8_text: 'Витаминді-минералды кешендер өзін жақсы сезінуге бағытталған өнімдер портфелін толықтырады.',
        cta_more: 'Толығырақ',
    // Gallery
    gallery_heading: 'Галерея',
    // Products section
    products_heading: 'Өнімдеріміз',
    product_enterogermina_name: 'Энтерожермина',
    product_enterogermina_capsules_name: 'Энтерожермина капсулалары',
    product_enterogermina_forte_name: 'Энтерожермина Форте',
    product_magneb6kids_name: 'Магне B6 Кидс',
    product_sinulan_duo_name: 'Синулан Дуо',
    product_snup_name: 'Снуп',
    product_edarbi_klo_name: 'Эдарби Кло',
    product_cardiomagnil_name: 'Кардиомагнил',
    product_noshpa_name: 'НО-ШПА',
    product_essentiale_name: 'Эссенциале',
    product_aqualor_name: 'Аквалор',
    product_aqualor_forte_name: 'Аквалор Актив Форте',
    product_aqualor_baby_name: 'Аквалор Беби',
    product_aqualor_gorlo_name: 'Аквалор Горло',
    product_aqualor_soft_name: 'Аквалор Софт',
    product_coldrex_name: 'Колдрекс',
    product_vitrum_immunaktiv_name: 'Витрум Иммунактив',
    // Product page titles and descriptions
    product_enterogermina_page_title: 'Энтерожермина',
    product_enterogermina_page_desc: 'Энтерожермина — пробиотик, дисбактериозды емдеу және алдын алу үшін қолданылады. Bacillus clausii спораларын қамтиды, ішек микрофлорасын қалпына келтіруге көмектеседі.',
    product_enterogermina_capsules_page_title: 'Энтерожермина капсулалары',
    product_enterogermina_capsules_page_desc: 'Энтерожермина капсулалары — Bacillus clausii споралары бар пробиотик, дисбактериозды емдеу және алдын алу үшін қолданылады. Капсула форматы ересектерге және 6 жастан асқан балаларға нұсқаулыққа сай ыңғайлы.',
    product_enterogermina_forte_page_title: 'Энтерожермина Форте',
    product_enterogermina_forte_page_desc: 'Энтерожермина Форте — Bacillus clausii споралары бар пробиотик, дисбактериозды емдеу және алдын алу үшін қолданылады. Суспензия форматы нұсқаулыққа сай күніне 1 рет қабылдауға ыңғайлы.',
    product_magneb6kids_page_title: 'Магне B6 Кидс',
    product_magneb6kids_page_desc: 'Магне B6 Кидс — 4 жастан бастап балаларға арналған магний мен B6 дәрумені бар шайнайтын таблеткалар. Компоненттер жүйке жүйесінің қалыпты жұмысын және энергия алмасуын қолдауға көмектеседі.',
    product_sinulan_duo_page_title: 'Синулан Дуо',
    product_sinulan_duo_page_desc: 'Синулан Дуо — суық тию кезінде тыныс алуды жеңілдетуге және тыныс алу жолдарының денсаулығын қолдауға арналған өсімдік сығындыларының кешені.',
    product_snup_page_title: 'Снуп',
    product_snup_page_desc: 'Снуп — мұрын бітелгенде тыныс алуды жеңілдетуге арналған ксилометазолин мен теңіз суы бар дозаланған мұрын спрейі.',
    product_edarbi_klo_page_title: 'Эдарби Кло',
    product_edarbi_klo_page_desc: 'Эдарби Кло — азилсартан медоксомил калийі мен хлорталидон негізіндегі артериялық қысымды төмендететін біріктірілген препарат.',
    product_cardiomagnil_page_title: 'Кардиомагнил',
    product_cardiomagnil_page_desc: 'Кардиомагнил 150 мг — дәрігер тағайындауы бойынша инфаркт пен тромбоздың профилактикасына арналған магний гидроксиді бар ацетилсалицил қышқылы препараты.',
    product_noshpa_page_title: 'НО-ШПА',
    product_noshpa_page_desc: 'НО-ШПА 40 мг — нұсқаулыққа сай тегіс бұлшықет түйілуін жеңілдетуге арналған дротаверин гидрохлориді бар таблеткалар.',
    product_noshpa_forte_name: 'НО-ШПА Форте',
    product_noshpa_forte_kicker: '80 мг спазмолитик',
    product_noshpa_forte_page_title: 'НО-ШПА Форте',
    product_noshpa_forte_page_desc: 'НО-ШПА Форте 80 мг — нұсқаулыққа сай тегіс бұлшықет түйілуін жеңілдетуге арналған дротаверин гидрохлориді бар таблеткалар.',
    product_noshpa_forte_badge_drotaverine: 'Дротаверин 80 мг',
    product_noshpa_forte_badge_spasm: 'Форте форматы',
    product_noshpa_forte_badge_pack: '24 таблетка',
    product_noshpa_forte_metric_dose: 'мг дротаверин',
    product_noshpa_forte_metric_pack: 'қаптамадағы таблетка',
    product_noshpa_forte_metric_component: 'белсенді компонент',
    product_noshpa_forte_overview_label: 'Түйілулер кезінде',
    product_noshpa_forte_overview_heading: 'НО-ШПА препаратының Форте форматындағы күшейтілген дозасы',
    product_noshpa_forte_overview_intro: 'Бір таблеткада 80 мг дротаверин гидрохлориді бар. Қолдану нұсқаулыққа, дозировкаға және маман ұсынымына сәйкес болуы керек.',
    product_noshpa_forte_card_drotaverine_title: 'Дротаверин',
    product_noshpa_forte_card_drotaverine_text: 'Миотропты спазмолитиктерге жататын препараттың белсенді заты.',
    product_noshpa_forte_card_dose_title: '80 мг',
    product_noshpa_forte_card_dose_text: 'НО-ШПА Форте препаратының бір таблеткасындағы дротаверин гидрохлоридінің дозасы.',
    product_noshpa_forte_card_pack_title: '24 таблетка',
    product_noshpa_forte_card_pack_text: 'Нұсқаулықта көрсетілген схема бойынша қабылдауға арналған 24 таблеткалық қаптама.',
    product_noshpa_forte_card_age_title: '12 жастан бастап',
    product_noshpa_forte_card_age_text: 'Жас шектеулері мен қабылдау режимін нұсқаулықпен салыстыру қажет.',
    product_noshpa_forte_benefit1: 'Әр таблеткада 80 мг дротаверин гидрохлориді бар',
    product_noshpa_forte_benefit2: 'Форте форматы нұсқаулыққа сай қабылдауға арналған',
    product_noshpa_forte_benefit3: 'Нұсқаулықта көрсетілген көрсетілімдер бойынша тегіс бұлшықет түйілулері кезінде қолданылады',
    product_noshpa_forte_benefit4: '24 таблеткалық қаптама ұсынылған қабылдау схемасына ыңғайлы',
    product_noshpa_forte_benefit5: 'Қолданар алдында қарсы көрсетілімдер мен шектеулерді ескеру маңызды',
    product_noshpa_forte_formula_label: 'Формула',
    product_noshpa_forte_formula_heading: 'Ортасында — дротаверин 80 мг, көрсетілімдер және Форте форматы',
    product_noshpa_forte_formula_intro: 'Қаптамадан сызықтар төмендегі карточкаларға өтеді: дозировка, спазмолитикалық бағыт және 24 таблеткалық қаптама.',
    product_noshpa_forte_formula_drotaverine_title: 'Дротаверин',
    product_noshpa_forte_formula_drotaverine_text: 'Дротаверин гидрохлориді 80 мг препараттың белсенді заты болып табылады.',
    product_noshpa_forte_formula_spasm_title: 'Спазмолитикалық бағыт',
    product_noshpa_forte_formula_spasm_text: 'Нұсқаулыққа сай тегіс бұлшықет түйілулері кезінде қолданылады.',
    product_noshpa_forte_formula_pack_title: '24 таблетка',
    product_noshpa_forte_formula_pack_text: 'Қаптама форматы ұсынылған схема бойынша қабылдауға сәйкес келеді.',
    product_noshpa_forte_usage_label: 'Қашан қолданылады',
    product_noshpa_forte_usage_heading: 'Нұсқаулыққа сай тегіс бұлшықет түйілулері кезінде',
    product_noshpa_forte_usage_biliary_title: 'Өт шығару жолдары',
    product_noshpa_forte_usage_biliary_text: 'Нұсқаулықта өт шығару жолдары аурулары кезіндегі тегіс бұлшықет түйілулері көрсетілген.',
    product_noshpa_forte_usage_gi_title: 'Асқазан-ішек жолы',
    product_noshpa_forte_usage_gi_text: 'Асқазан-ішек жолының тегіс бұлшықет түйілулері кезінде қосымша терапия ретінде қолданылуы мүмкін.',
    product_noshpa_forte_usage_doctor_title: 'Жауапты қабылдау',
    product_noshpa_forte_usage_doctor_text: 'Дозаны, ұзақтығын және басқа препараттармен үйлесімділігін нұсқаулықпен және маманмен салыстыру қажет.',
    product_noshpa_forte_note_title: 'Маңызды',
    product_noshpa_forte_note_text: 'НО-ШПА Форте нұсқаулыққа сай қолданылады. Қабылдар алдында қарсы көрсетілімдермен, дозировкасымен танысып, күмән болса дәрігерге жүгініңіз.',
    product_noshpa_forte_buy_intro: 'НО-ШПА Форте 80 мг №24 препаратын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
    product_essentiale_page_title: 'Эссенциале Форте Н',
    product_essentiale_page_desc: 'Эссенциале Форте Н — нұсқаулық пен маман ұсынымдарына сай бауыр функцияларын қолдауға арналған эссенциальды фосфолипидтері бар капсулалар.',
    product_aqualor_page_title: 'Аквалор Экстра Форте',
    product_aqualor_page_desc: 'Аквалор Экстра Форте — нұсқаулыққа сай қатты тұмау кезінде мұрын қуысына күтім жасауға арналған 125 мл стерильді теңіз суы ерітіндісі.',
    product_aqualor_forte_page_title: 'Аквалор Актив Форте',
    product_aqualor_forte_page_desc: 'Аквалор Актив Форте — нұсқаулыққа сай мұрын қуысын күту және шаюға арналған CO2 қосылған 150 мл теңіз суы спрейі.',
    product_aqualor_baby_page_title: 'Аквалор Беби',
    product_aqualor_baby_page_desc: 'Аквалор Беби — нұсқаулыққа сай сәбидің мұрнына күнделікті күтім жасауға арналған 15 мл теңіз суы тамшылары.',
    product_aqualor_gorlo_page_title: 'Аквалор Горло спрей',
    product_aqualor_gorlo_page_desc: 'Аквалор Горло спрей — нұсқаулыққа сай тамақты шаюға және бүркуге арналған 50 мл стерильді гипертониялық теңіз суы ерітіндісі.',
    product_aqualor_soft_page_title: 'Аквалор Софт',
    product_aqualor_soft_page_desc: 'Аквалор Софт — нұсқаулыққа сай мұрын қуысын сулауға және шаюға арналған душ форматындағы 125 мл стерильді изотониялық теңіз суы ерітіндісі.',
    product_aqualor_soft_mini_name: 'Аквалор Софт мини',
    product_aqualor_soft_mini_page_title: 'Аквалор Софт мини',
    product_aqualor_soft_mini_page_desc: 'Аквалор Софт мини — нұсқаулыққа сай мұрын қуысын сулауға және шаюға арналған душ форматындағы 50 мл стерильді изотониялық теңіз суы ерітіндісі.',
    product_related_label: 'Ұқсас тауарлар',
    product_related_heading: 'Аквалордың басқа нұсқалары',
    product_related_intro: 'Аквалор желісінен көлемі, бүрку форматы және қолдану аймағы бойынша ұқсас нұсқаны таңдаңыз.',
        product_back: 'Өнімдерге оралу',
    // Enterogermina benefits
    product_enterogermina_benefit1: 'Ішектің сау микрофлорасын қалпына келтіреді',
    product_enterogermina_benefit2: 'Антибиотиктерге төзімді Bacillus clausii спораларын қамтиды',
    product_enterogermina_benefit3: 'Ыңғайлы сұйық түрі – балалар мен ересектерге арналған',
    product_enterogermina_benefit4: 'Дисбактериозды емдеу және алдын алу үшін қолайлы',
    product_enterogermina_kicker: 'Микрофлораға арналған пробиотик',
    product_enterogermina_badge_spores: 'Bacillus clausii споралары',
    product_enterogermina_badge_pack: '10 флакон',
    product_enterogermina_badge_liquid: 'Сұйық түрі',
    product_enterogermina_metric_spores: 'Bacillus clausii споралары',
    product_enterogermina_metric_pack: 'қаптамадағы флакон',
    product_enterogermina_metric_format: 'дайын сұйық түрі',
    product_enterogermina_overview_label: 'Микрофлораны қолдау',
    product_enterogermina_overview_heading: 'Ішек микрофлорасының тепе-теңдігін қалпына келтіруге арналған формат',
    product_enterogermina_overview_intro: 'Энтерожермина ішек микрофлорасының тепе-теңдігі бұзылғанда және қолайсыз факторлардан кейін пайдалы бактерияларды толықтыруға көмектеседі.',
    product_enterogermina_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_card_bacillus_text: 'Пробиотикалық споралар ішек микрофлорасының қалыпты құрамын қолдауға көмектеседі.',
    product_enterogermina_card_spores_title: 'Споралы түрі',
    product_enterogermina_card_spores_text: 'Споралар қышқыл ортаға төзімді және Bacillus clausii-ді ішекке жеткізуге көмектеседі.',
    product_enterogermina_card_pack_title: '10 флакон',
    product_enterogermina_card_pack_text: 'Қаптама нұсқаулыққа сай ыңғайлы курстық қабылдауға арналған.',
    product_enterogermina_card_format_title: '5 мл',
    product_enterogermina_card_format_text: 'Флаконды ашып, қосымша дайындаусыз қабылдау оңай.',
    product_enterogermina_formula_label: 'Формула',
    product_enterogermina_formula_heading: 'Ортасында — Bacillus clausii және ыңғайлы сұйық түрі',
    product_enterogermina_formula_intro: 'Негізгі акцент қаптамаға қойылған: құрамы, споралардың тұрақтылығы және қабылдау ыңғайлылығы бірден көрінеді.',
    product_enterogermina_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_formula_bacillus_text: 'Пробиотикалық споралар қалыпты ішек микрофлорасын қолдауға көмектеседі.',
    product_enterogermina_formula_spores_title: 'Споралы түрі',
    product_enterogermina_formula_spores_text: 'Споралы түрі бактериялардың ішекке жеткенге дейін тұрақтылығын сақтауға көмектеседі.',
    product_enterogermina_formula_pack_title: 'Дайын суспензия',
    product_enterogermina_formula_pack_text: 'Флакондағы сұйық түрі: алдын ала дайындаусыз қабылдауға ыңғайлы.',
    product_enterogermina_usage_label: 'Қашан өзекті',
    product_enterogermina_usage_heading: 'Күнделікті күтімде ішек микрофлорасын қолдау үшін',
    product_enterogermina_usage_microflora_title: 'Тепе-теңдік бұзылғанда',
    product_enterogermina_usage_microflora_text: 'Нұсқаулыққа сай дисбактериоз кезінде микрофлораны қалпына келтіруге қолайлы.',
    product_enterogermina_usage_antibiotic_title: 'Антибиотиктерден кейін',
    product_enterogermina_usage_antibiotic_text: 'Нұсқаулыққа сай антибактериалды терапия кезінде немесе одан кейін микрофлораны қолдау үшін қолданылуы мүмкін.',
    product_enterogermina_usage_family_title: 'Отбасы үшін',
    product_enterogermina_usage_family_text: 'Сұйық формат қолдану бойынша ұсынымдарды сақтағанда балалар мен ересектерге қолайлы.',
    product_enterogermina_note_title: 'Есте сақтау маңызды',
    product_enterogermina_note_text: 'Қолданар алдында нұсқаулықты оқып, әсіресе балаларға қолданғанда маманмен кеңесіңіз.',
    product_enterogermina_buy_intro: 'Энтерожерминаны Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Enterogermina capsules benefits
    product_enterogermina_capsules_benefit1: 'Дисбактериоз кезінде ішек микрофлорасының тепе-теңдігін қалпына келтіруге көмектеседі',
    product_enterogermina_capsules_benefit2: 'Қолайсыз орта факторларына төзімді Bacillus clausii спораларын қамтиды',
    product_enterogermina_capsules_benefit3: 'Капсула форматын өзіңізбен алып жүру және күнделікті қабылдауға қосу ыңғайлы',
    product_enterogermina_capsules_benefit4: 'Нұсқаулық сақталған жағдайда ересектерге және 6 жастан асқан балаларға жарамды',
    product_enterogermina_capsules_kicker: 'Капсуладағы пробиотик',
    product_enterogermina_capsules_badge_spores: 'Bacillus clausii споралары',
    product_enterogermina_capsules_badge_pack: '12 капсула',
    product_enterogermina_capsules_badge_capsules: 'Капсула түрі',
    product_enterogermina_capsules_metric_spores: 'Bacillus clausii споралары',
    product_enterogermina_capsules_metric_pack: 'қаптамадағы капсула',
    product_enterogermina_capsules_metric_age: '6 жастан асқан балаларға',
    product_enterogermina_capsules_overview_label: 'Микрофлора тепе-теңдігі',
    product_enterogermina_capsules_overview_heading: 'Таныс пробиотикалық қолдау ықшам форматта',
    product_enterogermina_capsules_overview_intro: 'Энтерожермина капсулалары Bacillus clausii-ге бағытталған және сұйық түр қажет емес кезде ұқыпты формат ұсынады.',
    product_enterogermina_capsules_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_capsules_card_bacillus_text: 'Пробиотикалық споралар ішек микрофлорасының қалыпты құрамын қолдауға көмектеседі.',
    product_enterogermina_capsules_card_spores_title: 'Споралы түрі',
    product_enterogermina_capsules_card_spores_text: 'Споралар қышқыл орта әсеріне төзімді және Bacillus clausii-ді ішекке жеткізуге көмектеседі.',
    product_enterogermina_capsules_card_pack_title: '12 капсула',
    product_enterogermina_capsules_card_pack_text: 'Қаптама нұсқаулықта көрсетілген қабылдау режиміне сай ыңғайлы қолдануға арналған.',
    product_enterogermina_capsules_card_age_title: '6 жастан жоғары',
    product_enterogermina_capsules_card_age_text: 'Капсулалар ересектерге және капсуланы жұта алатын 6 жастан асқан балаларға арналған.',
    product_enterogermina_capsules_formula_label: 'Формула',
    product_enterogermina_capsules_formula_heading: 'Ортасында — Bacillus clausii және капсула форматы',
    product_enterogermina_capsules_formula_intro: 'Карточкалар өнімнің үш негізгі акцентін көрсетеді: пробиотикалық споралар, тұрақты форма және 12 капсулалық қаптама.',
    product_enterogermina_capsules_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_capsules_formula_bacillus_text: 'Микрофлора тепе-теңдігі бұзылғанда пайдалы бактерияларды толықтыруға көмектеседі.',
    product_enterogermina_capsules_formula_spores_title: 'Споралар',
    product_enterogermina_capsules_formula_spores_text: 'Споралы түрі бактериялардың ішекке жеткенге дейін тұрақтылығын сақтауға көмектеседі.',
    product_enterogermina_capsules_formula_pack_title: '12 капсула',
    product_enterogermina_capsules_formula_pack_text: 'Ықшам қаптама нұсқаулыққа сай курстық қабылдауға қолайлы.',
    product_enterogermina_capsules_usage_label: 'Қашан өзекті',
    product_enterogermina_capsules_usage_heading: 'Микрофлораны қолдауға арналған ыңғайлы ересек формат',
    product_enterogermina_capsules_usage_microflora_title: 'Дисбактериоз кезінде',
    product_enterogermina_capsules_usage_microflora_text: 'Нұсқаулыққа сай дисбактериозды емдеу және алдын алу үшін қолданылуы мүмкін.',
    product_enterogermina_capsules_usage_antibiotic_title: 'Антибиотиктерден кейін',
    product_enterogermina_capsules_usage_antibiotic_text: 'Маман ұсынымы бойынша антибактериялық терапия кезінде немесе одан кейін микрофлораны қолдауға орынды.',
    product_enterogermina_capsules_usage_format_title: 'Формат маңызды болғанда',
    product_enterogermina_capsules_usage_format_text: 'Капсулаларды сақтау, өзіңізбен алып жүру және қосымша дайындаусыз қабылдау ыңғайлы.',
    product_enterogermina_capsules_note_title: 'Есте сақтау маңызды',
    product_enterogermina_capsules_note_text: 'Қолданар алдында нұсқаулықты оқыңыз. Бала капсуланы жұта алмаса, капсулалар 6 жасқа дейінгі балаларға ұсынылмайды.',
    product_enterogermina_capsules_buy_intro: 'Энтерожермина капсулаларын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Enterogermina Forte benefits
    product_enterogermina_forte_benefit1: 'Дисбактериоз кезінде ішек микрофлорасының тепе-теңдігін қалпына келтіруге көмектеседі',
    product_enterogermina_forte_benefit2: 'Қолайсыз орта факторларына төзімді Bacillus clausii спораларын қамтиды',
    product_enterogermina_forte_benefit3: 'Қабылдау режимі ыңғайлы — нұсқаулыққа сай күніне 1 рет',
    product_enterogermina_forte_benefit4: 'Флакондағы суспензия форматы курстық қолдануға қолайлы',
    product_enterogermina_forte_kicker: 'Күшейтілген форматтағы пробиотик',
    product_enterogermina_forte_badge_spores: 'Bacillus clausii споралары',
    product_enterogermina_forte_badge_daily: 'күніне 1 рет',
    product_enterogermina_forte_badge_pack: '10 флакон',
    product_enterogermina_forte_metric_spores: 'Bacillus clausii споралары',
    product_enterogermina_forte_metric_daily: 'рет күніне',
    product_enterogermina_forte_metric_pack: 'қаптамадағы флакон',
    product_enterogermina_forte_overview_label: 'Микрофлораны қолдау',
    product_enterogermina_forte_overview_heading: 'Форте форматындағы таныс пробиотикалық қолдау',
    product_enterogermina_forte_overview_intro: 'Энтерожермина Форте Bacillus clausii-ге бағытталған және ішек микрофлорасының тепе-теңдігін қалпына келтіруге арналған ыңғайлы қолдану режимін көрсетеді.',
    product_enterogermina_forte_card_bacillus_title: 'Bacillus clausii',
    product_enterogermina_forte_card_bacillus_text: 'Пробиотикалық споралар ішек микрофлорасының қалыпты құрамын қолдауға көмектеседі.',
    product_enterogermina_forte_card_spores_title: 'Споралы түрі',
    product_enterogermina_forte_card_spores_text: 'Споралар қышқыл орта әсеріне төзімді және Bacillus clausii-ді ішекке жеткізуге көмектеседі.',
    product_enterogermina_forte_card_daily_title: 'Күніне 1 рет',
    product_enterogermina_forte_card_daily_text: 'Қабылдау режимі өнімді нұсқаулыққа сай күнделікті графикке қосуға көмектеседі.',
    product_enterogermina_forte_card_pack_title: '10 флакон',
    product_enterogermina_forte_card_pack_text: 'Суспензия флакондары бар қаптама ұқыпты курстық қабылдауға қолайлы.',
    product_enterogermina_forte_formula_label: 'Формула',
    product_enterogermina_forte_formula_heading: 'Ортасында — Bacillus clausii, суспензия және Форте форматы',
    product_enterogermina_forte_formula_intro: 'Блок өнімнің үш негізгі акцентін көрсетеді: пробиотикалық споралар, тұрақты форма және дайын суспензия.',
    product_enterogermina_forte_formula_bacillus_title: 'Bacillus clausii',
    product_enterogermina_forte_formula_bacillus_text: 'Микрофлора тепе-теңдігі бұзылғанда пайдалы бактерияларды толықтыруға көмектеседі.',
    product_enterogermina_forte_formula_spores_title: 'Споралар',
    product_enterogermina_forte_formula_spores_text: 'Споралы түрі бактериялардың ішекке жеткенге дейін тұрақтылығын сақтауға көмектеседі.',
    product_enterogermina_forte_formula_pack_title: 'Дайын суспензия',
    product_enterogermina_forte_formula_pack_text: 'Флакондағы сұйық түрі: алдын ала дайындаусыз қабылдауға ыңғайлы.',
    product_enterogermina_forte_usage_label: 'Қашан өзекті',
    product_enterogermina_forte_usage_heading: 'Күніне 1 рет форматында ішек микрофлорасын қолдау үшін',
    product_enterogermina_forte_usage_microflora_title: 'Дисбактериоз кезінде',
    product_enterogermina_forte_usage_microflora_text: 'Нұсқаулыққа сай дисбактериозды емдеу және алдын алу үшін қолданылуы мүмкін.',
    product_enterogermina_forte_usage_antibiotic_title: 'Антибиотиктерден кейін',
    product_enterogermina_forte_usage_antibiotic_text: 'Маман ұсынымы бойынша антибактериялық терапия кезінде немесе одан кейін микрофлораны қолдауға орынды.',
    product_enterogermina_forte_usage_daily_title: 'Режим маңызды болғанда',
    product_enterogermina_forte_usage_daily_text: 'Күніне 1 рет қабылдау күнделікті қолдану схемасын күрделендірмеуге көмектеседі.',
    product_enterogermina_forte_note_title: 'Есте сақтау маңызды',
    product_enterogermina_forte_note_text: 'Қолданар алдында нұсқаулықты оқып, әсіресе балаларға қолданғанда маманмен кеңесіңіз.',
    product_enterogermina_forte_buy_intro: 'Энтерожермина Фортені Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Career page translations (added)
    career_heading: 'STADA компаниясындағы мансап',
    career_par1: 'STADA-да жұмыс істеу – бұл бірегей саяхат. Біз түлектерге арналған бастапқы лауазымдардан бастап сарапшылық позицияларға дейін әртүрлі және қызықты рөлдерді ұсынамыз. Біздің бос орындар дағдылардың кең ауқымын қамтиды және тек фармацевтика саласымен шектелмейді – сіз жеткізілім тізбегі, маркетинг, қаржы, жобаларды басқару және тағы басқа салаларда мүмкіндіктер таба аласыз.',
    career_fact1: 'басшылар – әйелдер',
    career_fact2: 'қызметкерлер біздің «Адамдардың денсаулығына сенімді серіктес ретінде қамқорлық жасау» мақсатымызды мақтан тұтады',
    career_fact3: 'қызметкер әлем бойынша',
    career_fact4: 'командамызда 93 ұлт өкілі',
    career_fact5: 'Sustainalytics ESG 2023 рейтингі бойынша фармацевтикалық компаниялардың жоғарғы 6%-ы',
    career_button: 'Вакансияларды көру',
    hero_products_label: 'БІЗДІҢ ӨНІМДЕР',
    hero_products_heading: 'Үздік өмір үшін сапалы дәрілер',
    hero_products_description: 'Біз әртүрлі терапевтік салаларда жоғары сапалы дженериктер мен тұтынушылар денсаулығы өнімдерінің кең ассортиментін ұсынамыз.',
    button_products: 'Өнімдер',
    products_browse_catalog: 'Каталогты көру',
    products_metric_portfolio: 'каталогтағы өнім',
    products_metric_areas: 'терапевтік бағыт',
    products_catalog_label: 'STADA каталогы',
    products_catalog_intro: 'Бағытты таңдаңыз немесе өнім карточкасын ашып, құрамы, артықшылықтары және сатып алу орындары туралы көбірек біліңіз.',
    products_filter_all: 'Барлық өнімдер',
    products_category_cold: 'Суық тию және тыныс алу',
    products_category_immunity: 'Иммунитет',
    products_category_digestive: 'Ас қорыту',
    products_category_kids: 'Балаларға арналған',
    products_category_cardio: 'Кардио',
    products_category_respiratory: 'Тыныс алу жолдары',
    products_partners_heading: 'Дәріханалар мен онлайн-сервистерде қолжетімді',
    products_partners_intro: 'STADA өнімдерін Қазақстандағы серіктестерден табуға болады: ірі дәріхана желілерінен бастап ыңғайлы цифрлық сервистерге дейін.',
    footer_pill: 'STADA Қазақстан',
    footer_heading: 'Денсаулыққа қамқорлық сенімді ақпараттан басталады',
    footer_lead: 'Өнімдер каталогын ашыңыз, компания туралы көбірек біліңіз немесе STADA-дағы мансап мүмкіндіктерін қараңыз.',
    footer_catalog_cta: 'Каталогты ашу',
    footer_career_cta: 'STADA мансабы',
    footer_brand_text: 'Біз STADA-ның халықаралық тәжірибесін Қазақстандағы пациенттерге, мамандарға және серіктестерге жақындықпен біріктіреміз.',
    footer_trust_years: '130+ жыл тәжірибе',
    footer_trust_countries: '100+ ел',
    footer_company_title: 'Компания',
    footer_products_title: 'Өнімдер',
    footer_access_title: 'Қолжетімділік',
    footer_global_link: 'STADA Global',
    footer_warning_title: 'Маңызды',
    footer_warning_text: 'Сайттағы ақпарат маман кеңесін алмастырмайды. Дәрілік заттарды қолданар алдында нұсқаулықпен танысыңыз.',
    footer_rights: 'Барлық құқықтар қорғалған.',
    footer_back_top: 'Жоғары',
    where_to_buy_heading: 'Қайдан сатып алуға болады',
    benefits_heading: 'Артықшылықтар',
    
    // Coldrex page title and description
    product_coldrex_page_title: 'Колдрекс',
    product_coldrex_page_desc: 'Колдрекс — суық тию мен тұмаудың белгілерін жеңілдететін кешенді препарат.',
    // Coldrex benefits
    product_coldrex_benefit1: 'Парацетамол жоғары температураны төмендетуге және ауырсынуды жеңілдетуге көмектеседі',
    product_coldrex_benefit2: 'Фенилэфрин мұрын мен қойнаулардың бітелуін азайтуға көмектеседі',
    product_coldrex_benefit3: 'C дәрумені формуланы толықтырып, суық тию маусымында ағзаны қолдайды',
    product_coldrex_benefit4: 'Ыстық сусын форматы қабылдауды үйреншікті әрі жайлы етеді',
    product_coldrex_benefit5: 'Кешенді әсер суық тию мен тұмаудың негізгі симптомдарына бағытталған',
    product_coldrex_benefit6: 'Нұсқаулыққа сай, жас пен қарсы көрсетілімдерді ескере отырып қолданылады',
    product_coldrex_overview_label: 'Өнім туралы',
    product_coldrex_overview_heading: 'Суық тию симптомдары кезіндегі кешенді көмек',
    product_coldrex_overview_intro: 'Колдрекс ХотРем қызуды түсіретін, мұрын бітелуін азайтатын және ағзаны қолдайтын компоненттерді ыстық сусын форматында біріктіріп, суық тию мен тұмаудың типтік симптомдарын жеңілдетуге көмектеседі.',
    product_coldrex_card_format_title: '10 пакетик',
    product_coldrex_card_format_text: 'Қаптама нұсқаулықта көрсетілген схема бойынша бірнеше қабылдауға арналған.',
    product_coldrex_card_action_title: 'Үш бағыт',
    product_coldrex_card_action_text: 'Формула температура, ауырсыну, мұрын бітелуі және жалпы хал-жағдайға бағытталған.',
    product_coldrex_card_vitamin_title: 'C дәрумені',
    product_coldrex_card_vitamin_text: 'Аскорбин қышқылы ағзаға жүктеме артатын маусымда формуланы толықтырады.',
    product_coldrex_card_pack_title: 'Порциялық формат',
    product_coldrex_card_pack_text: 'Әр пакетик ыстық сусынның бір порциясын дайындауға ыңғайлы.',
    product_coldrex_formula_label: 'Формула',
    product_coldrex_formula_heading: 'Кешенді әсердің үш компоненті',
    product_coldrex_formula_intro: 'Колдрекс ХотРем формуласы суық тиюдің негізгі симптомдарын жеңілдетуге және ағзаны қолдауға арналған компоненттерді біріктіреді.',
    product_coldrex_formula_paracetamol_title: 'Парацетамол',
    product_coldrex_formula_paracetamol_text: 'Жоғары температураны төмендетуге, бас ауыруы, тамақ ауыруы және дене сырқырауын жеңілдетуге көмектеседі.',
    product_coldrex_formula_phenylephrine_title: 'Фенилэфрин',
    product_coldrex_formula_phenylephrine_text: 'Мұрын мен қойнаулардың бітелуін азайтып, тыныс алуды жеңілдетуге көмектеседі.',
    product_coldrex_formula_vitamin_c_title: 'C дәрумені',
    product_coldrex_formula_vitamin_c_text: 'Формуланы толықтырып, суық тию маусымында ағзаны қолдауға көмектеседі.',
    product_coldrex_usage_label: 'Қашан әсіресе өзекті',
    product_coldrex_usage_heading: 'Температура, ауырсыну және мұрын бітелуі кезінде',
    product_coldrex_usage_fever_title: 'Температура және сырқырау',
    product_coldrex_usage_fever_text: 'Суық тию жоғары температурамен, бас ауыруымен және дене сырқырауымен қатар жүргенде өзекті.',
    product_coldrex_usage_congestion_title: 'Мұрын бітелуі',
    product_coldrex_usage_congestion_text: 'Мұрын мен қойнаулар бітеліп, тыныс алу қиындаған симптомдарда қолайлы.',
    product_coldrex_usage_season_title: 'Суық тию маусымы',
    product_coldrex_usage_season_text: 'Нұсқаулыққа сәйкес суық тию және тұмау кезеңінде симптоматикалық қолдау ретінде қолданылады.',
    product_coldrex_note_title: 'Жауапты қолдану',
    product_coldrex_note_text: 'Қолданар алдында нұсқаулықпен танысып, маманмен кеңесіңіз, әсіресе созылмалы аурулар немесе басқа дәрілерді бірге қабылдау жағдайында.',
    product_coldrex_buy_intro: 'Колдрексті Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Magne B6 Kids
    product_magneb6kids_benefit1: 'Магний мен B6 дәрумені жүйке жүйесінің қалыпты жұмысын қолдауға көмектеседі',
    product_magneb6kids_benefit2: 'Компоненттер энергия алмасуына қатысып, шаршауды азайтуға көмектеседі',
    product_magneb6kids_benefit3: 'B6 дәрумені магнийдің әсерін толықтырып, оның сіңірілуін қолдайды',
    product_magneb6kids_benefit4: 'Формула қалыпты психологиялық функцияны қолдауға көмектеседі',
    product_magneb6kids_benefit5: 'Шайнайтын формат балалардың күнделікті қабылдауына ыңғайлы',
    product_magneb6kids_benefit6: '4 жастан бастап балаларға арналған; дозасы жасына қарай таңдалады',
    product_magneb6kids_kicker: 'Магний + B6 дәрумені',
    product_magneb6kids_badge_age: 'Балаларға 4+',
    product_magneb6kids_badge_chewable: 'Шайнайтын таблеткалар',
    product_magneb6kids_badge_formula: 'Mg + B6',
    product_magneb6kids_metric_magnesium: 'мг магний',
    product_magneb6kids_metric_vitamin: 'B6 дәрумені',
    product_magneb6kids_metric_age: 'балаларға',
    product_magneb6kids_overview_label: 'Өнім туралы',
    product_magneb6kids_overview_heading: 'Баланың күнделікті ырғағына жүйке жүйесін қолдау',
    product_magneb6kids_overview_intro: 'Магне B6 Кидс магний мен B6 дәруменін шайнайтын форматта біріктіріп, нутриенттік қолдауды баланың күнделікті режиміне ыңғайлы енгізуге көмектеседі.',
    product_magneb6kids_card_magnesium_title: '70 мг магний',
    product_magneb6kids_card_magnesium_text: 'Магний жүйке жүйесі мен бұлшықеттердің қалыпты жұмысына және күнделікті зат алмасуға маңызды.',
    product_magneb6kids_card_b6_title: 'B6 дәрумені',
    product_magneb6kids_card_b6_text: 'B6 дәрумені энергия алмасуына қатысып, шаршауды азайтуға көмектеседі.',
    product_magneb6kids_card_format_title: '30 таблетка',
    product_magneb6kids_card_format_text: 'Шайнайтын форма қабылдауды балаға түсінікті әрі үйреншікті етуге көмектеседі.',
    product_magneb6kids_card_age_title: '4 жастан бастап',
    product_magneb6kids_card_age_text: 'Формат 4 жастан асқан балаларға арналған; қабылдау режимі нұсқаулық бойынша таңдалады.',
    product_magneb6kids_formula_label: 'Формула',
    product_magneb6kids_formula_heading: 'Сабырлы қолдаудың үш элементі',
    product_magneb6kids_formula_intro: 'Формула магний, B6 дәрумені және балаларға арналған шайнайтын форматқа негізделген.',
    product_magneb6kids_formula_magnesium_title: 'Магний',
    product_magneb6kids_formula_magnesium_text: 'Жүйке жүйесі мен бұлшықеттердің қалыпты жұмысын қолдауға көмектеседі.',
    product_magneb6kids_formula_b6_title: 'B6 дәрумені',
    product_magneb6kids_formula_b6_text: 'Магнийді толықтырып, энергия алмасу процестеріне қатысады.',
    product_magneb6kids_formula_format_title: 'Балалар форматы',
    product_magneb6kids_formula_format_text: 'Шайнайтын таблеткалар нұсқаулыққа сай күнделікті режимге ыңғайлы қосылады.',
    product_magneb6kids_usage_label: 'Қашан әсіресе өзекті',
    product_magneb6kids_usage_heading: 'Оқу, өсу және белсенді ырғақ кезеңінде',
    product_magneb6kids_usage_school_title: 'Оқу жүктемесі',
    product_magneb6kids_usage_school_text: 'Балаға тұрақты күнделікті ырғақты сақтау маңызды болған кезеңдерде нутриенттік қолдау ретінде жарайды.',
    product_magneb6kids_usage_activity_title: 'Белсенді күндер',
    product_magneb6kids_usage_activity_text: 'Магний мен B6 дәрумені қарқынды кесте кезінде энергия алмасуын қолдауға көмектеседі.',
    product_magneb6kids_usage_diet_title: 'Рацион ерекшеліктері',
    product_magneb6kids_usage_diet_text: 'Рационға магний мен B6 дәрумені бойынша қосымша қолдау қажет болғанда орынды болуы мүмкін.',
    product_magneb6kids_note_title: 'Жауапты қабылдау',
    product_magneb6kids_note_text: 'Қолданар алдында нұсқаулықпен танысып, маманмен кеңесіңіз, әсіресе балада созылмалы аурулар болса немесе басқа құралдарды қабылдаса.',
    product_magneb6kids_buy_intro: 'Магне B6 Кидсті Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Snup benefits
    product_snup_benefit1: 'Ксилометазолин мұрын шырышты қабығының ісінуін азайтып, тыныс алуды жеңілдетуге көмектеседі',
    product_snup_benefit2: 'Әсері қолданғаннан кейін әдетте 5–10 минут ішінде басталады',
    product_snup_benefit3: 'Деконгестанттық әсер бір қолданудан кейін орта есеппен 6–8 сағат сақталады',
    product_snup_benefit4: 'Теңіз суы мұрын шырышты қабығының қалыпты физиологиялық жағдайын қолдайды',
    product_snup_benefit5: '0,1% форматы ересектерге және 6 жастан асқан балаларға арналған',
    product_snup_benefit6: 'Нұсқаулық бойынша қолдану курсы 5–7 күннен аспауы керек',
    product_snup_kicker: 'Мұрын спрейі',
    product_snup_badge_spray: 'Дозаланған спрей',
    product_snup_badge_seawater: 'Теңіз суы',
    product_snup_badge_age: '0,1% үшін 6+',
    product_snup_metric_minutes: 'әсер басталуына минут',
    product_snup_metric_hours: 'орташа әсер сағаты',
    product_snup_metric_doses: 'құтыдағы доза',
    product_snup_overview_label: 'Өнім туралы',
    product_snup_overview_heading: 'Мұрын бітелгенде тыныс алу жеңілдейді',
    product_snup_overview_intro: 'Снуп ксилометазолиннің жергілікті тамыр тарылтатын әсерін және теңіз суын біріктіріп, ринит кезінде шырышты қабықтың ісінуін азайтуға және мұрынмен тыныс алуды жеңілдетуге көмектеседі.',
    product_snup_card_strength_title: '0,1% / 90 мкг',
    product_snup_card_strength_text: 'Қаптамадағы формат нұсқаулыққа сәйкес ересектерге және 6 жастан асқан балаларға арналған.',
    product_snup_card_action_title: 'Ксилометазолин',
    product_snup_card_action_text: 'Деконгестант мұрын шырышты қабығының ісінуі мен гиперемиясын азайтуға көмектеседі.',
    product_snup_card_seawater_title: 'Теңіз суы',
    product_snup_card_seawater_text: 'Компонент шырышты қабықтың физиологиялық жағдайын және кірпікшелі эпителий жұмысын қолдайды.',
    product_snup_card_course_title: '5–7 күн',
    product_snup_card_course_text: 'Ұсынылатын қолдану курсының ұзақтығы 5–7 күннен аспауы керек.',
    product_snup_formula_label: 'Формула',
    product_snup_formula_heading: 'Бір жүйенің үш элементі',
    product_snup_formula_intro: 'Ксилометазолин, теңіз суы және дозаланған формат бірге жұмыс істейді: тыныс алуды жеңілдетуге, шырышты қабықты қолдауға және қолдануды түсінікті етуге көмектеседі.',
    product_snup_formula_active_text: 'Мұрын шырышты қабығының тамырларын тарылтып, ісінуді азайтуға және тыныс алуды жеңілдетуге көмектеседі.',
    product_snup_formula_seawater_text: 'Формуланың әсерін мұрын шырышты қабығының физиологиялық жағдайын қолдаумен толықтырады.',
    product_snup_formula_format_text: 'Дозаланған спрей компоненттердің әсерін нұсқаулық бойынша жергілікті қолданудың үйреншікті форматына біріктіреді.',
    product_snup_usage_label: 'Қашан әсіресе өзекті',
    product_snup_usage_heading: 'Тұмауратқанда, аллергияда және мұрын бітелгенде',
    product_snup_usage_cold_title: 'ЖРВИ кезіндегі ринит',
    product_snup_usage_cold_text: 'Жедел респираторлық аурулар аясындағы ринит кезінде мұрынмен тыныс алуды жеңілдетуге жарамды.',
    product_snup_usage_allergy_title: 'Аллергиялық ринит',
    product_snup_usage_allergy_text: 'Нұсқаулыққа сәйкес аллергиялық ринит және поллиноз кезінде қолданылуы мүмкін.',
    product_snup_usage_sinus_title: 'Мұрын маңы қойнаулары',
    product_snup_usage_sinus_text: 'Мұрын маңы қойнаулары қабынғанда секреттің ағуын жақсарту үшін қолданылады.',
    product_snup_note_title: 'Маңызды ақпарат',
    product_snup_note_text: 'Қолданар алдында нұсқаулықпен танысыңыз. Күніне 3 реттен жиі және 5–7 күннен ұзақ қолданбаңыз; балаларға концентрацияны жасына қарай таңдаңыз.',
    product_snup_buy_intro: 'Снупты Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Sinulan Duo benefits
    product_sinulan_duo_benefit1: 'Өсімдік сығындыларының комбинациясы жоғарғы және төменгі тыныс жолдарын қолдайды',
    product_sinulan_duo_benefit2: 'Жоңышқа иммундық қорғауды және тыныс жолдарының саулығын қолдайды',
    product_sinulan_duo_benefit3: 'Бузина гүлдері табиғи қорғанысты және тыныс жолдарының саулығын қолдайды',
    product_sinulan_duo_benefit4: 'Вербена тыныс алу жүйесін және табиғи қорғанысты нығайтады',
    product_sinulan_duo_benefit5: 'Сары теңгежапырақ тамыры дененің жалпы жағдайын жақсартады',
    product_sinulan_duo_benefit6: '6 жастан бастап ересектер мен балаларға жарамды',
    product_sinulan_duo_kicker: 'Тыныс алуға арналған өсімдік кешені',
    product_sinulan_duo_badge_plant: 'Өсімдік сығындылары',
    product_sinulan_duo_badge_breathing: 'Еркін тыныс алу',
    product_sinulan_duo_badge_age: '6 жастан бастап',
    product_sinulan_duo_metric_complex: 'өсімдік кешені',
    product_sinulan_duo_metric_tablets: 'қаптамадағы таблетка',
    product_sinulan_duo_metric_age: 'балалар мен ересектерге',
    product_sinulan_duo_overview_label: 'Тыныс алу жолдары',
    product_sinulan_duo_overview_heading: 'Өсімдік форматында еркін тыныс алуды қолдау',
    product_sinulan_duo_overview_intro: 'Синулан Дуо тыныс алу жолдарын және ағзаның табиғи қорғанысын қолдау үшін өсімдік компоненттерін біріктіреді.',
    product_sinulan_duo_card_plant_title: 'Өсімдік кешені',
    product_sinulan_duo_card_plant_text: 'Сығындылар комбинациясы жоғарғы және төменгі тыныс алу жолдарын қолдауға көмектеседі.',
    product_sinulan_duo_card_breathing_title: 'Еркін тыныс алу',
    product_sinulan_duo_card_breathing_text: 'Формула суық тию маусымында жайлы тыныс алуды қолдауға бағытталған.',
    product_sinulan_duo_card_format_title: '15 таблетка',
    product_sinulan_duo_card_format_text: 'Нұсқаулыққа сай қабылдауға арналған ыңғайлы таблетка форматы.',
    product_sinulan_duo_card_age_title: '6 жастан бастап',
    product_sinulan_duo_card_age_text: 'Қолдану бойынша ұсынымдарды сақтағанда ересектер мен 6 жастан асқан балаларға жарамды.',
    product_sinulan_duo_formula_label: 'Формула',
    product_sinulan_duo_formula_heading: 'Ортасында — өсімдік кешені және тыныс алуды қолдау',
    product_sinulan_duo_formula_intro: 'Карточкалар өнімнің негізгі қасиеттерін көрсетеді: өсімдік негізі, тыныс алу фокусы және 6 жастан бастап қолдану.',
    product_sinulan_duo_formula_plant_title: 'Өсімдік сығындылары',
    product_sinulan_duo_formula_plant_text: 'Компоненттер кешені тыныс алу жолдарының саулығын қолдауға көмектеседі.',
    product_sinulan_duo_formula_breathing_title: 'Еркін тыныс алу',
    product_sinulan_duo_formula_breathing_text: 'Суық тию және маусымдық жайсыздық кезінде тыныс алуды қолдауға жарамды.',
    product_sinulan_duo_formula_format_title: '6 жастан бастап',
    product_sinulan_duo_formula_format_text: 'Қолдану бойынша ұсынымдарды сақтағанда 6 жастан асқан балалар мен ересектерге жарамды.',
    product_sinulan_duo_usage_label: 'Қашан өзекті',
    product_sinulan_duo_usage_heading: 'Суық тию маусымында тыныс алу жолдарын қолдау үшін',
    product_sinulan_duo_usage_cold_title: 'Суық тигенде',
    product_sinulan_duo_usage_cold_text: 'Нұсқаулыққа сай тыныс алуды және жалпы жай-күйді қолдау үшін қолданылуы мүмкін.',
    product_sinulan_duo_usage_sinus_title: 'Мұрын бітелгенде',
    product_sinulan_duo_usage_sinus_text: 'Өсімдік формуласы тыныс алу жолдарының жайлылығын қолдауға көмектеседі.',
    product_sinulan_duo_usage_family_title: 'Отбасы үшін',
    product_sinulan_duo_usage_family_text: 'Қолдану бойынша ұсынымдарды сақтағанда ересектер мен 6 жастан асқан балаларға жарамды.',
    product_sinulan_duo_note_title: 'Есте сақтау маңызды',
    product_sinulan_duo_note_text: 'Қолданар алдында нұсқаулықты оқып, созылмалы аурулар болса маманмен кеңесіңіз.',
    product_sinulan_duo_buy_intro: 'Синулан Дуоны Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Vitrum Immunaktiv translations
    product_vitrum_immunaktiv_page_title: 'Витрум Иммунактив',
    product_vitrum_immunaktiv_page_desc: 'Витрум Иммунактив — иммунитетті қолдау үшін 13 витамин, 8 минерал және β-глюканнан тұратын витамин-минерал кешені.',
    product_vitrum_immunaktiv_benefit1: 'Иммунитетті қолдау үшін 13 витамин, 8 минерал және β-глюканнан тұратын теңдестірілген формула',
    product_vitrum_immunaktiv_benefit2: 'Иммунитетті күшейтіп, иммундық жасушалардың дұрыс жұмыс істеуін қамтамасыз етеді',
    product_vitrum_immunaktiv_benefit3: 'Денені маусымдық, вирустық және бактериялық инфекциялардан қорғайды',
    product_vitrum_immunaktiv_benefit4: 'Жазылу уақытын қысқартып, асқынулардың қаупін азайтады',
    product_vitrum_immunaktiv_benefit5: 'Аурудан кейінгі тезірек реабилитацияға көмектесіп, қайта ауру қаупін азайтады',
    product_vitrum_immunaktiv_benefit6: '18 жастан асқан ересектерге арналған',
    product_vitrum_immunaktiv_kicker: 'Витамин-минерал кешені',
    product_vitrum_immunaktiv_badge_adults: '18+ ересектерге',
    product_vitrum_immunaktiv_badge_immune: 'Иммунитетті қолдау',
    product_vitrum_immunaktiv_badge_course: 'Курстық қабылдауға',
    product_vitrum_immunaktiv_metric_vitamins: 'витамин',
    product_vitrum_immunaktiv_metric_minerals: 'минерал',
    product_vitrum_immunaktiv_metric_beta: 'β-глюкан',
    product_vitrum_immunaktiv_overview_label: 'Өнім туралы',
    product_vitrum_immunaktiv_overview_heading: 'Жоғары жүктеме кезеңіне арналған кешенді формула',
    product_vitrum_immunaktiv_overview_intro: 'Витрум Иммунактив витамин-минерал негізін және β-глюканды біріктіріп, суық тию маусымында, қарқынды өмір ырғағында және аурудан кейін иммундық жүйенің қалыпты жұмысын қолдауға көмектеседі.',
    product_vitrum_immunaktiv_card_vitamins_title: '13 витамин',
    product_vitrum_immunaktiv_card_vitamins_text: 'Ағзаның маңызды микронутриенттерге күнделікті қажеттілігін толықтыруға көмектеседі.',
    product_vitrum_immunaktiv_card_minerals_title: '8 минерал',
    product_vitrum_immunaktiv_card_minerals_text: 'Зат алмасу процестерін және ағзаның қалыпты жұмысын қолдайды.',
    product_vitrum_immunaktiv_card_beta_title: 'β-глюкан',
    product_vitrum_immunaktiv_card_beta_text: 'Кешенді иммундық қолдауға арналған формуланы толықтыратын компонент.',
    product_vitrum_immunaktiv_card_adults_title: 'Ересектерге',
    product_vitrum_immunaktiv_card_adults_text: 'Формула 18 жастан асқан ересектерге арналған.',
    product_vitrum_immunaktiv_formula_label: 'Формула',
    product_vitrum_immunaktiv_formula_heading: 'Күнделікті қолдаудың үш деңгейі',
    product_vitrum_immunaktiv_formula_intro: 'Құрамы қалыпты иммундық жауап, зат алмасу және ағза ресурстарын қалпына келтіру үшін маңызды нутриенттерге бағытталған.',
    product_vitrum_immunaktiv_formula_vitamins_title: 'Витаминдер',
    product_vitrum_immunaktiv_formula_vitamins_text: 'Витаминдер кешені энергия алмасуын және табиғи қорғаныс қызметтерін қолдауға көмектеседі.',
    product_vitrum_immunaktiv_formula_minerals_title: 'Минералдар',
    product_vitrum_immunaktiv_formula_minerals_text: 'Минералды бөлігі рационды толықтырып, ағзаның төзімділігін қолдайды.',
    product_vitrum_immunaktiv_formula_beta_title: 'β-глюкан',
    product_vitrum_immunaktiv_formula_beta_text: 'β-глюкан өнімнің иммундық жүйені қолдауға бағытталған әсерін толықтырады.',
    product_vitrum_immunaktiv_usage_label: 'Қашан әсіресе өзекті',
    product_vitrum_immunaktiv_usage_heading: 'Маусымға, қалпына келуге және қарқынды өмірге',
    product_vitrum_immunaktiv_usage_season_title: 'Суық тию маусымында',
    product_vitrum_immunaktiv_usage_season_text: 'Иммунитетке жүктеме артатын кезеңдерде күнделікті қолдаудың бір бөлігі ретінде жарамды.',
    product_vitrum_immunaktiv_usage_recovery_title: 'Аурудан кейін',
    product_vitrum_immunaktiv_usage_recovery_text: 'Аурудан кейін қалпына келу кезінде ағза ресурстарын толықтыруға көмектеседі.',
    product_vitrum_immunaktiv_usage_daily_title: 'Белсенді кестеде',
    product_vitrum_immunaktiv_usage_daily_text: 'Витаминдер мен минералдар балансын қолдағысы келетін ересектерге ыңғайлы нұсқа.',
    product_vitrum_immunaktiv_note_title: 'Жауапты қабылдау',
    product_vitrum_immunaktiv_note_text: 'Қолданар алдында нұсқаулықпен танысып, маманмен кеңесіңіз, әсіресе созылмалы аурулар немесе басқа құралдарды бірге қабылдау жағдайында.',
    product_vitrum_immunaktiv_buy_intro: 'Витрум Иммунактивті Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Edarbi Klo benefits
    product_edarbi_klo_benefit1: 'Азилсартан мен хлорталидонның комбинациясы гипертонияны тиімді бақылау үшін',
    product_edarbi_klo_benefit2: 'Азилсартан ангиотензин II-нің тамырларды тарылту және натрийді ұстап қалу әсерін блоктайды',
    product_edarbi_klo_benefit3: 'Хлорталидон натрий мен хлоридтің бөлінуін арттыра отырып, диурез тудырады',
    product_edarbi_klo_benefit4: 'Қан қысымын шеткері кедергіні төмендету арқылы толықтыратын механизмдермен төмендетеді',
    product_edarbi_klo_benefit5: 'Қан қысымын бақылауға бір дәрі жеткіліксіз науқастарға ұсынылады',
    product_edarbi_klo_kicker: 'Қан қысымын біріктірілген бақылау',
    product_edarbi_klo_badge_combo: 'Азилсартан + хлорталидон',
    product_edarbi_klo_badge_pressure: 'Қан қысымын бақылау',
    product_edarbi_klo_badge_pack: '28 таблетка',
    product_edarbi_klo_metric_dose: 'мг белсенді компоненттер',
    product_edarbi_klo_metric_pack: 'қаптамадағы таблетка',
    product_edarbi_klo_metric_mechanism: 'әсер ету механизмі',
    product_edarbi_klo_overview_label: 'Артериялық қысым',
    product_edarbi_klo_overview_heading: 'Гипертонияны бақылауға арналған комбинация',
    product_edarbi_klo_overview_intro: 'Эдарби Кло дәрігердің тағайындауы бойынша артериялық қысымды бақылау үшін азилсартан мен хлорталидонды біріктіреді.',
    product_edarbi_klo_card_azilsartan_title: 'Азилсартан',
    product_edarbi_klo_card_azilsartan_text: 'Тамыр тонусымен байланысты ангиотензин II әсерін тежеуге көмектеседі.',
    product_edarbi_klo_card_chlorthalidone_title: 'Хлорталидон',
    product_edarbi_klo_card_chlorthalidone_text: 'Диуретикалық компонент натрий мен сұйықтықтың шығарылуына ықпал етеді.',
    product_edarbi_klo_card_pack_title: '28 таблетка',
    product_edarbi_klo_card_pack_text: 'Дәрігер тағайындаған схема бойынша тұрақты қабылдауға арналған қаптама форматы.',
    product_edarbi_klo_card_control_title: 'Қысымды бақылау',
    product_edarbi_klo_card_control_text: 'Компоненттер артериялық гипертензия терапиясында бірін-бірі толықтырады.',
    product_edarbi_klo_formula_label: 'Формула',
    product_edarbi_klo_formula_heading: 'Ортасында — екі белсенді компонент',
    product_edarbi_klo_formula_intro: 'Сызықтар азилсартан, хлорталидон және жалпы қысым бақылауы қаптама айналасында қалай бірігетінін көрсетеді.',
    product_edarbi_klo_formula_azilsartan_title: 'Азилсартан',
    product_edarbi_klo_formula_azilsartan_text: 'Компонент ангиотензин II рецепторларын тежеуге бағытталған.',
    product_edarbi_klo_formula_chlorthalidone_title: 'Хлорталидон',
    product_edarbi_klo_formula_chlorthalidone_text: 'Диуретикалық компонент сұйықтық көлемін және тамырларға түсетін жүктемені азайтуға көмектеседі.',
    product_edarbi_klo_formula_control_title: 'Қан қысымын бақылау',
    product_edarbi_klo_formula_control_text: 'Екі әсер ету механизмі жоғары қысымды бақылауда бірін-бірі толықтырады.',
    product_edarbi_klo_usage_label: 'Қашан тағайындалады',
    product_edarbi_klo_usage_heading: 'Біріктірілген қысым бақылауы қажет пациенттерге',
    product_edarbi_klo_usage_pressure_title: 'Артериялық гипертензия',
    product_edarbi_klo_usage_pressure_text: 'Жоғары артериялық қысымды төмендету үшін дәрігердің тағайындауы бойынша қолданылады.',
    product_edarbi_klo_usage_combo_title: 'Бір препарат жеткіліксіз болғанда',
    product_edarbi_klo_usage_combo_text: 'Монотерапия қажетті бақылауды қамтамасыз етпесе, компоненттер комбинациясы тағайындалуы мүмкін.',
    product_edarbi_klo_usage_routine_title: 'Күнделікті схема',
    product_edarbi_klo_usage_routine_text: 'Қабылдау режимін дәрігер анықтайды; ұсыныстарды және қысым бақылауын сақтау маңызды.',
    product_edarbi_klo_note_title: 'Маңызды',
    product_edarbi_klo_note_text: 'Эдарби Кло дәрігердің тағайындауы бойынша қолданылады. Қолданар алдында нұсқаулықпен танысыңыз және терапия схемасын өз бетіңізше өзгертпеңіз.',
    product_edarbi_klo_buy_intro: 'Эдарби Кло препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Cardiomagnil
    product_cardiomagnil_benefit1: 'Құрамында үлбірлі қабықпен қапталған таблетка форматында 150 мг ацетилсалицил қышқылы бар',
    product_cardiomagnil_benefit2: 'Магний гидроксиді препарат құрамына асқазан шырышты қабығын қорғаумен байланысты компонент ретінде кіреді',
    product_cardiomagnil_benefit3: 'Дәрігер тағайындауы бойынша инфаркт пен тромбоз профилактикасында қолданылады',
    product_cardiomagnil_benefit4: '30 таблеткадан тұратын қаптама нұсқаулыққа сай тұрақты қабылдау курсына ыңғайлы',
    product_cardiomagnil_benefit5: 'Тағайындалған схеманы сақтау және ацетилсалицил қышқылына қарсы көрсетілімдерді ескеру маңызды',
    product_cardiomagnil_kicker: 'Антиагреганттық терапия',
    product_cardiomagnil_badge_asa: 'АСК 150 мг',
    product_cardiomagnil_badge_magnesium: 'Магний гидроксиді',
    product_cardiomagnil_badge_pack: '30 таблетка',
    product_cardiomagnil_metric_dose: 'мг ацетилсалицил қышқылы',
    product_cardiomagnil_metric_pack: 'қаптамадағы таблетка',
    product_cardiomagnil_metric_component: 'белсенді компонент',
    product_cardiomagnil_overview_label: 'Жүрек-қантамыр профилактикасы',
    product_cardiomagnil_overview_heading: 'Дәрігер тағайындаған профилактикаға арналған 150 мг Кардиомагнил',
    product_cardiomagnil_overview_intro: 'Кардиомагнил ацетилсалицил қышқылы мен магний гидроксидін үлбірлі қабықпен қапталған таблеткада біріктіреді. Қолдану нұсқаулық пен маман ұсынымдарын сақтауды талап етеді.',
    product_cardiomagnil_card_asa_title: 'Ацетилсалицил қышқылы',
    product_cardiomagnil_card_asa_text: 'Дәрігер тағайындауы бойынша антиагреганттық терапияда қолданылатын препараттың белсенді компоненті.',
    product_cardiomagnil_card_magnesium_title: 'Магний гидроксиді',
    product_cardiomagnil_card_magnesium_text: 'Тұз қышқылын бейтараптандырып, бүркеуші қасиет көрсететін құрам компоненті.',
    product_cardiomagnil_card_dose_title: '150 мг',
    product_cardiomagnil_card_dose_text: 'Ұсынылған қаптама форматында көрсетілген ацетилсалицил қышқылының дозасы.',
    product_cardiomagnil_card_pack_title: '30 таблетка',
    product_cardiomagnil_card_pack_text: 'Дәрігер анықтаған схема бойынша қабылдауға арналған қаптама форматы.',
    product_cardiomagnil_formula_label: 'Формула',
    product_cardiomagnil_formula_heading: 'Ортасында — АСК, магний және тұрақты формат',
    product_cardiomagnil_formula_intro: 'Көрнекі схема өнімнің негізгі элементтерін көрсетеді: ацетилсалицил қышқылы, магний гидроксиді және 30 таблеткалық қаптама.',
    product_cardiomagnil_formula_asa_title: 'АСК',
    product_cardiomagnil_formula_asa_text: 'Ацетилсалицил қышқылы 150 мг препараттың белсенді заты болып табылады.',
    product_cardiomagnil_formula_magnesium_title: 'Магний гидроксиді',
    product_cardiomagnil_formula_magnesium_text: 'Препарат құрамына кіреді және антацидтік, бүркеуші әсермен байланысты.',
    product_cardiomagnil_formula_pack_title: 'Бақылаудағы курс',
    product_cardiomagnil_formula_pack_text: 'Қаптамадағы 30 таблетка тағайындалған қабылдау режимін сақтауға көмектеседі.',
    product_cardiomagnil_usage_label: 'Қашан тағайындалады',
    product_cardiomagnil_usage_heading: 'Маман ұсынымы бойынша инфаркт пен тромбоз профилактикасы үшін',
    product_cardiomagnil_usage_prevention_title: 'Инфаркт профилактикасы',
    product_cardiomagnil_usage_prevention_text: 'Дәрігер көрсетілімдер мен қауіптерді бағалаған жағдайда профилактикалық схемаларда қолданылуы мүмкін.',
    product_cardiomagnil_usage_thrombosis_title: 'Тромбоз профилактикасы',
    product_cardiomagnil_usage_thrombosis_text: 'Антиагреганттық терапия тұрақты қабылдауды және маман бақылауын талап етеді.',
    product_cardiomagnil_usage_doctor_title: 'Жеке схема',
    product_cardiomagnil_usage_doctor_text: 'Дозаны, ұзақтығын және басқа препараттармен үйлесімділігін дәрігер анықтайды.',
    product_cardiomagnil_note_title: 'Маңызды',
    product_cardiomagnil_note_text: 'Кардиомагнил дәрігердің тағайындауы бойынша қолданылады. Қолданар алдында нұсқаулықпен, қарсы көрсетілімдермен және ықтимал дәрілік өзара әрекеттесулермен танысыңыз.',
    product_cardiomagnil_buy_intro: 'Кардиомагнил препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // No-Spa
    product_noshpa_benefit1: 'Әр таблеткада 40 мг дротаверин гидрохлориді бар',
    product_noshpa_benefit2: 'Нұсқаулыққа сәйкес тегіс бұлшықет түйілуі кезінде қолданылады',
    product_noshpa_benefit3: 'Асқазан-ішек жолдарының тегіс бұлшықет түйілуінде қосымша терапия ретінде қолданылуы мүмкін',
    product_noshpa_benefit4: '24 таблетка форматы ұсынылған схема бойынша қабылдауға ыңғайлы',
    product_noshpa_benefit5: 'Қолданар алдында қарсы көрсетілімдер мен жас шектеулерін ескеру маңызды',
    product_noshpa_kicker: 'Спазмолитик',
    product_noshpa_badge_drotaverine: 'Дротаверин 40 мг',
    product_noshpa_badge_spasm: 'Түйілу кезінде',
    product_noshpa_badge_pack: '24 таблетка',
    product_noshpa_metric_dose: 'мг дротаверин',
    product_noshpa_metric_pack: 'қаптамадағы таблетка',
    product_noshpa_metric_component: 'белсенді компонент',
    product_noshpa_overview_label: 'Түйілу кезінде',
    product_noshpa_overview_heading: 'Тегіс бұлшықет түйілуін жеңілдетуге арналған НО-ШПА 40 мг',
    product_noshpa_overview_intro: 'НО-ШПА құрамында дротаверин гидрохлориді бар және тегіс бұлшықет түйілуі кезінде қолданылады. Қабылдау нұсқаулық пен маман ұсынымдарына сай болуы керек.',
    product_noshpa_card_drotaverine_title: 'Дротаверин',
    product_noshpa_card_drotaverine_text: 'Миотропты спазмолитиктерге жататын препараттың белсенді заты.',
    product_noshpa_card_dose_title: '40 мг',
    product_noshpa_card_dose_text: 'НО-ШПА бір таблеткасындағы дротаверин гидрохлоридінің дозасы.',
    product_noshpa_card_pack_title: '24 таблетка',
    product_noshpa_card_pack_text: 'Нұсқаулыққа сәйкес қабылдауға арналған бір блистері бар қаптама.',
    product_noshpa_card_age_title: '6 жастан бастап',
    product_noshpa_card_age_text: 'Жас шектеулері мен қабылдау режимін нұсқаулықпен салыстыру қажет.',
    product_noshpa_formula_label: 'Формула',
    product_noshpa_formula_heading: 'Ортасында — дротаверин, доза және ыңғайлы формат',
    product_noshpa_formula_intro: 'Схема өнімнің негізгі элементтерін біріктіреді: дротаверин 40 мг, спазмолитикалық бағыт және 24 таблеткалық қаптама.',
    product_noshpa_formula_drotaverine_title: 'Дротаверин',
    product_noshpa_formula_drotaverine_text: 'Дротаверин гидрохлориді 40 мг препараттың белсенді заты болып табылады.',
    product_noshpa_formula_spasm_title: 'Спазмолитикалық әсер',
    product_noshpa_formula_spasm_text: 'Нұсқаулықта көрсетілген көрсетілімдерде тегіс бұлшықет түйілуі кезінде қолданылады.',
    product_noshpa_formula_pack_title: '24 таблетка',
    product_noshpa_formula_pack_text: 'Қаптама форматы ұсынылған қабылдау схемасын сақтауға көмектеседі.',
    product_noshpa_usage_label: 'Қашан қолданылады',
    product_noshpa_usage_heading: 'Нұсқаулыққа сай тегіс бұлшықет түйілуі кезінде',
    product_noshpa_usage_biliary_title: 'Өт шығару жолдары',
    product_noshpa_usage_biliary_text: 'Нұсқаулықта өт шығару жолдары ауруларындағы тегіс бұлшықет түйілулері көрсетілген.',
    product_noshpa_usage_gi_title: 'Асқазан-ішек жолдары',
    product_noshpa_usage_gi_text: 'Асқазан-ішек жолдарының тегіс бұлшықет түйілуінде қосымша терапия ретінде қолданылуы мүмкін.',
    product_noshpa_usage_doctor_title: 'Жауапты қабылдау',
    product_noshpa_usage_doctor_text: 'Дозаны, ұзақтығын және басқа препараттармен үйлесімділігін нұсқаулықпен және маманмен нақтылаған жөн.',
    product_noshpa_note_title: 'Маңызды',
    product_noshpa_note_text: 'НО-ШПА нұсқаулыққа сәйкес қолданылады. Қабылдар алдында қарсы көрсетілімдермен, дозамен танысыңыз және күмән болса дәрігерге жүгініңіз.',
    product_noshpa_buy_intro: 'НО-ШПА препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Essentiale
    product_essentiale_benefit1: 'Құрамында капсула форматындағы эссенциальды фосфолипидтер бар',
    product_essentiale_benefit2: '30 капсулалық қаптама нұсқаулықта көрсетілген схема бойынша қабылдауға ыңғайлы',
    product_essentiale_benefit3: 'Өнім форматы бауыр жасушаларына күтіммен байланысты',
    product_essentiale_benefit4: 'Қаптамада үш бағыт көрсетілген: қорғайды, қалпына келтіреді және бауыр жасушаларының төзімділігін арттырады',
    product_essentiale_benefit5: 'Қолданар алдында нұсқаулықпен танысып, маман ұсынымдарын ескеру маңызды',
    product_essentiale_kicker: 'Бауырға күтім',
    product_essentiale_badge_phospholipids: 'Эссенциальды фосфолипидтер',
    product_essentiale_badge_liver: 'Бауыр жасушалары үшін',
    product_essentiale_badge_pack: '30 капсула',
    product_essentiale_metric_pack: 'қаптамадағы капсула',
    product_essentiale_metric_actions: 'күтім бағыты',
    product_essentiale_metric_component: 'фосфолипидтер',
    product_essentiale_overview_label: 'Бауыр және фосфолипидтер',
    product_essentiale_overview_heading: '30 капсулалық форматтағы Эссенциале Форте Н',
    product_essentiale_overview_intro: 'Бет өнімнің негізгі элементтері айналасында құрылған: эссенциальды фосфолипидтер, 30 капсулалық қаптама және нұсқаулыққа сай жауапты қабылдау.',
    product_essentiale_card_phospholipids_title: 'Эссенциальды фосфолипидтер',
    product_essentiale_card_phospholipids_text: 'Эссенциале Форте Н өнімінің негізі ретінде көрсетілген компоненттер.',
    product_essentiale_card_pack_title: '30 капсула',
    product_essentiale_card_pack_text: 'Packshot-та көрсетілген, нұсқаулық бойынша қабылдауға арналған қаптама форматы.',
    product_essentiale_card_actions_title: '3 бағыт',
    product_essentiale_card_actions_text: 'Қаптамада қорғаныс, қалпына келтіру және бауыр жасушаларының төзімділігін арттыру көрсетілген.',
    product_essentiale_card_instruction_title: 'Нұсқаулық бойынша',
    product_essentiale_card_instruction_text: 'Қабылдау режимі мен шектеулерді нұсқаулықпен және маманмен нақтылау қажет.',
    product_essentiale_formula_label: 'Формула',
    product_essentiale_formula_heading: 'Ортасында — фосфолипидтер, бауыр және жинақы формат',
    product_essentiale_formula_intro: 'Схема өнімді байсалды масштабта көрсетеді: қаптама назарда қалады, бірақ формула карточкалары мен сызықтарын жаппайды.',
    product_essentiale_formula_phospholipids_title: 'Фосфолипидтер',
    product_essentiale_formula_phospholipids_text: 'Эссенциальды фосфолипидтер өнімнің негізгі компоненті ретінде бөлектелген.',
    product_essentiale_formula_liver_title: 'Бауырға күтім',
    product_essentiale_formula_liver_text: 'Беттің визуалды логикасы қаптамадағы ақпаратқа сай бауыр жасушаларын қолдаумен байланысты.',
    product_essentiale_formula_pack_title: '30 капсула',
    product_essentiale_formula_pack_text: 'Орталықтағы қаптама формула жеңіл оқылуы үшін үйлесімді өлшемде берілген.',
    product_essentiale_usage_label: 'Қашан қолданылады',
    product_essentiale_usage_heading: 'Нұсқаулыққа сай бауырға күтім үшін',
    product_essentiale_usage_liver_title: 'Бауыр функциялары',
    product_essentiale_usage_liver_text: 'Өнімді қолдануды нұсқаулықпен және маман ұсынымдарымен салыстыру қажет.',
    product_essentiale_usage_cells_title: 'Бауыр жасушалары',
    product_essentiale_usage_cells_text: 'Қаптамада бауыр жасушаларын қорғау, қалпына келтіру және төзімділігін арттыруға акцент жасалған.',
    product_essentiale_usage_doctor_title: 'Жауапты қабылдау',
    product_essentiale_usage_doctor_text: 'Дозаны, курс ұзақтығын және басқа препараттармен үйлесімділігін маман анықтайды.',
    product_essentiale_note_title: 'Маңызды',
    product_essentiale_note_text: 'Эссенциале Форте Н нұсқаулыққа сәйкес қолданылады. Қабылдар алдында қарсы көрсетілімдермен танысып, күмән болса дәрігерге жүгініңіз.',
    product_essentiale_buy_intro: 'Эссенциале препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Aqualor
    product_aqualor_benefit1: 'Құрамында 125 мл спрей форматындағы стерильді теңіз суы ерітіндісі бар',
    product_aqualor_benefit2: 'Қаптамада қатты тұмауға арналған формат көрсетілген',
    product_aqualor_benefit3: 'Тұздардың гипертониялық концентрациясы 16-27 г/л деп белгіленген',
    product_aqualor_benefit4: 'Мұрын қуысын күту және шаю үшін нұсқаулыққа сәйкес қолданылады',
    product_aqualor_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жеке ерекшеліктерді ескеру маңызды',
    product_aqualor_kicker: 'Теңіз суы спрейі',
    product_aqualor_badge_seawater: 'Теңіз суы',
    product_aqualor_badge_strong: 'Қатты тұмау',
    product_aqualor_badge_volume: '125 мл',
    product_aqualor_metric_volume: 'қаптамадағы мл',
    product_aqualor_metric_concentration: 'г/л концентрация',
    product_aqualor_metric_component: 'теңіз суы ерітіндісі',
    product_aqualor_overview_label: 'Мұрынға күтім',
    product_aqualor_overview_heading: 'Мұрын қуысына күтім жасауға арналған Аквалор Экстра Форте',
    product_aqualor_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: стерильді теңіз суы ерітіндісі, 125 мл формат және қаптамада көрсетілген қатты тұмау кезіндегі қолдану.',
    product_aqualor_card_seawater_title: 'Теңіз суы',
    product_aqualor_card_seawater_text: 'Стерильді теңіз суы ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_card_volume_title: '125 мл',
    product_aqualor_card_volume_text: 'Packshot-та көрсетілген, нұсқаулық бойынша қолдануға арналған қаптама көлемі.',
    product_aqualor_card_concentration_title: '16-27 г/л',
    product_aqualor_card_concentration_text: 'Қаптамада тұздардың гипертониялық концентрациясы белгіленген.',
    product_aqualor_card_instruction_title: 'Нұсқаулық бойынша',
    product_aqualor_card_instruction_text: 'Қолдану режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
    product_aqualor_formula_label: 'Формула',
    product_aqualor_formula_heading: 'Ортасында — теңіз суы, концентрация және спрей форматы',
    product_aqualor_formula_intro: 'Қаптама формула жеңіл оқылуы және компонент карточкаларын жаппауы үшін жинақы өлшемде көрсетілген.',
    product_aqualor_formula_seawater_title: 'Стерильді теңіз суы',
    product_aqualor_formula_seawater_text: 'Өнімнің негізі — стерильді теңіз суы ерітіндісі.',
    product_aqualor_formula_nose_title: 'Мұрын қуысы үшін',
    product_aqualor_formula_nose_text: 'Спрей форматы нұсқаулыққа сай мұрын қуысын күту және шаюмен байланысты.',
    product_aqualor_formula_volume_title: '125 мл',
    product_aqualor_formula_volume_text: 'Қаптама көлемі өнімнің практикалық форматы ретінде бөлектелген.',
    product_aqualor_usage_label: 'Қашан қолданылады',
    product_aqualor_usage_heading: 'Нұсқаулыққа сай қатты тұмау кезінде мұрынға күтім үшін',
    product_aqualor_usage_rhinitis_title: 'Қатты тұмау',
    product_aqualor_usage_rhinitis_text: 'Қаптамада өнім қатты тұмау жағдайына арналған деп көрсетілген.',
    product_aqualor_usage_hygiene_title: 'Мұрынды шаю',
    product_aqualor_usage_hygiene_text: 'Қолдану нұсқаулыққа сәйкес болуы керек.',
    product_aqualor_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_usage_doctor_text: 'Күмән болса, жағдай ерекшеліктері немесе ұзақ симптомдар кезінде маманға жүгінген жөн.',
    product_aqualor_note_title: 'Маңызды',
    product_aqualor_note_text: 'Аквалор Экстра Форте нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_buy_intro: 'Аквалор препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Aqualor Forte
    product_aqualor_forte_benefit1: 'Құрамында 150 мл душ форматындағы табиғи теңіз суының гипертониялық ерітіндісі бар',
    product_aqualor_forte_benefit2: 'Қаптамада ұзаққа созылған тұмауға арналған формат көрсетілген',
    product_aqualor_forte_benefit3: 'Ерітінді CO2-мен байытылған; бұл акцент packshot-та көрсетілген',
    product_aqualor_forte_benefit4: 'Нұсқаулыққа сай 2 жастан бастап балаларға және ересектерге мұрын қуысын күту және шаю үшін қолданылады',
    product_aqualor_forte_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жеке ерекшеліктерді ескеру маңызды',
    product_aqualor_forte_kicker: 'Теңіз суы спрейі',
    product_aqualor_forte_badge_seawater: 'Теңіз суы',
    product_aqualor_forte_badge_co2: 'CO2',
    product_aqualor_forte_badge_volume: '150 мл',
    product_aqualor_forte_metric_volume: 'қаптамадағы мл',
    product_aqualor_forte_metric_age: '2 жастан бастап балаларға',
    product_aqualor_forte_metric_component: 'ерітіндіні байыту',
    product_aqualor_forte_overview_label: 'Мұрынға күтім',
    product_aqualor_forte_overview_heading: 'Мұрын қуысын күту және шаюға арналған Аквалор Актив Форте',
    product_aqualor_forte_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: табиғи теңіз суы, 150 мл көлем, душ форматы және қаптамада көрсетілген CO2 акценті.',
    product_aqualor_forte_card_seawater_title: 'Табиғи теңіз суы',
    product_aqualor_forte_card_seawater_text: 'Табиғи теңіз суының гипертониялық ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_forte_card_volume_title: '150 мл',
    product_aqualor_forte_card_volume_text: 'Packshot-та көрсетілген, нұсқаулық бойынша қолдануға арналған қаптама көлемі.',
    product_aqualor_forte_card_co2_title: 'CO2',
    product_aqualor_forte_card_co2_text: 'Қаптамада ерітіндінің CO2-мен байытылғаны көрсетілген.',
    product_aqualor_forte_card_age_title: '2+',
    product_aqualor_forte_card_age_text: 'Қаптамада 2 жастан бастап балаларға және ересектерге арналған формат көрсетілген.',
    product_aqualor_forte_formula_label: 'Формула',
    product_aqualor_forte_formula_heading: 'Ортасында — теңіз суы, CO2 және душ форматы',
    product_aqualor_forte_formula_intro: 'Формула үйлесімді көрінуі және компонент карточкалары жабылмауы үшін қаптама жинақырақ өлшемде көрсетілген.',
    product_aqualor_forte_formula_seawater_title: 'Теңіз суы',
    product_aqualor_forte_formula_seawater_text: 'Өнімнің негізі — табиғи теңіз суының гипертониялық ерітіндісі.',
    product_aqualor_forte_formula_co2_title: 'CO2-мен байытылған',
    product_aqualor_forte_formula_co2_text: 'CO2 қаптамада жеке визуалды акцент ретінде көрсетілген.',
    product_aqualor_forte_formula_volume_title: '150 мл',
    product_aqualor_forte_formula_volume_text: 'Қаптама көлемі өнімнің практикалық форматы ретінде бөлектелген.',
    product_aqualor_forte_usage_label: 'Қашан қолданылады',
    product_aqualor_forte_usage_heading: 'Нұсқаулыққа сай ұзаққа созылған тұмау кезінде мұрынға күтім үшін',
    product_aqualor_forte_usage_rhinitis_title: 'Ұзаққа созылған тұмау',
    product_aqualor_forte_usage_rhinitis_text: 'Қаптамада өнім ұзаққа созылған тұмау жағдайына арналған деп көрсетілген.',
    product_aqualor_forte_usage_hygiene_title: 'Мұрынды шаю',
    product_aqualor_forte_usage_hygiene_text: 'Қолдану нұсқаулыққа сәйкес болуы керек.',
    product_aqualor_forte_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_forte_usage_doctor_text: 'Күмән болса, жағдай ерекшеліктері немесе ұзақ симптомдар кезінде маманға жүгінген жөн.',
    product_aqualor_forte_note_title: 'Маңызды',
    product_aqualor_forte_note_text: 'Аквалор Актив Форте нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_forte_buy_intro: 'Аквалор Актив Форте препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.',
    // Aqualor Baby
    product_aqualor_baby_benefit1: 'Құрамында 15 мл тамшы форматындағы теңіз суы ерітіндісі бар',
    product_aqualor_baby_benefit2: 'Қаптамада туғаннан бастап қолдануға арналған формат көрсетілген',
    product_aqualor_baby_benefit3: 'Тамшылар нұсқаулыққа сай сәбидің мұрнына жұмсақ күнделікті күтім жасауға арналған',
    product_aqualor_baby_benefit4: 'Ықшам көлемді тұрақты күтім үшін қолда ұстау ыңғайлы',
    product_aqualor_baby_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жасқа қатысты ұсынымдарды ескеру маңызды',
    product_aqualor_baby_kicker: 'Теңіз суы тамшылары',
    product_aqualor_baby_badge_seawater: 'Теңіз суы',
    product_aqualor_baby_badge_from_birth: 'Туғаннан бастап',
    product_aqualor_baby_badge_volume: '15 мл',
    product_aqualor_baby_metric_volume: 'қаптамадағы мл',
    product_aqualor_baby_metric_age: 'сәбилерге арналған',
    product_aqualor_baby_metric_component: 'теңіз суы ерітіндісі',
    product_aqualor_baby_overview_label: 'Сәбидің мұрнына күтім',
    product_aqualor_baby_overview_heading: 'Жұмсақ күнделікті күтімге арналған Аквалор Беби',
    product_aqualor_baby_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: теңіз суы, тамшы форматы, 15 мл көлем және қаптамада көрсетілген туғаннан бастап қолдану.',
    product_aqualor_baby_card_seawater_title: 'Теңіз суы',
    product_aqualor_baby_card_seawater_text: 'Теңіз суы ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_baby_card_volume_title: '15 мл',
    product_aqualor_baby_card_volume_text: 'Packshot-та көрсетілген, нұсқаулық бойынша күтімге арналған ықшам тамшы форматы.',
    product_aqualor_baby_card_age_title: 'Туғаннан бастап',
    product_aqualor_baby_card_age_text: 'Қаптамада туғаннан бастап қолдануға арналған формат көрсетілген.',
    product_aqualor_baby_card_instruction_title: 'Нұсқаулық бойынша',
    product_aqualor_baby_card_instruction_text: 'Қолдану режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
    product_aqualor_baby_formula_label: 'Формула',
    product_aqualor_baby_formula_heading: 'Ортасында — теңіз суы, жас форматы және тамшылар',
    product_aqualor_baby_formula_intro: 'Қаптама үйлесімді өлшемде көрсетілген, ал сызықтар карточкалардың төменгі жағынан кіріп, қозғалыс кезінде байланыс үзілмей көрінеді.',
    product_aqualor_baby_formula_seawater_title: 'Теңіз суы',
    product_aqualor_baby_formula_seawater_text: 'Өнімнің негізі — теңіз суы ерітіндісі.',
    product_aqualor_baby_formula_age_title: 'Туғаннан бастап',
    product_aqualor_baby_formula_age_text: 'Жас форматы қаптамада жеке акцент ретінде көрсетілген.',
    product_aqualor_baby_formula_volume_title: '15 мл',
    product_aqualor_baby_formula_volume_text: 'Қаптама көлемі ықшам тамшы форматы ретінде бөлектелген.',
    product_aqualor_baby_usage_label: 'Қашан қолданылады',
    product_aqualor_baby_usage_heading: 'Нұсқаулыққа сай сәбидің мұрнына күнделікті күтім үшін',
    product_aqualor_baby_usage_daily_title: 'Күнделікті күтім',
    product_aqualor_baby_usage_daily_text: 'Тамшыларды нұсқаулыққа сай мұрын қуысына жұмсақ күтім жасау үшін қолдануға болады.',
    product_aqualor_baby_usage_hygiene_title: 'Мұрын гигиенасы',
    product_aqualor_baby_usage_hygiene_text: 'Қолдану нұсқаулыққа сәйкес болуы керек.',
    product_aqualor_baby_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_baby_usage_doctor_text: 'Сәбилер үшін нұсқаулықты ескеріп, күмән болса маманға жүгіну ерекше маңызды.',
    product_aqualor_baby_note_title: 'Маңызды',
    product_aqualor_baby_note_text: 'Аквалор Беби нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_baby_buy_intro: 'Аквалор Беби препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.'
,
    product_aqualor_gorlo_benefit1: 'Құрамында стерильді гипертониялық теңіз суы ерітіндісі бар',
    product_aqualor_gorlo_benefit2: 'Қаптамада тұз концентрациясы 19-23 г/л деп көрсетілген',
    product_aqualor_gorlo_benefit3: '50 мл спрей форматы нұсқаулыққа сай тамақты бүркуге және шаюға арналған',
    product_aqualor_gorlo_benefit4: 'Қаптамада 6 айдан бастап балаларға және ересектерге арналған формат көрсетілген',
    product_aqualor_gorlo_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жеке шектеулерді ескеру маңызды',
    product_aqualor_gorlo_kicker: 'Тамаққа арналған спрей',
    product_aqualor_gorlo_badge_seawater: 'Теңіз суы',
    product_aqualor_gorlo_badge_salt: '19-23 г/л',
    product_aqualor_gorlo_badge_volume: '50 мл',
    product_aqualor_gorlo_metric_volume: 'қаптамадағы мл',
    product_aqualor_gorlo_metric_age: '6 айдан бастап',
    product_aqualor_gorlo_metric_component: 'теңіз суы ерітіндісі',
    product_aqualor_gorlo_overview_label: 'Тамақ күтімі',
    product_aqualor_gorlo_overview_heading: 'Тамақты бүркуге және шаюға арналған Аквалор Горло',
    product_aqualor_gorlo_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: стерильді теңіз суы ерітіндісі, 19-23 г/л гипертониялық концентрация, спрей форматы және 50 мл көлем.',
    product_aqualor_gorlo_card_seawater_title: 'Теңіз суы',
    product_aqualor_gorlo_card_seawater_text: 'Стерильді теңіз суы ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_gorlo_card_volume_title: '50 мл',
    product_aqualor_gorlo_card_volume_text: 'Packshot-та көрсетілген, нұсқаулық бойынша қолдануға арналған ықшам спрей форматы.',
    product_aqualor_gorlo_card_age_title: '6+ ай',
    product_aqualor_gorlo_card_age_text: 'Қаптамада 6 айдан бастап балаларға және ересектерге арналған формат көрсетілген.',
    product_aqualor_gorlo_card_instruction_title: 'Нұсқаулық бойынша',
    product_aqualor_gorlo_card_instruction_text: 'Қолдану режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
    product_aqualor_gorlo_formula_label: 'Формула',
    product_aqualor_gorlo_formula_heading: 'Ортасында — теңіз суы, концентрация және спрей форматы',
    product_aqualor_gorlo_formula_intro: 'Қаптама тыныш өлшемде көрсетілген, ал сызықтар карточкалардың төменгі жағынан кіріп, қозғалыс кезінде байланыс сақталады.',
    product_aqualor_gorlo_formula_seawater_title: 'Теңіз суы',
    product_aqualor_gorlo_formula_seawater_text: 'Өнімнің негізі — стерильді теңіз суы ерітіндісі.',
    product_aqualor_gorlo_formula_age_title: '19-23 г/л',
    product_aqualor_gorlo_formula_age_text: 'Тұздың гипертониялық концентрациясы жеке акцент ретінде шығарылған.',
    product_aqualor_gorlo_formula_volume_title: '50 мл',
    product_aqualor_gorlo_formula_volume_text: 'Қаптама көлемі тамаққа арналған ықшам спрей форматы ретінде бөлектелген.',
    product_aqualor_gorlo_usage_label: 'Қашан қолданылады',
    product_aqualor_gorlo_usage_heading: 'Нұсқаулыққа сай тамақты бүрку және шаю үшін',
    product_aqualor_gorlo_usage_daily_title: 'Тамақты бүрку',
    product_aqualor_gorlo_usage_daily_text: 'Спрейді нұсқаулыққа сай тамақты бүрку үшін қолдануға болады.',
    product_aqualor_gorlo_usage_hygiene_title: 'Шаю',
    product_aqualor_gorlo_usage_hygiene_text: 'Қолдану пайдалану нұсқаулығына сәйкес болуы керек.',
    product_aqualor_gorlo_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_gorlo_usage_doctor_text: 'Қабыну, ауырсыну немесе күмән болса, нұсқаулықты ескеріп, маманға жүгіну маңызды.',
    product_aqualor_gorlo_note_title: 'Маңызды',
    product_aqualor_gorlo_note_text: 'Аквалор Горло нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_gorlo_buy_intro: 'Аквалор Горло препаратын Қазақстандағы STADA дәріхана серіктестерінен іздеңіз.'
,
    product_aqualor_soft_benefit1: 'Құрамында стерильді изотониялық теңіз суы ерітіндісі бар',
    product_aqualor_soft_benefit2: 'Қаптамада және дәріхана карточкаларында тұз концентрациясы 8-11 г/л деп көрсетілген',
    product_aqualor_soft_benefit3: '125 мл душ форматы нұсқаулыққа сай мұрын қуысын сулауға және шаюға арналған',
    product_aqualor_soft_benefit4: 'Дәріхана карточкасында 6 айдан бастап қолдануға арналған формат көрсетілген',
    product_aqualor_soft_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жеке шектеулерді ескеру маңызды',
    product_aqualor_soft_kicker: 'Мұрынға арналған душ',
    product_aqualor_soft_badge_seawater: 'Теңіз суы',
    product_aqualor_soft_badge_salt: '8-11 г/л',
    product_aqualor_soft_badge_volume: '125 мл',
    product_aqualor_soft_metric_volume: 'қаптамадағы мл',
    product_aqualor_soft_metric_age: '6 айдан бастап',
    product_aqualor_soft_metric_component: 'теңіз суы ерітіндісі',
    product_aqualor_soft_overview_label: 'Мұрын күтімі',
    product_aqualor_soft_overview_heading: 'Мұрынды жұмсақ сулауға және шаюға арналған Аквалор Софт',
    product_aqualor_soft_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: стерильді теңіз суы ерітіндісі, 8-11 г/л изотониялық концентрация, душ форматы және 125 мл көлем.',
    product_aqualor_soft_card_seawater_title: 'Теңіз суы',
    product_aqualor_soft_card_seawater_text: 'Стерильді теңіз суы ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_soft_card_volume_title: '125 мл',
    product_aqualor_soft_card_volume_text: '125 мл қаптама форматы нұсқаулық бойынша тұрақты қолдануға арналған.',
    product_aqualor_soft_card_age_title: '6+ ай',
    product_aqualor_soft_card_age_text: 'Жас форматы дәріхана карточкаларындағы ақпаратқа сай көрсетілген.',
    product_aqualor_soft_card_instruction_title: 'Нұсқаулық бойынша',
    product_aqualor_soft_card_instruction_text: 'Қолдану режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
    product_aqualor_soft_formula_label: 'Формула',
    product_aqualor_soft_formula_heading: 'Ортасында — теңіз суы, изотониялық концентрация және душ форматы',
    product_aqualor_soft_formula_intro: 'Қаптама тыныш өлшемде көрсетілген, ал сызықтар карточкалардың төменгі жағынан кіріп, левитация кезінде байланыс сақталады.',
    product_aqualor_soft_formula_seawater_title: 'Теңіз суы',
    product_aqualor_soft_formula_seawater_text: 'Өнімнің негізі — стерильді теңіз суы ерітіндісі.',
    product_aqualor_soft_formula_salt_title: '8-11 г/л',
    product_aqualor_soft_formula_salt_text: 'Тұздың изотониялық концентрациясы жеке акцент ретінде шығарылған.',
    product_aqualor_soft_formula_volume_title: '125 мл',
    product_aqualor_soft_formula_volume_text: 'Қаптама көлемі мұрынды сулауға және шаюға арналған формат ретінде бөлектелген.',
    product_aqualor_soft_usage_label: 'Қашан қолданылады',
    product_aqualor_soft_usage_heading: 'Нұсқаулыққа сай мұрын қуысын сулау және шаю үшін',
    product_aqualor_soft_usage_daily_title: 'Мұрынды сулау',
    product_aqualor_soft_usage_daily_text: 'Душ форматын нұсқаулыққа сай мұрын қуысын сулау үшін қолдануға болады.',
    product_aqualor_soft_usage_hygiene_title: 'Шаю',
    product_aqualor_soft_usage_hygiene_text: 'Қолдану пайдалану нұсқаулығына сәйкес болуы керек.',
    product_aqualor_soft_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_soft_usage_doctor_text: 'Айқын симптомдар немесе күмән болса, нұсқаулықты ескеріп, маманға жүгіну маңызды.',
    product_aqualor_soft_note_title: 'Маңызды',
    product_aqualor_soft_note_text: 'Аквалор Софт нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_soft_buy_intro: 'Аквалор Софт препаратын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.'
,
    product_aqualor_soft_mini_benefit1: 'Құрамында стерильді изотониялық теңіз суы ерітіндісі бар',
    product_aqualor_soft_mini_benefit2: 'Қаптамада және дәріхана карточкаларында тұз концентрациясы 8-11 г/л деп көрсетілген',
    product_aqualor_soft_mini_benefit3: '50 мл ықшам душ форматы нұсқаулыққа сай мұрын қуысын сулауға және шаюға арналған',
    product_aqualor_soft_mini_benefit4: 'Дәріхана карточкасында 6 айдан бастап қолдануға арналған формат көрсетілген',
    product_aqualor_soft_mini_benefit5: 'Қолданар алдында нұсқаулықпен танысып, жеке шектеулерді ескеру маңызды',
    product_aqualor_soft_mini_kicker: 'Мұрынға арналған ықшам душ',
    product_aqualor_soft_mini_badge_seawater: 'Теңіз суы',
    product_aqualor_soft_mini_badge_salt: '8-11 г/л',
    product_aqualor_soft_mini_badge_volume: '50 мл',
    product_aqualor_soft_mini_metric_volume: 'қаптамадағы мл',
    product_aqualor_soft_mini_metric_age: '6 айдан бастап',
    product_aqualor_soft_mini_metric_component: 'теңіз суы ерітіндісі',
    product_aqualor_soft_mini_overview_label: 'Мұрын күтімі',
    product_aqualor_soft_mini_overview_heading: 'Ықшам форматта мұрынды жұмсақ сулауға арналған Аквалор Софт мини',
    product_aqualor_soft_mini_overview_intro: 'Бет өнімнің негізгі элементтерін біріктіреді: стерильді теңіз суы ерітіндісі, 8-11 г/л изотониялық концентрация, душ форматы және 50 мл көлем.',
    product_aqualor_soft_mini_card_seawater_title: 'Теңіз суы',
    product_aqualor_soft_mini_card_seawater_text: 'Стерильді теңіз суы ерітіндісі өнімнің негізі ретінде көрсетілген.',
    product_aqualor_soft_mini_card_volume_title: '50 мл',
    product_aqualor_soft_mini_card_volume_text: 'Ықшам көлемді бірге алып жүруге және нұсқаулық бойынша қолдануға ыңғайлы.',
    product_aqualor_soft_mini_card_age_title: '6+ ай',
    product_aqualor_soft_mini_card_age_text: 'Жас форматы дәріхана карточкаларындағы ақпаратқа сай көрсетілген.',
    product_aqualor_soft_mini_card_instruction_title: 'Нұсқаулық бойынша',
    product_aqualor_soft_mini_card_instruction_text: 'Қолдану режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
    product_aqualor_soft_mini_formula_label: 'Формула',
    product_aqualor_soft_mini_formula_heading: 'Ортасында — теңіз суы, изотониялық концентрация және мини-формат',
    product_aqualor_soft_mini_formula_intro: 'Қаптама тыныш өлшемде көрсетілген, карточкалар жұмсақ левитация жасайды, ал сызықтар қозғалысқа жеткілікті қорымен карточкалардың төменгі жағынан кіреді.',
    product_aqualor_soft_mini_formula_seawater_title: 'Теңіз суы',
    product_aqualor_soft_mini_formula_seawater_text: 'Өнімнің негізі — стерильді теңіз суы ерітіндісі.',
    product_aqualor_soft_mini_formula_salt_title: '8-11 г/л',
    product_aqualor_soft_mini_formula_salt_text: 'Тұздың изотониялық концентрациясы жеке акцент ретінде шығарылған.',
    product_aqualor_soft_mini_formula_volume_title: '50 мл',
    product_aqualor_soft_mini_formula_volume_text: 'Қаптама көлемі мұрынды сулауға және шаюға арналған ықшам формат ретінде бөлектелген.',
    product_aqualor_soft_mini_usage_label: 'Қашан қолданылады',
    product_aqualor_soft_mini_usage_heading: 'Нұсқаулыққа сай мұрын қуысын сулау және шаю үшін',
    product_aqualor_soft_mini_usage_daily_title: 'Мұрынды сулау',
    product_aqualor_soft_mini_usage_daily_text: 'Душ форматын нұсқаулыққа сай мұрын қуысын сулау үшін қолдануға болады.',
    product_aqualor_soft_mini_usage_hygiene_title: 'Шаю',
    product_aqualor_soft_mini_usage_hygiene_text: 'Қолдану пайдалану нұсқаулығына сәйкес болуы керек.',
    product_aqualor_soft_mini_usage_doctor_title: 'Жауапты күтім',
    product_aqualor_soft_mini_usage_doctor_text: 'Айқын симптомдар немесе күмән болса, нұсқаулықты ескеріп, маманға жүгіну маңызды.',
    product_aqualor_soft_mini_note_title: 'Маңызды',
    product_aqualor_soft_mini_note_text: 'Аквалор Софт мини нұсқаулыққа сәйкес қолданылады. Қолданар алдында қолдану тәсілімен және шектеулермен танысыңыз.',
    product_aqualor_soft_mini_buy_intro: 'Аквалор Софт мини препаратын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.'
  }
};

// Current language state
translations.ru.nav_worldwide = 'Наши филиалы';
translations.kz.nav_worldwide = 'Біздің филиалдарымыз';
Object.assign(translations.ru, {
  worldwide_page_title: 'STADA - Наши филиалы',
  worldwide_eyebrow: 'Глобальное присутствие STADA',
  worldwide_heading: 'Наши филиалы',
  worldwide_subtitle: 'Глобальное присутствие. Локальная экспертиза.',
  worldwide_lead: 'STADA работает на международных рынках и помогает обеспечивать доступ к надежным продуктам для здоровья.',
  worldwide_stat_countries: 'стран с продуктами STADA',
  worldwide_stat_markets: 'ключевых рынков',
  worldwide_stat_standard: 'единый стандарт заботы о здоровье',
  worldwide_overview_eyebrow: 'Интерактивный обзор стран',
  worldwide_overview_heading: 'Глобальное присутствие',
  worldwide_overview_intro: 'Профили стран объединяют данные локальных офисов, контакты и ссылки на официальные сайты.',
  worldwide_country_label: 'Обзор стран',
  worldwide_country_search: 'Поиск страны',
  worldwide_globe_label: 'Интерактивный глобус STADA',
  worldwide_globe_topline: 'COBE WebGL глобус',
  worldwide_globe_fallback_title: 'Глобальная карта',
  worldwide_globe_fallback_text: 'Выберите рынок STADA в обзоре стран.',
  worldwide_globe_hint_regions: 'Региональные офисы',
  worldwide_globe_hint_markets: 'Официальные рынки STADA'
});
Object.assign(translations.kz, {
  worldwide_page_title: 'STADA - Біздің филиалдарымыз',
  worldwide_eyebrow: 'STADA жаһандық қатысуы',
  worldwide_heading: 'Біздің филиалдарымыз',
  worldwide_subtitle: 'Жаһандық қатысу. Жергілікті сараптама.',
  worldwide_lead: 'STADA халықаралық нарықтарда жұмыс істейді және сенімді денсаулық сақтау өнімдеріне қолжетімділікті қолдайды.',
  worldwide_stat_countries: 'STADA өнімдері бар ел',
  worldwide_stat_markets: 'негізгі нарық',
  worldwide_stat_standard: 'денсаулыққа қамқорлықтың ортақ стандарты',
  worldwide_overview_eyebrow: 'Елдерге интерактивті шолу',
  worldwide_overview_heading: 'Жаһандық қатысу',
  worldwide_overview_intro: 'Ел профильдері жергілікті кеңсе деректерін, байланыстарды және ресми сайт сілтемелерін біріктіреді.',
  worldwide_country_label: 'Елдерге шолу',
  worldwide_country_search: 'Елді іздеу',
  worldwide_globe_label: 'STADA интерактивті глобусы',
  worldwide_globe_topline: 'COBE WebGL глобусы',
  worldwide_globe_fallback_title: 'Жаһандық карта',
  worldwide_globe_fallback_text: 'STADA нарығын елдер шолуынан таңдаңыз.',
  worldwide_globe_hint_regions: 'Аймақтық кеңселер',
  worldwide_globe_hint_markets: 'STADA ресми нарықтары'
});

translations.ru.nav_culture = 'Культура';
translations.kz.nav_culture = 'Мәдениет';
Object.assign(translations.ru, {
  culture_page_title: 'STADA - Корпоративная культура',
  culture_eyebrow: 'Культура STADA',
  culture_heading: 'Культура доверия',
  culture_hero_lead: 'Действуем быстро, открыто и ответственно.',
  culture_values_cta: 'Смотреть ценности',
  culture_purpose_cta: 'Наша цель',
  culture_fact_origin: 'аптечные истоки',
  culture_fact_years: 'лет доверия',
  culture_fact_values: 'общие ценности',
  culture_purpose_eyebrow: 'Забота о здоровье людей',
  culture_purpose_heading: 'От аптечных корней к культуре доверия',
  culture_purpose_text_1: 'STADA началась в 1895 году с простой идеи: выпускать лекарства по единым стандартам и делать качественную помощь доступнее.',
  culture_purpose_text_2: 'Сегодня эти корни видны в нашем подходе: ответственность, открытый диалог и фокус на пользе для человека.',
  culture_purpose_label: 'Наша цель',
  culture_purpose_statement: 'Заботиться о здоровье людей как надежный партнер.',
  culture_values_eyebrow: 'Наши ценности',
  culture_values_heading: 'Принципы для ежедневных решений',
  culture_values_intro: 'Четыре ценности помогают командам брать ответственность, быстрее учиться, сотрудничать без барьеров и сохранять доверие.',
  culture_integrity_title: 'Добросовестность',
  culture_integrity_tagline: 'Поступать правильно.',
  culture_trust_title: 'Доверие',
  culture_trust_text: 'Бережно относимся к информации и выбираем честный диалог.',
  culture_compliance_title: 'Соблюдение правил',
  culture_compliance_text: 'Следуем стандартам, признаем ошибки и исправляем причины.',
  culture_respect_title: 'Уважение',
  culture_respect_text: 'Общаемся уважительно и даем конструктивную обратную связь.',
  culture_speakup_title: 'Открытый голос',
  culture_speakup_text: 'Говорим прямо и помогаем улучшать процессы.',
  culture_sustainability_title: 'Устойчивость и разнообразие',
  culture_sustainability_text: 'Ценим индивидуальность и видим различия как силу.',
  culture_entrepreneurship_title: 'Предпринимательство',
  culture_entrepreneurship_tagline: 'Мыслить смело.',
  culture_risk_title: 'Продуманный риск',
  culture_risk_text: 'Принимаем обоснованные решения и убираем лишнее.',
  culture_innovation_title: 'Инновации',
  culture_innovation_text: 'Задаем вопросы привычному и ищем лучшие решения.',
  culture_anticipation_title: 'Предвидение',
  culture_anticipation_text: 'Раньше замечаем потребности пациентов, бизнеса и партнеров.',
  culture_ownership_title: 'Ответственность за идеи',
  culture_ownership_text: 'Берем инициативу и отвечаем за результат.',
  culture_agility_title: 'Гибкость',
  culture_agility_tagline: 'Расти через изменения.',
  culture_open_title: 'Открытость',
  culture_open_text: 'Видим новые возможности и сохраняем фокус на решении.',
  culture_change_title: 'Изменения',
  culture_change_text: 'Быстро адаптируемся и помогаем другим двигаться вместе.',
  culture_challenge_title: 'Вызовы',
  culture_challenge_text: 'Учимся на сложных ситуациях и двигаемся дальше.',
  culture_urgency_title: 'Приоритеты',
  culture_urgency_text: 'Отделяем важное от срочного и действуем без задержек.',
  culture_one_title: 'One STADA',
  culture_one_tagline: 'Сила одной команды.',
  culture_communication_title: 'Коммуникация',
  culture_communication_text: 'Говорим прозрачно, по фактам и по сути.',
  culture_teamwork_title: 'Командная работа',
  culture_teamwork_text: 'Сотрудничаем ради общих целей.',
  culture_growth_title: 'Личный рост',
  culture_growth_text: 'Развиваемся и стремимся быть сильнее в своем деле.',
  culture_complexity_title: 'Сложность',
  culture_complexity_text: 'Используем опыт сети STADA, чтобы упрощать сложное.',
  culture_action_eyebrow: 'Культура в действии',
  culture_action_heading: 'Как ценности работают каждый день',
  culture_action_trust_title: 'Надежность в каждом решении',
  culture_action_trust_text: 'Качество, стандарты и уважение к пациенту остаются нашей основой.',
  culture_action_drive_title: 'Инициатива без лишней сложности',
  culture_action_drive_text: 'Меньше бюрократии, больше ответственности и практических результатов.',
  culture_action_team_title: 'Единая команда на международном уровне',
  culture_action_team_text: 'Локальная экспертиза соединяется с глобальным опытом STADA.',
  culture_next_eyebrow: 'Продолжить знакомство',
  culture_next_heading: 'Узнайте, как история и люди формируют STADA сегодня.',
  culture_history_cta: 'История STADA',
  culture_career_cta: 'Карьера в STADA'
});
Object.assign(translations.kz, {
  culture_page_title: 'STADA - Корпоративтік мәдениет',
  culture_eyebrow: 'STADA мәдениеті',
  culture_heading: 'Сенім мәдениеті',
  culture_hero_lead: 'Жылдам, ашық және жауапты әрекет етеміз.',
  culture_values_cta: 'Құндылықтарды қарау',
  culture_purpose_cta: 'Біздің мақсатымыз',
  culture_fact_origin: 'дәріханалық бастау',
  culture_fact_years: 'жыл сенім',
  culture_fact_values: 'ортақ құндылық',
  culture_purpose_eyebrow: 'Адам денсаулығына қамқорлық',
  culture_purpose_heading: 'Дәріханалық тамырдан сенім мәдениетіне',
  culture_purpose_text_1: 'STADA 1895 жылы дәрілерді бірыңғай стандартпен шығару және сапалы көмекті қолжетімді ету идеясынан басталды.',
  culture_purpose_text_2: 'Бүгінде бұл мұра біздің жұмысымызда көрінеді: жауапкершілік, ашық диалог және адамға пайда әкелуге назар.',
  culture_purpose_label: 'Біздің мақсатымыз',
  culture_purpose_statement: 'Сенімді серіктес ретінде адамдардың денсаулығына қамқорлық жасау.',
  culture_values_eyebrow: 'Біздің құндылықтарымыз',
  culture_values_heading: 'Күнделікті шешімдерге арналған қағидалар',
  culture_values_intro: 'Төрт құндылық жауапкершілік алуға, тез үйренуге, ашық ынтымақтасуға және сенімді сақтауға көмектеседі.',
  culture_integrity_title: 'Адалдық',
  culture_integrity_tagline: 'Дұрыс әрекет ету.',
  culture_trust_title: 'Сенім',
  culture_trust_text: 'Ақпаратқа мұқият қарап, адал диалогты таңдаймыз.',
  culture_compliance_title: 'Ережелерді сақтау',
  culture_compliance_text: 'Стандарттарды ұстанып, қателердің себебін түзетеміз.',
  culture_respect_title: 'Құрмет',
  culture_respect_text: 'Құрметпен сөйлесіп, пайдалы кері байланыс береміз.',
  culture_speakup_title: 'Ашық пікір',
  culture_speakup_text: 'Маңызды сұрақтарды ашық айтып, процестерді жақсартамыз.',
  culture_sustainability_title: 'Тұрақтылық және әртүрлілік',
  culture_sustainability_text: 'Даралықты бағалап, айырмашылықтарды күш ретінде көреміз.',
  culture_entrepreneurship_title: 'Кәсіпкерлік',
  culture_entrepreneurship_tagline: 'Батыл ойлау.',
  culture_risk_title: 'Ойластырылған тәуекел',
  culture_risk_text: 'Негізді шешім қабылдап, артықты алып тастаймыз.',
  culture_innovation_title: 'Инновация',
  culture_innovation_text: 'Үйреншікті тәсілге сұрақ қойып, жақсы шешім іздейміз.',
  culture_anticipation_title: 'Алдын ала көру',
  culture_anticipation_text: 'Пациенттер, бизнес және серіктестер қажеттілігін ерте байқаймыз.',
  culture_ownership_title: 'Идеяға жауапкершілік',
  culture_ownership_text: 'Бастама көтеріп, нәтижеге жауап береміз.',
  culture_agility_title: 'Икемділік',
  culture_agility_tagline: 'Өзгеріс арқылы өсу.',
  culture_open_title: 'Ашықтық',
  culture_open_text: 'Жаңа мүмкіндікті көріп, шешімге назар аударамыз.',
  culture_change_title: 'Өзгеріс',
  culture_change_text: 'Тез бейімделіп, басқаларға бірге қозғалуға көмектесеміз.',
  culture_challenge_title: 'Сын-қатер',
  culture_challenge_text: 'Күрделі жағдайдан үйреніп, алға жылжимыз.',
  culture_urgency_title: 'Басымдықтар',
  culture_urgency_text: 'Маңыздыны шұғылдан ажыратып, кідіріссіз әрекет етеміз.',
  culture_one_title: 'One STADA',
  culture_one_tagline: 'Бір команданың күші.',
  culture_communication_title: 'Коммуникация',
  culture_communication_text: 'Ашық, нақты және фактіге сүйеніп сөйлейміз.',
  culture_teamwork_title: 'Командалық жұмыс',
  culture_teamwork_text: 'Ортақ мақсат үшін бірге жұмыс істейміз.',
  culture_growth_title: 'Жеке өсу',
  culture_growth_text: 'Дамып, өз ісімізде күштірек болуға ұмтыламыз.',
  culture_complexity_title: 'Күрделілік',
  culture_complexity_text: 'STADA тәжірибесін қолданып, күрделіні жеңілдетеміз.',
  culture_action_eyebrow: 'Мәдениет іс жүзінде',
  culture_action_heading: 'Құндылықтар күн сайын қалай жұмыс істейді',
  culture_action_trust_title: 'Әр шешімдегі сенімділік',
  culture_action_trust_text: 'Сапа, стандарттар және пациентке құрмет біздің негізіміз.',
  culture_action_drive_title: 'Артық күрделіліксіз бастама',
  culture_action_drive_text: 'Бюрократия аз, жауапкершілік пен нақты нәтиже көп.',
  culture_action_team_title: 'Халықаралық деңгейдегі бір команда',
  culture_action_team_text: 'Жергілікті сараптама STADA-ның жаһандық тәжірибесімен бірігеді.',
  culture_next_eyebrow: 'Танысуды жалғастыру',
  culture_next_heading: 'STADA тарихы мен адамдары бүгінгі компанияны қалай қалыптастыратынын біліңіз.',
  culture_history_cta: 'STADA тарихы',
  culture_career_cta: 'STADA-дағы мансап'
});

let currentLang = 'ru';
let currentCountry = 'kz';

const STADA_COUNTRY_OPTIONS = [
  {
    code: 'kz',
    label: 'KZ',
    name: 'Kazakhstan',
    backendCountry: 'kazakhstan',
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'kz'],
  },
  {
    code: 'kg',
    label: 'KG',
    name: 'Kyrgyzstan',
    backendCountry: 'kyrgyzstan',
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'kg'],
  },
];

const STADA_COUNTRY_BY_CODE = Object.fromEntries(STADA_COUNTRY_OPTIONS.map(country => [country.code, country]));
const STADA_LANGUAGE_LABELS = {
  ru: 'RU',
  kz: 'KZ',
  kg: 'KG',
};

const productFallbacks = {
  ru: {
    products_category_allergy: 'Аллергия',
    products_category_urology: 'Урология',
    product_vitrum_fizzy: {
      name: 'Витрум Иммунактив шипучие таблетки',
      title: 'Витрум Иммунактив шипучие таблетки',
      desc: 'Шипучий витаминно-минеральный комплекс для поддержки иммунитета взрослых в удобном формате.',
      kicker: 'Витамины для иммунитета',
      badge1: 'Для взрослых 18+',
      badge2: 'Поддержка иммунитета',
      badge3: 'Шипучий формат',
      facts: ['13 витаминов', '8 минералов', '20 таблеток'],
      buy: 'Ищите Витрум Иммунактив шипучие таблетки у аптечных партнеров STADA в Казахстане.'
    },
    product_vitrum_syrop: {
      name: 'Витрум Кидс Проиммун',
      title: 'Витрум Кидс Проиммун',
      desc: 'Детский комплекс для ежедневной поддержки иммунитета и рациона ребенка согласно инструкции.',
      kicker: 'Детская иммунная поддержка',
      badge1: 'Для детей',
      badge2: 'Поддержка иммунитета',
      badge3: 'Удобный прием',
      facts: ['Витамины', 'β-глюкан', 'Детский формат'],
      buy: 'Ищите Витрум Кидс Проиммун у аптечных партнеров STADA в Казахстане.'
    },
    product_vitrum_magneb6: {
      name: 'Витрум Магний B6',
      title: 'Витрум Магний B6',
      desc: 'Комплекс магния и витамина B6 для поддержки нервной системы и нормального энергетического обмена.',
      kicker: 'Магний и витамин B6',
      badge1: 'Для взрослых',
      badge2: 'Магний + B6',
      badge3: '60 таблеток',
      facts: ['Mg', 'B6', '60 таблеток'],
      buy: 'Ищите Витрум Магний B6 у аптечных партнеров STADA в Казахстане.'
    },
    product_vitrum_vitaminc: {
      name: 'Витрум Витамин C 900 мг',
      title: 'Витрум Витамин C 900 мг',
      desc: 'Шипучие таблетки с витамином C 900 мг для поддержки иммунитета и восполнения потребности в витамине C.',
      kicker: 'Витамин C',
      badge1: '900 мг',
      badge2: 'Поддержка иммунитета',
      badge3: 'Шипучий формат',
      facts: ['900 мг', 'Витамин C', '20 таблеток'],
      buy: 'Ищите Витрум Витамин C 900 мг у аптечных партнеров STADA в Казахстане.'
    },
    product_vitrum_energy: {
      name: 'Витрум Энерджи',
      title: 'Витрум Энерджи',
      desc: 'Шипучий витаминно-минеральный комплекс для поддержки энергии, активности и ежедневного тонуса.',
      kicker: 'Энергия и тонус',
      badge1: 'Для взрослых 18+',
      badge2: 'Витамины и минералы',
      badge3: 'Шипучий формат',
      facts: ['12 витаминов', '8 минералов', '20 таблеток'],
      buy: 'Ищите Витрум Энерджи у аптечных партнеров STADA в Казахстане.'
    },
    product_zodak: {
      name: 'Зодак',
      title: 'Зодак таблетки',
      desc: 'Антигистаминный препарат с цетиризином для облегчения симптомов аллергического ринита и крапивницы.',
      kicker: 'Антигистаминный препарат',
      badge1: 'Цетиризин',
      badge2: '10 мг',
      badge3: '1 раз в день',
      facts: ['10 мг', '30 таблеток', 'С 6 лет'],
      buy: 'Ищите Зодак таблетки у аптечных партнеров STADA в Казахстане.'
    },
    product_zodak_drops: {
      name: 'Зодак капли',
      title: 'Зодак капли',
      desc: 'Капли с цетиризином для облегчения симптомов аллергии у взрослых и детей согласно инструкции.',
      kicker: 'Антигистаминные капли',
      badge1: 'Цетиризин',
      badge2: 'Капли',
      badge3: 'Для детей',
      facts: ['10 мг/мл', '20 мл', 'Капли'],
      buy: 'Ищите Зодак капли у аптечных партнеров STADA в Казахстане.'
    },
    product_vitaprost: {
      name: 'Витапрост',
      title: 'Витапрост таблетки',
      desc: 'Препарат для применения в урологии согласно инструкции и назначению специалиста.',
      kicker: 'Урология',
      badge1: 'Таблетки',
      badge2: '20 мг',
      badge3: 'По назначению',
      facts: ['20 мг', '20 таблеток', '18+'],
      buy: 'Ищите Витапрост у аптечных партнеров STADA в Казахстане.'
    }
  },
  kz: {}
};

const productCopyOverrides = {
  ru: {
    products_category_allergy: 'Аллергия',
    products_category_urology: 'Урология',
    product_vitrum_fizzy: {
      name: 'Витрум Иммунактив шипучие таблетки',
      title: 'Витрум Иммунактив шипучие таблетки',
      desc: 'Шипучий витаминно-минеральный комплекс с витаминами, минералами и β-глюканом для поддержки иммунитета взрослых.',
      kicker: 'Иммунная поддержка',
      badge1: 'Для взрослых 18+',
      badge2: 'Витамины и минералы',
      badge3: 'Шипучий формат',
      facts: ['Витамины', 'Минералы', '20 таблеток'],
      buy: 'Витрум Иммунактив шипучие таблетки можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_label: 'О продукте',
        overview_heading: 'Шипучий формат для ежедневной поддержки иммунитета',
        overview_intro: 'Формула объединяет витамины, минералы и β-глюкан в формате шипучих таблеток, который удобно включать в ежедневный режим взрослых.',
        card_vitamins_title: 'Витаминный комплекс',
        card_vitamins_text: 'Помогает дополнять рацион микронутриентами, важными для нормальной работы организма.',
        card_minerals_title: 'Минеральная поддержка',
        card_minerals_text: 'Минералы дополняют витаминную основу и поддерживают обменные процессы.',
        card_beta_title: 'β-глюкан',
        card_beta_text: 'Компонент, который усиливает акцент формулы на поддержке иммунной системы.',
        card_adults_title: 'Удобный прием',
        card_adults_text: 'Шипучая таблетка растворяется в воде и подходит для курсового приема согласно инструкции.',
        formula_label: 'Формула',
        formula_heading: 'Витамины, минералы и β-глюкан в одном комплексе',
        formula_intro: 'В центре композиции упаковка продукта, а карточки выделяют три ключевых слоя формулы.',
        formula_vitamins_text: 'Витамины помогают поддерживать ежедневную потребность организма в микронутриентах.',
        formula_minerals_text: 'Минералы дополняют рацион и поддерживают нормальный обмен веществ.',
        formula_beta_text: 'β-глюкан подчеркивает иммунный фокус продукта.',
        usage_label: 'Когда актуально',
        usage_heading: 'Для сезона простуд, восстановления и активного ритма',
        usage_season_title: 'Сезонная нагрузка',
        usage_season_text: 'Подходит для ежедневной поддержки в периоды повышенной нагрузки на иммунитет.',
        usage_recovery_title: 'После болезни',
        usage_recovery_text: 'Может быть частью восстановления ресурсов организма после перенесенной болезни.',
        usage_daily_title: 'Активный график',
        usage_daily_text: 'Удобен для взрослых, которым важно поддерживать баланс витаминов и минералов.',
        note_title: 'Ответственный прием',
        note_text: 'Перед применением ознакомьтесь с инструкцией и учитывайте индивидуальные ограничения.',
        benefit1: 'Шипучий формат удобно растворять в воде и включать в ежедневный режим.',
        benefit2: 'Формула объединяет витамины, минералы и β-глюкан в одном комплексе.',
        benefit3: 'Подходит для взрослых в периоды сезонной нагрузки на иммунитет.',
        benefit4: 'Карточка продукта ясно показывает состав, формат и места покупки без лишних повторов.'
      }
    },
    product_vitrum_syrop: {
      name: 'Витрум Кидс Проиммун',
      title: 'Витрум Кидс Проиммун',
      desc: 'Детский продукт для поддержки иммунитета с витамином C, β-глюканом и растительными компонентами в удобном формате.',
      kicker: 'Детская иммунная поддержка',
      badge1: 'Для детей',
      badge2: 'Витамин C и β-глюкан',
      badge3: 'Сироп',
      facts: ['Витамин C', 'β-глюкан', '150 мл'],
      buy: 'Витрум Кидс Проиммун можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Поддержка детского иммунитета в мягком формате',
        overview_intro: 'Формат сиропа помогает аккуратно представить продукт для детей: с понятными акцентами на витамин C, β-глюкан и ежедневную поддержку.',
        card_vitamin_title: 'Витамин C',
        card_vitamin_text: 'Важный компонент для нормальной работы иммунной системы.',
        card_beta_title: 'β-глюкан',
        card_beta_text: 'Дополняет иммунный фокус формулы.',
        card_volume_title: '150 мл',
        card_volume_text: 'Формат флакона рассчитан на удобное применение согласно инструкции.',
        card_age_title: 'Детский формат',
        card_age_text: 'Перед применением важно сверить возрастные рекомендации с инструкцией.',
        formula_heading: 'Витамин C, β-глюкан и растительная поддержка',
        formula_intro: 'Композиция строится вокруг флакона, а карточки сохраняют ясные расстояния и читаемые линии.',
        formula_vitamin_text: 'Витамин C поддерживает нормальную функцию иммунной системы.',
        formula_beta_text: 'β-глюкан усиливает акцент на иммунной поддержке.',
        formula_extracts_text: 'Растительные компоненты дополняют формулу продукта.',
        usage_heading: 'Для детского режима согласно инструкции',
        usage_season_title: 'Сезон простуд',
        usage_season_text: 'Может быть актуален в периоды повышенной сезонной нагрузки.',
        usage_recovery_title: 'После нагрузки',
        usage_recovery_text: 'Подходит как часть заботы о рационе ребенка согласно инструкции.',
        usage_daily_title: 'Ежедневный прием',
        usage_daily_text: 'Формат сиропа удобен для включения в режим ребенка.',
        note_text: 'Перед применением обязательно ознакомьтесь с инструкцией и рекомендациями по возрасту.',
        benefit1: 'Детский формат делает продукт понятным для родителей и удобным для режима приема.',
        benefit2: 'Витамин C и β-глюкан вынесены как ключевые компоненты иммунной поддержки.',
        benefit3: 'Флакон и дозировка представлены без перегруза карточек.',
        benefit4: 'Возрастные рекомендации остаются привязаны к инструкции, без лишних обещаний.'
      }
    },
    product_vitrum_magneb6: {
      name: 'Витрум Магний B6',
      title: 'Витрум Магний B6',
      desc: 'Комплекс магния и витамина B6 для поддержки нервной системы, энергетического обмена и ежедневной устойчивости к нагрузкам.',
      kicker: 'Магний и витамин B6',
      badge1: 'Для взрослых',
      badge2: 'Магний + B6',
      badge3: '60 таблеток',
      facts: ['Магний', 'B6', '60 таблеток'],
      buy: 'Витрум Магний B6 можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Два ключевых компонента для нервной системы',
        overview_intro: 'Страница выделяет магний, витамин B6 и формат упаковки, сохраняя спокойный STADA-ритм карточек и визуальных акцентов.',
        card_magnesium_title: 'Магний',
        card_magnesium_text: 'Помогает поддерживать нормальную работу нервной системы и мышц.',
        card_b6_title: 'Витамин B6',
        card_b6_text: 'Дополняет действие магния и участвует в энергетическом обмене.',
        card_format_title: '60 таблеток',
        card_format_text: 'Формат упаковки удобен для курсового приема согласно инструкции.',
        card_antistress_title: 'При нагрузках',
        card_antistress_text: 'Может быть актуален в периоды умственного и физического напряжения.',
        formula_heading: 'Магний, B6 и удобный формат упаковки',
        formula_intro: 'Упаковка остается центром композиции, а карточки аккуратно поясняют формулу.',
        formula_magnesium_text: 'Магний поддерживает нормальную работу нервной системы.',
        formula_b6_text: 'Витамин B6 помогает нормальному энергетическому обмену.',
        formula_format_text: '60 таблеток вынесены как практичный формат для курса.',
        usage_heading: 'Для нагрузки, режима и ежедневной поддержки',
        usage_stress_title: 'При стрессе',
        usage_stress_text: 'Компоненты формулы актуальны при повышенной нагрузке.',
        usage_sleep_title: 'Для режима',
        usage_sleep_text: 'Поддержка нервной системы помогает сохранять ежедневный ритм.',
        usage_daily_title: 'Каждый день',
        usage_daily_text: 'Принимать согласно инструкции и рекомендациям специалиста.',
        benefit1: 'Магний и витамин B6 представлены как два понятных компонента формулы.',
        benefit2: 'Акцент на нервной системе и энергетическом обмене помогает быстро считать назначение продукта.',
        benefit3: 'Формат 60 таблеток вынесен как практичная информация для курса.',
        benefit4: 'Тексты сохраняют медицински спокойный тон и не перегружают страницу.'
      }
    },
    product_vitrum_vitaminc: {
      name: 'Витрум Витамин C 900 мг',
      title: 'Витрум Витамин C 900 мг',
      desc: 'Шипучие таблетки с витамином C 900 мг для поддержки иммунитета и восполнения потребности в витамине C.',
      kicker: 'Витамин C',
      badge1: '900 мг',
      badge2: 'Поддержка иммунитета',
      badge3: 'Шипучие таблетки',
      facts: ['900 мг', 'Витамин C', '20 таблеток'],
      buy: 'Витрум Витамин C 900 мг можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Высокая дозировка витамина C в шипучем формате',
        overview_intro: 'Продукт сфокусирован на витамине C 900 мг и удобном формате растворимой таблетки.',
        card_vitamins_title: '900 мг витамина C',
        card_vitamins_text: 'Витамин C помогает поддерживать нормальную функцию иммунной системы.',
        card_minerals_title: 'Шипучий формат',
        card_minerals_text: 'Растворимая таблетка удобна для приема с водой.',
        card_beta_title: '20 таблеток',
        card_beta_text: 'Формат упаковки вынесен как практичный курсовой акцент.',
        card_adults_title: 'Для взрослых',
        card_adults_text: 'Принимать согласно инструкции и индивидуальным рекомендациям.',
        formula_heading: 'Витамин C, дозировка и формат',
        formula_vitamins_text: '900 мг витамина C выделены как главный компонент продукта.',
        formula_minerals_text: 'Шипучий формат делает прием наглядным и удобным.',
        formula_beta_text: '20 таблеток помогают быстро считывать формат упаковки.',
        usage_heading: 'Для иммунной поддержки и восполнения витамина C',
        usage_season_title: 'Сезон простуд',
        usage_season_text: 'Актуален в периоды повышенной потребности в поддержке иммунитета.',
        usage_recovery_title: 'Восстановление',
        usage_recovery_text: 'Может применяться для восполнения витамина C согласно инструкции.',
        usage_daily_title: 'Ежедневный режим',
        usage_daily_text: 'Удобен для приема с водой в шипучем формате.',
        benefit1: 'Дозировка 900 мг сразу показывает главный акцент продукта.',
        benefit2: 'Шипучая таблетка помогает сделать прием с водой простым и понятным.',
        benefit3: 'Формула сфокусирована на поддержке иммунитета и восполнении витамина C.',
        benefit4: 'Информация о применении остается привязанной к инструкции.'
      }
    },
    product_vitrum_energy: {
      name: 'Витрум Энерджи',
      title: 'Витрум Энерджи',
      desc: 'Шипучий витаминно-минеральный комплекс для поддержки энергии, активности и ежедневного тонуса взрослых.',
      kicker: 'Энергия и тонус',
      badge1: 'Для взрослых',
      badge2: 'Витамины и минералы',
      badge3: 'Шипучий формат',
      facts: ['Витамины B', 'Минералы', '20 таблеток'],
      buy: 'Витрум Энерджи можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Комплекс для энергии и активного ритма',
        overview_intro: 'Витрум Энерджи объединяет витамины и минералы в шипучем формате, чтобы поддерживать ежедневный тонус.',
        formula_heading: 'Витамины группы B, минералы и удобный формат',
        formula_vitamins_text: 'Витамины группы B участвуют в нормальном энергетическом обмене.',
        formula_minerals_text: 'Минералы дополняют формулу ежедневной поддержки.',
        formula_beta_text: 'Шипучий формат помогает сделать прием удобным.',
        usage_heading: 'Для активного графика и ежедневного тонуса',
        usage_season_title: 'Интенсивный ритм',
        usage_season_text: 'Подходит взрослым в периоды активной нагрузки.',
        usage_recovery_title: 'После усталости',
        usage_recovery_text: 'Может быть частью поддержки энергетического обмена.',
        usage_daily_title: 'Ежедневно',
        usage_daily_text: 'Принимать согласно инструкции, растворяя таблетку в воде.',
        benefit1: 'Формула сфокусирована на энергии, активности и ежедневном тонусе.',
        benefit2: 'Витамины группы B и минералы выделены как основные смысловые акценты.',
        benefit3: 'Шипучий формат делает продукт удобным для приема с водой.',
        benefit4: 'Страница объясняет продукт коротко, без повторения одного и того же описания.'
      }
    },
    product_zodak: {
      name: 'Зодак',
      title: 'Зодак таблетки',
      desc: 'Антигистаминный препарат с цетиризином для облегчения симптомов аллергического ринита и крапивницы.',
      kicker: 'Антигистаминный препарат',
      badge1: 'Цетиризин',
      badge2: '1 раз в день',
      badge3: 'С 6 лет',
      facts: ['10 мг', '1 раз в день', '30 таблеток'],
      buy: 'Зодак таблетки можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Цетиризин в формате таблеток',
        overview_intro: 'Страница выделяет дозировку, режим приема и аллергические симптомы, при которых препарат применяют согласно инструкции.',
        formula_heading: 'Действующее вещество, симптомы и формат',
        formula_active_title: 'Цетиризин',
        formula_active_text: 'Действующее вещество антигистаминного препарата.',
        formula_symptoms_text: 'Применяется при симптомах аллергического ринита и крапивницы согласно инструкции.',
        formula_format_title: 'Таблетки',
        formula_format_text: 'Формат таблеток удобен для взрослых и детей с 6 лет согласно инструкции.',
        usage_heading: 'При сезонных и круглогодичных симптомах аллергии',
        note_text: 'Перед применением сверяйтесь с инструкцией, особенно при совместном приеме других препаратов.',
        benefit1: 'Цетиризин вынесен как активный компонент антигистаминного препарата.',
        benefit2: 'Страница разделяет сезонные, круглогодичные и кожные проявления аллергии.',
        benefit3: 'Формат таблеток и режим приема считываются через факты в hero и карточках.',
        benefit4: 'Все формулировки остаются в рамках инструкции к препарату.'
      }
    },
    product_zodak_drops: {
      name: 'Зодак капли',
      title: 'Зодак капли',
      desc: 'Капли с цетиризином для облегчения симптомов аллергии у взрослых и детей согласно инструкции.',
      kicker: 'Антигистаминные капли',
      badge1: 'Цетиризин',
      badge2: 'Капли',
      badge3: 'Для детей',
      facts: ['10 мг/мл', 'С 2 лет', '20 мл'],
      buy: 'Зодак капли можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Цетиризин в формате капель',
        overview_intro: 'Формат капель помогает аккуратно представить продукт для взрослых и детей, сохраняя акцент на инструкции и возрастных ограничениях.',
        formula_heading: 'Активный компонент, возраст и жидкий формат',
        formula_active_title: 'Цетиризин',
        formula_active_text: 'Активный компонент для облегчения симптомов аллергии.',
        formula_age_title: 'С 2 лет',
        formula_age_text: 'Возрастные ограничения и дозировку необходимо сверять с инструкцией.',
        formula_format_title: 'Капли 20 мл',
        formula_format_text: 'Жидкий формат подходит для применения согласно инструкции.',
        usage_heading: 'При аллергическом рините, конъюнктивите и кожных проявлениях',
        benefit1: 'Капли показывают альтернативный формат Зодака для взрослых и детей.',
        benefit2: 'Возраст и дозировку страница подает осторожно, с опорой на инструкцию.',
        benefit3: 'Симптомы аллергии разделены на понятные сценарии применения.',
        benefit4: 'Упаковка, объем и активный компонент не смешиваются в один повторяющийся текст.'
      }
    },
    product_vitaprost: {
      name: 'Витапрост',
      title: 'Витапрост таблетки',
      desc: 'Урологический препарат в форме таблеток для применения согласно инструкции и назначению специалиста.',
      kicker: 'Урология',
      badge1: 'Таблетки',
      badge2: '20 мг',
      badge3: '18+',
      facts: ['20 мг', '20 таблеток', '18+'],
      buy: 'Витапрост можно найти у аптечных партнеров STADA в Казахстане.',
      copy: {
        overview_heading: 'Урологический препарат в таблетках',
        overview_intro: 'Страница выдержана в спокойной медицинской подаче: упаковка, дозировка, формат и ответственное применение по назначению специалиста.',
        formula_heading: 'Активный компонент, формат и возрастные ограничения',
        formula_active_title: 'Активный компонент',
        formula_active_text: 'Состав и дозировку необходимо сверять с инструкцией к препарату.',
        formula_age_title: '18+',
        formula_age_text: 'Препарат предназначен для взрослых согласно инструкции.',
        formula_format_title: '20 таблеток',
        formula_format_text: 'Формат упаковки вынесен как основной практичный акцент.',
        usage_heading: 'В урологии по назначению специалиста',
        usage_prostatitis_title: 'Хронический простатит',
        usage_prostatitis_text: 'Применение определяется инструкцией и назначением врача.',
        usage_bph_title: 'Урологические состояния',
        usage_bph_text: 'Используйте препарат только по инструкции и рекомендации специалиста.',
        usage_surgery_title: 'После вмешательств',
        usage_surgery_text: 'Необходимость применения после процедур определяет врач.',
        note_text: 'Информация на странице не заменяет консультацию врача. Перед применением ознакомьтесь с инструкцией.',
        benefit1: 'Урологический профиль продукта обозначен спокойно и без рекламного преувеличения.',
        benefit2: 'Формат таблеток, дозировка и возрастное ограничение вынесены в отдельные факты.',
        benefit3: 'Сценарии применения связаны с назначением специалиста и инструкцией.',
        benefit4: 'Страница сохраняет медицинский тон и помогает быстро перейти к местам покупки.'
      }
    }
  },
  kz: {
    products_category_allergy: 'Аллергия',
    products_category_urology: 'Урология',
    product_vitrum_fizzy: {
      name: 'Витрум Иммунактив көпіршікті таблеткалары',
      title: 'Витрум Иммунактив көпіршікті таблеткалары',
      desc: 'Ересектердің иммунитетін қолдауға арналған витаминдер, минералдар және β-глюкан бар көпіршікті витамин-минералды кешен.',
      kicker: 'Иммунитетті қолдау',
      badge1: 'Ересектерге 18+',
      badge2: 'Витаминдер мен минералдар',
      badge3: 'Көпіршікті формат',
      facts: ['Витаминдер', 'Минералдар', '20 таблетка'],
      buy: 'Витрум Иммунактив көпіршікті таблеткаларын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Иммунитетті күнделікті қолдауға арналған көпіршікті формат',
        overview_intro: 'Формула витаминдерді, минералдарды және β-глюканды ересектердің күнделікті режиміне ыңғайлы қосылатын көпіршікті таблетка форматында біріктіреді.',
        card_vitamins_title: 'Витаминді кешен',
        card_vitamins_text: 'Ағзаның қалыпты жұмысы үшін маңызды микронутриенттермен рационды толықтыруға көмектеседі.',
        card_minerals_title: 'Минералды қолдау',
        card_minerals_text: 'Минералдар витаминді негізді толықтырып, алмасу процестерін қолдайды.',
        card_beta_title: 'β-глюкан',
        card_beta_text: 'Формуланың иммундық жүйені қолдау бағытын күшейтетін компонент.',
        card_adults_title: 'Ыңғайлы қабылдау',
        card_adults_text: 'Көпіршікті таблетка суда ериді және нұсқаулыққа сай курстық қабылдауға ыңғайлы.',
        formula_label: 'Формула',
        formula_heading: 'Витаминдер, минералдар және β-глюкан бір кешенде',
        formula_intro: 'Композиция ортасында өнім қаптамасы орналасқан, ал карточкалар формуланың негізгі үш қабатын көрсетеді.',
        formula_vitamins_text: 'Витаминдер ағзаның микронутриенттерге күнделікті қажеттілігін қолдауға көмектеседі.',
        formula_minerals_text: 'Минералдар рационды толықтырып, зат алмасудың қалыпты жүруін қолдайды.',
        formula_beta_text: 'β-глюкан өнімнің иммундық бағытын айқындайды.',
        usage_label: 'Қашан өзекті',
        usage_heading: 'Суық тию маусымында, қалпына келу кезеңінде және күнделікті режимде',
        usage_season_title: 'Маусымдық жүктеме',
        usage_season_text: 'Иммунитетке түсетін жүктеме артатын кезеңдерде күнделікті қолдаудың бөлігі бола алады.',
        usage_recovery_title: 'Қалпына келу кезеңі',
        usage_recovery_text: 'Ағза ресурстарын толықтыру қажет болған кезде нұсқаулыққа сай қолдануға болады.',
        usage_daily_title: 'Күнделікті режим',
        usage_daily_text: 'Таблетканы суда ерітіп, нұсқаулыққа сай қабылдау ыңғайлы.',
        note_title: 'Маңызды',
        note_text: 'Қолданар алдында нұсқаулықпен танысып, қажет болса маманмен кеңесіңіз.',
        benefit1: 'Көпіршікті форматты суда ерітіп, күнделікті режимге қосу ыңғайлы.',
        benefit2: 'Формула витаминдерді, минералдарды және β-глюканды бір кешенге біріктіреді.',
        benefit3: 'Иммунитетке маусымдық жүктеме түскен кезеңдерде ересектерге арналған.',
        benefit4: 'Өнім карточкасы құрамды, форматты және сатып алу орындарын артық қайталаусыз көрсетеді.'
      }
    },
    product_vitrum_syrop: {
      name: 'Витрум Кидс Проиммун',
      title: 'Витрум Кидс Проиммун',
      desc: 'Баланың иммунитетін және күнделікті рационын нұсқаулыққа сай қолдауға арналған балалар кешені.',
      kicker: 'Балалар иммунитетін қолдау',
      badge1: 'Балаларға',
      badge2: 'Иммунитетті қолдау',
      badge3: 'Ыңғайлы қабылдау',
      facts: ['Витамин C', 'β-глюкан', 'Балалар форматы'],
      buy: 'Витрум Кидс Проиммунды Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Баланың күнделікті иммундық қолдауына арналған формат',
        overview_intro: 'Өнім витамин C мен β-глюканға назар аударады және ата-аналарға баланың режиміне енгізуге түсінікті форматта берілген.',
        card_vitamin_title: 'Витамин C',
        card_vitamin_text: 'Витамин C иммундық жүйенің қалыпты жұмысын қолдауға қатысады.',
        card_beta_title: 'β-глюкан',
        card_beta_text: 'Формуланың иммундық қолдау бағытын толықтыратын компонент.',
        card_age_title: 'Балаларға арналған',
        card_age_text: 'Жас ерекшелігі мен қабылдау режимін нұсқаулықпен салыстыру қажет.',
        card_volume_title: 'Ыңғайлы формат',
        card_volume_text: 'Флакон форматы күнделікті қабылдауды ұйымдастыруға көмектеседі.',
        formula_label: 'Формула',
        formula_heading: 'Витамин C, β-глюкан және балаларға арналған формат',
        formula_intro: 'Карточкалар өнімнің негізгі компоненттерін және қабылдауға қатысты маңызды ақпаратты бөледі.',
        formula_vitamin_text: 'Витамин C баланың рационындағы маңызды микронутриенттердің бірі.',
        formula_beta_text: 'β-глюкан өнімнің иммундық қолдау бағытын айқындайды.',
        formula_extracts_text: 'Формула күнделікті қолдауға арналған компоненттерді біріктіреді.',
        usage_label: 'Қашан қолдануға болады',
        usage_heading: 'Күнделікті режимде және маусымдық жүктеме кезінде',
        usage_season_title: 'Маусымдық кезең',
        usage_season_text: 'Иммунитетке түсетін жүктеме артқанда нұсқаулыққа сай қолдануға болады.',
        usage_recovery_title: 'Қалпына келу',
        usage_recovery_text: 'Баланың рационын қолдау қажет кезеңдерде өзекті болуы мүмкін.',
        usage_daily_title: 'Күнделікті қабылдау',
        usage_daily_text: 'Қабылдау режимін нұсқаулыққа сәйкес сақтау маңызды.',
        note_title: 'Маңызды',
        note_text: 'Балаларға қолданар алдында нұсқаулықты мұқият оқып, қажет болса маманмен кеңесіңіз.',
        benefit1: 'Балалар форматы ата-аналарға түсінікті және қабылдау режиміне ыңғайлы.',
        benefit2: 'Витамин C және β-глюкан иммундық қолдаудың негізгі компоненттері ретінде көрсетілген.',
        benefit3: 'Флакон мен дозалау ақпараттары карточкаларда артық жүктемесіз берілген.',
        benefit4: 'Жасқа қатысты ұсынымдар нұсқаулыққа байланыстырылған және артық уәде бермейді.'
      }
    },
    product_vitrum_magneb6: {
      name: 'Витрум Магний B6',
      title: 'Витрум Магний B6',
      desc: 'Жүйке жүйесін және қалыпты энергия алмасуын қолдауға арналған магний мен B6 витамині кешені.',
      kicker: 'Магний және B6 витамині',
      badge1: 'Ересектерге',
      badge2: 'Магний + B6',
      badge3: '60 таблетка',
      facts: ['Магний', 'B6 витамині', '60 таблетка'],
      buy: 'Витрум Магний B6 өнімін Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Жүйке жүйесін қолдауға арналған магний мен B6 витамині',
        overview_intro: 'Өнім магний мен B6 витаминін біріктіріп, қалыпты энергия алмасуы мен күнделікті тонусты қолдау бағытын анық көрсетеді.',
        card_magnesium_title: 'Магний',
        card_magnesium_text: 'Магний жүйке жүйесінің қалыпты жұмысын қолдауға қатысады.',
        card_b6_title: 'B6 витамині',
        card_b6_text: 'B6 витамині магнийдің әсерін толықтырып, энергия алмасуына қатысады.',
        card_format_title: '60 таблетка',
        card_format_text: 'Қаптама форматы курс туралы практикалық ақпарат береді.',
        card_antistress_title: 'Күнделікті қолдау',
        card_antistress_text: 'Компоненттерді нұсқаулыққа сай қабылдау маңызды.',
        formula_label: 'Формула',
        formula_heading: 'Магний, B6 витамині және практикалық қаптама форматы',
        formula_intro: 'Формула карточкалары негізгі компоненттерді және қабылдауға қатысты фактілерді бөледі.',
        formula_magnesium_title: 'Магний',
        formula_magnesium_text: 'Магний ағзаның қалыпты жұмысына қажет минералдардың бірі.',
        formula_b6_title: 'B6 витамині',
        formula_b6_text: 'B6 витамині формуланың екінші негізгі компоненті ретінде көрсетілген.',
        formula_format_title: '60 таблетка',
        formula_format_text: 'Қаптама көлемі курстық қабылдау туралы түсінікті ақпарат береді.',
        usage_label: 'Қашан өзекті',
        usage_heading: 'Жүктеме, шаршау және күнделікті режим кезінде',
        usage_stress_title: 'Жүктеме кезінде',
        usage_stress_text: 'Қалыпты жүйке жүйесін қолдау қажет болғанда нұсқаулыққа сай қолдануға болады.',
        usage_sleep_title: 'Режим үшін',
        usage_sleep_text: 'Компоненттер жүйке жүйесінің қалыпты жұмысын қолдауға көмектеседі.',
        usage_daily_title: 'Күнделікті',
        usage_daily_text: 'Қабылдау жиілігі мен дозасын нұсқаулықпен салыстыру қажет.',
        note_title: 'Маңызды',
        note_text: 'Қолданар алдында нұсқаулықпен танысып, қарсы көрсетілімдерді тексеріңіз.',
        benefit1: 'Магний мен B6 витамині формуланың екі түсінікті компоненті ретінде ұсынылған.',
        benefit2: 'Жүйке жүйесі мен энергия алмасуына жасалған акцент өнімнің мақсатын тез түсінуге көмектеседі.',
        benefit3: '60 таблетка форматы курсқа қатысты практикалық ақпарат ретінде көрсетілген.',
        benefit4: 'Мәтіндер медициналық сабырлы тонды сақтап, бетті артық жүктемейді.'
      }
    },
    product_vitrum_vitaminc: {
      name: 'Витрум Витамин C 900 мг',
      title: 'Витрум Витамин C 900 мг',
      desc: 'Иммунитетті қолдау және C витаминіне қажеттілікті толықтыруға арналған 900 мг C витамині бар көпіршікті таблеткалар.',
      kicker: 'Витамин C',
      badge1: '900 мг',
      badge2: 'Иммунитетті қолдау',
      badge3: 'Көпіршікті формат',
      facts: ['900 мг', 'Витамин C', '20 таблетка'],
      buy: 'Витрум Витамин C 900 мг өнімін Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'C витаминін ыңғайлы көпіршікті форматта толықтыру',
        overview_intro: 'Өнім C витаминінің 900 мг дозасына және суда еритін көпіршікті таблетка форматына назар аударады.',
        card_vitamins_title: '900 мг C витамині',
        card_vitamins_text: 'Дозировка өнімнің басты акценті ретінде көрсетілген.',
        card_minerals_title: 'Иммунитетті қолдау',
        card_minerals_text: 'C витамині иммундық жүйенің қалыпты жұмысына қатысады.',
        card_beta_title: 'Көпіршікті таблетка',
        card_beta_text: 'Таблетка суда ериді және қабылдауды түсінікті етеді.',
        card_adults_title: 'Нұсқаулыққа сай',
        card_adults_text: 'Қабылдау режимі мен шектеулерді нұсқаулықпен салыстыру қажет.',
        formula_label: 'Формула',
        formula_heading: 'C витамині, дозировка және көпіршікті формат',
        formula_intro: 'Карточкалар өнімнің негізгі акценттерін: витамин, дозировка және қабылдау форматын көрсетеді.',
        formula_vitamins_text: 'C витамині өнімнің негізгі компоненті ретінде ұсынылған.',
        formula_minerals_text: '900 мг дозировка қаптамада және беттегі фактілерде бөлек көрсетілген.',
        formula_beta_text: 'Көпіршікті формат таблетканы суда ерітіп қабылдауға мүмкіндік береді.',
        usage_label: 'Қашан өзекті',
        usage_heading: 'Иммунитетті қолдау және C витаминін толықтыру үшін',
        usage_season_title: 'Маусымдық кезең',
        usage_season_text: 'Суық тию маусымында рационды толықтырудың бөлігі болуы мүмкін.',
        usage_recovery_title: 'Қалпына келу',
        usage_recovery_text: 'Ағзаға C витаминін толықтыру қажет болған кезеңдерде қолдануға болады.',
        usage_daily_title: 'Қабылдау форматы',
        usage_daily_text: 'Таблетканы суда ерітіп, нұсқаулыққа сай қабылдау қажет.',
        note_title: 'Маңызды',
        note_text: 'Қолданар алдында нұсқаулықпен танысып, дозировканы сақтаңыз.',
        benefit1: '900 мг дозировка өнімнің басты акцентін бірден көрсетеді.',
        benefit2: 'Көпіршікті таблетка сумен қабылдауды қарапайым әрі түсінікті етеді.',
        benefit3: 'Формула иммунитетті қолдауға және C витаминін толықтыруға бағытталған.',
        benefit4: 'Қолдану туралы ақпарат нұсқаулыққа байланыстырылған.'
      }
    },
    product_vitrum_energy: {
      name: 'Витрум Энерджи',
      title: 'Витрум Энерджи',
      desc: 'Энергияны, белсенділікті және күнделікті тонусты қолдауға арналған көпіршікті витамин-минералды кешен.',
      kicker: 'Энергия және тонус',
      badge1: 'Ересектерге 18+',
      badge2: 'Витаминдер мен минералдар',
      badge3: 'Көпіршікті формат',
      facts: ['B витаминдері', 'Минералдар', '20 таблетка'],
      buy: 'Витрум Энерджи өнімін Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Энергия мен белсенді ырғаққа арналған кешен',
        overview_intro: 'Витрум Энерджи витаминдер мен минералдарды күнделікті тонусты қолдауға арналған көпіршікті форматта біріктіреді.',
        card_vitamins_title: 'B витаминдері',
        card_vitamins_text: 'B тобының витаминдері қалыпты энергия алмасуына қатысады.',
        card_minerals_title: 'Минералдар',
        card_minerals_text: 'Минералдар күнделікті қолдау формуласын толықтырады.',
        card_beta_title: 'Көпіршікті формат',
        card_beta_text: 'Суда еритін таблетка қабылдауды ыңғайлы етеді.',
        card_adults_title: 'Ересектерге',
        card_adults_text: 'Өнімді нұсқаулыққа сай қабылдау қажет.',
        formula_label: 'Формула',
        formula_heading: 'B витаминдері, минералдар және ыңғайлы формат',
        formula_intro: 'Карточкалар өнімнің энергияға, минералдарға және қабылдау форматына қатысты негізгі акценттерін көрсетеді.',
        formula_vitamins_text: 'B тобының витаминдері қалыпты энергия алмасуына қатысады.',
        formula_minerals_text: 'Минералдар күнделікті қолдау формуласын толықтырады.',
        formula_beta_text: 'Көпіршікті формат қабылдауды ыңғайлы етуге көмектеседі.',
        usage_label: 'Қашан өзекті',
        usage_heading: 'Белсенді кесте және күнделікті тонус үшін',
        usage_season_title: 'Қарқынды ырғақ',
        usage_season_text: 'Белсенді жүктеме кезеңдерінде ересектерге нұсқаулыққа сай қолдануға болады.',
        usage_recovery_title: 'Шаршаудан кейін',
        usage_recovery_text: 'Энергия алмасуын қолдаудың бөлігі болуы мүмкін.',
        usage_daily_title: 'Күнделікті',
        usage_daily_text: 'Таблетканы суда ерітіп, нұсқаулыққа сай қабылдау қажет.',
        note_title: 'Маңызды',
        note_text: 'Қолданар алдында нұсқаулықпен танысып, қарсы көрсетілімдерді тексеріңіз.',
        benefit1: 'Формула энергияға, белсенділікке және күнделікті тонусқа бағытталған.',
        benefit2: 'B тобының витаминдері мен минералдар негізгі мағыналық акценттер ретінде көрсетілген.',
        benefit3: 'Көпіршікті формат өнімді сумен қабылдауға ыңғайлы етеді.',
        benefit4: 'Бет өнімді қысқа түсіндіреді және бір сипаттаманы қайталамайды.'
      }
    },
    product_zodak: {
      name: 'Зодак',
      title: 'Зодак таблеткалары',
      desc: 'Аллергиялық ринит және есекжем белгілерін жеңілдетуге арналған цетиризині бар антигистаминдік препарат.',
      kicker: 'Антигистаминдік препарат',
      badge1: 'Цетиризин',
      badge2: 'Күніне 1 рет',
      badge3: '6 жастан бастап',
      facts: ['10 мг', 'Күніне 1 рет', '30 таблетка'],
      buy: 'Зодак таблеткаларын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Цетиризин таблетка форматында',
        overview_intro: 'Бетте препарат нұсқаулыққа сай қолданылатын дозировка, қабылдау режимі және аллергиялық белгілер бөлек көрсетілген.',
        card_strength_title: '10 мг',
        card_strength_text: 'Дозировка өнім фактілері мен қаптамада көрсетілген.',
        card_action_title: 'Цетиризин',
        card_action_text: 'Антигистаминдік препараттың белсенді компоненті.',
        card_daily_title: 'Қабылдау режимі',
        card_daily_text: 'Қабылдау жиілігі нұсқаулыққа сәйкес сақталуы керек.',
        card_age_title: '6 жастан бастап',
        card_age_text: 'Жас шектеулерін нұсқаулықпен салыстыру қажет.',
        formula_label: 'Формула',
        formula_heading: 'Белсенді зат, белгілер және формат',
        formula_intro: 'Карточкалар белсенді компонентті, аллергия белгілерін және таблетка форматын бөледі.',
        formula_active_title: 'Цетиризин',
        formula_active_text: 'Антигистаминдік препараттың белсенді заты.',
        formula_symptoms_title: 'Аллергия белгілері',
        formula_symptoms_text: 'Нұсқаулыққа сай аллергиялық ринит және есекжем белгілері кезінде қолданылады.',
        formula_format_title: 'Таблеткалар',
        formula_format_text: 'Таблетка форматы нұсқаулыққа сай ересектерге және 6 жастан бастап балаларға арналған.',
        usage_label: 'Қашан қолданылады',
        usage_heading: 'Маусымдық және жыл бойғы аллергия белгілері кезінде',
        usage_seasonal_title: 'Маусымдық аллергия',
        usage_seasonal_text: 'Маусымдық аллергиялық ринит белгілерін жеңілдету үшін қолданылады.',
        usage_yearround_title: 'Жыл бойғы белгілер',
        usage_yearround_text: 'Нұсқаулыққа сай аллергиялық белгілер кезінде қолдануға болады.',
        usage_skin_title: 'Тері көріністері',
        usage_skin_text: 'Есекжем белгілері кезінде нұсқаулыққа сай қолданылады.',
        note_title: 'Маңызды',
        note_text: 'Қолданар алдында, әсіресе басқа препараттармен бірге қабылдағанда, нұсқаулықпен салыстырыңыз.',
        benefit1: 'Цетиризин антигистаминдік препараттың белсенді компоненті ретінде көрсетілген.',
        benefit2: 'Бет аллергияның маусымдық, жыл бойғы және тері көріністерін бөледі.',
        benefit3: 'Таблетка форматы мен қабылдау режимі hero және карточкалардағы фактілер арқылы оқылады.',
        benefit4: 'Барлық тұжырымдар препарат нұсқаулығы шегінде қалады.'
      }
    },
    product_zodak_drops: {
      name: 'Зодак тамшылары',
      title: 'Зодак тамшылары',
      desc: 'Ересектер мен балалардағы аллергия белгілерін нұсқаулыққа сай жеңілдетуге арналған цетиризині бар тамшылар.',
      kicker: 'Антигистаминдік тамшылар',
      badge1: 'Цетиризин',
      badge2: 'Тамшылар',
      badge3: 'Балаларға',
      facts: ['10 мг/мл', '2 жастан бастап', '20 мл'],
      buy: 'Зодак тамшыларын Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Цетиризин тамшы форматында',
        overview_intro: 'Тамшы форматы ересектер мен балаларға арналған өнімді нұсқаулық пен жас шектеулеріне сүйене отырып көрсетуге көмектеседі.',
        card_strength_title: '10 мг/мл',
        card_strength_text: 'Белсенді компонент концентрациясы өнім фактілерінде көрсетілген.',
        card_age_title: '2 жастан бастап',
        card_age_text: 'Жас пен дозаны нұсқаулықпен салыстыру қажет.',
        card_action_title: 'Цетиризин',
        card_action_text: 'Аллергия белгілерін жеңілдетуге арналған белсенді компонент.',
        card_pack_title: '20 мл',
        card_pack_text: 'Қаптама көлемі жеке практикалық факт ретінде берілген.',
        formula_label: 'Формула',
        formula_heading: 'Белсенді компонент, жас және сұйық формат',
        formula_intro: 'Карточкалар белсенді компонентті, жас шектеуін және тамшы форматын бөліп көрсетеді.',
        formula_active_title: 'Цетиризин',
        formula_active_text: 'Аллергия белгілерін жеңілдетуге арналған белсенді компонент.',
        formula_age_title: '2 жастан бастап',
        formula_age_text: 'Жас шектеулері мен дозировканы нұсқаулықпен салыстыру қажет.',
        formula_format_title: '20 мл тамшылар',
        formula_format_text: 'Сұйық формат нұсқаулыққа сай қолдануға арналған.',
        usage_label: 'Қашан қолданылады',
        usage_heading: 'Аллергиялық ринит, конъюнктивит және тері көріністері кезінде',
        usage_rhinitis_title: 'Аллергиялық ринит',
        usage_rhinitis_text: 'Аллергияның мұрын белгілерін жеңілдету үшін нұсқаулыққа сай қолданылады.',
        usage_conjunctivitis_title: 'Аллергиялық конъюнктивит',
        usage_conjunctivitis_text: 'Аллергияның көз белгілерін жеңілдету үшін нұсқаулыққа сай қолданылады.',
        usage_skin_title: 'Тері көріністері',
        usage_skin_text: 'Есекжем сияқты тері белгілері кезінде нұсқаулыққа сай қолданылуы мүмкін.',
        note_title: 'Маңызды',
        note_text: 'Балаларға қолданғанда дозаны, жас шектеулерін және қабылдау режимін нұсқаулықпен салыстырыңыз.',
        benefit1: 'Тамшылар Зодактың ересектер мен балаларға арналған балама форматын көрсетеді.',
        benefit2: 'Жас пен дозировка бетте нұсқаулыққа сүйене отырып сақ берілген.',
        benefit3: 'Аллергия белгілері қолданудың түсінікті сценарийлеріне бөлінген.',
        benefit4: 'Қаптама, көлем және белсенді компонент бір қайталанатын мәтінге араластырылмаған.'
      }
    },
    product_vitaprost: {
      name: 'Витапрост',
      title: 'Витапрост таблеткалары',
      desc: 'Нұсқаулыққа және маман тағайындауына сай урологияда қолдануға арналған таблетка форматындағы препарат.',
      kicker: 'Урология',
      badge1: 'Таблеткалар',
      badge2: '20 мг',
      badge3: '18+',
      facts: ['20 мг', '20 таблетка', '18+'],
      buy: 'Витапрост өнімін Қазақстандағы STADA дәріхана серіктестерінен табуға болады.',
      copy: {
        overview_label: 'Өнім туралы',
        overview_heading: 'Таблетка форматындағы урологиялық препарат',
        overview_intro: 'Бет сабырлы медициналық стильде жасалған: қаптама, дозировка, формат және маман тағайындауына сай жауапты қолдану бөлек көрсетілген.',
        card_strength_title: '20 мг',
        card_strength_text: 'Дозировка өнім карточкасында жеке факт ретінде көрсетілген.',
        card_active_title: 'Белсенді компонент',
        card_active_text: 'Құрам мен дозировканы препарат нұсқаулығымен салыстыру қажет.',
        card_daily_title: 'Қолдану',
        card_daily_text: 'Қолдану нұсқаулық пен маман ұсынымына сәйкес анықталады.',
        card_storage_title: 'Жауапты қабылдау',
        card_storage_text: 'Өзін-өзі емдемей, маман кеңесін сақтау маңызды.',
        formula_label: 'Формула',
        formula_heading: 'Белсенді компонент, формат және жас шектеулері',
        formula_intro: 'Карточкалар препарат туралы негізгі практикалық ақпаратты бөлек көрсетеді.',
        formula_active_title: 'Белсенді компонент',
        formula_active_text: 'Құрам мен дозировканы препарат нұсқаулығымен салыстыру қажет.',
        formula_age_title: '18+',
        formula_age_text: 'Препарат нұсқаулыққа сай ересектерге арналған.',
        formula_format_title: '20 таблетка',
        formula_format_text: 'Қаптама форматы негізгі практикалық акцент ретінде көрсетілген.',
        usage_label: 'Қашан қолданылады',
        usage_heading: 'Урологияда маман тағайындауына сай',
        usage_prostatitis_title: 'Созылмалы простатит',
        usage_prostatitis_text: 'Қолдану нұсқаулықпен және дәрігер тағайындауымен анықталады.',
        usage_bph_title: 'Урологиялық жағдайлар',
        usage_bph_text: 'Препаратты тек нұсқаулыққа және маман ұсынымына сай қолданыңыз.',
        usage_surgery_title: 'Араласудан кейін',
        usage_surgery_text: 'Процедуралардан кейін қолдану қажеттілігін дәрігер анықтайды.',
        note_title: 'Маңызды',
        note_text: 'Беттегі ақпарат дәрігер кеңесін алмастырмайды. Қолданар алдында нұсқаулықпен танысыңыз.',
        benefit1: 'Өнімнің урологиялық профилі сабырлы және жарнамалық асыра сілтеусіз белгіленген.',
        benefit2: 'Таблетка форматы, дозировка және жас шектеуі жеке фактілерге шығарылған.',
        benefit3: 'Қолдану сценарийлері маман тағайындауымен және нұсқаулықпен байланыстырылған.',
        benefit4: 'Бет медициналық тонды сақтап, сатып алу орындарына тез өтуге көмектеседі.'
      }
    }
  }
};

Object.assign(productFallbacks.ru, productCopyOverrides.ru);
Object.assign(productFallbacks.kz, productCopyOverrides.kz);

function getProductFallback(lang, key) {
  const dictionary = productFallbacks[lang] || productFallbacks.ru;
  if (dictionary[key]) return dictionary[key];

  const prefixes = Object.keys(productFallbacks.ru)
    .filter(item => item.startsWith('product_'))
    .sort((a, b) => b.length - a.length);
  const prefix = prefixes.find(item => key === `${item}_name` || key.startsWith(`${item}_`));
  if (!prefix) return '';

  const data = dictionary[prefix] || productFallbacks.ru[prefix];
  const suffix = key.slice(prefix.length + 1);
  if (data.copy && data.copy[suffix]) return data.copy[suffix];
  const facts = data.facts || [];
  const firstFact = facts[0] || data.name;
  const secondFact = facts[1] || data.name;
  const thirdFact = facts[2] || data.name;

  const suffixMap = {
    name: data.name,
    page_title: data.title,
    page_desc: data.desc,
    kicker: data.kicker,
    buy_intro: data.buy,
    badge_adults: data.badge1,
    badge_active: data.badge1,
    badge_age: data.badge3,
    badge_antistress: data.badge2,
    badge_course: data.badge3,
    badge_daily: data.badge3,
    badge_format: data.badge3,
    badge_formula: data.badge2,
    badge_immune: data.badge2,
    metric_age: thirdFact,
    metric_beta: thirdFact,
    metric_count: thirdFact,
    metric_daily: thirdFact,
    metric_magnesium: firstFact,
    metric_minerals: secondFact,
    metric_pack: thirdFact,
    metric_strength: firstFact,
    metric_vitamin: firstFact,
    metric_vitamins: firstFact,
    metric_volume: thirdFact,
    overview_label: 'О продукте',
    overview_heading: `${data.name}: ключевые свойства`,
    overview_intro: data.desc,
    formula_label: 'Формула',
    formula_heading: `Состав и формат ${data.name}`,
    formula_intro: 'Карточки выделяют основные компоненты, форму выпуска и правила ответственного применения.',
    usage_label: 'Когда применяют',
    usage_heading: `Применение ${data.name} согласно инструкции`,
    note_title: 'Важно',
    note_text: 'Перед применением ознакомьтесь с инструкцией и проконсультируйтесь со специалистом.',
    card_vitamins_title: firstFact,
    card_minerals_title: secondFact,
    card_beta_title: thirdFact,
    card_adults_title: 'Ответственный прием',
    card_vitamin_title: firstFact,
    card_age_title: thirdFact,
    card_volume_title: thirdFact,
    card_magnesium_title: firstFact,
    card_b6_title: secondFact,
    card_format_title: thirdFact,
    card_antistress_title: 'Ежедневная поддержка',
    card_action_title: 'Действующее вещество',
    card_daily_title: 'Удобный прием',
    card_strength_title: firstFact,
    card_pack_title: thirdFact,
    card_active_title: 'Активный компонент',
    card_storage_title: 'Хранение',
    formula_vitamins_text: `${firstFact} в составе продукта поддерживает ежедневный рацион.`,
    formula_minerals_text: `${secondFact} дополняет формулу продукта.`,
    formula_beta_text: `${thirdFact} подчеркивает формат продукта.`,
    formula_extracts_text: 'Компоненты формулы подобраны для ежедневной поддержки.',
    formula_vitamin_text: `${firstFact} является важной частью формулы.`,
    formula_magnesium_title: firstFact,
    formula_magnesium_text: `${firstFact} помогает поддерживать нормальную работу организма.`,
    formula_b6_title: secondFact,
    formula_b6_text: `${secondFact} дополняет основной компонент.`,
    formula_format_title: thirdFact,
    formula_format_text: `${thirdFact} вынесено как удобный формат упаковки.`,
    formula_active_title: 'Активный компонент',
    formula_active_text: 'Активный компонент указан в инструкции к препарату.',
    formula_symptoms_title: 'Симптомы аллергии',
    formula_symptoms_text: 'Применяется для облегчения симптомов аллергии согласно инструкции.',
    formula_age_title: 'Возраст',
    formula_age_text: 'Возрастные ограничения необходимо сверять с инструкцией.',
    usage_season_title: 'В сезон повышенной нагрузки',
    usage_season_text: 'Подходит как часть ежедневной поддержки согласно инструкции.',
    usage_recovery_title: 'Во время восстановления',
    usage_recovery_text: 'Может быть актуален при восстановлении ресурсов организма.',
    usage_daily_title: 'Ежедневный ритм',
    usage_daily_text: 'Удобен для регулярного приема согласно инструкции.',
    usage_stress_title: 'При нагрузках',
    usage_stress_text: 'Поддерживает организм в периоды повышенной нагрузки.',
    usage_sleep_title: 'Для режима',
    usage_sleep_text: 'Компоненты формулы помогают поддерживать нормальную работу нервной системы.',
    usage_seasonal_title: 'Сезонная аллергия',
    usage_seasonal_text: 'Применяется для облегчения симптомов сезонного аллергического ринита.',
    usage_yearround_title: 'Круглогодичные симптомы',
    usage_yearround_text: 'Может применяться при аллергических симптомах согласно инструкции.',
    usage_skin_title: 'Кожные проявления',
    usage_skin_text: 'Применяется при симптомах крапивницы согласно инструкции.',
    usage_rhinitis_title: 'Аллергический ринит',
    usage_rhinitis_text: 'Помогает облегчать назальные симптомы аллергии согласно инструкции.',
    usage_conjunctivitis_title: 'Аллергический конъюнктивит',
    usage_conjunctivitis_text: 'Помогает облегчать глазные симптомы аллергии согласно инструкции.',
    usage_prostatitis_title: 'Хронический простатит',
    usage_prostatitis_text: 'Применение определяется инструкцией и назначением специалиста.',
    usage_bph_title: 'Урологические состояния',
    usage_bph_text: 'Используйте препарат только согласно инструкции и назначению специалиста.',
    usage_surgery_title: 'После вмешательств',
    usage_surgery_text: 'Необходимость применения определяет врач.'
  };

  if (suffixMap[suffix]) return suffixMap[suffix];
  if (suffix.startsWith('benefit')) return '';
  if (suffix.endsWith('_text')) return 'Информация представлена для ознакомления; перед применением сверяйтесь с инструкцией.';
  if (suffix.endsWith('_title')) return data.name;
  return '';
}

const STADA_BACKEND_BASE_URL = window.STADA_BACKEND_BASE_URL || 'https://stada-content-backend.onrender.com';
const STADA_DOMAIN_COUNTRY = getCountryCodeFromHostname(window.location.hostname);
const STADA_CONFIG_COUNTRY = getConfiguredCountryCode();
const STADA_DEFAULT_COUNTRY = STADA_DOMAIN_COUNTRY || STADA_CONFIG_COUNTRY || 'kz';
const backendPageCache = {};
let backendPagePayload = null;

function normalizeCountryCode(countryInput) {
  const requested = String(countryInput || '').trim().toLowerCase();
  const matched = STADA_COUNTRY_OPTIONS.find(country => {
    return [country.code, country.backendCountry, country.name].some(value => value.toLowerCase() === requested);
  });
  return matched?.code || 'kz';
}

function getConfiguredCountryCode() {
  const configuredCountry = window.STADA_BACKEND_COUNTRY || window.STADA_COUNTRY || '';
  return configuredCountry ? normalizeCountryCode(configuredCountry) : '';
}

function getCountryCodeFromHostname(hostname) {
  const normalizedHostname = String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '')
    .split(':')[0];

  const matchedCountry = STADA_COUNTRY_OPTIONS.find(country => {
    return normalizedHostname === country.code || normalizedHostname.endsWith(`.${country.code}`);
  });

  return matchedCountry?.code || '';
}

function getCountryConfig(countryCode = currentCountry) {
  return STADA_COUNTRY_BY_CODE[normalizeCountryCode(countryCode)] || STADA_COUNTRY_BY_CODE.kz;
}

function getSupportedLanguages(countryCode = currentCountry) {
  return getCountryConfig(countryCode).supportedLanguages;
}

function getLanguageLabel(lang) {
  return STADA_LANGUAGE_LABELS[lang] || String(lang || '').toUpperCase();
}

function resolveLanguageForCountry(lang, countryCode = currentCountry) {
  const country = getCountryConfig(countryCode);
  const requested = String(lang || '').trim().toLowerCase();
  if (country.supportedLanguages.includes(requested)) return requested;
  return country.defaultLanguage || country.supportedLanguages[0] || 'ru';
}

function persistLocaleState() {
  try {
    localStorage.setItem('stada-country', currentCountry);
    localStorage.setItem('stada-lang', currentLang);
  } catch (e) {
    // Ignore storage failures.
  }
}

function initializeLocaleState() {
  currentCountry = STADA_DEFAULT_COUNTRY;
  try {
    const savedCountry = localStorage.getItem('stada-country');
    if (savedCountry && !STADA_DOMAIN_COUNTRY) {
      currentCountry = normalizeCountryCode(savedCountry);
    }
    const savedLang = localStorage.getItem('stada-lang');
    if (savedLang) {
      currentLang = resolveLanguageForCountry(savedLang, currentCountry);
    } else {
      currentLang = resolveLanguageForCountry(currentLang, currentCountry);
    }
  } catch (e) {
    currentLang = resolveLanguageForCountry(currentLang, currentCountry);
  }
}

function setToggleActiveIndex(toggle, index) {
  if (!toggle) return;
  toggle.dataset.activeIndex = String(index);
  toggle.style.setProperty('--toggle-active-x', index === 0 ? '0%' : 'calc(100% + 4px)');
  toggle.style.setProperty('--lang-active-x', index === 0 ? '0%' : 'calc(100% + 4px)');
}

function renderLanguageOptions(countryCode = currentCountry) {
  const supportedLanguages = getSupportedLanguages(countryCode);
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    const buttons = Array.from(toggle.querySelectorAll('.lang-option'));
    buttons.forEach((button, index) => {
      const lang = supportedLanguages[index];
      if (!lang) {
        button.hidden = true;
        return;
      }
      button.hidden = false;
      button.dataset.lang = lang;
      button.id = `lang-${lang}`;
      button.textContent = getLanguageLabel(lang);
      button.setAttribute('aria-label', `Switch language to ${getLanguageLabel(lang)}`);
    });
  });
}

function isBackendDrivenPage() {
  return !!document.querySelector('[data-i18n-key], [data-backend-text-id], [data-backend-image-id]');
}

function getCurrentBackendPagePath() {
  const pathname = decodeURIComponent(window.location.pathname || '').replace(/\\/g, '/');
  const mainMarker = '/main/';
  const mainIndex = pathname.lastIndexOf(mainMarker);
  let pagePath = mainIndex >= 0 ? pathname.slice(mainIndex + mainMarker.length) : pathname.replace(/^\/+/, '');

  pagePath = pagePath.replace(/^main\//, '');
  if (!pagePath || pagePath.endsWith('/')) pagePath = `${pagePath}index.html`;
  if (pagePath === 'main') pagePath = 'index.html';
  return pagePath || 'index.html';
}

function getSiteAssetPath(relativePath) {
  const depth = Math.max(0, getCurrentBackendPagePath().split('/').length - 1);
  return `${'../'.repeat(depth)}${String(relativePath || '').replace(/^\/+/, '')}`;
}

function buildBackendPageUrl(lang) {
  const country = getCountryConfig();
  const url = new URL(`/api/page/${encodeURIComponent(country.backendCountry)}`, STADA_BACKEND_BASE_URL);
  url.searchParams.set('lang', lang);
  url.searchParams.set('page', getCurrentBackendPagePath());
  return url.href;
}

async function fetchBackendPage(lang) {
  const cacheKey = `${currentCountry}:${lang}:${getCurrentBackendPagePath()}`;
  if (!backendPageCache[cacheKey]) {
    backendPageCache[cacheKey] = fetch(buildBackendPageUrl(lang))
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      });
  }
  return backendPageCache[cacheKey];
}

function getBackendPageText(key) {
  if (!backendPagePayload?.content?.text) return '';
  return backendPagePayload.content.text[key] || '';
}

function escapeCssIdentifier(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/["\\]/g, '\\$&');
}

function getTranslatedText(lang, key) {
  return getBackendPageText(key)
    || translations[lang]?.[key]
    || translations.ru?.[key]
    || getProductFallback(lang, key)
    || getProductFallback('ru', key);
}

function getStaticTranslatedText(lang, key) {
  return translations[lang]?.[key]
    || translations.ru?.[key]
    || getProductFallback(lang, key)
    || getProductFallback('ru', key)
    || '';
}

function applyStaticI18n(lang) {
  document.querySelectorAll('[data-static-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-static-i18n-key');
    const translation = getStaticTranslatedText(lang, key);
    if (translation) el.textContent = translation;
  });
}

function setLanguageToggleState(lang) {
  renderLanguageOptions(currentCountry);
  document.querySelectorAll('.lang-toggle').forEach(langToggle => {
    const buttons = Array.from(langToggle.querySelectorAll('.lang-option:not([hidden])'));
    const activeIndex = Math.max(0, buttons.findIndex(button => button.dataset.lang === lang));
    langToggle.dataset.activeLang = lang;
    setToggleActiveIndex(langToggle, activeIndex);
    buttons.forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  });
}

function applyTextFromBackendPayload(payload) {
  const text = payload?.content?.text || {};
  const dynamicText = {
    hero_kicker: payload?.country?.siteName,
    site_name: payload?.country?.siteName,
  };

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const value = dynamicText[key] || text[key] || '';
    if (value) {
      el.textContent = value;
      el.hidden = false;
    } else if (el.closest('.benefits-list')) {
      el.textContent = '';
      el.hidden = true;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder-key');
    const value = text[key] || '';
    if (value) el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-aria-label-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label-key');
    const value = text[key] || '';
    if (value) el.setAttribute('aria-label', value);
  });

  (payload?.content?.dom?.text || []).forEach(item => {
    if (!item?.id) return;
    document.querySelectorAll(`[data-backend-text-id="${escapeCssIdentifier(item.id)}"]`).forEach(el => {
      const value = item.value || '';
      el.textContent = value;
      el.dataset.backendTextValue = value;
      delete el.dataset.animated;
    });
  });
}

function normalizeImageLookupKey(value) {
  return String(value || '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\\/g, '/')
    .replace(/^https?:\/\/[^/]+\/?/i, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^\.\.\//, '');
}

function isStableCloudinaryImageUrl(src) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?!v\d+\/)/i.test(String(src || ''));
}

function withRuntimeImageRefresh(src) {
  if (!isStableCloudinaryImageUrl(src)) return src;
  if (!window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/)) return src;

  try {
    const url = new URL(src);
    url.searchParams.set('fresh', String(Date.now()));
    return url.href;
  } catch (error) {
    const separator = String(src).includes('?') ? '&' : '?';
    return `${src}${separator}fresh=${Date.now()}`;
  }
}

function applyImagesFromBackendPayload(payload) {
  (payload?.content?.dom?.images || []).forEach(image => {
    if (!image?.id) return;
    document.querySelectorAll(`img[data-backend-image-id="${escapeCssIdentifier(image.id)}"]`).forEach(img => {
      if (img.dataset.optimizedStaticSrc === 'true' && image.source !== 'override') return;

      const nextSrc = image.source === 'override'
        ? image.url || image.src || img.src
        : image.src || img.src;
      img.src = withRuntimeImageRefresh(nextSrc);
      if (image.srcset) img.srcset = image.srcset;
      if (image.sizes) img.sizes = image.sizes;
      img.alt = image.alt || '';
      if (image.loading) img.loading = image.loading;
      img.dataset.backendImageApplied = 'true';
    });
  });

  const photosBySrc = new Map();
  (payload?.content?.photos || []).forEach(photo => {
    const keys = [photo.src, photo.url].map(normalizeImageLookupKey).filter(Boolean);
    keys.forEach(key => photosBySrc.set(key, photo));
  });

  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.backendImageApplied === 'true') return;
    const originalSrc = img.getAttribute('data-backend-src') || img.getAttribute('src') || '';
    const photo = photosBySrc.get(normalizeImageLookupKey(originalSrc));
    if (!photo) return;
    img.src = photo.src || photo.url || img.src;
    if (photo.alt) img.alt = photo.alt;
    if (photo.loading) img.loading = photo.loading;
  });
}

function showBackendRequiredMessage(error) {
  backendPagePayload = null;
  delete backendPageCache[`${currentCountry}:${currentLang}:${getCurrentBackendPagePath()}`];
  hideStadaPageLoader();
  document.body.classList.add('backend-content-pending');

  let screen = document.querySelector('[data-backend-error-screen]');
  if (!screen) {
    screen = document.createElement('div');
    screen.setAttribute('data-backend-error-screen', '');
    screen.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:24px;background:#f7f8fb;color:#141414;font:400 16px/1.5 Noto Sans,Arial,sans-serif;';
    document.body.appendChild(screen);
  }

  screen.innerHTML = `
    <section role="alert" aria-live="assertive" style="width:min(100%,560px);padding:44px 38px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(20,20,20,.14);text-align:center;">
      <img src="${getSiteAssetPath('assets/logos/stada_logo.png')}" alt="STADA logo" style="display:block;width:118px;height:auto;margin:0 auto 26px;">
      <p style="margin:0 0 10px;color:#c4002f;font-weight:700;text-transform:uppercase;font-size:13px;letter-spacing:.08em;">Service unavailable</p>
      <h1 style="margin:0 0 14px;font-size:clamp(28px,4vw,42px);line-height:1.12;color:#1d1d1f;">Sorry, our services are unavailable.</h1>
      <p style="margin:0 auto 28px;max-width:420px;color:#4b4b55;font-size:17px;">We're working on fixing it. Please try refreshing the page in a moment.</p>
      <button type="button" data-backend-retry style="appearance:none;border:0;border-radius:999px;background:#005db9;color:#fff;padding:13px 24px;font:700 15px/1 Noto Sans,Arial,sans-serif;cursor:pointer;">Refresh page</button>
    </section>
  `;
  screen.querySelector('[data-backend-retry]')?.addEventListener('click', () => window.location.reload());
  document.title = 'STADA - Service unavailable';
  console.warn('Page backend unavailable.', error);
}

function clearBackendRequiredMessage() {
  document.querySelector('[data-backend-error-screen]')?.remove();
}

async function updateBackendDrivenPage(lang) {
  lang = resolveLanguageForCountry(lang);
  currentLang = lang;
  persistLocaleState();
  document.documentElement.lang = lang;
  setLanguageToggleState(lang);
  applyStaticI18n(lang);

  const payload = await fetchBackendPage(lang);
  backendPagePayload = payload;
  clearBackendRequiredMessage();
  applyStaticI18n(lang);
  applyTextFromBackendPayload(payload);
  applyImagesFromBackendPayload(payload);
  document.body.classList.remove('backend-content-pending');

  updateDocumentTitle(lang);
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.setAttribute('aria-label', getBackendPageText('footer_back_top') || 'Back to top');
  }

  document.dispatchEvent(new CustomEvent('stada:languagechange', { detail: { lang, country: currentCountry } }));
  document.querySelectorAll('.hero-overlay').forEach(overlay => {
    overlay.classList.add('visible');
  });
}

function updateStaticLanguage(lang) {
  lang = resolveLanguageForCountry(lang);
  currentLang = lang;
  persistLocaleState();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const translation = getTranslatedText(lang, key);
    if (translation) {
      el.textContent = translation;
      el.hidden = false;
    } else if (el.closest('.benefits-list')) {
      el.textContent = '';
      el.hidden = true;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder-key');
    const translation = getTranslatedText(lang, key);
    if (translation) el.setAttribute('placeholder', translation);
  });

  document.querySelectorAll('[data-i18n-aria-label-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label-key');
    const translation = getTranslatedText(lang, key);
    if (translation) el.setAttribute('aria-label', translation);
  });

  setLanguageToggleState(lang);
  applyStaticI18n(lang);

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.setAttribute('aria-label', lang === 'kz' ? 'Жоғарыға қайту' : 'Вернуться наверх');
  }

  updateDocumentTitle(lang);
  document.dispatchEvent(new CustomEvent('stada:languagechange', { detail: { lang, country: currentCountry } }));
  document.querySelectorAll('.hero-overlay').forEach(overlay => {
    overlay.classList.add('visible');
  });
}

// Helper to update all elements with data-i18n-key
function updateLanguage(lang) {
  lang = resolveLanguageForCountry(lang);
  if (isBackendDrivenPage()) {
    updateBackendDrivenPage(lang).catch(error => {
      updateStaticLanguage(lang);
      showBackendRequiredMessage(error);
    });
    return;
  }
  updateStaticLanguage(lang);
}

function updateCountry(countryCode) {
  const nextCountry = normalizeCountryCode(countryCode);
  if (nextCountry === currentCountry) return;
  currentCountry = nextCountry;
  backendPagePayload = null;
  updateLanguage(resolveLanguageForCountry(currentLang, nextCountry));
}

// Toggle languages on button click
function toggleLanguage() {
  const supportedLanguages = getSupportedLanguages();
  const currentIndex = supportedLanguages.indexOf(currentLang);
  updateLanguage(supportedLanguages[(currentIndex + 1) % supportedLanguages.length] || supportedLanguages[0]);
}

function updateDocumentTitle(lang) {
  const explicitTitle = document.querySelector('title[data-i18n-key]');
  if (explicitTitle) {
    const titleKey = explicitTitle.getAttribute('data-i18n-key');
    const title = getTranslatedText(lang, titleKey);
    if (title) {
      explicitTitle.textContent = title;
      return;
    }
  }

  const productHeading = document.querySelector('.product-detail-page h1[data-i18n-key]');
  if (productHeading?.textContent.trim()) {
    document.title = `STADA - ${productHeading.textContent.trim()}`;
    return;
  }

  const pageTitleMap = [
    ['worldwide-page', 'worldwide_page_title'],
    ['products-page', 'products_heading'],
    ['history-page', 'nav_history'],
    ['culture-page', 'culture_page_title']
  ];
  const bodyClass = document.body?.classList;
  const matched = pageTitleMap.find(([className]) => bodyClass?.contains(className));
  if (matched) {
    const title = getTranslatedText(lang, matched[1]);
    if (title) {
      document.title = matched[1] === 'worldwide_page_title' ? title : `STADA - ${title}`;
      return;
    }
  }

  const homeTitle = getStaticTranslatedText(lang, 'nav_about') || getTranslatedText(lang, 'nav_about');
  if (homeTitle) document.title = `STADA - ${homeTitle}`;
}

// Mobile menu toggle
function setMenuOpen(isOpen) {
  const menu = document.querySelector('.menu');
  const hamburger = document.querySelector('.hamburger');
  if (!menu || !hamburger) return;

  menu.classList.toggle('open', isOpen);
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
}

function toggleMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  setMenuOpen(!menu.classList.contains('open'));
}

// Initialise Swiper carousel
function initSwiper() {
  // Only initialise the hero swiper if the element exists.  Product pages
  // do not include a hero carousel, so without this guard Swiper would
  // throw an error.  If a container with the `.hero-swiper` class is
  // found, configure it with the same settings used on the landing page.
  const swiperEl = document.querySelector('.hero-swiper');
  if (!swiperEl) return;
  new Swiper('.hero-swiper', {
    loop: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    // Use the default slide effect to avoid overlay glitches when the page loads.
    effect: 'slide'
  });
}

// Initialise AOS library
function initAOS() {
  // Only initialise AOS if the library is present.  In the redesigned
  // site the AOS script may be omitted to reduce external dependencies.
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true
    });
  }
}

// Initialise the homepage hero image carousel.
function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const hero = carousel.closest('.stada-home-hero');
  const slides = Array.from(carousel.querySelectorAll('.hero-carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
  const caption = document.querySelector('[data-hero-caption]');
  const heroTitle = hero?.querySelector('.stada-home-hero__copy h1');
  const heroLead = hero?.querySelector('.stada-home-hero__lead');
  const prevButton = carousel.querySelector('[data-hero-prev]');
  const nextButton = carousel.querySelector('[data-hero-next]');
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let timerId = null;
  let transitionTimerId = null;
  let transitionEndTimerId = null;
  let isTransitioning = false;
  let queuedIndex = null;

  function clearHeroTransitionTimers() {
    if (transitionTimerId) {
      window.clearTimeout(transitionTimerId);
      transitionTimerId = null;
    }
    if (transitionEndTimerId) {
      window.clearTimeout(transitionEndTimerId);
      transitionEndTimerId = null;
    }
  }

  function setHeroTransitionState(state) {
    if (!hero) return;
    hero.classList.toggle('is-changing-out', state === 'out');
    hero.classList.toggle('is-changing-in', state === 'in');
  }

  function applySlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    if (hero) {
      hero.dataset.heroActiveSlide = String(activeIndex);
    }
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    carousel.classList.toggle('hero-carousel--awards-active', slides[activeIndex].classList.contains('hero-carousel-slide--awards'));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    const captionKey = slides[activeIndex].dataset.captionKey;
    if (caption && captionKey) {
      caption.setAttribute('data-i18n-key', captionKey);
      caption.textContent = getTranslatedText(currentLang, captionKey) || '';
    }

    const titleKey = slides[activeIndex].dataset.titleKey;
    if (heroTitle && titleKey) {
      heroTitle.setAttribute('data-i18n-key', titleKey);
      heroTitle.textContent = getTranslatedText(currentLang, titleKey) || '';
    }

    const leadKey = slides[activeIndex].dataset.leadKey;
    if (heroLead && leadKey) {
      heroLead.setAttribute('data-i18n-key', leadKey);
      heroLead.textContent = getTranslatedText(currentLang, leadKey) || '';
    }
  }

  function showSlide(index, options = {}) {
    const nextIndex = (index + slides.length) % slides.length;
    const animate = options.animate !== false && !reduceMotion && !!hero;

    if (nextIndex === activeIndex && !isTransitioning) return;

    if (!animate) {
      clearHeroTransitionTimers();
      isTransitioning = false;
      queuedIndex = null;
      setHeroTransitionState(null);
      applySlide(nextIndex);
      return;
    }

    if (isTransitioning) {
      queuedIndex = nextIndex;
      return;
    }

    isTransitioning = true;
    hero.classList.add('has-carousel-transitioned');
    setHeroTransitionState('out');

    transitionTimerId = window.setTimeout(() => {
      transitionTimerId = null;
      applySlide(nextIndex);
      setHeroTransitionState('in');

      transitionEndTimerId = window.setTimeout(() => {
        transitionEndTimerId = null;
        isTransitioning = false;
        setHeroTransitionState(null);

        if (queuedIndex !== null && queuedIndex !== activeIndex) {
          const queued = queuedIndex;
          queuedIndex = null;
          showSlide(queued);
        } else {
          queuedIndex = null;
        }
      }, 980);
    }, 560);
  }

  function stopAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    timerId = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5500);
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      startAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      startAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroSlide));
      startAutoplay();
    });
  });

  carousel.addEventListener('pointerenter', stopAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  applySlide(0);
  startAutoplay();
}

function initHeroMetricCounters() {
  const counters = document.querySelectorAll('[data-hero-count]');
  if (!counters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatNumber = value => Math.round(value).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');

  counters.forEach(counter => {
    const target = Number(counter.dataset.heroCount);
    const suffix = counter.dataset.heroSuffix || '';
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      counter.textContent = `${formatNumber(target)}${suffix}`;
      return;
    }

    const duration = target > 1000 ? 1700 : 1350;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${formatNumber(target * eased)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = `${formatNumber(target)}${suffix}`;
      }
    }

    requestAnimationFrame(animate);
  });
}

function initNewsCarousel() {
  const carousel = document.querySelector('[data-news-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-news-track]');
  const cards = Array.from(carousel.querySelectorAll('.news-card'));
  const prevButton = document.querySelector('[data-news-prev]');
  const nextButton = document.querySelector('[data-news-next]');
  const current = document.querySelector('[data-news-current]');
  const total = document.querySelector('[data-news-total]');
  const progress = carousel.querySelector('[data-news-progress]');
  if (!track || !cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.scrollLeft = 0;
  let autoplayId = null;
  let rafId = null;

  const formatIndex = value => String(value).padStart(2, '0');
  const getPositions = () => cards.map(card => card.offsetLeft - track.offsetLeft);
  const getMaxStartIndex = () => {
    const positions = getPositions();
    const maxScroll = track.scrollWidth - track.clientWidth;
    const tolerance = Math.max(24, cards[0].getBoundingClientRect().width * 0.1);
    let maxIndex = positions.length - 1;
    while (maxIndex > 0 && positions[maxIndex] - maxScroll > tolerance) {
      maxIndex -= 1;
    }
    return maxIndex;
  };
  const getIndex = () => {
    const positions = getPositions();
    const closestIndex = positions.reduce((closest, position, index) => {
      const currentDistance = Math.abs(track.scrollLeft - positions[closest]);
      const nextDistance = Math.abs(track.scrollLeft - position);
      return nextDistance < currentDistance ? index : closest;
    }, 0);
    return Math.min(closestIndex, getMaxStartIndex());
  };

  function updateState() {
    const index = getIndex();
    const pageCount = getMaxStartIndex() + 1;
    if (current) current.textContent = formatIndex(index + 1);
    if (total) total.textContent = formatIndex(pageCount);
    if (progress) {
      progress.style.width = `${100 / pageCount}%`;
      progress.style.transform = `translateX(${index * 100}%)`;
    }
  }

  function scrollToIndex(index) {
    const maxStartIndex = getMaxStartIndex();
    const pageCount = maxStartIndex + 1;
    const normalized = (index + pageCount) % pageCount;
    const positions = getPositions();
    track.scrollTo({
      left: positions[normalized],
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    autoplayId = window.setInterval(() => {
      scrollToIndex(getIndex() + 1);
    }, 6500);
  }

  prevButton?.addEventListener('click', () => {
    scrollToIndex(getIndex() - 1);
    startAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    scrollToIndex(getIndex() + 1);
    startAutoplay();
  });

  track.addEventListener('scroll', () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(updateState);
  });

  carousel.addEventListener('pointerenter', stopAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);
  window.addEventListener('resize', updateState);

  updateState();
  startAutoplay();
}

// Initialise the auto-scrolling products carousel.
function initProductsCarousel() {
  const carousel = document.querySelector('.products-carousel');
  if (!carousel) return;
  // Duplicate the current children to allow seamless looping.  Append
  // the existing inner HTML once so that the original set of products
  // appears twice in sequence.  This allows us to translate the
  // container continuously across the viewport without exposing a gap.
  carousel.innerHTML += carousel.innerHTML;
  let isPaused = false;
  let offset = 0;
  // Increase the speed slightly compared to the previous iteration to
  // achieve a brisker scroll.  This value represents the number of
  // pixels moved per animation frame.
  const speed = 0.5;
  // Record the total width of the original (pre‑duplicated) content.
  const originalWidth = carousel.scrollWidth / 2;
  // Enable hardware acceleration for smoother animations.
  carousel.style.willChange = 'transform';
  function animate() {
    if (!isPaused) {
      offset += speed;
      if (offset >= originalWidth) {
        // Loop back by subtracting the original width rather than
        // resetting to zero.  This prevents any visible jump.
        offset -= originalWidth;
      }
      carousel.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  // Pause scrolling when the pointer enters the carousel and resume
  // when it leaves.  Using pointer events captures mouse and touch
  // interactions uniformly.
  carousel.addEventListener('pointerenter', () => { isPaused = true; });
  carousel.addEventListener('pointerleave', () => { isPaused = false; });
}

function initProductCatalogFilters() {
  const filters = Array.from(document.querySelectorAll('[data-product-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-product-card]'));
  if (!filters.length || !cards.length) return;

  filters.forEach(filterButton => {
    filterButton.addEventListener('click', () => {
      const activeFilter = filterButton.dataset.productFilter;

      filters.forEach(button => {
        const isActive = button === filterButton;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      cards.forEach(card => {
        const categories = (card.dataset.category || '').split(' ');
        const isVisible = activeFilter === 'all' || categories.includes(activeFilter);
        card.hidden = !isVisible;
        card.setAttribute('aria-hidden', String(!isVisible));
        if (isVisible && card.classList.contains('home-reveal')) {
          card.classList.remove('is-visible');
          requestAnimationFrame(() => card.classList.add('is-visible'));
        }
      });
    });
  });
}

function initProductDetailPage() {
  const page = document.querySelector('.product-detail-page');
  if (!page) return;

  page.classList.add('vitrum-reveal-ready');
  const revealItems = Array.from(page.querySelectorAll('.vitrum-animate'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealPassedItems = () => {
    revealItems.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add('is-visible');
      }
    });
  };

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealItems.forEach(item => revealObserver.observe(item));
    revealPassedItems();
    window.addEventListener('scroll', revealPassedItems, { passive: true });
    window.addEventListener('resize', revealPassedItems);
  }

  const usageItems = Array.from(page.querySelectorAll('[data-vitrum-usage] .usage-item'));
  usageItems.forEach(item => {
    const activate = () => {
      usageItems.forEach(current => current.classList.toggle('is-active', current === item));
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate();
    });
  });
}

function initVitrumFizzyHeroLevitation() {
  const configs = [
    {
      pageSelector: '.product-vitrum-vitamin-c-page',
      heroSelector: '.product-hero--vitrum-vitamin-c',
      duration: 1420,
      lift: 6,
      shadowBase: 0.72
    },
    {
      pageSelector: '.product-vitrum-energy-page',
      heroSelector: '.product-hero--vitrum-energy',
      duration: 1460,
      lift: 7,
      shadowBase: 0.72
    },
    {
      pageSelector: '.product-vitrum-fizzy-page',
      heroSelector: '.product-hero--vitrum-fizzy',
      duration: 1400,
      lift: 6,
      shadowBase: 0.74
    }
  ];

  const config = configs.find(item => document.querySelector(item.pageSelector));
  if (!config) return;

  const page = document.querySelector(config.pageSelector);
  const hero = page.querySelector(config.heroSelector);
  const packshot = hero?.querySelector('.product-hero-packshot');
  const heroImage = hero?.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const resetHero = () => {
    packshot.style.setProperty('--vitrum-fizzy-hero-float-y', '0px');
    heroImage.style.setProperty('--vitrum-fizzy-hero-shadow-opacity', config.shadowBase.toFixed(2));
    heroImage.style.setProperty('--vitrum-fizzy-hero-shadow-transform', 'scale3d(1, 1, 1)');
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    resetHero();
    return;
  }

  let animationFrame = 0;
  let isVisible = true;

  const renderFrame = time => {
    if (!isVisible || document.hidden) {
      animationFrame = 0;
      resetHero();
      return;
    }

    const phase = Math.sin(time / config.duration);
    const progress = (phase + 1) / 2;
    const lift = progress * -config.lift;
    const shadowScaleX = 1 - progress * 0.05;
    const shadowScaleY = 1 - progress * 0.09;
    const shadowOpacity = config.shadowBase - progress * 0.1;

    packshot.style.setProperty('--vitrum-fizzy-hero-float-y', `${lift.toFixed(2)}px`);
    heroImage.style.setProperty('--vitrum-fizzy-hero-shadow-opacity', shadowOpacity.toFixed(3));
    heroImage.style.setProperty('--vitrum-fizzy-hero-shadow-transform', `scale3d(${shadowScaleX.toFixed(3)}, ${shadowScaleY.toFixed(3)}, 1)`);

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (!animationFrame && isVisible && !document.hidden) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const stop = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    resetHero();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      });
    }, { threshold: 0.08 });

    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resetHero();
  start();
}

function initHomeScrollReveal() {
  const page = document.querySelector('.home-main');
  if (!page) return;

  const revealGroups = [
    ['.about-copy', 'home-reveal--left'],
    ['.about-stats', 'home-reveal--right'],
    ['.about-values li', 'home-reveal--scale'],
    ['.news-section .section-header', 'home-reveal'],
    ['.news-card', 'home-reveal--scale'],
    ['.career-media', 'home-reveal--left'],
    ['.career-content', 'home-reveal--right'],
    ['.career-fact', 'home-reveal--scale'],
    ['.hero-products-text', 'home-reveal--left'],
    ['.hero-products-image', 'home-reveal--right'],
    ['.products-highlight', 'home-reveal--scale'],
    ['.product-preview-header', 'home-reveal'],
    ['.product-preview-card', 'home-reveal--scale'],
    ['.site-footer .footer-brand', 'home-reveal--left'],
    ['.site-footer .footer-nav__group', 'home-reveal'],
    ['.site-footer .footer-warning', 'home-reveal--scale']
  ];

  const revealItems = [];
  revealGroups.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      if (item.classList.contains('home-reveal')) return;
      item.classList.add('home-reveal', variant);
      item.style.setProperty('--home-reveal-delay', `${Math.min(index, 5) * 70}ms`);
      revealItems.push(item);
    });
  });

  if (!revealItems.length) return;

  const showPassedItems = () => {
    revealItems.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add('is-visible');
      }
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealItems.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));
  showPassedItems();
  window.addEventListener('scroll', showPassedItems, { passive: true });
  window.addEventListener('resize', showPassedItems);
}

function initProductsScrollReveal() {
  const page = document.querySelector('.products-page');
  if (!page) return;

  const revealGroups = [
    ['.catalog-hero__content', 'home-reveal--left'],
    ['.catalog-hero__visual', 'home-reveal--right'],
    ['.catalog-metric', 'home-reveal--scale'],
    ['.catalog-section__header', 'home-reveal'],
    ['.catalog-filter', 'home-reveal'],
    ['.catalog-card', 'home-reveal--scale'],
    ['.catalog-partners__copy', 'home-reveal--left'],
    ['.catalog-partner', 'home-reveal--scale'],
    ['.site-footer .footer-brand', 'home-reveal--left'],
    ['.site-footer .footer-nav__group', 'home-reveal'],
    ['.site-footer .footer-warning', 'home-reveal--scale']
  ];

  const revealItems = [];
  revealGroups.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      if (item.classList.contains('home-reveal')) return;
      item.classList.add('home-reveal', variant);
      item.style.setProperty('--home-reveal-delay', `${Math.min(index, 6) * 65}ms`);
      revealItems.push(item);
    });
  });

  if (!revealItems.length) return;

  const showPassedItems = () => {
    revealItems.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add('is-visible');
      }
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealItems.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));
  showPassedItems();
  window.addEventListener('scroll', showPassedItems, { passive: true });
  window.addEventListener('resize', showPassedItems);
}

function initHistoryScrollReveal() {
  const page = document.querySelector('.history-page');
  if (!page) return;

  const revealGroups = [
    ['.history-hero__content', 'home-reveal--left'],
    ['.history-hero__visual', 'home-reveal--right'],
    ['.history-summary-card', 'home-reveal--scale'],
    ['.history-periods__inner', 'home-reveal'],
    ['.history-section-heading', 'home-reveal'],
    ['.history-period__header', 'home-reveal--left'],
    ['.history-event', 'home-reveal--scale'],
    ['.site-footer .footer-brand', 'home-reveal--left'],
    ['.site-footer .footer-nav__group', 'home-reveal'],
    ['.site-footer .footer-warning', 'home-reveal--scale']
  ];

  const revealItems = [];
  revealGroups.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      if (item.classList.contains('home-reveal')) return;
      item.classList.add('home-reveal', variant);
      item.style.setProperty('--home-reveal-delay', `${Math.min(index, 6) * 65}ms`);
      revealItems.push(item);
    });
  });

  if (!revealItems.length) return;

  const showPassedItems = () => {
    revealItems.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add('is-visible');
      }
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealItems.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));
  showPassedItems();
  window.addEventListener('scroll', showPassedItems, { passive: true });
  window.addEventListener('resize', showPassedItems);
}

function initMagneHeroLevitation() {
  const page = document.querySelector('.product-magne-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--magne');
  const packshot = page.querySelector('.magne-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    packshot.style.setProperty('--magne-hero-float-y', '0px');
    heroImage.style.setProperty('--magne-hero-shadow-opacity', '0.78');
    heroImage.style.setProperty('--magne-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('magne-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initEnterogerminaCapsulesHeroLevitation() {
  const page = document.querySelector('.product-enterogermina-capsules-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--enterogermina-capsules');
  const packshot = page.querySelector('.enterogermina-capsules-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    packshot.style.setProperty('--enterogermina-capsules-hero-float-y', '0px');
    heroImage.style.setProperty('--enterogermina-capsules-hero-shadow-opacity', '0.76');
    heroImage.style.setProperty('--enterogermina-capsules-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('enterogermina-capsules-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initEnterogerminaForteHeroLevitation() {
  const page = document.querySelector('.product-enterogermina-forte-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--enterogermina-forte');
  const packshot = page.querySelector('.enterogermina-forte-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    packshot.style.setProperty('--enterogermina-forte-hero-float-y', '0px');
    heroImage.style.setProperty('--enterogermina-forte-hero-shadow-opacity', '0.72');
    heroImage.style.setProperty('--enterogermina-forte-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('enterogermina-forte-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initAqualorForteHeroLevitation() {
  const page = document.querySelector('.product-aqualor-forte-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--aqualor-forte');
  const packshot = page.querySelector('.aqualor-forte-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--aqualor-hero-shadow-opacity', '0.68');
    heroImage.style.setProperty('--aqualor-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('aqualor-forte-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initAqualorBabyHeroLevitation() {
  const page = document.querySelector('.product-aqualor-baby-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--aqualor-baby');
  const packshot = page.querySelector('.aqualor-baby-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--aqualor-hero-shadow-opacity', '0.7');
    heroImage.style.setProperty('--aqualor-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('aqualor-baby-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initAqualorGorloHeroLevitation() {
  const page = document.querySelector('.product-aqualor-gorlo-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--aqualor-gorlo');
  const packshot = page.querySelector('.aqualor-gorlo-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--aqualor-hero-shadow-opacity', '0.68');
    heroImage.style.setProperty('--aqualor-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('aqualor-gorlo-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initAqualorSoftHeroLevitation() {
  const page = document.querySelector('.product-aqualor-soft-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--aqualor-soft');
  const packshot = page.querySelector('.aqualor-soft-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--aqualor-hero-shadow-opacity', '0.7');
    heroImage.style.setProperty('--aqualor-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('aqualor-soft-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initAqualorSoftMiniHeroLevitation() {
  const page = document.querySelector('.product-aqualor-soft-mini-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--aqualor-soft-mini');
  const packshot = page.querySelector('.aqualor-soft-mini-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--aqualor-hero-shadow-opacity', '0.7');
    heroImage.style.setProperty('--aqualor-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('aqualor-soft-mini-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initNizoralHeroLevitation() {
  const page = document.querySelector('.product-nizoral-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--nizoral');
  const packshot = page.querySelector('.nizoral-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroImage.style.setProperty('--nizoral-hero-shadow-opacity', '0.7');
    heroImage.style.setProperty('--nizoral-hero-shadow-transform', 'scale3d(1, 1, 1)');
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      page.classList.toggle('nizoral-hero-paused', !entry.isIntersecting);
    });
  }, { threshold: 0.08 });

  observer.observe(hero);
}

function initFemilexHeroLevitation() {
  const page = document.querySelector('.product-femilex-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--femilex');
  const packshot = page.querySelector('.femilex-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  if (!hero || !packshot || !heroImage) return;

  const resetHero = () => {
    packshot.style.setProperty('--femilex-hero-float-y', '0px');
    heroImage.style.setProperty('--femilex-hero-shadow-opacity', '0.78');
    heroImage.style.setProperty('--femilex-hero-shadow-transform', 'scale3d(1, 1, 1)');
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    resetHero();
    return;
  }

  let animationFrame = 0;
  let isVisible = true;

  const renderFrame = time => {
    if (!isVisible || document.hidden) {
      animationFrame = 0;
      resetHero();
      return;
    }

    const phase = Math.sin(time / 1350);
    const lift = ((phase + 1) / 2) * -7;
    const shadowScaleX = 1 - ((phase + 1) / 2) * 0.055;
    const shadowScaleY = 1 - ((phase + 1) / 2) * 0.1;
    const shadowOpacity = 0.78 - ((phase + 1) / 2) * 0.12;

    packshot.style.setProperty('--femilex-hero-float-y', `${lift.toFixed(2)}px`);
    heroImage.style.setProperty('--femilex-hero-shadow-opacity', shadowOpacity.toFixed(3));
    heroImage.style.setProperty('--femilex-hero-shadow-transform', `scale3d(${shadowScaleX.toFixed(3)}, ${shadowScaleY.toFixed(3)}, 1)`);

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (!animationFrame && isVisible && !document.hidden) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const stop = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    resetHero();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      });
    }, { threshold: 0.08 });

    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

function initNoshpaForteLevitation() {
  const page = document.querySelector('.product-noshpa-forte-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--noshpa-forte');
  const packshot = page.querySelector('.noshpa-forte-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  const formula = page.querySelector('.noshpa-forte-formula-system');
  const formulaCards = Array.from(page.querySelectorAll('.noshpa-forte-formula-point'));
  if (!hero || !packshot || !heroImage) return;

  const resetHero = () => {
    packshot.style.setProperty('--noshpa-forte-hero-float-y', '0px');
    heroImage.style.setProperty('--noshpa-forte-hero-shadow-opacity', '0.74');
    heroImage.style.setProperty('--noshpa-forte-hero-shadow-transform', 'scale3d(1, 1, 1)');
  };

  const resetFormula = () => {
    formulaCards.forEach(card => {
      card.style.setProperty('--noshpa-forte-formula-card-y', '0px');
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    resetHero();
    resetFormula();
    return;
  }

  let animationFrame = 0;
  let heroVisible = true;
  let formulaVisible = !!formula;

  const renderFrame = time => {
    if (document.hidden || (!heroVisible && !formulaVisible)) {
      animationFrame = 0;
      resetHero();
      resetFormula();
      return;
    }

    if (heroVisible) {
      const phase = Math.sin(time / 1400);
      const liftProgress = (phase + 1) / 2;
      const lift = liftProgress * -6;
      const shadowScaleX = 1 - liftProgress * 0.05;
      const shadowScaleY = 1 - liftProgress * 0.08;
      const shadowOpacity = 0.74 - liftProgress * 0.1;

      packshot.style.setProperty('--noshpa-forte-hero-float-y', `${lift.toFixed(2)}px`);
      heroImage.style.setProperty('--noshpa-forte-hero-shadow-opacity', shadowOpacity.toFixed(3));
      heroImage.style.setProperty('--noshpa-forte-hero-shadow-transform', `scale3d(${shadowScaleX.toFixed(3)}, ${shadowScaleY.toFixed(3)}, 1)`);
    } else {
      resetHero();
    }

    if (formulaVisible) {
      formulaCards.forEach((card, index) => {
        const cardPhase = Math.sin(time / 1250 + index * 0.86);
        card.style.setProperty('--noshpa-forte-formula-card-y', `${(cardPhase * 5).toFixed(2)}px`);
      });
    } else {
      resetFormula();
    }

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (!animationFrame && !document.hidden && (heroVisible || formulaVisible)) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const stopIfIdle = () => {
    if (animationFrame && (document.hidden || (!heroVisible && !formulaVisible))) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      resetHero();
      resetFormula();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === formula) formulaVisible = entry.isIntersecting;
      });
      stopIfIdle();
      start();
    }, { threshold: 0.08 });

    observer.observe(hero);
    if (formula) observer.observe(formula);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopIfIdle();
    } else {
      start();
    }
  });

  start();
}

function initGecsikonLevitation() {
  const page = document.querySelector('.product-gecsikon-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--gecsikon');
  const packshot = page.querySelector('.gecsikon-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  const formula = page.querySelector('.gecsikon-formula-system');
  const formulaCards = Array.from(page.querySelectorAll('.gecsikon-formula-point'));
  if (!hero || !packshot || !heroImage) return;

  const resetHero = () => {
    packshot.style.setProperty('--gecsikon-hero-float-y', '0px');
    heroImage.style.setProperty('--gecsikon-hero-shadow-opacity', '0.72');
    heroImage.style.setProperty('--gecsikon-hero-shadow-transform', 'scale3d(1, 1, 1)');
  };

  const resetFormula = () => {
    formulaCards.forEach(card => {
      card.style.setProperty('--gecsikon-formula-card-y', '0px');
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    resetHero();
    resetFormula();
    return;
  }

  let animationFrame = 0;
  let heroVisible = true;
  let formulaVisible = !!formula;

  const renderFrame = time => {
    if (document.hidden || (!heroVisible && !formulaVisible)) {
      animationFrame = 0;
      resetHero();
      resetFormula();
      return;
    }

    if (heroVisible) {
      const phase = Math.sin(time / 1380);
      const liftProgress = (phase + 1) / 2;
      const lift = liftProgress * -6;
      const shadowScaleX = 1 - liftProgress * 0.05;
      const shadowScaleY = 1 - liftProgress * 0.08;
      const shadowOpacity = 0.72 - liftProgress * 0.1;

      packshot.style.setProperty('--gecsikon-hero-float-y', `${lift.toFixed(2)}px`);
      heroImage.style.setProperty('--gecsikon-hero-shadow-opacity', shadowOpacity.toFixed(3));
      heroImage.style.setProperty('--gecsikon-hero-shadow-transform', `scale3d(${shadowScaleX.toFixed(3)}, ${shadowScaleY.toFixed(3)}, 1)`);
    } else {
      resetHero();
    }

    if (formulaVisible) {
      formulaCards.forEach((card, index) => {
        const cardPhase = Math.sin(time / 1260 + index * 0.84);
        card.style.setProperty('--gecsikon-formula-card-y', `${(cardPhase * 5).toFixed(2)}px`);
      });
    } else {
      resetFormula();
    }

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (!animationFrame && !document.hidden && (heroVisible || formulaVisible)) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const stopIfIdle = () => {
    if (animationFrame && (document.hidden || (!heroVisible && !formulaVisible))) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      resetHero();
      resetFormula();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === formula) formulaVisible = entry.isIntersecting;
      });
      stopIfIdle();
      start();
    }, { threshold: 0.08 });

    observer.observe(hero);
    if (formula) observer.observe(formula);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopIfIdle();
    } else {
      start();
    }
  });

  start();
}

function initKlopidogrelTevaLevitation() {
  const page = document.querySelector('.product-klopidogrel-teva-page');
  if (!page) return;

  const hero = page.querySelector('.product-hero--klopidogrel-teva');
  const packshot = page.querySelector('.klopidogrel-teva-hero-packshot');
  const heroImage = page.querySelector('.product-hero-image');
  const formula = page.querySelector('.klopidogrel-teva-formula-system');
  const formulaCards = Array.from(page.querySelectorAll('.klopidogrel-teva-formula-point'));
  if (!hero || !packshot || !heroImage) return;

  const resetHero = () => {
    packshot.style.setProperty('--klopidogrel-teva-hero-float-y', '0px');
    heroImage.style.setProperty('--klopidogrel-teva-hero-shadow-opacity', '0.74');
    heroImage.style.setProperty('--klopidogrel-teva-hero-shadow-transform', 'scale3d(1, 1, 1)');
  };

  const resetFormula = () => {
    formulaCards.forEach(card => {
      card.style.setProperty('--klopidogrel-teva-formula-card-y', '0px');
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    resetHero();
    resetFormula();
    return;
  }

  let animationFrame = 0;
  let heroVisible = true;
  let formulaVisible = !!formula;

  const renderFrame = time => {
    if (document.hidden || (!heroVisible && !formulaVisible)) {
      animationFrame = 0;
      resetHero();
      resetFormula();
      return;
    }

    if (heroVisible) {
      const phase = Math.sin(time / 1380);
      const liftProgress = (phase + 1) / 2;
      const lift = liftProgress * -6;
      const shadowScaleX = 1 - liftProgress * 0.05;
      const shadowScaleY = 1 - liftProgress * 0.08;
      const shadowOpacity = 0.74 - liftProgress * 0.1;

      packshot.style.setProperty('--klopidogrel-teva-hero-float-y', `${lift.toFixed(2)}px`);
      heroImage.style.setProperty('--klopidogrel-teva-hero-shadow-opacity', shadowOpacity.toFixed(3));
      heroImage.style.setProperty('--klopidogrel-teva-hero-shadow-transform', `scale3d(${shadowScaleX.toFixed(3)}, ${shadowScaleY.toFixed(3)}, 1)`);
    } else {
      resetHero();
    }

    if (formulaVisible) {
      formulaCards.forEach((card, index) => {
        const cardPhase = Math.sin(time / 1260 + index * 0.84);
        card.style.setProperty('--klopidogrel-teva-formula-card-y', `${(cardPhase * 5).toFixed(2)}px`);
      });
    } else {
      resetFormula();
    }

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (!animationFrame && !document.hidden && (heroVisible || formulaVisible)) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const stopIfIdle = () => {
    if (animationFrame && (document.hidden || (!heroVisible && !formulaVisible))) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      resetHero();
      resetFormula();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === formula) formulaVisible = entry.isIntersecting;
      });
      stopIfIdle();
      start();
    }, { threshold: 0.08 });

    observer.observe(hero);
    if (formula) observer.observe(formula);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopIfIdle();
    } else {
      start();
    }
  });

  start();
}

// Highlight the current navigation link as its section enters the viewport
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.menu a');
  if (!sections.length || !navLinks.length) return;
  if (document.body.classList.contains('culture-page')) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === 'culture.html' || href === '../culture.html');
    });
    return;
  }
  if (document.body.classList.contains('history-page')) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === 'history.html');
    });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          // Remove previous actives
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}` || link.getAttribute('href') === `${location.pathname}#${id}` || link.getAttribute('href') === `../index.html#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

// Shrink the navigation bar on scroll and reveal back to top button
function initScrollEffects() {
  const navBar = document.querySelector('nav');
  if (!navBar) return;
  const backToTop = document.createElement('button');
  backToTop.id = 'backToTop';
  backToTop.setAttribute('aria-label', currentLang === 'ru' ? 'Вернуться наверх' : 'Жоғарыға қайту');
  backToTop.innerHTML = '↑';
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navBar.classList.toggle('scrolled', scrolled);
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  });
}

// Animate numerical counters when they become visible
function initCounters() {
  const counters = document.querySelectorAll('.career-fact .number');
  if (!counters.length) return;
  const animateCounter = (el, endVal, formatValue, finalText) => {
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (endVal - startVal) + startVal);
      el.textContent = el.dataset.prefix + formatValue(value) + el.dataset.suffix;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = finalText;
      }
    };
    requestAnimationFrame(animate);
  };
  const parseNumber = (text) => {
    // Extract digits and return numeric value; ignore thousands separators and symbols
    const match = text.replace(/[^0-9]/g, '');
    return parseInt(match, 10) || 0;
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (!el.dataset.animated) {
          // Store prefix and suffix so we can reassemble the original format
          const text = el.dataset.backendTextValue || el.textContent;
          if (!/[0-9]/.test(text)) {
            el.textContent = text;
            el.dataset.animated = 'true';
            return;
          }
          const prefixMatch = text.match(/^[^0-9]+/);
          const suffixMatch = text.match(/[^0-9]+$/);
          el.dataset.prefix = prefixMatch ? prefixMatch[0] : '';
          el.dataset.suffix = suffixMatch ? suffixMatch[0] : '';
          const endVal = parseNumber(text);
          const shouldGroup = endVal >= 1000 || /\d[\s\u00a0]\d/.test(text);
          const formatValue = shouldGroup
            ? value => value.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')
            : value => String(value);
          animateCounter(el, endVal, formatValue, text);
          el.dataset.animated = 'true';
        }
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => observer.observe(el));
}

// Set the current year in the footer
function setYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function initHistoryTimelineMedia() {
  if (!document.body.classList.contains('history-page')) return;

  const periodImages = {
    'period-1895': 'assets/history/period-1895-1933.jpg',
    'period-1933': 'assets/history/period-1933-1948.jpg',
    'period-1948': 'assets/history/period-1948-1961.jpg',
    'period-1961': 'assets/history/period-1961-1975.jpg',
    'period-1975': 'assets/history/period-1975-1993.png',
    'period-1993': 'assets/history/period-1993-2000.jpg',
    'period-2000': 'assets/history/period-2000-2005.png',
    'period-2005': 'assets/history/period-2005-2010.jpg',
    'period-2010': 'assets/history/period-2010-2015.jpg',
    'period-2016': 'assets/history/2019.jpg'
  };

  const eventImages = {
    '1895': 'assets/history/1895.jpg',
    '1903': 'assets/history/1903.jpg',
    '1908': 'assets/history/1908.jpg',
    '1933': 'assets/history/1933.jpg',
    '1935': 'assets/history/1935.jpg',
    '1938': 'assets/history/1938.jpg',
    '1948': 'assets/history/1948.jpg',
    '1954': 'assets/history/1954.jpg',
    '1957': 'assets/history/1957.jpg',
    '1961': 'assets/history/1961.jpg',
    '1970': 'assets/history/1970.jpg',
    '1971': 'assets/history/1971.jpg',
    '1975': 'assets/history/1975.jpg',
    '1986': 'assets/history/1986.png',
    '1992': 'assets/history/1992.png',
    '1993': 'assets/history/1993.png',
    '1995': 'assets/history/1995.jpg',
    '1996': 'assets/history/1996.jpg',
    '1997': 'assets/history/1997.jpg',
    '1998': 'assets/history/1998.jpg',
    '1999': 'assets/history/1999.jpg',
    '2000': 'assets/history/2000.jpg',
    '2001': 'assets/history/2001.jpg',
    '2002': 'assets/history/2002.png',
    '2003': 'assets/history/2003.png',
    '2004': 'assets/history/2004.png',
    '2005': 'assets/history/2005.jpg',
    '2006': 'assets/history/2006.jpg',
    '2007': 'assets/history/2007.jpg',
    '2008': 'assets/history/2008.jpg',
    '2010': 'assets/history/2010.png',
    '2011': 'assets/history/2011.png',
    '2012': 'assets/history/2012.png',
    '2013': 'assets/history/2013.jpg',
    '2014': 'assets/history/2014.jpg',
    '2015': 'assets/history/2015.jpg',
    '2016': 'assets/history/2016.jpg',
    '2017': 'assets/history/2017.jpg',
    '2018': 'assets/history/2018.jpg',
    '2019': 'assets/history/2019.jpg',
    '2020': 'assets/history/2020.jpg',
    '2021': 'assets/history/2021.jpg',
    '2022': 'assets/history/2022.png'
  };

  const summaryImages = {
    '1895': 'assets/history/period-1895-1933.jpg',
    '1975': 'assets/history/period-1975-1993.png',
    '1997': 'assets/history/1997.jpg',
    '2022': 'assets/history/2022.png'
  };

  document.querySelectorAll('.history-summary-card').forEach(card => {
    const year = card.querySelector('span')?.textContent.trim();
    const src = summaryImages[year];
    if (!src || card.querySelector('.history-summary-card__media')) return;

    const title = card.querySelector('h2')?.textContent.trim() || `STADA ${year}`;
    const figure = document.createElement('figure');
    figure.className = 'history-summary-card__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    card.insertBefore(figure, card.firstElementChild);
  });

  document.querySelectorAll('.history-period').forEach(period => {
    const src = periodImages[period.id];
    const header = period.querySelector('.history-period__header');
    if (!src || !header || header.querySelector('.history-period__media')) return;

    const title = header.querySelector('h3')?.textContent.trim() || 'STADA company history';
    const figure = document.createElement('figure');
    figure.className = 'history-period__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    header.insertBefore(figure, header.firstElementChild);
  });

  document.querySelectorAll('.history-event').forEach(event => {
    const year = event.querySelector('time')?.textContent.trim();
    const src = eventImages[year];
    if (!src || event.querySelector('.history-event__media')) return;

    const title = event.querySelector('h4')?.textContent.trim() || `STADA ${year}`;
    const figure = document.createElement('figure');
    figure.className = 'history-event__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    event.insertBefore(figure, event.firstElementChild);
  });
}

// Bind event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeLocaleState();
  renderLanguageOptions(currentCountry);
  // Initial language update
  updateLanguage(currentLang);
  // Initialise libraries
  initSwiper();
  initAOS();
  // Initialise custom scroll behaviours
  initScrollSpy();
  initScrollEffects();
  initHomeScrollReveal();
  initProductsScrollReveal();
  initCounters();
  initHistoryTimelineMedia();
  initHistoryScrollReveal();
  setYear();
  // Bind language switcher
  // Prefer the redesigned dual‑button toggle if present.  Each button
  // specifies its target language via the data‑lang attribute.  If
  // neither is found (e.g. on older pages) fall back to the single
  // toggle button and the toggleLanguage() helper.
  const langOptions = document.querySelectorAll('.lang-toggle .lang-option');
  if (langOptions.length) {
    langOptions.forEach(button => {
      button.addEventListener('click', () => updateLanguage(button.dataset.lang));
    });
  } else {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
  }

  // Initialise homepage carousels
  initHeroCarousel();
  initHeroMetricCounters();
  initNewsCarousel();
  initProductsCarousel();
  initProductCatalogFilters();
  initProductDetailPage();
  initVitrumFizzyHeroLevitation();
  initMagneHeroLevitation();
  initEnterogerminaCapsulesHeroLevitation();
  initEnterogerminaForteHeroLevitation();
  initAqualorForteHeroLevitation();
  initAqualorBabyHeroLevitation();
  initAqualorGorloHeroLevitation();
  initAqualorSoftHeroLevitation();
  initAqualorSoftMiniHeroLevitation();
  initNizoralHeroLevitation();
  initFemilexHeroLevitation();
  initNoshpaForteLevitation();
  initGecsikonLevitation();
  initKlopidogrelTevaLevitation();
  // Bind hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (hamburger && menu) {
    if (!menu.id) menu.id = 'site-menu';
    hamburger.setAttribute('type', 'button');
    hamburger.setAttribute('aria-controls', menu.id);
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', toggleMenu);
  }
  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });
  document.addEventListener('click', event => {
    const menu = document.querySelector('.menu');
    const hamburger = document.querySelector('.hamburger');
    if (!menu || !hamburger || !menu.classList.contains('open')) return;
    if (menu.contains(event.target) || hamburger.contains(event.target)) return;
    setMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setMenuOpen(false);
  });

  // After initialisation, reveal the hero section.  This prevents
  // unstyled content from flashing onscreen before the overlay and
  // translations are ready.  The class toggled here corresponds to
  // CSS rules that fade in the hero section.
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    // Mark all hero overlays as visible and remove inline hidden styles to prevent initial centered flash
    document.querySelectorAll('.hero-overlay').forEach(el => {
      el.classList.add('visible');
      // Unhide overlays if inline styles were set to hide them initially
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });
    heroSection.classList.add('loaded');
  }
});
